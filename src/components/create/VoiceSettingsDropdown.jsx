"use client";

import { useState, useEffect } from "react";
import { Play, ChevronDown, Volume2 } from "lucide-react";
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

// Define voice personas with the specific voices requested
const VOICE_PERSONAS = [
  ...CHATGPT_VOICES,
  // Female voices
  // {
  //   id: "lesya",
  //   name: "LESYA",
  //   category: "SOOTHING",
  //   color: "#FFDEAD",
  //   priority: 1,
  //   voicePattern: /lesya|samantha|google.*us.*english.*female|chrome.*us.*english.*female/i,
  // },
  // {
  //   id: "lily",
  //   name: "LILY",
  //   category: "STORYTELLING",
  //   color: "#9C5CFF",
  //   priority: 2,
  //   voicePattern: /lily|lili|victoria|karen|helena|google.*uk.*english.*female|chrome.*uk.*english.*female|british.*female/i,
  // },
  // {
  //   id: "google-hindi",
  //   name: "PRIYA",
  //   category: "PROFESSIONAL",
  //   color: "#159759",
  //   priority: 3,
  //   voicePattern: /google.*hindi|hindi|indian|priya|neha|hindi.*female/i,
  // },
  // {
  //   id: "google-hindi-female",
  //   name: "SITA",
  //   category: "PROFESSIONAL",
  //   color: "#159759",
  //   priority: 4,
  //   // voicePattern: /google.*hindi.*female|hindi.*female|sita|indian.*female|female.*hindi|google.*hindi.*neha|neha.*hindi|hindi.*neha/i,
  //   voicePattern: /google\s?hindi.*\(भारत\)|google.*hindi.*female|hindi.*female|sita|neha/i
  // },
  // {
  //   id: "microsoft-kalpana",
  //   name: "KALPANA",
  //   category: "PROFESSIONAL",
  //   color: "#00bcd4",
  //   priority: 5,
  //   voicePattern: /microsoft.*kalpana|kalpana|heera|google.*hindi.*female|hindi.*female/i,
  // },
  // {
  //   id: "google-us-english",
  //   name: "SAMANTHA",
  //   category: "CONVERSATIONAL",
  //   color: "#5CAAFF",
  //   priority: 6,
  //   voicePattern: /google.*us.*english|english.*us|samantha|google.*female|chrome.*female|female.*en|en.*female/i,
  // },
  // {
  //   id: "nicky",
  //   name: "NICKY",
  //   category: "SOOTHING",
  //   color: "#FF8C5C",
  //   priority: 7,
  //   voicePattern: /nicky|nicole|nina|female.*en|en.*female|google.*female/i,
  // },
  // {
  //   id: "emily",
  //   name: "EMILY",
  //   category: "SOOTHING",
  //   color: "#FFC2E2",
  //   priority: 8,
  //   voicePattern: /emily|soothing.*us|female.*en|en.*female|google.*female|chrome.*female/i,
  // },

  // Male voices
  // {
  //   id: "rishi",
  //   name: "RISHI",
  //   category: "NATURAL",
  //   color: "#5C7CFF",
  //   priority: 9,
  //   voicePattern: /rishi|male.*en|en.*male|google.*male|chrome.*male|daniel|john|michael|david/i,
  // },
  // {
  //   id: "aaron",
  //   name: "AARON",
  //   category: "PROFESSIONAL",
  //   color: "#5CFFE1",
  //   priority: 10,
  //   voicePattern: /aaron|alex|male.*en|en.*male|google.*male|chrome.*male|daniel|john|michael/i,
  // },
  // {
  //   id: "arthur",
  //   name: "ARTHUR",
  //   category: "CONVERSATIONAL",
  //   color: "#C45CFF",
  //   priority: 11,
  //   voicePattern: /arthur|male.*en|en.*male|google.*male|chrome.*male|daniel|john|michael|david/i,
  // },
  // {
  //   id: "thomas",
  //   name: "THOMAS",
  //   category: "STORYTELLING",
  //   color: "#FFD45C",
  //   priority: 12,
  //   voicePattern: /thomas|daniel|john|michael|male.*us|english.*us|male.*en|en.*male|google.*male|chrome.*male/i,
  // },
];

// Fallback patterns for common voices
// const FALLBACK_PATTERNS = [
//   { name: "AMELIE", pattern: /female|woman|girl|samantha/i },
//   { name: "RISHI", pattern: /male|man|boy|daniel/i },
//   { name: "SAMANTHA", pattern: /google.*female|chrome.*female/i },
// ];

export default function VoiceSettingsDropdown({
  formData,
  updateFormData,
  affirmations = [],
}) {
  const [availableVoices, setAvailableVoices] = useState([]);
  const [mappedVoices, setMappedVoices] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playingVoiceId, setPlayingVoiceId] = useState(null);
  const [testMessage, setTestMessage] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Initialize voices
  useEffect(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      const updateBrowserVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        setAvailableVoices(voices);

        // Sort personas by priority (lower number = higher priority)
        // const sortedPersonas = [...VOICE_PERSONAS].sort(
        //   (a, b) => a.priority - b.priority
        // );
        const sortedPersonas = [...VOICE_PERSONAS].filter((p) => p.isChatGPT).sort((a, b) => a.priority - b.priority);

        let voiceMapping = [];
        const usedVoices = new Set();

        // First pass: exact matches with language filtering (only if persona has voicePattern)
        sortedPersonas.forEach((persona) => {
          let matchedVoice = null;

          if (persona.isChatGPT) {
            // 🔹 Skip browser voice matching for ChatGPT voices
            voiceMapping.push({
              ...persona,
              systemVoice: null,
              value: persona.id, // use id as identifier for ChatGPT voices
            });
          } else if (persona.name === "SITA" || persona.name === "KALPANA") {
            matchedVoice = voices.find(
              (voice) =>
                ((persona.voicePattern &&
                  persona.voicePattern.test(voice.name.toLowerCase())) ||
                  (voice.lang.includes("hi") &&
                    voice.name.toLowerCase().includes("female"))) &&
                !usedVoices.has(voice.name) &&
                voice.lang.includes("hi") // Must be Hindi language
            );
          } else if (persona.name === "PRIYA") {
            matchedVoice = voices.find(
              (voice) =>
                ((persona.voicePattern &&
                  persona.voicePattern.test(voice.name.toLowerCase())) ||
                  voice.lang.includes("hi")) &&
                !usedVoices.has(voice.name) &&
                voice.lang.includes("hi") // Must be Hindi language
            );
          } else if (persona.voicePattern) {
            // Regular matching only if voicePattern exists
            matchedVoice = voices.find(
              (voice) =>
                persona.voicePattern.test(voice.name.toLowerCase()) &&
                !usedVoices.has(voice.name)
            );
          }

          if (matchedVoice) {
            voiceMapping.push({
              ...persona,
              systemVoice: matchedVoice,
              value: matchedVoice.name,
            });
            usedVoices.add(matchedVoice.name);
          }
        });

        // Second pass: assign remaining voices to unused personas (only for browser/system personas)
        const remainingVoices = voices.filter(
          (voice) => !usedVoices.has(voice.name)
        );
        const unusedPersonas = sortedPersonas.filter(
          (persona) =>
            !persona.isChatGPT &&
            !voiceMapping.some((mapped) => mapped.id === persona.id)
        );

        remainingVoices.forEach((voice, index) => {
          if (unusedPersonas[index]) {
            voiceMapping.push({
              ...unusedPersonas[index],
              systemVoice: voice,
              value: voice.name,
            });
          }
        });

        // Ensure we have at least one browser voice if nothing matched
        // if (
        //   voiceMapping.filter((v) => !v.isChatGPT).length === 0 &&
        //   voices.length > 0
        // ) {
        //   voiceMapping.push({
        //     ...sortedPersonas.find((p) => !p.isChatGPT),
        //     systemVoice: voices[0],
        //     value: voices[0].name,
        //   });
        // }

        setMappedVoices(voiceMapping);

        // Set default voice if none selected
        if (!formData.voiceType && voiceMapping.length > 0) {
          updateFormData({ voiceType: voiceMapping[0].value });
        }
      };

      // Chrome loads voices asynchronously
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = updateBrowserVoices;
      }

      updateBrowserVoices();
    }
  }, [formData.voiceType, updateFormData]);

  // Test the voice with the first affirmation
  const testVoice = async (voiceValue) => {
    const voiceToTest = voiceValue || formData.voiceType;
    if (!voiceToTest) return;

    const voice = mappedVoices.find((v) => v.value === voiceToTest);
    if (!voice) return;

    let testText =
      "This is a test of how your affirmations will sound with this voice.";
    if (affirmations && affirmations.length > 0) {
      testText = affirmations[0];
    }

    setTestMessage(testText);
    setIsPlaying(true);
    setPlayingVoiceId(voice.id);

    if (voice.isChatGPT) {
      // 🔹 ChatGPT voices → call your backend API
      try {
        const resp = await fetch("/api/chatgpt-tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: testText, voice: voice.id }),
        });

        if (!resp.ok) throw new Error("TTS API failed");

        const audioBlob = await resp.blob();
        const audioURL = URL.createObjectURL(audioBlob);

        const audio = new Audio(audioURL);
        audio.onended = () => {
          setIsPlaying(false);
          setPlayingVoiceId(null);
        };
        audio.onerror = () => {
          setIsPlaying(false);
          setPlayingVoiceId(null);
        };

        audio.play();
      } catch (err) {
        console.error("ChatGPT TTS error:", err);
        setIsPlaying(false);
        setPlayingVoiceId(null);
      }
    } else {
      // 🔹 Browser/system voices → use speech synthesis
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(testText);
        const voices = window.speechSynthesis.getVoices();
        const selectedVoice = voices.find((v) => v.name === voice.value);
        if (selectedVoice) utterance.voice = selectedVoice;
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        utterance.volume = 0.8;
        utterance.onend = () => {
          setIsPlaying(false);
          setPlayingVoiceId(null);
        };
        utterance.onerror = () => {
          setIsPlaying(false);
          setPlayingVoiceId(null);
        };
        window.speechSynthesis.speak(utterance);
      }
    }
  };

  // Get the currently selected voice
  const getSelectedVoice = () => {
    return mappedVoices.find((v) => v.value === formData.voiceType) || null;
  };

  // Handle voice selection
  const handleSelectVoice = (voice) => {
    updateFormData({ voiceType: voice.value, voicePersonaName: voice.name });
    setIsDropdownOpen(false);
  };

  const selectedVoice = getSelectedVoice();

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
              {mappedVoices.map((voice) => (
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
                      {voice.name || "Unknown"}
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
                        testVoice(voice.value);
                      }}
                      disabled={isPlaying}
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
          disabled={isPlaying || mappedVoices.length === 0}
          className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white rounded-full px-5 py-2 text-sm"
        >
          {isPlaying ? (
            <div className="animate-pulse">Testing...</div>
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
