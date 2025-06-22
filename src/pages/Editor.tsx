
import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { Save, Send, Download, Eye, Instagram, MessageCircle, Send as TelegramIcon, Sparkles, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import { generateArticleWithAI } from "@/services/newsService";

const Editor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isPreview, setIsPreview] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [sourceArticle, setSourceArticle] = useState<any>(null);

  // Load source article if coming from news
  useEffect(() => {
    const sourceParam = searchParams.get('source');
    if (sourceParam) {
      try {
        const source = JSON.parse(decodeURIComponent(sourceParam));
        setSourceArticle(source);
        setTitle(source.title || "");
        setContent(`# ${source.title || ""}

${source.description || ""}

## Source Information
- **Original Source**: ${source.source?.name || 'Unknown'}
- **URL**: ${source.url || 'N/A'}

## Content to Expand
${source.content || source.description || "Please provide more details about this topic..."}

---

*This article is being developed from source material. Use AI generation to expand and enhance the content.*`);
      } catch (error) {
        console.error('Error parsing source article:', error);
      }
    } else if (id && id !== "new") {
      // Load existing draft
      setTitle("AI Impact on Central Asian Education");
      setContent(`# AI Impact on Central Asian Education

The educational landscape across Central Asia is undergoing a revolutionary transformation as artificial intelligence technologies reshape traditional learning methodologies.

## Key Developments

### Technology Integration
- **Smart Learning Platforms**: Universities in Kazakhstan and Uzbekistan are implementing AI-powered learning management systems
- **Personalized Education**: Adaptive learning algorithms are being deployed to cater to individual student needs
- **Language Processing**: Natural language processing tools are helping break down language barriers in multilingual educational environments

### Regional Initiatives

#### Kazakhstan
Kazakhstan's Ministry of Education has launched a comprehensive digital transformation program, investing in AI-powered educational tools that serve over 3 million students nationwide.

#### Uzbekistan
Uzbekistan's universities are pioneering AI research centers, focusing on applications specific to regional challenges and opportunities.

### Challenges and Opportunities

The integration of AI in education presents both challenges and opportunities:

- **Infrastructure Development**: Building robust digital infrastructure across diverse geographical regions
- **Teacher Training**: Preparing educators to effectively utilize AI tools in their teaching methodologies
- **Cultural Adaptation**: Ensuring AI systems respect and incorporate local cultural values and languages

## Future Outlook

As Central Asian nations continue to embrace digital transformation, the role of AI in education is expected to expand significantly, potentially positioning the region as a leader in innovative educational technologies.

*This article was generated using NewzLM's AI assistance and reviewed by our editorial team.*`);
    }
  }, [id, searchParams]);

  const handleSave = () => {
    toast({
      title: "Draft Saved",
      description: "Your article has been saved as a draft.",
    });
  };

  const handleSubmit = () => {
    toast({
      title: "Submitted for Review",
      description: "Your article has been submitted for moderation.",
    });
    navigate("/dashboard");
  };

  const handleExport = (platform: string) => {
    toast({
      title: `Exported for ${platform}`,
      description: `Article formatted and ready for ${platform} publishing.`,
    });
  };

  const handleAIGeneration = async () => {
    if (!sourceArticle && !title) {
      toast({
        title: "No Content to Generate",
        description: "Please provide a title or source article for AI generation.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsGenerating(true);
      
      const articleData = sourceArticle || {
        title,
        description: content.substring(0, 200),
        source: { name: "User Input" }
      };

      const generatedContent = await generateArticleWithAI(articleData);
      setContent(generatedContent);
      
      toast({
        title: "AI Generation Complete",
        description: "Article has been generated successfully using LLAMA3.",
      });
    } catch (error) {
      console.error('Error generating article:', error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate article. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEnhanceWithAI = async () => {
    if (!content.trim()) {
      toast({
        title: "No Content to Enhance",
        description: "Please write some content first.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsGenerating(true);
      
      const articleData = {
        title,
        description: content.substring(0, 500),
        source: { name: "NewzLM Editor" },
        content
      };

      const enhancedContent = await generateArticleWithAI(
        articleData, 
        `Please enhance and expand this existing article content, improving clarity, adding relevant context, and maintaining professional journalism standards:\n\n${content}`
      );
      
      setContent(enhancedContent);
      
      toast({
        title: "Content Enhanced",
        description: "Your article has been enhanced with AI assistance.",
      });
    } catch (error) {
      console.error('Error enhancing content:', error);
      toast({
        title: "Enhancement Failed",
        description: "Failed to enhance content. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-black font-poppins">
              {id === "new" || !id ? "New Article" : "Edit Article"}
            </h1>
            {sourceArticle && (
              <p className="text-sm text-gray-600 font-roboto mt-1">
                Based on: {sourceArticle.source?.name || 'External Source'}
              </p>
            )}
          </div>
          
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={() => setIsPreview(!isPreview)}
              className="font-roboto"
            >
              <Eye className="h-4 w-4 mr-2" />
              {isPreview ? "Edit" : "Preview"}
            </Button>
            
            <Button
              variant="outline"
              onClick={handleSave}
              className="font-roboto"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Draft
            </Button>
            
            <Button
              onClick={handleSubmit}
              className="bg-black text-white hover:bg-gray-800 font-roboto"
            >
              <Send className="h-4 w-4 mr-2" />
              Submit for Review
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Editor */}
          <div className="lg:col-span-3">
            {!isPreview ? (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-black mb-2 font-roboto">
                    Article Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-black focus:border-black font-roboto text-lg"
                    placeholder="Enter article title..."
                  />
                </div>

                {/* AI Generation Controls */}
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-black mb-3 font-poppins flex items-center">
                    <Sparkles className="h-4 w-4 mr-2" />
                    AI-Powered Content Generation
                  </h3>
                  <div className="flex gap-3">
                    <Button
                      onClick={handleAIGeneration}
                      disabled={isGenerating}
                      className="bg-black text-white hover:bg-gray-800 font-roboto"
                    >
                      {isGenerating ? (
                        <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                      ) : (
                        <Wand2 className="h-4 w-4 mr-2" />
                      )}
                      {sourceArticle ? "Generate from Source" : "Generate Article"}
                    </Button>
                    
                    <Button
                      onClick={handleEnhanceWithAI}
                      disabled={isGenerating || !content.trim()}
                      variant="outline"
                      className="font-roboto"
                    >
                      {isGenerating ? (
                        <div className="animate-spin h-4 w-4 border-2 border-gray-600 border-t-transparent rounded-full mr-2" />
                      ) : (
                        <Sparkles className="h-4 w-4 mr-2" />
                      )}
                      Enhance Existing
                    </Button>
                  </div>
                  {isGenerating && (
                    <p className="text-xs text-gray-600 font-roboto mt-2">
                      AI is generating content using LLAMA3... This may take a moment.
                    </p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-black mb-2 font-roboto">
                    Content (Markdown Supported)
                  </label>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full h-96 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-black focus:border-black font-roboto font-mono text-sm"
                    placeholder="Write your article content here or use AI generation..."
                  />
                </div>
              </div>
            ) : (
              <div className="bg-white border border-gray-200 rounded-lg p-8">
                <h1 className="text-3xl font-bold text-black mb-6 font-poppins">{title}</h1>
                <div className="prose prose-lg max-w-none font-roboto">
                  {content.split('\n').map((line, index) => {
                    if (line.startsWith('# ')) {
                      return <h1 key={index} className="text-2xl font-bold text-black mb-4 font-poppins">{line.substring(2)}</h1>;
                    }
                    if (line.startsWith('## ')) {
                      return <h2 key={index} className="text-xl font-semibold text-black mb-3 mt-6 font-poppins">{line.substring(3)}</h2>;
                    }
                    if (line.startsWith('### ')) {
                      return <h3 key={index} className="text-lg font-medium text-black mb-2 mt-4 font-poppins">{line.substring(4)}</h3>;
                    }
                    if (line.startsWith('#### ')) {
                      return <h4 key={index} className="text-base font-medium text-black mb-2 mt-3 font-poppins">{line.substring(5)}</h4>;
                    }
                    if (line.startsWith('- ')) {
                      return <li key={index} className="text-gray-700 mb-1">{line.substring(2)}</li>;
                    }
                    if (line.startsWith('*') && line.endsWith('*') && line.length > 2) {
                      return <p key={index} className="text-gray-500 italic text-sm mb-4">{line.substring(1, line.length - 1)}</p>;
                    }
                    if (line.trim() === '') {
                      return <br key={index} />;
                    }
                    return <p key={index} className="text-gray-700 mb-4">{line}</p>;
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              {/* Source Info */}
              {sourceArticle && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-black mb-4 font-poppins">
                    Source Article
                  </h3>
                  <div className="space-y-2 text-sm font-roboto">
                    <div>
                      <span className="font-medium text-gray-700">Source:</span>
                      <span className="text-black ml-1">{sourceArticle.source?.name}</span>
                    </div>
                    {sourceArticle.url && (
                      <div>
                        <span className="font-medium text-gray-700">URL:</span>
                        <a href={sourceArticle.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline ml-1 text-xs break-all">
                          {sourceArticle.url}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Export Options */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-black mb-4 font-poppins">
                  Export for Social Media
                </h3>
                <div className="space-y-3">
                  <Button
                    variant="outline"
                    onClick={() => handleExport("Instagram")}
                    className="w-full justify-start font-roboto"
                  >
                    <Instagram className="h-4 w-4 mr-2" />
                    Instagram
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => handleExport("Threads")}
                    className="w-full justify-start font-roboto"
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Threads
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => handleExport("Telegram")}
                    className="w-full justify-start font-roboto"
                  >
                    <TelegramIcon className="h-4 w-4 mr-2" />
                    Telegram
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => handleExport("PDF")}
                    className="w-full justify-start font-roboto"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF
                  </Button>
                </div>
              </div>

              {/* Article Stats */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-black mb-4 font-poppins">
                  Article Stats
                </h3>
                <div className="space-y-2 text-sm font-roboto">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Words:</span>
                    <span className="text-black">{content.split(' ').filter(word => word.length > 0).length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Characters:</span>
                    <span className="text-black">{content.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Read time:</span>
                    <span className="text-black">{Math.ceil(content.split(' ').filter(word => word.length > 0).length / 200)} min</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Editor;
