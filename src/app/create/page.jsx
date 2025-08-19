"use client";

import { useState, useEffect, useRef } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ChevronLeft,
  ChevronRight,
  Mic,
  Music,
  Download,
  Settings,
  CheckCircle2,
  Info,
  Edit,
  CheckCircle2Icon,
  ChevronRightCircle,
  ChevronsRight,
  Mic2Icon,
  MicIcon,
  ScrollText,
} from "lucide-react";
import EnhancedAudioPlayer from "@/components/create/EnhancedAudioPlayer";
import VoiceSettingsDropdown from "@/components/create/VoiceSettingsDropdown";
import { redirect, useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/context/ThemeContext";
import { saveAudioToLibrary } from "@/lib/audio-utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { categories } from "@/server/constant";
import { set } from "react-hook-form";
// import { initializeOpenAI, generateAffirmationsWithAI } from "@/lib/openai";

export default function CreatePage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    category: "",
    goal: "",
    affirmations: [],
    voiceType: "en-US-Neural2-F",
    musicTrack: null,
    customOnly: false,
    musicVolume: 1.0,
    affirmationsVolume: 0.2, // Default to 20%
    repetitionInterval: 10,
    speed: 1,
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedAffirmations, setGeneratedAffirmations] = useState([]);
  const [customAffirmations, setCustomAffirmations] = useState([]);
  const [showCustomDialog, setShowCustomDialog] = useState(false);
  const [customAffirmation, setCustomAffirmation] = useState("");
  const [error, setError] = useState("");
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(false);
  const [isGeneratingFinal, setIsGeneratingFinal] = useState(false);
  const [finalAudioUrl, setFinalAudioUrl] = useState("");
  const [availableVoices, setAvailableVoices] = useState([]);
  const [isDownloading, setIsDownloading] = useState(false);
  const [musicTracks, setMusicTracks] = useState([]);
  const [isLoadingTracks, setIsLoadingTracks] = useState(true);
  const [showRawAudio, setShowRawAudio] = useState(false);
  const [showDebugTools, setShowDebugTools] = useState(false);
  const [processedAudioUrl, setProcessedAudioUrl] = useState(""); // Store the processed audio URL
  const [selectedAffirmations, setSelectedAffirmations] = useState([]);
  const [allCatsAffirmations, setAllCatsAffirmations] = useState([]);

  const [editAffirmation, setEditAffirmation] = useState("");
  const [editIndex, setEditIndex] = useState(null);

  // Group voices by language for the dropdown
  const [groupedVoices, setGroupedVoices] = useState({});
  const [voiceLanguages, setVoiceLanguages] = useState([]);
  const { user, logout } = useAuth();

  const [subscriptionStatus, setSubscriptionStatus] = useState({});

  // Add router and toast
  const router = useRouter();
  const { toast } = useToast();

  const [currentPlayingTrackId, setCurrentPlayingTrackId] = useState(null);
  const audioRef = useRef(null);

  // Add this function inside the CreatePage component, after the useState declarations
  const { currentTheme } = useTheme();

  // Get theme colors from the current theme
  const getThemeColor = (index, fallback) => {
    if (!currentTheme || !currentTheme.palettes) return fallback;

    const activePalette =
      currentTheme.palettes.find((p) => p.isActive) || currentTheme.palettes[0];
    if (
      !activePalette ||
      !activePalette.colors ||
      activePalette.colors.length <= index
    ) {
      return fallback;
    }

    return activePalette.colors[index];
  };

  // Theme colors with fallbacks
  const primaryColor = getThemeColor(0, "#4169E1"); // Primary (indigo)
  const secondaryColor = getThemeColor(1, "#87CEEB"); // Secondary (light blue)
  const accentColor = getThemeColor(2, "#1E90FF"); // Accent (dodger blue)
  const mutedColor = getThemeColor(3, "#6495ED"); // Muted (cornflower blue)

  // Dynamic gradient styles
  const heroGradient = `linear-gradient(to bottom right, ${primaryColor}20, ${secondaryColor}20, ${primaryColor}20)`;
  const primaryGradient = `linear-gradient(to right, ${primaryColor}, ${secondaryColor})`;

  // Fetch music tracks from database
  const fetchMusicTracks = async () => {
    try {
      setIsLoadingTracks(true);
      const response = await fetch("/api/admin/music");

      if (!response.ok) {
        throw new Error("Failed to fetch music tracks");
      }

      const data = await response.json();

      // Ensure each track has the required properties
      const processedTracks = (data.tracks || []).map((track) => ({
        id: track.id || `track-${Math.random().toString(36).substr(2, 9)}`,
        name: track.name || "Untitled Track",
        category: track.category || "Music",
        duration: track.duration || "0:00",
        imageUrl: track.imageUrl || (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-music4-icon lucide-music-4"
          >
            <path d="M9 18V5l12-2v13" />
            <path d="m9 9 12-2" />
            <circle cx="6" cy="18" r="3" />
            <circle cx="18" cy="16" r="3" />
          </svg>
        ),
        audioUrl: track.path || track.url || "", // Support both audioUrl and url properties
      }));

      setMusicTracks(processedTracks);
    } catch (error) {
      // console.error("Error fetching music tracks:", error);
      toast({
        title: "Error",
        description: "Failed to load music tracks. Please try again.",
        variant: "destructive",
      });

      // Fallback to sample tracks if API fails
      setMusicTracks([
        {
          id: "calm-waves",
          name: "Calm Waves",
          category: "Relaxation",
          duration: "4:32",
          imageUrl: "/placeholder.svg?height=80&width=80",
          audioUrl:
            "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
        },
        {
          id: "deep-focus",
          name: "Deep Focus",
          category: "Productivity",
          duration: "3:45",
          imageUrl: "/placeholder.svg?height=80&width=80",
          audioUrl:
            "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
        },
        {
          id: "dream-state",
          name: "Dream State",
          category: "Sleep",
          duration: "5:15",
          imageUrl: "/placeholder.svg?height=80&width=80",
          audioUrl:
            "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
        },
        {
          id: "energy-boost",
          name: "Energy Boost",
          category: "Motivation",
          duration: "3:21",
          imageUrl: "/placeholder.svg?height=80&width=80",
          audioUrl:
            "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
        },
      ]);
    } finally {
      setIsLoadingTracks(false);
    }
  };

  // Fetch audio settings
  const fetchAudioSettings = async () => {
    try {
      const response = await fetch("/api/user/settings/audio");
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.settings) {
          // Update form data with user settings
          setFormData((prev) => ({
            ...prev,
            musicVolume: data.settings.musicVolume,
            affirmationsVolume: data.settings.affirmationsVolume,
            repetitionInterval: data.settings.repetitionInterval,
            speed: data.settings.speed,
          }));
        } else {
          console.log("No user settings found, using defaults");
          // Keep using the default values from initial state
        }
      } else {
        console.error("Failed to fetch user settings, using defaults");
        // Keep using the default values from initial state
      }
    } catch (err) {
      console.error("Error fetching audio settings:", err);
      // No need to set error state as we're just using defaults
    }
  };

  useEffect(() => {
    if (user && user?.id) {
      checkUserSubscriptionStatus(user?.id);
    }
  }, [user]);

  useEffect(() => {
    // if (!user) {
    //   if (typeof window !== 'undefined') {
    //     window.open("/auth", "_self");
    //   }
    // }

    fetchMusicTracks();
    fetchAudioSettings();
    const params = new URLSearchParams(window.location.search);
    const cid = params.get("cid"); // this gets 'health'
    if (cid) {
      handleCategorySelect(cid);
    }
    // Enable debug tools with keyboard shortcut (Ctrl+Shift+D)
    // const handleKeyDown = (e) => {
    //   if (e.ctrlKey && e.shiftKey && e.key === "D") {
    //     setShowDebugTools((prev) => !prev);
    //     toast({
    //       title: "Debug Tools",
    //       description: "Debug tools have been toggled",
    //       variant: "default",
    //     });
    //   }
    // };

    // window.addEventListener("keydown", handleKeyDown);
    // return () => window.removeEventListener("keydown", handleKeyDown);
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0; // reset if needed
      }
    };
  }, []);

  // Initialize voices
  useEffect(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      const updateVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        setAvailableVoices(voices);

        // Group voices by language
        const grouped = {};
        const languages = [];

        voices.forEach((voice) => {
          if (!voice.lang) return;

          const langCode = voice.lang.split("-").slice(0, 2).join("-");

          if (!grouped[langCode]) {
            grouped[langCode] = [];
            languages.push({
              code: langCode,
              name: getLanguageName(langCode),
            });
          }

          grouped[langCode].push({
            value: voice.name,
            label: `${voice.name} (${voice.lang})`,
            language: langCode,
          });
        });

        setGroupedVoices(grouped);
        setVoiceLanguages(
          languages.sort((a, b) => a.name.localeCompare(b.name))
        );
      };

      // Chrome loads voices asynchronously
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = updateVoices;
      }

      updateVoices();
    }
  }, []);

  // Helper function to get language name from code
  const getLanguageName = (langCode) => {
    const languages = {
      "en-US": "US English",
      "en-GB": "British English",
      "en-AU": "Australian English",
      "es-ES": "Spanish (Spain)",
      "es-MX": "Spanish (Mexico)",
      "fr-FR": "French",
      "de-DE": "German",
      "it-IT": "Italian",
      "ja-JP": "Japanese",
      "ko-KR": "Korean",
      "pt-BR": "Portuguese (Brazil)",
      "ru-RU": "Russian",
      "zh-CN": "Chinese (Mainland)",
      "zh-TW": "Chinese (Taiwan)",
    };

    return languages[langCode] || langCode;
  };

  const updateFormData = (data) => {
    // Stop any preview playback when settings change
    setIsPreviewPlaying(false);

    // Cancel any ongoing speech synthesis
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

    setFormData({ ...formData, ...data });
  };

  // Add this function inside CreatePage:
  const [maxStepReached, setMaxStepReached] = useState(1);

  const setStepSafe = (s) => {
    if (maxStepReached >= 4) {
      setStep(s);
    } else {
      // Only allow forward navigation or current logic
      if (s <= step) setStep(s);
    }
  };

  // In handleNext, update maxStepReached
  const handleNext = () => {
    if (step == 3) {
      setIsPreviewPlaying(false);
      setCurrentPlayingTrackId(null);
      audioRef?.current?.pause();
    }
    setStep((prev) => {
      const nextStep = prev + 1;
      setMaxStepReached((max) => Math.max(max, nextStep));
      if (nextStep == 4) {
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0; // reset if needed
        }
      }
      return nextStep;
    });
  };

  const handleBack = () => {
    setStep(step - 1);
    setError("");
    let newStep = step - 1;
    if (newStep == 2) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0; // reset if needed
      }
    }
  };

  const handleCategorySelect = (categoryId) => {
    updateFormData({ category: categoryId });
    let selectedCategory = categories.find((cat) => cat.id === categoryId);
    if (selectedCategory) {
      setAllCatsAffirmations(selectedCategory.affirmations);
      // setGeneratedAffirmations(selectedCategory.affirmations)
    }
    setSelectedAffirmations([]);
    setCustomAffirmations([]);
    setError("");
  };

  const handleAffirmationToggle = (affirmation) => {
    if (selectedAffirmations.includes(affirmation)) {
      setSelectedAffirmations(
        selectedAffirmations.filter((a) => a !== affirmation)
      );
      setCustomAffirmations(
        selectedAffirmations.filter((a) => a !== affirmation)
      );
    } else {
      setSelectedAffirmations([...selectedAffirmations, affirmation]);
      setCustomAffirmations([...selectedAffirmations, affirmation]);
    }
  };

  // const handleGenerateAffirmations = async () => {
  //   setError("");

  //   if (!formData.category && !formData.customOnly) {
  //     setError("Please select a category first");
  //     return;
  //   }

  //   if (!formData.goal && !formData.customOnly) {
  //     setError("Please enter your goal first");
  //     return;
  //   }

  //   setIsGenerating(true);

  //   try {
  //     // Simulate API call to generate affirmations
  //     initializeOpenAI();
  //     let generatedAffirmations;

  //     // Use the mock data if in development mode or testing
  //     if (
  //       process.env.NODE_ENV === "development" &&
  //       process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true"
  //     ) {
  //       // Simulate API call to generate affirmations
  //       await new Promise((resolve) => setTimeout(resolve, 1500));
  //       generatedAffirmations =
  //         categories.find((cat) => cat.id === formData.category)
  //           ?.affirmations || [];
  //     } else {
  //       // Generate affirmations using OpenAI
  //       generatedAffirmations = await generateAffirmationsWithAI(
  //         categories.find((cat) => cat.id === formData.category)?.name ||
  //           formData.category,
  //         formData.goal,
  //         6 // Number of affirmations to generate
  //       );
  //     }
  //     // Mock generated affirmations based on category
  //     let mockAffirmations = [];

  //     mockAffirmations = categories.find(
  //       (cat) => cat.id === formData.category
  //     ).affirmations;
  //     setGeneratedAffirmations(generatedAffirmations);
  //     updateFormData({
  //       affirmations: generatedAffirmations || mockAffirmations,
  //     });
  //     setSelectedAffirmations([...generatedAffirmations]);
  //     setCustomAffirmations([...generatedAffirmations]);
  //   } catch (error) {
  //     console.error("Error generating affirmations:", error);
  //     setError("Failed to generate affirmations. Please try again.");
  //   } finally {
  //     setIsGenerating(false);
  //   }
  // };

  const handleGenerateAffirmations = async () => {
    setError("");

    if (!formData.category && !formData.customOnly) {
      setError("Please select a category first");
      return;
    }

    if (!formData.goal && !formData.customOnly) {
      setError("Please enter your goal first");
      return;
    }

    setIsGenerating(true);

    try {
      let generatedAffirmations;

      // Use the mock data if in development mode or testing
      if (
        process.env.NODE_ENV === "development" &&
        process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true"
      ) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        generatedAffirmations =
          categories.find((cat) => cat.id === formData.category)
            ?.affirmations || [];
      } else {
        // Request affirmations from the secure server route
        const displayCategory =
          categories.find((cat) => cat.id === formData.category)?.name ||
          formData.category;

        const res = await fetch("/api/affirmations/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ category: displayCategory, goal: formData.goal }),
        });

        if (!res.ok) {
          throw new Error("Failed to generate affirmations");
        }

        const data = await res.json();
        generatedAffirmations = data.affirmations || [];
      }
      // Mock generated affirmations based on category
      let mockAffirmations = [];

      mockAffirmations = categories.find(
        (cat) => cat.id === formData.category
      ).affirmations;
      setGeneratedAffirmations(generatedAffirmations);
      updateFormData({
        affirmations: generatedAffirmations || mockAffirmations,
      });
      setSelectedAffirmations([...generatedAffirmations]);
      setCustomAffirmations([...generatedAffirmations]);
    } catch (error) {
      console.error("Error generating affirmations:", error);
      setError("Failed to generate affirmations. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddCustomAffirmation = (
    affirmation = "",
    type = "add",
    index = 1
  ) => {
    setShowCustomDialog(true);
    setCustomAffirmation(affirmation);
    if (type === "edit") {
      setEditIndex(index); // we'll use this during update
    } else {
      setEditIndex(null); // add mode
    }
  };

  const handleAddCustomAffirmationSubmit = () => {
    const trimmedAffirmation = customAffirmation.trim();

    if (!trimmedAffirmation) {
      setError("Please enter an affirmation");
      return;
    }

    let updatedAffirmations = [...customAffirmations];

    if (editIndex !== null) {
      // Edit existing
      updatedAffirmations[editIndex] = trimmedAffirmation;
    } else {
      // Add new
      updatedAffirmations.push(trimmedAffirmation);
    }

    // Update states
    setCustomAffirmations(updatedAffirmations);
    updateFormData({ affirmations: updatedAffirmations });

    // Reset everything
    setCustomAffirmation("");
    setEditIndex(null);
    setShowCustomDialog(false);
    setError("");
  };

  // Add this function inside the CreatePage component
  const [selectedMusic, setSelectedMusic] = useState(null);
  const [affirmations, setAffirmations] = useState([]);
  const [audioContext, setAudioContext] = useState(null);
  const [voiceType, setVoiceType] = useState("en-US-Neural2-F");
  const [voiceLanguage, setVoiceLanguage] = useState("en-US");
  const [voicePitch, setVoicePitch] = useState(1.0);
  const [voiceSpeed, setVoiceSpeed] = useState(1.0);
  const [volume, setVolume] = useState(1.0);
  const [repetitionInterval, setRepetitionInterval] = useState(10);

  // Find the section where you handle saving audio and update it to use the save dialog

  // First, add state for the save dialog
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [tempAudioData, setTempAudioData] = useState(null);
  const [audioTitle, setAudioTitle] = useState("");
  const [titleError, setTitleError] = useState("");

  // Replace your existing save function with this updated version
  const handleSaveToLibrary = async () => {
    if (!finalAudioUrl) {
      toast({
        title: "Error",
        description: "Please generate audio first",
        variant: "destructive",
      });
      return;
    }

    // Store the audio data temporarily
    // Get the display name for the selected voice
    let voiceName = formData.voicePersonaName || formData.voiceType;
    const tempData = {
      affirmations: currentAffirmations,
      musicTrack: formData.musicTrack,
      voiceType: formData.voiceType,
      voiceName: voiceName, // Save the display name
      voiceLanguage: "en-US",
      voicePitch: formData.voicePitch || 0,
      voiceSpeed: formData.speed || 0,
      volume: formData.affirmationsVolume,
      audioUrl: finalAudioUrl,
      category: formData.category || "General",
      repetitionInterval: formData.repetitionInterval || 10,
    };

    setTempAudioData(tempData);

    // Generate a default title suggestion
    const defaultTitle = formData.musicTrack
      ? `${formData.category || "Custom"} Affirmations with ${
          formData.musicTrack.name
        }`
      : `${formData.category || "Custom"} Affirmations`;

    setAudioTitle(defaultTitle);
    // Open the save dialog with the default title
    setShowSaveDialog(true);
  };

  // Add a new function to handle the actual saving with the title
  const handleSaveWithTitle = async () => {
    if (!audioTitle || audioTitle.trim() === "") {
      setTitleError("Please enter a title for your audio.");
      return;
    }

    const audioDataToSave = {
      ...tempAudioData,
      name: audioTitle,
    };

    if (!user) {
      localStorage.setItem("pendingAudioSave", JSON.stringify(audioDataToSave));
      // Redirect to auth page
      router.push("/auth?returnTo=create");
      return;
    }

    if (subscriptionStatus?.hasActiveSubscription) {
      setIsSaving(true);
      try {
        // Create the final audioData object with the user-provided title
        const audioData = {
          ...tempAudioData,
          name: audioTitle, // Use the title from the dialog
        };

        const result = await saveAudioToLibrary(audioData);

        if (result.success) {
          toast({
            title: "Success",
            description: "Audio saved to your library!",
            variant: "success",
          });
          router.push("/dashboard/audios");
        } else {
          throw new Error(result.error || "Failed to save audio");
        }
      } catch (error) {
        console.error("Error saving audio:", error);
        toast({
          title: "Error",
          description: error.message || "Failed to save audio",
          variant: "destructive",
        });
      } finally {
        setIsSaving(false);
        setShowSaveDialog(false);
      }
    } else if (
      subscriptionStatus?.hasOneTimePayments &&
      subscriptionStatus?.paymentCount > 0
    ) {
      const currentActivePayment = await fetchPayments(user?.id);
      if (currentActivePayment) {
        setIsSaving(true);
        try {
          // Create the final audioData object with the user-provided title
          const audioData = {
            ...tempAudioData,
            name: audioTitle, // Use the title from the dialog
          };

          const result = await saveAudioToLibrary(audioData);
          if (result.success) {
            await updatePaymentData(
              currentActivePayment?._id,
              result?.audio?.id
            );
            toast({
              title: "Success",
              description: "Audio saved to your library!",
              variant: "success",
            });
            router.push("/dashboard/audios");
          } else {
            throw new Error(result.error || "Failed to save audio");
          }
        } catch (error) {
          console.error("Error saving audio:", error);
          toast({
            title: "Error",
            description: error.message || "Failed to save audio",
            variant: "destructive",
          });
        } finally {
          setIsSaving(false);
          setShowSaveDialog(false);
        }
      } else {
        toast({
          title: "Premium Feature",
          description: "Please upgrade to save audio to your library.",
          variant: "destructive",
        });
        localStorage.setItem(
          "pendingAudioSave",
          JSON.stringify(audioDataToSave)
        );
        // Redirect to pricing page
        router.push("/pricing");
        return;
      }
    } else {
      toast({
        title: "Premium Feature",
        description: "Please upgrade to save audio to your library.",
        variant: "destructive",
      });
      localStorage.setItem("pendingAudioSave", JSON.stringify(audioDataToSave));
      // Redirect to pricing page
      router.push("/pricing");
      return;
    }
  };

  // Function to check user's subscription status and one-time payments
  const checkUserSubscriptionStatus = async (userId) => {
    try {
      const response = await fetch(
        `/api/user/subscription-status?userId=${userId}`
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to check subscription status");
      }

      setSubscriptionStatus(data);
    } catch (error) {
      console.error("Error checking subscription status:", error);
      return false;
    }
  };

  // fetch payment for update on create audio if one-time payments active
  const fetchPayments = async (userId) => {
    try {
      const params = new URLSearchParams();
      if (user?.role === "admin") params.append("admin", "true");
      if (userId) params.append("userId", userId);

      const response = await fetch(`/api/admin/payments?${params}`);
      const data = await response.json();

      if (response.ok) {
        // setPayments(data.payments)
        return data.payments.find((payment) => payment.audioId === null);
      } else {
        console.error("Failed to fetch payments:", data.error);
      }
    } catch (error) {
      console.error("Error fetching payments:", error);
    }
  };

  // Update payment data :-  add audio id after audio creation
  const updatePaymentData = async (paymentId, audioId) => {
    try {
      const res = await fetch("/api/user/update-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: paymentId,
          updates: {
            audioId: audioId,
          },
        }),
      });
    } catch (error) {
      console.error("Error updating payment data:", error);
    }
  };

  // Modified to process audio with affirmations and stop playback after generation\
  const handleCreateFinalAudio = async () => {
    updateFormData({ affirmations: customAffirmations });
    if (!formData.musicTrack) {
      setError("Please selectt a music track");
      return;
    }

    if (!customAffirmations || customAffirmations?.length === 0) {
      setError("Please create some affirmations first");
      return;
    }

    // Stop any playing audio and speech synthesis
    setIsPreviewPlaying(false);
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

    setIsGeneratingFinal(true);
    setError("");

    try {
      // First, try to process the audio with affirmations
      const processResponse = await fetch("/api/audio/process", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          musicTrackUrl: formData.musicTrack.audioUrl,
          affirmations: customAffirmations,
          voiceSettings: {
            voice: formData.voiceType,
            volume: formData.affirmationsVolume,
            repetitionInterval: formData.repetitionInterval,
            speed: formData.speed,
          },
        }),
      });

      if (processResponse.ok) {
        const processData = await processResponse.json();

        if (processData.success && processData.processedAudioUrl) {
          // Store the processed audio URL for download
          setProcessedAudioUrl(processData.processedAudioUrl);
          setFinalAudioUrl(processData.processedAudioUrl);

          toast({
            title: "Success",
            description:
              "Your Sublmnl audio has been created successfully with affirmations!",
            variant: "success",
          });

          // Return early since we have the processed audio
          setIsGeneratingFinal(false);
          return;
        }
      }

      // If processing fails, fall back to the generate API
      console.warn("Audio processing failed, falling back to generate API");

      // Call the API to generate the audio with affirmations
      const response = await fetch("/api/audio/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          musicTrackUrl: formData.musicTrack.audioUrl,
          affirmations: customAffirmations,
          voiceSettings: {
            voice: formData.voiceType,
            volume: formData.affirmationsVolume,
            repetitionInterval: formData.repetitionInterval,
            speed: formData.speed,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message ||
            `Server responded with status: ${response.status}`
        );
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Failed to generate audio");
      }

      // Set the final audio URL to the generated audio
      setFinalAudioUrl(data.audioUrl);
      toast({
        title: "Success",
        description: "Your Sublmnl audio has been created successfully!",
        variant: "success",
      });
    } catch (error) {
      console.error("Error creating final audio:", error);
      setError(
        "Failed to create your Sublmnl audio with affirmations. Please try again."
      );

      // Fallback to using the music track directly if API fails
      setFinalAudioUrl(formData.musicTrack.audioUrl);

      toast({
        title: "Warning",
        description:
          "Using fallback audio without affirmations due to an error. You can still download the music track.",
        variant: "warning",
      });
    } finally {
      setIsGeneratingFinal(false);
      // Ensure playback is stopped after generation
      setIsPreviewPlaying(false);
    }
  };

  // Get the current affirmations based on the mode
  const currentAffirmations = formData.customOnly
    ? customAffirmations
    : formData.affirmations;

  // Voice settings for the audio player
  const voiceSettings = {
    voice: formData.voiceType,
  };

  // Determine which music track to preview
  const previewMusicTrack = formData.musicTrack
    ? formData.musicTrack.audioUrl
    : null;

  const handleTrackPreviewToggle = (track) => {
    const isSameTrack = currentPlayingTrackId === track.id;
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }
    if (isSameTrack) {
      if (isPreviewPlaying) {
        audioRef.current.pause();
        setIsPreviewPlaying(false);
      } else {
        audioRef.current.play();
        setIsPreviewPlaying(true);
      }
    } else {
      // Switch to new track
      audioRef.current.pause(); // stop previous if playing
      audioRef.current = new Audio(track.audioUrl); // replace with actual URL property
      audioRef.current.play();
      updateFormData({ musicTrack: track });
      setCurrentPlayingTrackId(track.id);
      setIsPreviewPlaying(true);
    }

    // Handle when audio ends
    audioRef.current.onended = () => {
      setIsPreviewPlaying(false);
      setCurrentPlayingTrackId(null);
    };
  };

  return (
    <div className="min-h-screen py-8 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-8">
          Create Your Sublmnl Audio
        </h1>

        {/* Progress steps */}
        <div className="flex justify-between items-center mb-8 max-w-3xl mx-auto">
          {[1,2,3,4].map((s, idx) => (
            <>
              {maxStepReached >= s ? (
                <button
                  key={s}
                  className={`flex items-center focus:outline-none ${
                    step >= s
                      ? "bg-gradient-to-r from-[#e4ffa8] to-[#b1d239] bg-clip-text text-transparent"
                      : "text-gray-500"
                  }`}
                  onClick={() => setStepSafe(s)}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      step >= s
                        ? "bg-gradient-to-r from-[#e4ffa8]/70 to-[#b1d239]/70 "
                        : "bg-gradient-to-r from-[#e4ffa8]/30 to-[#b1d239]/30 "
                    }`}
                  >
                    {s === 1 && <ScrollText className="h-5 w-5 text-white" />}
                    {s === 2 && <MicIcon className="h-5 w-5 text-white" />}
                    {s === 3 && <Music className="h-5 w-5 text-white" />}
                    {s === 4 && <Download className="h-5 w-5 text-white" />}
                  </div>
                  <span className="ml-2 font-medium hidden md:inline">
                    {s === 1 && "Affirmations"}
                    {s === 2 && "Voice"}
                    {s === 3 && "Music"}
                    {s === 4 && "Download"}
                  </span>
                </button>
              ) : (
                <div
                  key={s}
                  className={`flex items-center text-gray-500`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-r from-[#e4ffa8]/30 to-[#b1d239]/30`}
                  >
                    {s === 1 && <ScrollText className="h-5 w-5 text-white" />}
                    {s === 2 && <MicIcon className="h-5 w-5 text-white" />}
                    {s === 3 && <Music className="h-5 w-5 text-white" />}
                    {s === 4 && <Download className="h-5 w-5 text-white" />}
                  </div>
                  <span className="ml-2 font-medium hidden md:inline">
                    {s === 1 && "Affirmations"}
                    {s === 2 && "Voice"}
                    {s === 3 && "Music"}
                    {s === 4 && "Download"}
                  </span>
                </div>
              )}
              {idx < 3 && <div className="flex-1 mx-4 border-t border-gray-700"></div>}
            </>
          ))}
        </div>

        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-1 gap-8 md:px-10">
          {/* Main panel */}
          <div className="lg:col-span-2">
            <Card className="shadow-lg">
              <CardContent className="p-6">
                {step === 1 && (
                  <div>
                    <Tabs
                      defaultValue={formData.customOnly ? "custom" : "ai"}
                      onValueChange={(value) => {
                        updateFormData({ customOnly: value === "custom" });
                        setSelectedAffirmations([]);
                        setCustomAffirmations([]);
                        setGeneratedAffirmations([]);
                        updateFormData({ affirmations: [] });
                      }}
                    >
                      {/* <TabsList className="mb-6"
                        style={{ backgroundColor: "#b1d239aa"  }}>
                        <TabsTrigger value="ai" className="text-white">AI Generated</TabsTrigger>
                        <TabsTrigger value="custom" className="text-white">Custom</TabsTrigger>
                      </TabsList> */}
                      <text className="text-2xl font-bold bg-gradient-to-r from-[#e4ffa8] to-[#b1d239] bg-clip-text text-transparent">
                        Start it.
                      </text>
                      <h2 className="text-xl font-semibold mb-4">
                        How do you want to write your affirmations?
                      </h2>
                      <TabsList className="mb-6 bg-gray-800 border border-gray-700/50 rounded-lg h-auto">
                        <TabsTrigger
                          value="ai"
                          className="data-[state=active]:bg-gradient-to-r from-[#e4ffa8] to-[#b1d239] data-[state=active]:text-black text-gray-200 md:px-6 py-2 rounded-md transition-all hover:bg-gray-700 md:text-lg"
                        >
                          AI Generated
                        </TabsTrigger>
                        <TabsTrigger
                          value="custom"
                          className="data-[state=active]:bg-gradient-to-r from-[#e4ffa8] to-[#b1d239] data-[state=active]:text-black text-gray-200 md:px-6 py-2 rounded-md transition-all hover:bg-gray-700 md:text-lg"
                        >
                          Custom
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value="ai">
                        <div className="space-y-6">
                          <div>
                            <span
                              className=" flex items-center text-2xl font-bold bg-gradient-to-r from-[#e4ffa8] to-[#b1d239] bg-clip-text text-transparent"
                              // style={{color:primaryColor}}
                            >
                              Dream it.
                            </span>
                            <h2 className="text-xl font-semibold mb-4">
                              What area of your life do you want to improve?
                            </h2>
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                              {categories.map((category) => (
                                <button
                                  key={category.id}
                                  className={`glass-card p-4 flex flex-col items-center justify-center h-24 transition-colors ${
                                    formData.category === category.id
                                      ? "border-2 border-[#e4ffa8]  "
                                      : "border  border-gray-700"
                                  }`}
                                  onClick={() =>
                                    handleCategorySelect(category.id)
                                  }
                                  // style={{
                                  //   borderColor:
                                  //     formData.category === category.id
                                  //       ? getThemeColor(1, "#4169E1")
                                  //       : "rgba(55, 65, 81, 0.7)",
                                  // }}
                                >
                                  <div
                                    className={`mb-2 ${
                                      formData.category === category.id
                                        ? "text-[#e4ffa8]"
                                        : "text-gray-400"
                                    }`}
                                    // style={{
                                    //   color:
                                    //     formData.category === category.id
                                    //       ? getThemeColor(1, "#4169E1")
                                    //       : "rgba(156, 163, 175, 1)",
                                    // }}
                                  >
                                    {category.image == "" ? (
                                      category.icon
                                    ) : (
                                      <img
                                        src={category.image}
                                        alt={category.name}
                                        className="h-12 w-12"
                                      />
                                    )}
                                  </div>
                                  <span
                                    className={
                                      formData.category === category.id
                                        ? "text-[#e4ffa8]"
                                        : "text-gray-300"
                                    }
                                    // style={{
                                    //   color:
                                    //     formData.category === category.id
                                    //       ? getThemeColor(1, "#4169E1")
                                    //       : "rgba(209, 213, 219, 1)",
                                    // }}
                                  >
                                    {category.name}
                                  </span>
                                </button>
                              ))}
                            </div>
                          </div>

                          <div>
                            <span
                              className=" flex items-center text-2xl font-bold bg-gradient-to-r from-[#e4ffa8] to-[#b1d239] bg-clip-text text-transparent"
                              // style={{color:primaryColor}}
                            >
                              Script it.
                            </span>
                            <h2 className="text-xl font-semibold mb-4">
                              Tell us about your goals
                            </h2>
                            <p className="text-gray-300 mb-4">
                              Be specific about what you want to manifest. Our
                              AI will create powerful affirmations from your
                              goals.
                            </p>
                            <textarea
                              rows={4}
                              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#e4ffa8]"
                              placeholder="Example: I want to become a senior software engineer at a tech company within 1 year."
                              value={formData.goal}
                              onChange={(e) =>
                                updateFormData({ goal: e.target.value })
                              }
                            ></textarea>
                          </div>

                          <div className="flex justify-end">
                            <Button
                              onClick={handleGenerateAffirmations}
                              disabled={isGenerating}
                              className="transition-all text-black bg-gradient-to-r from-[#e4ffa8] to-[#b1d239] "
                              variant="primary"
                              // style={{
                              //   backgroundImage: `linear-gradient(to right, ${getThemeColor(
                              //     0,
                              //     "#4169E1"
                              //   )}, ${getThemeColor(1, "#1E90FF")})`,
                              // }}
                            >
                              {isGenerating ? (
                                <>
                                  <svg
                                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-black"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                  >
                                    <circle
                                      className="opacity-25"
                                      cx="12"
                                      cy="12"
                                      r="10"
                                      stroke="currentColor"
                                      strokeWidth="4"
                                    ></circle>
                                    <path
                                      className="opacity-75"
                                      fill="currentColor"
                                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    ></path>
                                  </svg>
                                  Generating...
                                </>
                              ) : (
                                "Generate Affirmations"
                              )}
                            </Button>
                          </div>

                          {formData.affirmations &&
                            formData.affirmations.length > 0 && (
                              <div className="mt-6">
                                <h3 className="text-lg font-medium mb-2">
                                  Your Generated Affirmations
                                </h3>
                                <div className="glass-card p-4 border border-gray-700 rounded-md">
                                  <ul className="space-y-2 flex items-start flex-col">
                                    {formData.affirmations.map(
                                      (affirmation, index) => (
                                        <li
                                          key={index}
                                          className="flex text-sm items-center justify-start"
                                        >
                                          <div className="flex-shrink-0 h-6 w-6 text-[#b1d239]/80 mt-0.5">
                                            <CheckCircle2 className="h-5 w-5" />
                                          </div>
                                          {/* <span className="ml-2">
                                            {affirmation}
                                          </span> */}

                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() =>
                                              handleAddCustomAffirmation(
                                                affirmation,
                                                "edit",
                                                index
                                              )
                                            }
                                            className="text-wrap text-start hover:bg-[#b1d239]/20 h-full"
                                          >
                                            <span className="ml-2 flex-grow font-medium">
                                              {affirmation}
                                            </span>{" "}
                                            <Edit className="h-4 w-4 text-gray-400 hover:text-white" />
                                          </Button>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            aria-label="Delete affirmation"
                                            className=" text-red-400 hover:text-red-600 hover:bg-red-500/10 h-5 w-5 "
                                            onClick={() => {
                                              // Remove affirmation at this index
                                              const updated = [
                                                ...formData.affirmations,
                                              ];
                                              updated.splice(index, 1);
                                              setGeneratedAffirmations(updated);
                                              setCustomAffirmations(updated);
                                              setSelectedAffirmations(updated); // <-- Add this line
                                              updateFormData({
                                                affirmations: updated,
                                              });
                                            }}
                                          >
                                            <svg
                                              xmlns="http://www.w3.org/2000/svg"
                                              className="h-4 w-4"
                                              fill="none"
                                              viewBox="0 0 24 24"
                                              stroke="currentColor"
                                              strokeWidth="2"
                                            >
                                              <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3m-4 0h16"
                                              />
                                            </svg>
                                          </Button>
                                        </li>
                                      )
                                    )}
                                  </ul>
                                </div>
                              </div>
                            )}
                        </div>
                      </TabsContent>

                      <TabsContent value="custom">
                        <div className="space-y-6">
                          <div>
                            <span
                              className=" flex items-center text-2xl font-bold bg-gradient-to-r from-[#e4ffa8] to-[#b1d239] bg-clip-text text-transparent"
                              // style={{color:primaryColor}}
                            >
                              Dream it.
                            </span>
                            <h2 className="text-xl font-semibold mb-4">
                              What area of your life do you want to improve?
                            </h2>
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                              {categories.map((category) => (
                                <button
                                  key={category.id}
                                  className={`glass-card p-4 flex flex-col items-center justify-center h-24 transition-colors ${
                                    formData.category === category.id
                                      ? "border-2 border-[#e4ffa8]"
                                      : "border border-gray-700"
                                  }`}
                                  onClick={() =>
                                    handleCategorySelect(category.id)
                                  }
                                  // style={{
                                  //   borderColor:
                                  //     formData.category === category.id
                                  //       ? getThemeColor(1, "#4169E1")
                                  //       : "rgba(55, 65, 81, 0.7)",
                                  // }}
                                >
                                  <div
                                    className={`mb-2 ${
                                      formData.category === category.id
                                        ? "text-[#e4ffa8]"
                                        : "text-gray-400"
                                    }`}
                                    // style={{
                                    //   color:
                                    //     formData.category === category.id
                                    //       ? getThemeColor(1, "#4169E1")
                                    //       : "rgba(156, 163, 175, 1)",
                                    // }}
                                  >
                                    {category.icon}
                                  </div>
                                  <span
                                    className={
                                      formData.category === category.id
                                        ? "text-[#e4ffa8]"
                                        : "text-gray-300"
                                    }
                                    // style={{
                                    //   color:
                                    //     formData.category === category.id
                                    //       ? getThemeColor(1, "#4169E1")
                                    //       : "rgba(209, 213, 219, 1)",
                                    // }}
                                  >
                                    {category.name}
                                  </span>
                                </button>
                              ))}
                            </div>

                            <div className="space-y-4 my-6">
                              <span
                                className="flex items-center text-2xl font-bold bg-gradient-to-r from-[#e4ffa8] to-[#b1d239] bg-clip-text text-transparent"
                                // style={{color:primaryColor}}
                              >
                                Script it.
                              </span>
                              <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-4">
                                <div className="flex items-start gap-3">
                                  <Info className="h-5 w-5 text-[#e4ffa8] mt-0.5 flex-shrink-0" />
                                  <div className="space-y-2 w-full">
                                    <h3 className="font-medium text-gray-200">
                                      <span className="capitalize">
                                        {formData.category}
                                      </span>{" "}
                                      Affirmations Ideas:
                                    </h3>
                                    <div className="space-y-2 mb-6 w-full">
                                      {allCatsAffirmations.map(
                                        (affirmation, index) => (
                                          <div
                                            key={index}
                                            className={`p-2 border w-full rounded-lg cursor-pointer transition-all ${
                                              selectedAffirmations.includes(
                                                affirmation
                                              )
                                                ? "bg-muted/50 border-[#e4ffa8]"
                                                : "border-gray-700 hover:bg-gray-800/50"
                                            }`}
                                            onClick={() =>
                                              handleAffirmationToggle(
                                                affirmation
                                              )
                                            }
                                            style={{
                                              backdropFilter: "blur(10px)",
                                            }}
                                          >
                                            <div className="flex items-center justify-between w-full">
                                              <div className="flex items-center gap-3 w-full">
                                                <div
                                                  className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                                                    selectedAffirmations.includes(
                                                      affirmation
                                                    )
                                                      ? "bg-[#e4ffa8] text-primary-foreground"
                                                      : "border border-gray-600"
                                                  }`}
                                                >
                                                  {selectedAffirmations.includes(
                                                    affirmation
                                                  ) && (
                                                    <svg
                                                      xmlns="http://www.w3.org/2000/svg"
                                                      className="h-3 w-3"
                                                      viewBox="0 0 20 20"
                                                      fill="currentColor"
                                                    >
                                                      <path
                                                        fillRule="evenodd"
                                                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                        clipRule="evenodd"
                                                      />
                                                    </svg>
                                                  )}
                                                </div>
                                                <p className="text-gray-200">
                                                  {affirmation}
                                                </p>
                                              </div>
                                            </div>
                                          </div>
                                        )
                                      )}
                                    </div>
                                    <div className="flex items-center justify-end">
                                      <Button
                                        variant="primary"
                                        className="flex items-center text-black bg-gradient-to-r from-[#e4ffa8] to-[#b1d239]"
                                        onClick={() =>
                                          handleAddCustomAffirmation(
                                            "",
                                            "add",
                                            1
                                          )
                                        }
                                      >
                                        <svg
                                          xmlns="http://www.w3.org/2000/svg"
                                          className="h-5 w-5 mr-2"
                                          viewBox="0 0 20 20"
                                          fill="currentColor"
                                        >
                                          <path
                                            fillRule="evenodd"
                                            d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                                            clipRule="evenodd"
                                          />
                                        </svg>
                                        Add Affirmation
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="glass-card p-4 border border-gray-700 rounded-md">
                              <h3 className="text-lg font-medium mb-4">
                                Your Custom Affirmations
                              </h3>

                              {customAffirmations.length === 0 ? (
                                <p className="text-gray-400">
                                  No custom affirmations added yet.
                                </p>
                              ) : (
                                <ul className="space-y-2">
                                  {customAffirmations.map(
                                    (affirmation, index) => (
                                      <li
                                        key={index}
                                        className="flex items-center justify-start  group opacity-1  p-1 h-auto"
                                      >
                                        <CheckCircle2 className="min-h-5 min-w-5 h-5 w-5 " />
                                        <Button
                                          variant="primary"
                                          size="sm"
                                          className="text-wrap text-align-start w-full hover:bg-[#b1d239]/20 h-full"
                                          onClick={() =>
                                            handleAddCustomAffirmation(
                                              affirmation,
                                              "edit",
                                              index
                                            )
                                          }
                                        >
                                          <div className="flex justify-between md:justify-start items-center w-full">
                                            <span className="md:ml-2  text-start">
                                              {affirmation}
                                            </span>{" "}
                                            <Edit className="h-4 w-4 text-gray-400 hover:text-white md:ml-2" />
                                          </div>
                                        </Button>
                                      </li>
                                    )
                                  )}
                                </ul>
                              )}
                            </div>
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>

                    {showCustomDialog && (
                      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-6">
                        <div className="glass-card p-6 max-w-md w-full">
                          <h3 className="text-xl font-semibold mb-4">
                            Custom Affirmation
                          </h3>
                          <textarea
                            rows={4}
                            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#b1d239] mb-4"
                            placeholder="Enter your affirmation here..."
                            value={customAffirmation}
                            onChange={(e) =>
                              setCustomAffirmation(e.target.value)
                            }
                          ></textarea>
                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="primary"
                              onClick={() => setShowCustomDialog(false)}
                              className="bg-gray-900 hover:bg-gray-950 text-white"
                            >
                              Cancel
                            </Button>
                            <Button
                              variant="primary"
                              onClick={handleAddCustomAffirmationSubmit}
                              className="bg-gradient-to-r from-[#e4ffa8] to-[#b1d239] text-black"
                            >
                              {editIndex == null ? "Add" : "Update"}
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {step === 2 && (
                  <div>
                    <span
                      className="flex items-center text-2xl font-bold bg-gradient-to-r from-[#e4ffa8] to-[#b1d239] bg-clip-text text-transparent "
                      // style={{color:primaryColor}}
                    >
                      Hear it.
                    </span>
                    <h2 className="text-xl font-semibold mb-2">
                      Select Your Voice
                    </h2>
                    <p className="text-gray-300 mb-6 ">
                      Choose the voice that sounds most like you. This is the
                      voice that will speak your affirmations.
                    </p>

                    <div className="space-y-4">
                      {/* Voice Settings Section */}
                      <VoiceSettingsDropdown
                        formData={formData}
                        updateFormData={updateFormData}
                        affirmations={selectedAffirmations}
                      />

                      {/* <div>
                        <label className="text-sm text-gray-400 mb-1 block">
                          Voice Selection
                        </label>
                        <select
                          value={formData.voiceType}
                          onChange={(e) =>
                            updateFormData({ voiceType: e.target.value })
                          }
                          className="w-full text-sm px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                          {voiceLanguages.map((language) => (
                            <optgroup key={language.code} label={language.name}>
                              {groupedVoices[language.code]?.map((voice) => (
                                <option key={voice.value} value={voice.value}>
                                  {voice.label}
                                </option>
                              ))}
                            </optgroup>
                          ))}
                        </select>
                      </div> */}
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div>
                    <span
                      className="flex items-center text-2xl font-bold bg-gradient-to-r from-[#e4ffa8] to-[#b1d239] bg-clip-text text-transparent"
                      // style={{color:primaryColor}}
                    >
                      Create it.
                    </span>
                    <h2 className="text-xl font-semibold mb-2">
                      Select Your Music
                    </h2>
                    <p className="text-gray-300 mb-6">
                      Choose a track that resonates with you. Your affirmations
                      will be embedded in this music.
                    </p>

                    <div className="space-y-4 mb-8 max-h-[489px] overflow-y-auto scrollbar_design pr-4 music-track">
                      {musicTracks.map((track) => (
                        <div
                          key={track.id}
                          className={`glass-card p-4 flex items-center cursor-pointer transition-colors ${
                            formData.musicTrack?.id === track.id
                              ? "border-2 border-[#e4ffa8]"
                              : "border border-gray-700"
                          }`}
                          onClick={() => {
                            updateFormData({ musicTrack: track });
                            setIsPreviewPlaying(false);
                            setCurrentPlayingTrackId(null);
                            audioRef?.current?.pause();
                          }}
                          // style={{
                          //   borderColor:
                          //     formData.musicTrack?.id === track.id
                          //       ? getThemeColor(0, "#4169E1")
                          //       : "rgba(55, 65, 81, 0.7)",
                          // }}
                        >
                          <div className="flex-shrink-0 w-6 h-6 md:w-12 md:h-12 bg-gray-800 rounded-md overflow-hidden mr-2 md:mr-4 flex items-center justify-center">
                            {/* <img
                              src={track.imageUrl || "/placeholder.svg"}
                              alt={track.name}
                              className="w-full h-full object-cover"
                            /> */}
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="lucide lucide-music4-icon lucide-music-4 w-10 h-10"
                            >
                              <path d="M9 18V5l12-2v13" />
                              <path d="m9 9 12-2" />
                              <circle cx="6" cy="18" r="3" />
                              <circle cx="18" cy="16" r="3" />
                            </svg>
                          </div>

                          <div className="flex-grow">
                            <h3 className="font-medium">{track.name}</h3>
                            <p className="text-gray-400 text-sm">
                              {track.category}
                              {/* • {track.duration} */}
                            </p>
                          </div>

                          <button
                            className="ml-4 min-w-10 w-10 h-10 rounded-full bg-[#e4ffa8]/20 hover:bg-[#e4ffa8]/30 flex items-center justify-center"
                            onClick={(e) => {
                              e.stopPropagation();
                              updateFormData({ musicTrack: track });
                              handleTrackPreviewToggle(track);
                            }}
                          >
                            {isPreviewPlaying &&
                            formData.musicTrack?.id === track.id ? (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5 min-w-5 text-[#e4ffa8]"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            ) : (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5 "
                                viewBox="0 0 20 20"
                                fill="url(#greenGradient)"
                              >
                                <defs>
                                  <linearGradient
                                    id="greenGradient"
                                    x1="0"
                                    y1="0"
                                    x2="1"
                                    y2="1"
                                  >
                                    <stop offset="0%" stopColor="#e4ffa8" />
                                    <stop offset="100%" stopColor="#b1d239" />
                                  </linearGradient>
                                </defs>
                                <path
                                  fillRule="evenodd"
                                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            )}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {step >= 4 && (
                  <div>
                    {isGeneratingFinal ? (
                      <div className="text-center py-12">
                        <svg
                          className="animate-spin h-12 w-12 text-[#e4ffa8] mx-auto mb-6"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        <h2 className="text-xl font-semibold mb-2">
                          Creating Your Sublmnl Audio
                        </h2>
                        <p className="text-gray-300">
                          We're embedding your affirmations into your chosen
                          music track...
                        </p>
                      </div>
                    ) : finalAudioUrl ? (
                      <div>
                        <div className="text-center mb-8">
                          <div className="w-16 h-16 bg-[#e4ffa8]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle2 className="h-8 w-8 text-[#e4ffa8]" />
                          </div>
                          <h2 className="text-2xl font-bold mb-2">
                            Your Sublmnl Audio is Ready!
                          </h2>
                          <p className="text-gray-300">
                            Your affirmations have been seamlessly embedded into
                            your chosen track.
                          </p>
                        </div>
                        <span className="flex items-center text-2xl font-bold bg-gradient-to-r from-[#e4ffa8] to-[#b1d239] bg-clip-text text-transparent mb-2">
                          Listen to it.
                        </span>
                        <div className="glass-card p-4 mb-8 border border-gray-700 rounded-md">
                          <div className="md:flex justify-between items-center mb-4">
                            <div>
                              <h3 className="font-semibold">
                                {formData.category
                                  ? formData.category.charAt(0).toUpperCase() +
                                    formData.category.slice(1) +
                                    " Affirmations"
                                  : "Your Affirmations"}
                                {formData.musicTrack &&
                                  ` with ${formData.musicTrack.name}`}
                              </h3>
                              <p className="text-sm text-gray-400 mb-2">
                                Created today
                              </p>
                            </div>

                            <Button
                              variant="primary"
                              className="flex items-center md:ml-2 bg-gradient-to-r from-[#e4ffa8] to-[#b1d239] text-black"
                              onClick={handleSaveToLibrary}
                              disabled={isDownloading}
                              // style={{
                              //   backgroundImage: `linear-gradient(to right, ${getThemeColor(
                              //     2,
                              //     "#22c55e"
                              //   )}, ${getThemeColor(1, "#1E90FF")})`,
                              // }}
                            >
                              {isDownloading ? (
                                <>
                                  <svg
                                    className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                  >
                                    <circle
                                      className="opacity-25"
                                      cx="12"
                                      cy="12"
                                      r="10"
                                      stroke="currentColor"
                                      strokeWidth="4"
                                    ></circle>
                                    <path
                                      className="opacity-75"
                                      fill="currentColor"
                                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    ></path>
                                  </svg>
                                  Saving...
                                </>
                              ) : (
                                <>
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-5 w-5 mr-2"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                  >
                                    <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                                  </svg>
                                  Save to Library
                                </>
                              )}
                            </Button>
                          </div>

                          <EnhancedAudioPlayer
                            audioUrl={finalAudioUrl}
                            affirmations={currentAffirmations}
                            voiceSettings={voiceSettings}
                            affirmationsVolume={formData.affirmationsVolume}
                            onAffirmationsVolumeChange={(vol) =>
                              updateFormData({ affirmationsVolume: vol })
                            }
                            repetitionInterval={formData.repetitionInterval}
                            onRepetitionIntervalChange={(interval) =>
                              updateFormData({ repetitionInterval: interval })
                            }
                            onPlayStateChange={setIsPreviewPlaying}
                            showControls={false}
                            hideVolumeControls={false}
                            showRawAudio={showRawAudio}
                            stopOnSettingsChange={true}
                            disableAffirmations={false}
                            speed={formData.speed}
                            subscriptionStatus={subscriptionStatus}
                            handleSaveToLibrary={handleSaveToLibrary}
                          />
                        </div>

                        <span
                          className="flex items-center text-2xl font-bold bg-gradient-to-r from-[#e4ffa8] to-[#b1d239] bg-clip-text text-transparent mb-2"
                          // style={{color:primaryColor}}
                        >
                          Live it.
                        </span>
                        <div className="glass-card p-4 mb-8 border border-gray-700 rounded-md">
                          <h3 className="font-semibold mb-4">
                            For best results:
                          </h3>
                          <ul className="space-y-3">
                            <li className="flex items-start">
                              <div className="flex-shrink-0 h-5 w-5 text-[#e4ffa8] mt-0.5">
                                <CheckCircle2 className="h-5 w-5" />
                              </div>
                              <span className="ml-2">
                                Listen to your Sublmnl audio at least once daily
                              </span>
                            </li>
                            <li className="flex items-start">
                              <div className="flex-shrink-0 h-5 w-5 text-[#e4ffa8] mt-0.5">
                                <CheckCircle2 className="h-5 w-5" />
                              </div>
                              <span className="ml-2">
                                Use headphones for the most immersive experience
                              </span>
                            </li>
                            <li className="flex items-start">
                              <div className="flex-shrink-0 h-5 w-5 text-[#e4ffa8] mt-0.5">
                                <CheckCircle2 className="h-5 w-5" />
                              </div>
                              <span className="ml-2">
                                Listen while relaxing, meditating, or before
                                sleep
                              </span>
                            </li>
                            <li className="flex items-start">
                              <div className="flex-shrink-0 h-5 w-5 text-[#e4ffa8] mt-0.5">
                                <CheckCircle2 className="h-5 w-5" />
                              </div>
                              <span className="ml-2">
                                Consistency is key - results improve over time
                              </span>
                            </li>
                          </ul>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <h2 className="text-2xl font-bold mb-4">
                          Ready to Create Your Sublmnl Audio
                        </h2>
                        <p className="text-gray-300 mb-8">
                          We'll combine your affirmations with your selected
                          music track to create a powerful Sublmnl audio
                          experience.
                        </p>
                        <Button
                          variant="primary"
                          size="lg"
                          onClick={handleCreateFinalAudio}
                          className="transition-all bg-gradient-to-r from-[#e4ffa8] to-[#b1d239] text-black "
                          // style={{
                          //   backgroundImage: `linear-gradient(to right, ${getThemeColor(
                          //     0,
                          //     "#4169E1"
                          //   )}, ${getThemeColor(1, "#1E90FF")})`,
                          // }}
                        >
                          Create My Sublmnl Audio
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {error && (
                  <div className="bg-red-900/30 border border-red-500 rounded-md p-4 mt-4 text-red-200">
                    <h4 className="font-semibold mb-1">Error</h4>
                    <p>{error}</p>
                  </div>
                )}

                {/* Navigation buttons */}
                <div className="flex justify-between mt-8">
                  {step > 1 ? (
                    <Button
                      variant=""
                      onClick={handleBack}
                      className="bg-gray-800 text-white hover:bg-gray-900"
                    >
                      <ChevronLeft className="h-4 w-4 mr-2 " />
                      Back
                    </Button>
                  ) : (
                    <div></div>
                  )}

                  {step < 4 && (
                    <Button
                      variant="primary"
                      onClick={handleNext}
                      disabled={
                        (step === 1 &&
                          (!currentAffirmations ||
                            (currentAffirmations.length === 0 &&
                              selectedAffirmations.length === 0))) ||
                        (step === 3 && !formData.musicTrack)
                      }
                      className="hover:bg-opacity-90 transition-all bg-gradient-to-r from-[#e4ffa8] to-[#b1d239]  text-black"
                      // style={{
                      //   backgroundImage: `linear-gradient(to right, ${getThemeColor(
                      //     1,
                      //     "#4169E1"
                      //   )}, ${getThemeColor(1, "#1E90FF")})`,
                      // }}
                    >
                      Next
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
        </div>
      </div>

      {/* Add the save dialog */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent className="sm:max-w-[425px] bg-gray-900 text-white border-gray-800">
          <DialogHeader>
            <DialogTitle>Save Audio to Library</DialogTitle>
            <DialogDescription className="text-gray-400">
              Enter a title for your audio track. This will help you identify it
              in your library.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="audioTitle" className="text-right">
                Title
              </Label>
              <Input
                id="audioTitle"
                value={audioTitle}
                onChange={(e) => setAudioTitle(e.target.value)}
                className="col-span-3 bg-gray-800 border-gray-700 text-white focus-visible:ring-1 ring-offset-2 focus-visible:ring-[#e4ffa8]"
                placeholder="Enter a title for your audio"
                autoFocus
              />
              {titleError && (
                <p className="col-span-4 text-red-500 text-sm mt-1">
                  {titleError}
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant=""
              onClick={() => setShowSaveDialog(false)}
              className="bg-gray-800 hover:bg-gray-950 text-white"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSaveWithTitle}
              disabled={isSaving}
              className="bg-gradient-to-r from-[#e4ffa8] to-[#b1d239] text-black "
              // style={{
              //   backgroundImage: `linear-gradient(to right, ${getThemeColor(
              //     2,
              //     "#22c55e"
              //   )}, ${getThemeColor(1, "#1E90FF")})`,
              // }}
            >
              {isSaving ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-5 w-5 text-black"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Saving...
                </>
              ) : (
                "Save to Library"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
