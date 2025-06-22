import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FileText, Settings, Eye, CheckSquare, Plus, Edit, Clock, Users, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import { Select } from "@/components/ui/select";
import steppeInfo from "../../the-steppe-info.json";

const LOCAL_STORAGE_KEY = "newzlm:drafts";
const SUBMITTED_STORAGE_KEY = "newzlm:submitted";

// Google TTS voices (example, you can expand as needed)
const GOOGLE_TTS_VOICES = [
  { value: "en-US-Standard-B", label: "English US - Standard B (Male)" },
  { value: "en-US-Standard-C", label: "English US - Standard C (Female)" },
  { value: "en-GB-Standard-A", label: "English UK - Standard A (Female)" },
  { value: "en-GB-Standard-B", label: "English UK - Standard B (Male)" },
];

const getDefaultPromptSettings = () => ({
  editorialVoice: steppeInfo.editorialVoice || "en-US-Standard-B",
  contentGuidelines: steppeInfo.contentGuidelines || "",
  mediaCompany: steppeInfo.mediaCompany || "",
  mission: steppeInfo.mission || "",
  targetAudience: steppeInfo.targetAudience || "",
  region: steppeInfo.region || "",
  instagram: steppeInfo.instagram || "",
  website: steppeInfo.website || ""
});

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("drafts");
  const navigate = useNavigate();
  const { toast } = useToast();

  const [mockDrafts, setMockDrafts] = useState([]);
  const [mockModeration, setMockModeration] = useState([]);
  const [mockPublished, setMockPublished] = useState([
    { id: 6, title: "Digital Transformation in Central Asia", publishedDate: "Dec 15, 2024", views: "1.2k" },
    { id: 7, title: "Green Energy Initiatives", publishedDate: "Dec 12, 2024", views: "890" }
  ]);

  const [promptSettings, setPromptSettings] = useState(getDefaultPromptSettings());

  useEffect(() => {
    // Load drafts and submitted from localStorage
    const drafts = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || "[]");
    setMockDrafts(
      drafts.map((d: any) => ({
        id: d.id,
        title: d.title,
        lastEdited: d.updated ? new Date(d.updated).toLocaleString() : "",
        status: "draft",
      }))
    );
    const submitted = JSON.parse(localStorage.getItem(SUBMITTED_STORAGE_KEY) || "[]");
    setMockModeration(
      submitted.map((s: any) => ({
        id: s.id,
        title: s.title,
        submittedBy: "You",
        status: "pending",
      }))
    );

    // Set prompt settings from localStorage if exists, else use steppeInfo defaults
    const saved = localStorage.getItem("newzlm:promptSettings");
    if (saved) {
      setPromptSettings(JSON.parse(saved));
    } else {
      setPromptSettings(getDefaultPromptSettings());
    }
  }, []);

  const handleReview = (articleId: number) => {
    navigate(`/editor/${articleId}`);
    toast({
      title: "Review Mode",
      description: "Article opened for review and editing.",
    });
  };

  const handleApprove = (articleId: number | string) => {
    const article = mockModeration.find(item => item.id === articleId);
    if (article) {
      // Remove from moderation
      setMockModeration(prev => prev.filter(item => item.id !== articleId));
      
      // Add to published
      const publishedArticle = {
        id: articleId,
        title: article.title,
        publishedDate: new Date().toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric' 
        }),
        views: "0"
      };
      setMockPublished(prev => [publishedArticle, ...prev]);
      
      // Remove from submitted
      let submitted = JSON.parse(localStorage.getItem(SUBMITTED_STORAGE_KEY) || "[]");
      submitted = submitted.filter((s: any) => String(s.id) !== String(articleId));
      localStorage.setItem(SUBMITTED_STORAGE_KEY, JSON.stringify(submitted));
      
      toast({
        title: "Article Approved",
        description: `"${article.title}" has been published successfully.`,
      });
    }
  };

  const handleReject = (articleId: number | string) => {
    
    setMockModeration(prev => prev.filter(item => item.id !== articleId));
    
    let submitted = JSON.parse(localStorage.getItem(SUBMITTED_STORAGE_KEY) || "[]");
    const rejected = submitted.find((s: any) => String(s.id) === String(articleId));
    submitted = submitted.filter((s: any) => String(s.id) !== String(articleId));
    localStorage.setItem(SUBMITTED_STORAGE_KEY, JSON.stringify(submitted));
    
    if (rejected) {
      let drafts = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || "[]");
      drafts.push({
        id: rejected.id,
        title: rejected.title,
        content: rejected.content,
        updated: Date.now()
      });
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(drafts));
      setMockDrafts(drafts.map((d: any) => ({
        id: d.id,
        title: d.title,
        lastEdited: d.updated ? new Date(d.updated).toLocaleString() : "",
        status: "draft",
      })));
    }
    toast({
      title: "Article Rejected",
      description: "The article has been moved back to drafts.",
      variant: "destructive",
    });
  };

  const handleView = (articleId: number) => {
    navigate(`/article/${articleId}`);
  };

  const handleSaveSettings = () => {
    localStorage.setItem("newzlm:promptSettings", JSON.stringify(promptSettings));
    toast({
      title: "Settings Saved",
      description: "AI prompt settings have been updated successfully.",
    });
  };

  const deleteDraft = (draftId: string) => {
    const drafts = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || "[]");
    const updatedDrafts = drafts.filter((d: any) => String(d.id) !== String(draftId));
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedDrafts));
    setMockDrafts(updatedDrafts.map((d: any) => ({
      id: d.id,
      title: d.title,
      lastEdited: d.updated ? new Date(d.updated).toLocaleString() : "",
      status: "draft",
    })));
    toast({
      title: "Draft Deleted",
      description: "Draft has been removed.",
      variant: "destructive",
    });
  };

  const tabs = [
    { id: "drafts", label: "Drafts", icon: FileText, count: mockDrafts.length },
    { id: "moderation", label: "Moderation", icon: Eye, count: mockModeration.length },
    { id: "published", label: "Published", icon: CheckSquare, count: mockPublished.length },
    { id: "settings", label: "Prompt Settings", icon: Settings, count: null }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-black font-poppins">Dashboard</h1>
          <Link to="/editor">
            <Button className="bg-black text-white hover:bg-gray-800 font-roboto">
              <Plus className="h-4 w-4 mr-2" />
              New Article
            </Button>
          </Link>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm font-roboto ${
                  activeTab === tab.id
                    ? "border-black text-black"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <tab.icon className="h-4 w-4 inline-block mr-2" />
                {tab.label}
                {tab.count !== null && (
                  <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === "drafts" && (
            <div>
              <h2 className="text-xl font-semibold text-black mb-4 font-poppins">Draft Articles</h2>
              <div className="space-y-4">
                {mockDrafts.length === 0 && (
                  <div className="text-center py-8 text-gray-500 font-roboto">
                    No articles in draft mode.
                  </div>
                )}
                {mockDrafts.map((draft) => (
                  <div key={draft.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:border-black transition-colors">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-black font-roboto mb-2">{draft.title}</h3>
                        <p className="text-sm text-gray-600 font-roboto">
                          <Clock className="h-4 w-4 inline-block mr-1" />
                          Last edited {draft.lastEdited}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <Link to={`/editor/${draft.id}`}>
                          <Button variant="outline" size="sm" className="font-roboto">
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                        </Link>
                        <Button
                          variant="outline"
                          size="sm"
                          className="font-roboto text-red-600 border-red-300 hover:bg-red-50"
                          onClick={() => deleteDraft(draft.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "moderation" && (
            <div>
              <h2 className="text-xl font-semibold text-black mb-4 font-poppins">Pending Moderation</h2>
              <div className="space-y-4">
                {mockModeration.map((item) => (
                  <div key={item.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:border-black transition-colors">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-black font-roboto mb-2">{item.title}</h3>
                        <p className="text-sm text-gray-600 font-roboto">
                          <Users className="h-4 w-4 inline-block mr-1" />
                          Submitted by {item.submittedBy}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="font-roboto"
                          onClick={() => handleReview(item.id)}
                        >
                          Review
                        </Button>
                        <Button 
                          size="sm" 
                          className="bg-black text-white hover:bg-gray-800 font-roboto"
                          onClick={() => handleApprove(item.id)}
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="font-roboto text-red-600 border-red-300 hover:bg-red-50"
                          onClick={() => handleReject(item.id)}
                        >
                          Reject
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                {mockModeration.length === 0 && (
                  <div className="text-center py-8 text-gray-500 font-roboto">
                    No articles pending moderation
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "published" && (
            <div>
              <h2 className="text-xl font-semibold text-black mb-4 font-poppins">Published Articles</h2>
              <div className="space-y-4">
                {mockPublished.map((item) => (
                  <div key={item.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:border-black transition-colors">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-black font-roboto mb-2">{item.title}</h3>
                        <p className="text-sm text-gray-600 font-roboto">
                          Published {item.publishedDate} • {item.views} views
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="font-roboto"
                          onClick={() => handleView(item.id)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "settings" && (
            <div>
              <h2 className="text-xl font-semibold text-black mb-4 font-poppins">AI Prompt Settings</h2>
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-black mb-2 font-roboto">
                      Media Company Name
                    </label>
                    <input
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-black focus:border-black font-roboto"
                      placeholder="Enter media company name..."
                      value={promptSettings.mediaCompany}
                      onChange={e => setPromptSettings(prev => ({
                        ...prev,
                        mediaCompany: e.target.value
                      }))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-black mb-2 font-roboto">
                      Mission
                    </label>
                    <textarea
                      className="w-full h-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-black focus:border-black font-roboto"
                      placeholder="Describe your company's mission..."
                      value={promptSettings.mission}
                      onChange={e => setPromptSettings(prev => ({
                        ...prev,
                        mission: e.target.value
                      }))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-black mb-2 font-roboto">
                      Target Audience / Region
                    </label>
                    <input
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-black focus:border-black font-roboto"
                      placeholder="e.g. Young professionals in Central Asia"
                      value={promptSettings.targetAudience}
                      onChange={e => setPromptSettings(prev => ({
                        ...prev,
                        targetAudience: e.target.value
                      }))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-black mb-2 font-roboto">
                      Region
                    </label>
                    <input
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-black focus:border-black font-roboto"
                      placeholder="e.g. Central Asia"
                      value={promptSettings.region}
                      onChange={e => setPromptSettings(prev => ({
                        ...prev,
                        region: e.target.value
                      }))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-black mb-2 font-roboto">
                      Instagram Link
                    </label>
                    <input
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-black focus:border-black font-roboto"
                      placeholder="https://instagram.com/yourcompany"
                      value={promptSettings.instagram}
                      onChange={e => setPromptSettings(prev => ({
                        ...prev,
                        instagram: e.target.value
                      }))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-black mb-2 font-roboto">
                      Official Website
                    </label>
                    <input
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-black focus:border-black font-roboto"
                      placeholder="https://yourcompany.com"
                      value={promptSettings.website}
                      onChange={e => setPromptSettings(prev => ({
                        ...prev,
                        website: e.target.value
                      }))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-black mb-2 font-roboto">
                      Editorial Voice (Google TTS)
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-black focus:border-black font-roboto"
                      value={promptSettings.editorialVoice}
                      onChange={e => setPromptSettings(prev => ({
                        ...prev,
                        editorialVoice: e.target.value
                      }))}
                    >
                      {GOOGLE_TTS_VOICES.map(voice => (
                        <option key={voice.value} value={voice.value}>
                          {voice.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-black mb-2 font-roboto">
                      Content Guidelines
                    </label>
                    <textarea
                      className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-black focus:border-black font-roboto"
                      placeholder="Specific guidelines for content generation..."
                      value={promptSettings.contentGuidelines}
                      onChange={(e) => setPromptSettings(prev => ({
                        ...prev,
                        contentGuidelines: e.target.value
                      }))}
                    />
                  </div>
                  <Button 
                    className="bg-black text-white hover:bg-gray-800 font-roboto"
                    onClick={handleSaveSettings}
                  >
                    Save Settings
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
