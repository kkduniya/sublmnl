"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { useSession } from "next-auth/react";
import * as LucideIcons from "lucide-react";
import { Plus, Edit3, Trash2, Save, X, FileText, ImageIcon, Settings, Sparkles, Zap, Target, Users, MessageSquare, HelpCircle, Rocket, Star, BarChart3, Layout, Palette } from 'lucide-react';

const contentTypes = [
  { key: "hero", label: "Hero Section", icon: Layout, color: "from-purple-500 to-pink-500" },
  { key: "categories", label: "Categories", icon: Palette, color: "from-blue-500 to-cyan-500" },
  { key: "features", label: "Features", icon: Sparkles, color: "from-green-500 to-emerald-500" },
  { key: "process", label: "Process Steps", icon: Target, color: "from-orange-500 to-red-500" },
  { key: "content-blocks", label: "Affirmations & Insights", icon: FileText, color: "from-indigo-500 to-purple-500" },
  { key: "statistics", label: "Statistics", icon: BarChart3, color: "from-teal-500 to-green-500" },
  { key: "testimonials", label: "Testimonials", icon: MessageSquare, color: "from-pink-500 to-rose-500" },
  { key: "cta-section", label: "Ready to Transform", icon: Rocket, color: "from-yellow-500 to-orange-500" },
  { key: "faq", label: "FAQ", icon: HelpCircle, color: "from-violet-500 to-purple-500" },
];

// Lucide icons list - commonly used icons
const lucideIconOptions = [
  { value: "Briefcase", label: "Briefcase", category: "Business" },
  { value: "Heart", label: "Heart", category: "Love" },
  { value: "Activity", label: "Activity", category: "Health" },
  { value: "Lock", label: "Lock", category: "Security" },
  { value: "LifeBuoy", label: "Support", category: "Help" },
  { value: "DollarSign", label: "Dollar Sign", category: "Money" },
  { value: "Database", label: "Database", category: "Technology" },
  { value: "Zap", label: "Zap", category: "Energy" },
  { value: "Music", label: "Music", category: "Audio" },
  { value: "Lightbulb", label: "Lightbulb", category: "Ideas" },
  { value: "Download", label: "Download", category: "Actions" },
  { value: "FileText", label: "File Text", category: "Documents" },
  { value: "Percent", label: "Percent", category: "Math" },
  { value: "Infinity", label: "Infinity", category: "Math" },
  { value: "Clock", label: "Clock", category: "Time" },
  { value: "Shield", label: "Shield", category: "Security" },
  { value: "Headphones", label: "Headphones", category: "Audio" },
  { value: "Brain", label: "Brain", category: "Mind" },
  { value: "Target", label: "Target", category: "Goals" },
  { value: "Star", label: "Star", category: "Rating" },
  { value: "Trophy", label: "Trophy", category: "Achievement" },
  { value: "Rocket", label: "Rocket", category: "Growth" },
  { value: "Gem", label: "Gem", category: "Premium" },
  { value: "Users", label: "Users", category: "People" },
  { value: "User", label: "User", category: "People" },
  { value: "Mail", label: "Mail", category: "Communication" },
  { value: "Phone", label: "Phone", category: "Communication" },
  {
    value: "MessageCircle",
    label: "Message Circle",
    category: "Communication",
  },
  { value: "Globe", label: "Globe", category: "Web" },
  { value: "Smartphone", label: "Smartphone", category: "Technology" },
  { value: "Laptop", label: "Laptop", category: "Technology" },
  { value: "Camera", label: "Camera", category: "Media" },
  { value: "Video", label: "Video", category: "Media" },
  { value: "Image", label: "Image", category: "Media" },
  { value: "Play", label: "Play", category: "Media" },
  { value: "Pause", label: "Pause", category: "Media" },
  { value: "Volume2", label: "Volume", category: "Audio" },
  { value: "Mic", label: "Microphone", category: "Audio" },
  { value: "Settings", label: "Settings", category: "System" },
  { value: "Search", label: "Search", category: "System" },
  { value: "Filter", label: "Filter", category: "System" },
  { value: "Edit", label: "Edit", category: "Actions" },
  { value: "Trash2", label: "Trash", category: "Actions" },
  { value: "Plus", label: "Plus", category: "Actions" },
  { value: "Minus", label: "Minus", category: "Actions" },
  { value: "Check", label: "Check", category: "Status" },
  { value: "X", label: "X", category: "Status" },
  { value: "AlertCircle", label: "Alert Circle", category: "Status" },
  { value: "CheckCircle", label: "Check Circle", category: "Status" },
  { value: "Info", label: "Info", category: "Status" },
  { value: "Home", label: "Home", category: "Navigation" },
  { value: "ArrowRight", label: "Arrow Right", category: "Navigation" },
  { value: "ArrowLeft", label: "Arrow Left", category: "Navigation" },
  { value: "ArrowUp", label: "Arrow Up", category: "Navigation" },
  { value: "ArrowDown", label: "Arrow Down", category: "Navigation" },
  { value: "ChevronRight", label: "Chevron Right", category: "Navigation" },
  { value: "ChevronLeft", label: "Chevron Left", category: "Navigation" },
  { value: "ChevronUp", label: "Chevron Up", category: "Navigation" },
  { value: "ChevronDown", label: "Chevron Down", category: "Navigation" },
  { value: "Menu", label: "Menu", category: "Navigation" },
  { value: "MoreHorizontal", label: "More Horizontal", category: "Navigation" },
  { value: "MoreVertical", label: "More Vertical", category: "Navigation" },
];

const AdminContentPage = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [contentType, setContentType] = useState(contentTypes[0].key);
  const [contentId, setContentId] = useState(null);
  const [contentData, setContentData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Add state for testimonials
  const [testimonialFields, setTestimonialFields] = useState({
    quote: "",
    author: "",
    role: "",
  });
  
  // Add state for categories
  const [categoryFields, setCategoryFields] = useState({
    title: "",
    description: "",
    icon: "",
    buttonText: "Get Started",
    buttonLink: "#",
    bgColor: "#0ef9fc",
  });
  
  // Add state for features
  const [featureFields, setFeatureFields] = useState({
    title: "",
    description: "",
    icon: "",
  });
  
  // Add state for process
  const [processFields, setProcessFields] = useState({
    title: "",
    description: "",
    icon: "",
    stepNumber: 1,
  });
  
  // Add state for statistics
  const [statisticsFields, setStatisticsFields] = useState({
    value: "",
    label: "",
    icon: "",
  });
  
  // Add state for hero section
  const [heroFields, setHeroFields] = useState({
    title: "",
    subtitle: "",
    description: "",
    buttonText: "",
    buttonLink: "",
    backgroundImage: "",
    badge: "",
  });
  
  // Add state for content blocks
  const [contentBlockFields, setContentBlockFields] = useState({
    title: "",
    content: "",
    image: "",
    buttonText: "",
    buttonLink: "",
    layout: "left",
  });
  
  // Add state for trust section
  const [trustFields, setTrustFields] = useState({
    title: "",
    subtitle: "",
    features: [{ icon: "", title: "", description: "" }],
  });
  
  // Add state for section headers
  const [sectionHeaderFields, setSectionHeaderFields] = useState({
    sectionId: "",
    title: "",
    subtitle: "",
    badge: "",
    backgroundImage: "",
  });
  
  // Add state for CTA section
  const [ctaFields, setCtaFields] = useState({
    title: "",
    subtitle: "",
    features: [{ icon: "", title: "", description: "" }],
    backgroundImage: "",
  });
  
  // Add state for FAQ
  const [faqFields, setFaqFields] = useState({
    title: "",
    description: "",
    questions: [{ question: "", answer: "" }],
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (contentType) {
      fetchContent();
    }
  }, [contentType]);

  const fetchContent = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/content?type=${contentType}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data.success) {
        setContentData(data.content);
      } else {
        setError(data.message || "Failed to fetch content");
      }
     } catch (error) {
      console.error("Fetch error:", error);
      setError("Failed to load content.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleContentTypeChange = (newType) => {
    setContentType(newType);
    setContentId(null);
  };

  const handleEdit = (id) => {
    setContentId(id);
    const content = contentData.find((item) => item._id === id);
    if (content) {
      try {
        const parsed = content.parsedContent || JSON.parse(content.content);
        switch (contentType) {
          case "testimonials":
            setTestimonialFields(parsed);
            break;
          case "categories":
            setCategoryFields(parsed);
            break;
          case "features":
            setFeatureFields(parsed);
            break;
          case "process":
            setProcessFields(parsed);
            break;
          case "statistics":
            setStatisticsFields(parsed);
            break;
          case "hero":
            setHeroFields(parsed);
            break;
          case "content-blocks":
            setContentBlockFields(parsed);
            break;
          case "trust":
            setTrustFields(parsed);
            break;
          case "section-headers":
            setSectionHeaderFields(parsed);
            break;
          case "cta-section":
            setCtaFields(parsed);
            break;
          case "faq":
            setFaqFields(parsed);
            break;
          default:
            console.warn("No handler for content type:", contentType);
        }
      } catch (error) {
        console.error("Parsing error:", error);
        setError("Failed to parse content.");
      }
    }
  };

  const resetFields = () => {
    setTestimonialFields({ quote: "", author: "", role: "" });
    setCategoryFields({
      title: "",
      description: "",
      icon: "",
      buttonText: "Get Started",
      buttonLink: "#",
      bgColor: "#0ef9fc",
    });
    setFeatureFields({ title: "", description: "", icon: "" });
    setProcessFields({ title: "", description: "", icon: "", stepNumber: 1 });
    setStatisticsFields({ value: "", label: "", icon: "" });
    setHeroFields({
      title: "",
      subtitle: "",
      description: "",
      buttonText: "",
      buttonLink: "",
      backgroundImage: "",
      badge: "",
    });
    setContentBlockFields({
      title: "",
      content: "",
      image: "",
      buttonText: "",
      buttonLink: "",
      layout: "left",
    });
    setTrustFields({
      title: "",
      subtitle: "",
      features: [{ icon: "", title: "", description: "" }],
    });
    setSectionHeaderFields({
      sectionId: "",
      title: "",
      subtitle: "",
      badge: "",
      backgroundImage: "",
    });
    setCtaFields({
      title: "",
      subtitle: "",
      features: [{ icon: "", title: "", description: "" }],
      backgroundImage: "",
    });
    setFaqFields({
      title: "",
      description: "",
      questions: [{ question: "", answer: "" }],
    });
  };

  const handleCreate = () => {
    setContentId("new");
    resetFields();
  };

  const handleSave = async () => {
    setIsLoading(true);
    setError(null);
    let contentData;
    let title;
    
    switch (contentType) {
      case "testimonials":
        if (!testimonialFields.quote || !testimonialFields.author) {
          setError("Quote and author are required for testimonials");
          setIsLoading(false);
          return;
        }
        contentData = testimonialFields;
        title = testimonialFields.author;
        break;
      case "categories":
        if (!categoryFields.title || !categoryFields.description) {
          setError("Title and description are required for categories");
          setIsLoading(false);
          return;
        }
        contentData = categoryFields;
        title = categoryFields.title;
        break;
      case "features":
        if (!featureFields.title || !featureFields.description) {
          setError("Title and description are required for features");
          setIsLoading(false);
          return;
        }
        contentData = featureFields;
        title = featureFields.title;
        break;
      case "process":
        if (!processFields.title || !processFields.description) {
          setError("Title and description are required for process steps");
          setIsLoading(false);
          return;
        }
        contentData = processFields;
        title = processFields.title;
        break;
      case "statistics":
        if (!statisticsFields.value || !statisticsFields.label) {
          setError("Value and label are required for statistics");
          setIsLoading(false);
          return;
        }
        contentData = statisticsFields;
        title = statisticsFields.label;
        break;
      case "hero":
        if (!heroFields.title || !heroFields.subtitle) {
          setError("Title and subtitle are required for hero section");
          setIsLoading(false);
          return;
        }
        contentData = heroFields;
        title = heroFields.title;
        break;
      case "content-blocks":
        if (!contentBlockFields.title || !contentBlockFields.content) {
          setError("Title and content are required for content blocks");
          setIsLoading(false);
          return;
        }
        contentData = contentBlockFields;
        title = contentBlockFields.title;
        break;
      case "trust":
        if (!trustFields.title || !trustFields.subtitle) {
          setError("Title and subtitle are required for trust section");
          setIsLoading(false);
          return;
        }
        contentData = trustFields;
        title = trustFields.title;
        break;
      case "section-headers":
        if (!sectionHeaderFields.sectionId || !sectionHeaderFields.title) {
          setError("Section ID and title are required for section headers");
          setIsLoading(false);
          return;
        }
        contentData = sectionHeaderFields;
        title = sectionHeaderFields.title;
        break;
      case "cta-section":
        if (!ctaFields.title || !ctaFields.subtitle) {
          setError("Title and subtitle are required for CTA section");
          setIsLoading(false);
          return;
        }
        contentData = ctaFields;
        title = ctaFields.title;
        break;
      case "faq":
        if (!faqFields.title || !faqFields.questions.length) {
          setError("Title and at least one question are required for FAQ");
          setIsLoading(false);
          return;
        }
        contentData = faqFields;
        title = faqFields.title;
        break;
      default:
        setError("Invalid content type");
        setIsLoading(false);
        return;
    }

    const contentString = JSON.stringify(contentData);
    
    try {
      const url =
        contentId === "new"
          ? "/api/admin/content"
          : `/api/admin/content/${contentId}`;
      const method = contentId === "new" ? "POST" : "PUT";
      
      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: contentType,
          title: title,
          content: contentString,
          order: 0,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save content");
      }
      
      toast.success("Content saved successfully!");
      fetchContent();
      setContentId(null);
    } catch (error) {
      console.error("Save error:", error);
      setError(error.message || "Failed to save content.");
      toast.error(error.message || "Failed to save content.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/content/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete content");
      }
      toast.success("Content deleted successfully!");
      fetchContent();
    } catch (error) {
      console.error("Delete error:", error);
      setError(error.message || "Failed to delete content.");
      toast.error(error.message || "Failed to delete content.");
    } finally {
      setIsLoading(false);
      setContentId(null);
    }
  };

  // Icon preview component
  const IconPreview = ({ iconName }) => {
    if (!iconName || !LucideIcons[iconName]) return null;
    const IconComponent = LucideIcons[iconName];
    return <IconComponent size={18} className="text-indigo-400" />;
  };

  const renderEditor = () => {
    switch (contentType) {
      case "testimonials":
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-200">
                Quote <span className="text-red-400">*</span>
              </label>
              <textarea
                rows={4}
                value={testimonialFields.quote}
                onChange={(e) =>
                  setTestimonialFields((f) => ({ ...f, quote: e.target.value }))
                }
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                placeholder="Enter the testimonial quote..."
                required
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-200">
                  Author <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={testimonialFields.author}
                  onChange={(e) =>
                    setTestimonialFields((f) => ({
                      ...f,
                      author: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                  placeholder="Author name"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-200">
                  Role
                </label>
                <input
                  type="text"
                  value={testimonialFields.role}
                  onChange={(e) =>
                    setTestimonialFields((f) => ({ ...f, role: e.target.value }))
                  }
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                  placeholder="Author's role or title"
                />
              </div>
            </div>
          </div>
        );
      case "categories":
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-200">
                Category Title <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={categoryFields.title}
                onChange={(e) =>
                  setCategoryFields((f) => ({ ...f, title: e.target.value }))
                }
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                placeholder="Enter category title"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-200">
                Description <span className="text-red-400">*</span>
              </label>
              <textarea
                rows={3}
                value={categoryFields.description}
                onChange={(e) =>
                  setCategoryFields((f) => ({
                    ...f,
                    description: e.target.value,
                  }))
                }
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                placeholder="Describe the category..."
                required
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-200">
                Icon
              </label>
              <div className="flex items-center space-x-3">
                <select
                  value={categoryFields.icon}
                  onChange={(e) =>
                    setCategoryFields((f) => ({ ...f, icon: e.target.value }))
                  }
                  className="flex-1 px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="">Select icon...</option>
                  {lucideIconOptions.map((icon) => (
                    <option key={icon.value} value={icon.value}>
                      {icon.label}
                    </option>
                  ))}
                </select>
                <div className="w-12 h-12 flex items-center justify-center bg-slate-700/50 rounded-xl border border-slate-600/50">
                  <IconPreview iconName={categoryFields.icon} />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-200">
                Background Color
              </label>
              <div className="flex space-x-3">
                <input
                  type="color"
                  value={categoryFields.bgColor}
                  onChange={(e) =>
                    setCategoryFields((f) => ({
                      ...f,
                      bgColor: e.target.value,
                    }))
                  }
                  className="w-16 h-12 p-1 border border-slate-600/50 bg-slate-800/50 rounded-xl cursor-pointer"
                />
                <input
                  type="text"
                  value={categoryFields.bgColor}
                  onChange={(e) =>
                    setCategoryFields((f) => ({
                      ...f,
                      bgColor: e.target.value,
                    }))
                  }
                  placeholder="#000000"
                  className="flex-1 px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-200">
                  Button Text
                </label>
                <input
                  type="text"
                  value={categoryFields.buttonText}
                  onChange={(e) =>
                    setCategoryFields((f) => ({
                      ...f,
                      buttonText: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                  placeholder="Button text"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-200">
                  Button Link
                </label>
                <input
                  type="text"
                  value={categoryFields.buttonLink}
                  onChange={(e) =>
                    setCategoryFields((f) => ({
                      ...f,
                      buttonLink: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                  placeholder="Button link URL"
                />
              </div>
            </div>
          </div>
        );
      case "features":
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-200">
                Feature Title <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={featureFields.title}
                onChange={(e) =>
                  setFeatureFields((f) => ({ ...f, title: e.target.value }))
                }
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                placeholder="Enter feature title"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-200">
                Description <span className="text-red-400">*</span>
              </label>
              <textarea
                rows={4}
                value={featureFields.description}
                onChange={(e) =>
                  setFeatureFields((f) => ({
                    ...f,
                    description: e.target.value,
                  }))
                }
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                placeholder="Describe the feature..."
                required
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-200">
                Icon
              </label>
              <div className="flex items-center space-x-3">
                <select
                  value={featureFields.icon}
                  onChange={(e) =>
                    setFeatureFields((f) => ({ ...f, icon: e.target.value }))
                  }
                  className="flex-1 px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="">Select icon...</option>
                  {lucideIconOptions.map((icon) => (
                    <option key={icon.value} value={icon.value}>
                      {icon.label}
                    </option>
                  ))}
                </select>
                <div className="w-12 h-12 flex items-center justify-center bg-slate-700/50 rounded-xl border border-slate-600/50">
                  <IconPreview iconName={featureFields.icon} />
                </div>
              </div>
            </div>
          </div>
        );
      case "process":
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-200">
                Step Number <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                value={processFields.stepNumber}
                onChange={(e) =>
                  setProcessFields((f) => ({
                    ...f,
                    stepNumber: parseInt(e.target.value),
                  }))
                }
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                placeholder="Step number"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-200">
                Title <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={processFields.title}
                onChange={(e) =>
                  setProcessFields((f) => ({ ...f, title: e.target.value }))
                }
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                placeholder="Process step title"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-200">
                Description <span className="text-red-400">*</span>
              </label>
              <textarea
                rows={4}
                value={processFields.description}
                onChange={(e) =>
                  setProcessFields((f) => ({
                    ...f,
                    description: e.target.value,
                  }))
                }
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                placeholder="Describe this process step..."
                required
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-200">
                Icon
              </label>
              <div className="flex items-center space-x-3">
                <select
                  value={processFields.icon}
                  onChange={(e) =>
                    setProcessFields((f) => ({ ...f, icon: e.target.value }))
                  }
                  className="flex-1 px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="">Select icon...</option>
                  {lucideIconOptions.map((icon) => (
                    <option key={icon.value} value={icon.value}>
                      {icon.label}
                    </option>
                  ))}
                </select>
                <div className="w-12 h-12 flex items-center justify-center bg-slate-700/50 rounded-xl border border-slate-600/50">
                  <IconPreview iconName={processFields.icon} />
                </div>
              </div>
            </div>
          </div>
        );
      case "statistics":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-200">
                  Value <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={statisticsFields.value}
                  onChange={(e) =>
                    setStatisticsFields((f) => ({ ...f, value: e.target.value }))
                  }
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                  placeholder="e.g., 100K+"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-200">
                  Label <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={statisticsFields.label}
                  onChange={(e) =>
                    setStatisticsFields((f) => ({ ...f, label: e.target.value }))
                  }
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                  placeholder="e.g., Happy Users"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-200">
                Icon
              </label>
              <div className="flex items-center space-x-3">
                <select
                  value={statisticsFields.icon}
                  onChange={(e) =>
                    setStatisticsFields((f) => ({ ...f, icon: e.target.value }))
                  }
                  className="flex-1 px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="">Select icon...</option>
                  {lucideIconOptions.map((icon) => (
                    <option key={icon.value} value={icon.value}>
                      {icon.label}
                    </option>
                  ))}
                </select>
                <div className="w-12 h-12 flex items-center justify-center bg-slate-700/50 rounded-xl border border-slate-600/50">
                  <IconPreview iconName={statisticsFields.icon} />
                </div>
              </div>
            </div>
          </div>
        );
      case "hero":
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-200">
                Badge Text
              </label>
              <input
                type="text"
                value={heroFields.badge}
                onChange={(e) =>
                  setHeroFields((f) => ({ ...f, badge: e.target.value }))
                }
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                placeholder="Optional badge text"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-200">
                Title <span className="text-red-400">*</span>
              </label>
              <textarea
                rows={2}
                value={heroFields.title}
                onChange={(e) =>
                  setHeroFields((f) => ({ ...f, title: e.target.value }))
                }
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                placeholder="Main hero title"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-200">
                Subtitle <span className="text-red-400">*</span>
              </label>
              <textarea
                rows={3}
                value={heroFields.subtitle}
                onChange={(e) =>
                  setHeroFields((f) => ({ ...f, subtitle: e.target.value }))
                }
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                placeholder="Hero subtitle"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-200">
                Description
              </label>
              <textarea
                rows={4}
                value={heroFields.description}
                onChange={(e) =>
                  setHeroFields((f) => ({ ...f, description: e.target.value }))
                }
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                placeholder="Additional description"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-200">
                  Button Text
                </label>
                <input
                  type="text"
                  value={heroFields.buttonText}
                  onChange={(e) =>
                    setHeroFields((f) => ({ ...f, buttonText: e.target.value }))
                  }
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                  placeholder="CTA button text"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-200">
                  Button Link
                </label>
                <input
                  type="text"
                  value={heroFields.buttonLink}
                  onChange={(e) =>
                    setHeroFields((f) => ({ ...f, buttonLink: e.target.value }))
                  }
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                  placeholder="Button link URL"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-200">
                Background Image URL
              </label>
              <input
                type="text"
                value={heroFields.backgroundImage}
                onChange={(e) =>
                  setHeroFields((f) => ({
                    ...f,
                    backgroundImage: e.target.value,
                  }))
                }
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                placeholder="Background image URL"
              />
            </div>
          </div>
        );
      case "content-blocks":
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-200">
                Title <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={contentBlockFields.title}
                onChange={(e) =>
                  setContentBlockFields((f) => ({
                    ...f,
                    title: e.target.value,
                  }))
                }
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                placeholder="Content block title"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-200">
                Content <span className="text-red-400">*</span>
              </label>
              <textarea
                rows={4}
                value={contentBlockFields.content}
                onChange={(e) =>
                  setContentBlockFields((f) => ({
                    ...f,
                    content: e.target.value,
                  }))
                }
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                placeholder="Content block text"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-200">
                Image URL
              </label>
              <input
                type="text"
                value={contentBlockFields.image}
                onChange={(e) =>
                  setContentBlockFields((f) => ({
                    ...f,
                    image: e.target.value,
                  }))
                }
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                placeholder="Image URL"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-200">
                  Button Text
                </label>
                <input
                  type="text"
                  value={contentBlockFields.buttonText}
                  onChange={(e) =>
                    setContentBlockFields((f) => ({
                      ...f,
                      buttonText: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                  placeholder="Button text"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-200">
                  Button Link
                </label>
                <input
                  type="text"
                  value={contentBlockFields.buttonLink}
                  onChange={(e) =>
                    setContentBlockFields((f) => ({
                      ...f,
                      buttonLink: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                  placeholder="Button link URL"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-200">
                Layout
              </label>
              <select
                value={contentBlockFields.layout}
                onChange={(e) =>
                  setContentBlockFields((f) => ({
                    ...f,
                    layout: e.target.value,
                  }))
                }
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
              >
                <option value="left">Image Left</option>
                <option value="right">Image Right</option>
              </select>
            </div>
          </div>
        );
      case "trust":
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-200">
                Title <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={trustFields.title}
                onChange={(e) =>
                  setTrustFields((f) => ({ ...f, title: e.target.value }))
                }
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                placeholder="Trust section title"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-200">
                Subtitle <span className="text-red-400">*</span>
              </label>
              <textarea
                rows={3}
                value={trustFields.subtitle}
                onChange={(e) =>
                  setTrustFields((f) => ({ ...f, subtitle: e.target.value }))
                }
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                placeholder="Trust section subtitle"
                required
              />
            </div>
            <div className="space-y-4">
              <label className="block text-sm font-semibold text-slate-200">
                Features
              </label>
              {trustFields.features.map((feature, index) => (
                <div
                  key={index}
                  className="p-6 bg-slate-800/30 border border-slate-600/30 rounded-xl space-y-4"
                >
                  <div className="flex items-center space-x-3">
                    <select
                      value={feature.icon}
                      onChange={(e) => {
                        const newFeatures = [...trustFields.features];
                        newFeatures[index].icon = e.target.value;
                        setTrustFields((f) => ({
                          ...f,
                          features: newFeatures,
                        }));
                      }}
                      className="flex-1 px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                    >
                      <option value="">Select icon...</option>
                      {lucideIconOptions.map((icon) => (
                        <option key={icon.value} value={icon.value}>
                          {icon.label}
                        </option>
                      ))}
                    </select>
                    <div className="w-12 h-12 flex items-center justify-center bg-slate-700/50 rounded-xl border border-slate-600/50">
                      <IconPreview iconName={feature.icon} />
                    </div>
                  </div>
                  <input
                    type="text"
                    placeholder="Feature Title"
                    value={feature.title}
                    onChange={(e) => {
                      const newFeatures = [...trustFields.features];
                      newFeatures[index].title = e.target.value;
                      setTrustFields((f) => ({
                        ...f,
                        features: newFeatures,
                      }));
                    }}
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                  />
                  <textarea
                    placeholder="Feature Description"
                    rows={2}
                    value={feature.description}
                    onChange={(e) => {
                      const newFeatures = [...trustFields.features];
                      newFeatures[index].description = e.target.value;
                      setTrustFields((f) => ({
                        ...f,
                        features: newFeatures,
                      }));
                    }}
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                  />
                  {trustFields.features.length > 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        const newFeatures = trustFields.features.filter(
                          (_, i) => i !== index
                        );
                        setTrustFields((f) => ({
                          ...f,
                          features: newFeatures,
                        }));
                      }}
                      className="flex items-center space-x-2 text-red-400 hover:text-red-300 transition-colors duration-200"
                    >
                      <Trash2 size={16} />
                      <span>Remove Feature</span>
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => {
                  setTrustFields((f) => ({
                    ...f,
                    features: [
                      ...f.features,
                      { icon: "", title: "", description: "" },
                    ],
                  }));
                }}
                className="flex items-center space-x-2 px-4 py-3 bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 rounded-xl hover:bg-indigo-600/30 transition-all duration-200"
              >
                <Plus size={16} />
                <span>Add Feature</span>
              </button>
            </div>
          </div>
        );
      case "section-headers":
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-200">
                Section ID <span className="text-red-400">*</span>
              </label>
              <select
                value={sectionHeaderFields.sectionId}
                onChange={(e) =>
                  setSectionHeaderFields((f) => ({
                    ...f,
                    sectionId: e.target.value,
                  }))
                }
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                required
              >
                <option value="">Select Section</option>
                <option value="hero">Hero Section</option>
                <option value="categories">Categories</option>
                <option value="features">Features</option>
                <option value="process">How It Works</option>
                <option value="testimonials">Testimonials</option>
                <option value="cta">CTA Section</option>
                <option value="affirmations-work">Affirmations Work</option>
                <option value="subliminal">Subliminal Section</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-200">
                Badge Text
              </label>
              <input
                type="text"
                value={sectionHeaderFields.badge}
                onChange={(e) =>
                  setSectionHeaderFields((f) => ({
                    ...f,
                    badge: e.target.value,
                  }))
                }
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                placeholder="Optional badge text"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-200">
                Title <span className="text-red-400">*</span>
              </label>
              <textarea
                rows={2}
                value={sectionHeaderFields.title}
                onChange={(e) =>
                  setSectionHeaderFields((f) => ({
                    ...f,
                    title: e.target.value,
                  }))
                }
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                placeholder="Section title"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-200">
                Subtitle
              </label>
              <textarea
                rows={3}
                value={sectionHeaderFields.subtitle}
                onChange={(e) =>
                  setSectionHeaderFields((f) => ({
                    ...f,
                    subtitle: e.target.value,
                  }))
                }
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                placeholder="Section subtitle"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-200">
                Background Image URL
              </label>
              <input
                type="text"
                value={sectionHeaderFields.backgroundImage}
                onChange={(e) =>
                  setSectionHeaderFields((f) => ({
                    ...f,
                    backgroundImage: e.target.value,
                  }))
                }
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                placeholder="Background image URL"
              />
            </div>
          </div>
        );
      case "cta-section":
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-200">
                Title <span className="text-red-400">*</span>
              </label>
              <textarea
                rows={2}
                value={ctaFields.title}
                onChange={(e) =>
                  setCtaFields((f) => ({ ...f, title: e.target.value }))
                }
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                placeholder="CTA section title"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-200">
                Subtitle <span className="text-red-400">*</span>
              </label>
              <textarea
                rows={3}
                value={ctaFields.subtitle}
                onChange={(e) =>
                  setCtaFields((f) => ({ ...f, subtitle: e.target.value }))
                }
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                placeholder="CTA section subtitle"
                required
              />
            </div>
            <div className="space-y-4">
              <label className="block text-sm font-semibold text-slate-200">
                Features
              </label>
              {ctaFields.features.map((feature, index) => (
                <div
                  key={index}
                  className="p-6 bg-slate-800/30 border border-slate-600/30 rounded-xl space-y-4"
                >
                  <div className="flex items-center space-x-3">
                    <select
                      value={feature.icon}
                      onChange={(e) => {
                        const newFeatures = [...ctaFields.features];
                        newFeatures[index].icon = e.target.value;
                        setCtaFields((f) => ({
                          ...f,
                          features: newFeatures,
                        }));
                      }}
                      className="flex-1 px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                    >
                      <option value="">Select icon...</option>
                      {lucideIconOptions.map((icon) => (
                        <option key={icon.value} value={icon.value}>
                          {icon.label}
                        </option>
                      ))}
                    </select>
                    <div className="w-12 h-12 flex items-center justify-center bg-slate-700/50 rounded-xl border border-slate-600/50">
                      <IconPreview iconName={feature.icon} />
                    </div>
                  </div>
                  <input
                    type="text"
                    placeholder="Feature Title"
                    value={feature.title}
                    onChange={(e) => {
                      const newFeatures = [...ctaFields.features];
                      newFeatures[index].title = e.target.value;
                      setCtaFields((f) => ({ ...f, features: newFeatures }));
                    }}
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                  />
                  <textarea
                    placeholder="Feature Description"
                    rows={2}
                    value={feature.description}
                    onChange={(e) => {
                      const newFeatures = [...ctaFields.features];
                      newFeatures[index].description = e.target.value;
                      setCtaFields((f) => ({ ...f, features: newFeatures }));
                    }}
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                  />
                  {ctaFields.features.length > 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        const newFeatures = ctaFields.features.filter(
                          (_, i) => i !== index
                        );
                        setCtaFields((f) => ({ ...f, features: newFeatures }));
                      }}
                      className="flex items-center space-x-2 text-red-400 hover:text-red-300 transition-colors duration-200"
                    >
                      <Trash2 size={16} />
                      <span>Remove Feature</span>
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => {
                  setCtaFields((f) => ({
                    ...f,
                    features: [
                      ...f.features,
                      { icon: "", title: "", description: "" },
                    ],
                  }));
                }}
                className="flex items-center space-x-2 px-4 py-3 bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 rounded-xl hover:bg-indigo-600/30 transition-all duration-200"
              >
                <Plus size={16} />
                <span>Add Feature</span>
              </button>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-200">
                Background Image URL
              </label>
              <input
                type="text"
                value={ctaFields.backgroundImage}
                onChange={(e) =>
                  setCtaFields((f) => ({
                    ...f,
                    backgroundImage: e.target.value,
                  }))
                }
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                placeholder="Background image URL"
              />
            </div>
          </div>
        );
      case "faq":
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-200">
                Title <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={faqFields.title}
                onChange={(e) =>
                  setFaqFields((f) => ({ ...f, title: e.target.value }))
                }
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                placeholder="FAQ section title"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-200">
                Description
              </label>
              <textarea
                rows={3}
                value={faqFields.description}
                onChange={(e) =>
                  setFaqFields((f) => ({ ...f, description: e.target.value }))
                }
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                placeholder="FAQ section description"
              />
            </div>
            <div className="space-y-4">
              <label className="block text-sm font-semibold text-slate-200">
                Questions & Answers
              </label>
              {faqFields.questions.map((item, index) => (
                <div
                  key={index}
                  className="p-6 bg-slate-800/30 border border-slate-600/30 rounded-xl space-y-4"
                >
                  <input
                    type="text"
                    placeholder="Question"
                    value={item.question}
                    onChange={(e) => {
                      const newQuestions = [...faqFields.questions];
                      newQuestions[index].question = e.target.value;
                      setFaqFields((f) => ({
                        ...f,
                        questions: newQuestions,
                      }));
                    }}
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                  />
                  <textarea
                    placeholder="Answer"
                    rows={4}
                    value={item.answer}
                    onChange={(e) => {
                      const newQuestions = [...faqFields.questions];
                      newQuestions[index].answer = e.target.value;
                      setFaqFields((f) => ({
                        ...f,
                        questions: newQuestions,
                      }));
                    }}
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                  />
                  {faqFields.questions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        const newQuestions = faqFields.questions.filter(
                          (_, i) => i !== index
                        );
                        setFaqFields((f) => ({
                          ...f,
                          questions: newQuestions,
                        }));
                      }}
                      className="flex items-center space-x-2 text-red-400 hover:text-red-300 transition-colors duration-200"
                    >
                      <Trash2 size={16} />
                      <span>Remove Question</span>
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => {
                  setFaqFields((f) => ({
                    ...f,
                    questions: [...f.questions, { question: "", answer: "" }],
                  }));
                }}
                className="flex items-center space-x-2 px-4 py-3 bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 rounded-xl hover:bg-indigo-600/30 transition-all duration-200"
              >
                <Plus size={16} />
                <span>Add Question</span>
              </button>
            </div>
          </div>
        );
      default:
        return (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-400 text-lg">No editor available for this content type.</p>
          </div>
        );
    }
  };

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-300 text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-300 text-lg">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  const currentContentType = contentTypes.find(type => type.key === contentType);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto p-6 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Settings className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                Content Management
              </h1>
              <p className="text-slate-400">Manage your website content with ease</p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-2">
            <div className="flex space-x-2 overflow-x-auto scrollbar-hide">
              {contentTypes.map((type) => {
                const IconComponent = type.icon;
                const isActive = contentType === type.key;
                return (
                  <button
                    key={type.key}
                    onClick={() => handleContentTypeChange(type.key)}
                    className={`flex items-center space-x-2 px-4 py-3 rounded-xl font-medium text-sm whitespace-nowrap transition-all duration-200 ${
                      isActive
                        ? `bg-gradient-to-r ${type.color} text-white shadow-lg shadow-indigo-500/25`
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-700/50"
                    }`}
                  >
                    <IconComponent size={18} />
                    <span>{type.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Content List */}
          <div className="xl:col-span-1">
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 sticky top-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  {currentContentType && (
                    <div className={`w-10 h-10 bg-gradient-to-r ${currentContentType.color} rounded-xl flex items-center justify-center`}>
                      <currentContentType.icon size={20} className="text-white" />
                    </div>
                  )}
                  <div>
                    <h2 className="text-xl font-semibold text-white">
                      Existing Content
                    </h2>
                    <p className="text-slate-400 text-sm">{contentData.length} items</p>
                  </div>
                </div>
                <button
                  onClick={handleCreate}
                  className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg shadow-indigo-500/25"
                >
                  <Plus size={16} />
                  <span>Create</span>
                </button>
              </div>

              {isLoading && (
                <div className="text-center py-8">
                  <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto mb-3"></div>
                  <p className="text-slate-400">Loading content...</p>
                </div>
              )}

              {error && (
                <div className="mb-4 p-4 bg-red-900/20 border border-red-500/30 rounded-xl text-red-300 text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-3 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800">
                {contentData.map((item) => (
                  <div
                    key={item._id}
                    className="group p-4 bg-slate-700/30 border border-slate-600/30 rounded-xl hover:bg-slate-700/50 transition-all duration-200"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-slate-200 font-medium truncate group-hover:text-white transition-colors duration-200">
                          {item.title}
                        </h3>
                        <p className="text-slate-400 text-xs mt-1">
                          {new Date(item.updatedAt || item.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex space-x-2 ml-3">
                        <button
                          onClick={() => handleEdit(item._id)}
                          className="p-2 text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-all duration-200"
                          title="Edit"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(item._id)}
                          className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-200"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {contentData.length === 0 && !isLoading && (
                  <div className="text-center py-12">
                    <FileText className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                    <p className="text-slate-400">No content found</p>
                    <p className="text-slate-500 text-sm mt-1">Create your first item to get started</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Content Editor */}
          <div className="xl:col-span-2">
            {contentId ? (
              <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center space-x-4">
                    {currentContentType && (
                      <div className={`w-12 h-12 bg-gradient-to-r ${currentContentType.color} rounded-xl flex items-center justify-center`}>
                        <currentContentType.icon size={24} className="text-white" />
                      </div>
                    )}
                    <div>
                      <h2 className="text-2xl font-semibold text-white">
                        {contentId === "new" ? "Create New Content" : "Edit Content"}
                      </h2>
                      <p className="text-slate-400">
                        {contentId === "new" ? "Add new content to your website" : "Update existing content"}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setContentId(null)}
                    className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 rounded-xl transition-all duration-200"
                  >
                    <X size={20} />
                  </button>
                </div>

                {error && (
                  <div className="mb-6 p-4 bg-red-900/20 border border-red-500/30 rounded-xl text-red-300">
                    <div className="flex items-center space-x-2">
                      <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                        <X size={12} className="text-white" />
                      </div>
                      <span>{error}</span>
                    </div>
                  </div>
                )}

                <div className="space-y-8">
                  {renderEditor()}
                  
                  <div className="flex items-center justify-end space-x-4 pt-6 border-t border-slate-700/50">
                    <button
                      onClick={() => setContentId(null)}
                      className="px-6 py-3 text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 rounded-xl transition-all duration-200"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={isLoading}
                      className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-indigo-500/25"
                    >
                      {isLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          <span>Saving...</span>
                        </>
                      ) : (
                        <>
                          <Save size={16} />
                          <span>Save Content</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-12 text-center">
                <div className="max-w-md mx-auto">
                  {currentContentType && (
                    <div className={`w-20 h-20 bg-gradient-to-r ${currentContentType.color} rounded-2xl flex items-center justify-center mx-auto mb-6`}>
                      <currentContentType.icon size={32} className="text-white" />
                    </div>
                  )}
                  <h2 className="text-2xl font-semibold text-white mb-4">
                    Content Editor
                  </h2>
                  <p className="text-slate-400 mb-8 leading-relaxed">
                    Select an existing content item to edit or create a new one to get started with managing your {currentContentType?.label.toLowerCase()}.
                  </p>
                  <button
                    onClick={handleCreate}
                    className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg shadow-indigo-500/25 mx-auto"
                  >
                    <Plus size={16} />
                    <span>Create New Content</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}; 

export default AdminContentPage;
