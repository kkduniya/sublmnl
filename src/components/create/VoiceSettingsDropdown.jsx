"use client";

import { useState, useEffect } from "react";
import { Play, ChevronDown, Volume2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

// ChatGPT voices (via OpenAI TTS, not browser speechSynthesis)
const CHATGPT_VOICES = [
  {
    id: "breeze",
    name: "BREEZE",
    category: "Calm",
    color: "#6EC6FF",
    priority: 100,
    isChatGPT: true,
  },
  {
    id: "cove",
    name: "COVE",
    category: "Warm",
    color: "#5AD3A6",
    priority: 101,
    isChatGPT: true,
  },
  {
    id: "ember",
    name: "EMBER",
    category: "Energetic",
    color: "#FF7B6E",
    priority: 102,
    isChatGPT: true,
  },
  {
    id: "juniper",
    name: "JUNIPER",
    category: "Balanced",
    color: "#C792EA",
    priority: 103,
    isChatGPT: true,
  },
  {
    id: "arbor",
    name: "ARBOR",
    category: "Grounded",
    color: "#7BD148",
    priority: 104,
    isChatGPT: true,
  },
  {
    id: "maple",
    name: "MAPLE",
    category: "Friendly",
    color: "#FFB347",
    priority: 105,
    isChatGPT: true,
  },
  {
    id: "sol",
    name: "SOL",
    category: "Bright",
    color: "#FFD93D",
    priority: 106,
    isChatGPT: true,
  },
  {
    id: "spruce",
    name: "SPRUCE",
    category: "Confident",
    color: "#3DB2FF",
    priority: 107,
    isChatGPT: true,
  },
  {
    id: "vale",
    name: "VALE",
    category: "Soothing",
    color: "#9AE19D",
    priority: 108,
    isChatGPT: true,
  },
];


export default function VoiceSettingsDropdown({
  formData,
  updateFormData,
  affirmations = [],
  onStopAudio, // Add this prop to allow parent to stop audio
}) {
  const [availableVoices, setAvailableVoices] = useState([]);
  const [mappedVoices, setMappedVoices] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playingVoiceId, setPlayingVoiceId] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingVoiceId, setGeneratingVoiceId] = useState(null);
  const [testMessage, setTestMessage] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [currentAudio, setCurrentAudio] = useState(null); // Track current audio instance

  const voices = [...CHATGPT_VOICES].sort((a, b) => a.priority - b.priority);

  // Set default voice if none selected
  if (!formData.voiceType && voices.length > 0) {
    updateFormData({ voiceType: voices[0].id, voicePersonaName: voices[0].name });
  }


  // Function to stop current audio
  const stopCurrentAudio = () => {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      setCurrentAudio(null);
    }
    setIsPlaying(false);
    setPlayingVoiceId(null);
  };

  // Expose stop function to parent component
  useEffect(() => {
    if (onStopAudio) {
      onStopAudio.current = stopCurrentAudio;
    }
  }, [onStopAudio, currentAudio]);

  // Test the voice with the first affirmation
  const testVoice = async (voiceId) => {
    const selectedId = voiceId || formData.voiceType;
    if (!selectedId) return;

    const voice = voices.find((v) => v.id === selectedId);
    if (!voice) return;

    // Stop any currently playing audio
    stopCurrentAudio();

    let testText =
      affirmations && affirmations.length > 0
        ? affirmations[0]
        : "This is a test of how your affirmations will sound with this voice.";

    setTestMessage(testText);

    try {
      setIsGenerating(true);
      setGeneratingVoiceId(voice.id);

      const resp = await fetch("/api/chatgpt-tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: testText, voice: voice.id }),
      });

      if (!resp.ok) throw new Error("TTS API failed");

      const audioBlob = await resp.blob();
      const audioURL = URL.createObjectURL(audioBlob);

      const audio = new Audio(audioURL);
      setCurrentAudio(audio); // Store the audio instance
      
      audio.onplay = () => {
        setIsGenerating(false);
        setGeneratingVoiceId(null);
        setIsPlaying(true);
        setPlayingVoiceId(voice.id);
      };
      audio.onended = () => {
        setIsPlaying(false);
        setPlayingVoiceId(null);
        setCurrentAudio(null);
      };
      audio.onerror = () => {
        setIsGenerating(false);
        setGeneratingVoiceId(null);
        setIsPlaying(false);
        setPlayingVoiceId(null);
        setCurrentAudio(null);
      };

      audio.play();
    } catch (err) {
      console.error("ChatGPT TTS error:", err);
      setIsGenerating(false);
      setGeneratingVoiceId(null);
      setIsPlaying(false);
      setPlayingVoiceId(null);
      setCurrentAudio(null);
    }
  };

  const selectedVoice = voices.find((v) => v.id === formData.voiceType) || null;

  // Handle voice selection
  const handleSelectVoice = (voice) => {
    console.log(voice);
    
    updateFormData({ voiceType: voice.id, voicePersonaName: voice.name });
    setIsDropdownOpen(false);
  };

  return (
    <div className="rounded-xl md:p-5 shadow-md">
      <div className="mb-5">
        <p className="text-xs font-semibold text-gray-500 mb-2">VOICE</p>

        <div className="relative">
          {/* Selected voice display */}
          <div
            className="flex items-center justify-between p-2.5 border border-gray-200 rounded-lg cursor-pointer hover:border-gray-300"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <div className="flex items-center">
              {selectedVoice && (
                <div
                  className="w-6 h-6 rounded-full mr-2.5 flex items-center justify-center text-black text-xs font-medium"
                  style={{ backgroundColor: selectedVoice.color }}
                >
                  {selectedVoice.name.charAt(0)}
                </div>
              )}
              <span className="font-medium">
                {selectedVoice ? selectedVoice.name : "Select a voice"}
              </span>
            </div>
            <ChevronDown
              className={`h-4 w-4 text-gray-500 transition-transform ${
                isDropdownOpen ? "transform rotate-180" : ""
              }`}
            />
          </div>

          {/* Dropdown */}
          {isDropdownOpen && (
            <div className="absolute z-10 mt-1 w-full bg-gray-900 border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-auto ">
              {voices.map((voice) => (
                <div
                  key={voice.id}
                  className={`flex items-center justify-between p-2.5 cursor-pointer hover:bg-gray-700 ${
                    formData.voiceType === voice.value ? "bg-gray-700" : ""
                  }`}
                  onClick={() => handleSelectVoice(voice)}
                >
                  <div className="flex items-center">
                    <div
                      className="w-6 h-6 rounded-full mr-2.5 flex items-center justify-center text-black text-xs font-medium"
                      style={{ backgroundColor: voice.color }}
                    >
                      {voice.name ? voice.name.charAt(0) : "?"}
                    </div>
                    <span className="font-medium text-sm md:text-base truncate">
                      {voice.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                      {voice.category}
                    </span>
                    <button
                      className="text-gray-400 hover:text-gray-600 p-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        testVoice(voice.id);
                      }}
                      disabled={isGenerating}
                    >
                      {isPlaying && playingVoiceId === voice.id ? (
                        <div className="animate-pulse flex space-x-1">
                          <div className="h-1 w-1 bg-gray-400 rounded-full"></div>
                          <div className="h-1 w-1 bg-gray-400 rounded-full"></div>
                          <div className="h-1 w-1 bg-gray-400 rounded-full"></div>
                        </div>
                      ) : (
                        <Volume2 className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-between items-center">
        <Button
          onClick={() => testVoice()}
          disabled={isGenerating || isPlaying || voices.length === 0}
          className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white rounded-full px-5 py-2 text-sm"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Generating...</span>
            </>
          ) : isPlaying ? (
            <>
              <Play className="h-3.5 w-3.5" />
              <span>Testing...</span>
            </>
          ) : (
            <>
              <Play className="h-3.5 w-3.5" />
              <span>Test Voice</span>
            </>
          )}
        </Button>

        {testMessage && isPlaying && (
          <div className="flex items-center text-sm text-gray-500">
            <div className="animate-pulse flex space-x-1 mr-2">
              <div className="h-1.5 w-1.5 bg-gray-400 rounded-full"></div>
              <div
                className="h-1.5 w-1.5 bg-gray-400 rounded-full"
                style={{ animationDelay: "0.2s" }}
              ></div>
              <div
                className="h-1.5 w-1.5 bg-gray-400 rounded-full"
                style={{ animationDelay: "0.4s" }}
              ></div>
            </div>
            <span>Playing</span>
          </div>
        )}
      </div>
    </div>
  );
}
