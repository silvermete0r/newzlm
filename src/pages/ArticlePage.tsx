import { useParams, useSearchParams } from "react-router-dom";
import { Clock, Share, Bookmark, Eye, Volume2, Pause, Play, SkipForward, SkipBack } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import { useEffect, useState, useRef } from "react";

const LOCAL_STORAGE_KEY = "newzlm:drafts";
const PROMPT_SETTINGS_KEY = "newzlm:promptSettings";

const ArticlePage = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const [article, setArticle] = useState<any>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentUtterance, setCurrentUtterance] = useState<SpeechSynthesisUtterance | null>(null);
  const [voice, setVoice] = useState<SpeechSynthesisVoice | null>(null);

  // Load preferred voice from prompt settings
  useEffect(() => {
    const promptSettings = JSON.parse(localStorage.getItem(PROMPT_SETTINGS_KEY) || "{}");
    const preferredVoice = promptSettings.editorialVoice || "en-US-Standard-B";
    const voices = window.speechSynthesis.getVoices();
    // Try to match by name or lang
    let selected = voices.find(v => v.name === preferredVoice) ||
                   voices.find(v => v.voiceURI === preferredVoice) ||
                   voices.find(v => v.lang.startsWith("en"));
    setVoice(selected || null);
  }, []);

  useEffect(() => {
    if (id === "preview") {
      setArticle({
        title: searchParams.get("title") || "Untitled",
        content: searchParams.get("content") || "",
        author: "Draft Preview",
        publishedDate: "",
        readTime: "",
        category: "",
        views: ""
      });
    } else if (id) {
      const drafts = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || "[]");
      const found = drafts.find((d: any) => String(d.id) === String(id));
      if (found) {
        setArticle({
          title: found.title,
          content: found.content,
          author: "Draft Author",
          publishedDate: found.updated ? new Date(found.updated).toLocaleString() : "",
          readTime: `${Math.ceil((found.content || '').split(' ').length / 200)} min read`,
          category: "",
          views: ""
        });
      } else {
        setArticle(null);
      }
    }
  }, [id, searchParams]);

  // Helper to speak the article
  const speakArticle = () => {
    if (!article?.content) return;
    window.speechSynthesis.cancel();
    const utter = new window.SpeechSynthesisUtterance(article.content);
    if (voice) utter.voice = voice;
    utter.rate = 1;
    utter.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
      setCurrentUtterance(null);
    };
    utter.onerror = () => {
      setIsSpeaking(false);
      setIsPaused(false);
      setCurrentUtterance(null);
    };
    setCurrentUtterance(utter);
    window.speechSynthesis.speak(utter);
    setIsSpeaking(true);
    setIsPaused(false);
  };

  const handlePlay = () => {
    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      setIsSpeaking(true);
    } else {
      speakArticle();
    }
  };

  const handlePause = () => {
    window.speechSynthesis.pause();
    setIsPaused(true);
    setIsSpeaking(false);
  };

  const handleStop = () => {
    window.speechSynthesis.cancel();
    setIsPaused(false);
    setIsSpeaking(false);
    setCurrentUtterance(null);
  };

  if (!article) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Article Not Found</h1>
          <p className="text-xl text-gray-600 mb-4">This article does not exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <header className="mb-8">
          <div className="mb-4">
            <span className="inline-block bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-roboto">
              {article.category || "Draft"}
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-black mb-4 font-poppins leading-tight">
            {article.title}
          </h1>
          <div className="flex items-center justify-between flex-wrap gap-4 text-sm text-gray-600 font-roboto">
            <div className="flex items-center space-x-4">
              <span>By {article.author}</span>
              {article.publishedDate && (
                <>
                  <span>•</span>
                  <span>{article.publishedDate}</span>
                </>
              )}
              {article.readTime && (
                <>
                  <span>•</span>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    {article.readTime}
                  </div>
                </>
              )}
              {article.views && (
                <>
                  <span>•</span>
                  <div className="flex items-center">
                    <Eye className="h-4 w-4 mr-1" />
                    {article.views} views
                  </div>
                </>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" className="font-roboto">
                <Share className="h-4 w-4 mr-1" />
                Share
              </Button>
              <Button variant="outline" size="sm" className="font-roboto">
                <Bookmark className="h-4 w-4 mr-1" />
                Save
              </Button>
            </div>
          </div>
        </header>
        <div className="prose prose-lg max-w-none font-roboto whitespace-pre-line">
          {article.content}
        </div>
        {/* TTS Mini-player */}
        <div className="flex items-center gap-4 mb-8">
          <button
            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200"
            onClick={handlePlay}
            aria-label="Play"
            disabled={isSpeaking && !isPaused}
          >
            <Play className="h-5 w-5" />
          </button>
          <button
            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200"
            onClick={handlePause}
            aria-label="Pause"
            disabled={!isSpeaking || isPaused}
          >
            <Pause className="h-5 w-5" />
          </button>
          <button
            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200"
            onClick={handleStop}
            aria-label="Stop"
          >
            <Volume2 className="h-5 w-5" />
          </button>
          <span className="text-sm text-gray-500 font-roboto">
            {isSpeaking ? (isPaused ? "Paused" : "Playing") : "Stopped"}
          </span>
        </div>
        <footer className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500 font-roboto">
              {id === "preview"
                ? "Draft preview"
                : "Draft from notebook"}
            </p>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" className="font-roboto">
                <Share className="h-4 w-4 mr-1" />
                Share Article
              </Button>
            </div>
          </div>
        </footer>
      </article>
    </div>
  );
};

export default ArticlePage;
