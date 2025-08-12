"use client";

import { useState, useEffect } from "react";
import { Play, ChevronDown, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";

// Define voice personas with the specific voices requested
const VOICE_PERSONAS = [
  // Female voices
  {
    id: "lesya",
    name: "LESYA",
    category: "SOOTHING",
    color: "#FFDEAD",
    priority: 1,
    voicePattern: /lesya|samantha|google.*us.*english.*female|chrome.*us.*english.*female/i,
  },
  {
    id: "lily",
    name: "LILY",
    category: "STORYTELLING",
    color: "#9C5CFF",
    priority: 2,
    voicePattern: /lily|lili|victoria|karen|helena|google.*uk.*english.*female|chrome.*uk.*english.*female|british.*female/i,
  },
  {
    id: "google-hindi",
    name: "PRIYA",
    category: "PROFESSIONAL",
    color: "#159759",
    priority: 3,
    voicePattern: /google.*hindi|hindi|indian|priya|neha|hindi.*female/i,
  },
  {
    id: "google-hindi-female",
    name: "SITA",
    category: "PROFESSIONAL",
    color: "#159759",
    priority: 4,
    // voicePattern: /google.*hindi.*female|hindi.*female|sita|indian.*female|female.*hindi|google.*hindi.*neha|neha.*hindi|hindi.*neha/i,
    voicePattern: /google\s?hindi.*\(भारत\)|google.*hindi.*female|hindi.*female|sita|neha/i
  },
  {
    id: "microsoft-kalpana",
    name: "KALPANA",
    category: "PROFESSIONAL",
    color: "#00bcd4",
    priority: 5,
    voicePattern: /microsoft.*kalpana|kalpana|heera|google.*hindi.*female|hindi.*female/i,
  },
  {
    id: "google-us-english",
    name: "SAMANTHA",
    category: "CONVERSATIONAL",
    color: "#5CAAFF",
    priority: 6,
    voicePattern: /google.*us.*english|english.*us|samantha|google.*female|chrome.*female|female.*en|en.*female/i,
  },
  {
    id: "nicky",
    name: "NICKY",
    category: "SOOTHING",
    color: "#FF8C5C",
    priority: 7,
    voicePattern: /nicky|nicole|nina|female.*en|en.*female|google.*female/i,
  },
  {
    id: "emily",
    name: "EMILY",
    category: "SOOTHING",
    color: "#FFC2E2",
    priority: 8,
    voicePattern: /emily|soothing.*us|female.*en|en.*female|google.*female|chrome.*female/i,
  },

  // Male voices
  {
    id: "rishi",
    name: "RISHI",
    category: "NATURAL",
    color: "#5C7CFF",
    priority: 9,
    voicePattern: /rishi|male.*en|en.*male|google.*male|chrome.*male|daniel|john|michael|david/i,
  },
  {
    id: "aaron",
    name: "AARON",
    category: "PROFESSIONAL",
    color: "#5CFFE1",
    priority: 10,
    voicePattern: /aaron|alex|male.*en|en.*male|google.*male|chrome.*male|daniel|john|michael/i,
  },
  {
    id: "arthur",
    name: "ARTHUR",
    category: "CONVERSATIONAL",
    color: "#C45CFF",
    priority: 11,
    voicePattern: /arthur|male.*en|en.*male|google.*male|chrome.*male|daniel|john|michael|david/i,
  },
  {
    id: "thomas",
    name: "THOMAS",
    category: "STORYTELLING",
    color: "#FFD45C",
    priority: 12,
    voicePattern: /thomas|daniel|john|michael|male.*us|english.*us|male.*en|en.*male|google.*male|chrome.*male/i,
  },
];

// Fallback patterns for common voices
const FALLBACK_PATTERNS = [
  { name: "AMELIE", pattern: /female|woman|girl|samantha/i },
  { name: "RISHI", pattern: /male|man|boy|daniel/i },
  { name: "SAMANTHA", pattern: /google.*female|chrome.*female/i },
];

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
        const sortedPersonas = [...VOICE_PERSONAS].sort(
          (a, b) => a.priority - b.priority
        );

        // Map voices with priority-based matching
        let voiceMapping = [];
        const usedVoices = new Set();

        // First pass: exact matches with language filtering
        sortedPersonas.forEach((persona) => {
          let matchedVoice = null;

          // Special handling for Hindi voices
          if (persona.name === "SITA" || persona.name === "KALPANA") {
            // Look specifically for Hindi female voices
            matchedVoice = voices.find(
              (voice) =>
                (persona.voicePattern.test(voice.name.toLowerCase()) ||
                  (voice.lang.includes("hi") &&
                    voice.name.toLowerCase().includes("female"))) &&
                !usedVoices.has(voice.name) &&
                voice.lang.includes("hi") // Must be Hindi language
            );
          } else if (persona.name === "PRIYA") {
            // Look for Hindi voices (can be male or female)
            matchedVoice = voices.find(
              (voice) =>
                (persona.voicePattern.test(voice.name.toLowerCase()) ||
                  voice.lang.includes("hi")) &&
                !usedVoices.has(voice.name) &&
                voice.lang.includes("hi") // Must be Hindi language
            );
          } else {
            // Regular matching for other voices
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

        // Second pass: assign remaining voices to unused personas
        const remainingVoices = voices.filter(
          (voice) => !usedVoices.has(voice.name)
        );
        const unusedPersonas = sortedPersonas.filter(
          (persona) => !voiceMapping.some((mapped) => mapped.id === persona.id)
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

        // Ensure we have at least one voice
        if (voiceMapping.length === 0 && voices.length > 0) {
          voiceMapping = [
            {
              ...sortedPersonas[0],
              systemVoice: voices[0],
              value: voices[0].name,
            },
          ];
        }

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
  const testVoice = (voiceValue) => {
    const voiceToTest = voiceValue || formData.voiceType;
    if (!voiceToTest) return;

    // Find the voice in our mapped voices
    const voice = mappedVoices.find((v) => v.value === voiceToTest);
    if (!voice) return;

    // Always use the first affirmation for consistency
    let testText =
      "This is a test of how your affirmations will sound with this voice.";
    if (affirmations && affirmations.length > 0) {
      testText = affirmations[0];
    }

    setTestMessage(testText);
    setIsPlaying(true);
    setPlayingVoiceId(voice.id);

    // Use browser's speech synthesis
    if (typeof window !== "undefined" && window.speechSynthesis) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      // Create a test utterance
      const utterance = new SpeechSynthesisUtterance(testText);

      // Apply voice settings
      const voices = window.speechSynthesis.getVoices();
      const selectedVoice = voices.find((v) => v.name === voice.value);

      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }

      // Use default settings for rate, pitch and volume
      utterance.rate = 1.0;
      // utterance.rate = formData.speed || 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 0.8;

      // Add event handlers
      utterance.onend = () => {
        setIsPlaying(false);
        setPlayingVoiceId(null);
      };

      utterance.onerror = () => {
        setIsPlaying(false);
        setPlayingVoiceId(null);
      };

      // Speak the utterance
      window.speechSynthesis.speak(utterance);
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
                      {voice.name.charAt(0)}
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
