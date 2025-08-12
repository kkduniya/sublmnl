"use client"

import { useState, useEffect } from "react"
import { useTheme } from "@/context/ThemeContext"

export default function ThemeSelector() {
  const { themes, currentTheme, applyTheme } = useTheme()
  const [isOpen, setIsOpen] = useState(false)

  // Close the dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen && !event.target.closest(".theme-selector")) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen])

  if (!themes || themes.length === 0) {
    return null
  }

  return (
    <div className="theme-selector relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 bg-secondary/20 border border-secondary/30 rounded-md hover:bg-secondary/30 transition-colors"
      >
        <span
          className="w-4 h-4 rounded-full"
          style={{
            background: `hsl(var(--primary))`,
          }}
        ></span>
        <span>{currentTheme?.name || "Theme"}</span>
        <svg
          className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-secondary/95 border border-secondary/30 rounded-md shadow-lg z-10">
          <div className="py-1">
            {themes.map((theme) => (
              <button
                key={theme._id}
                onClick={() => {
                  applyTheme(theme)
                  setIsOpen(false)
                }}
                className={`w-full text-left px-4 py-2 hover:bg-secondary/50 flex items-center space-x-2 ${
                  currentTheme?._id === theme._id ? "bg-secondary/30" : ""
                }`}
              >
                <span
                  className="w-3 h-3 rounded-full"
                  style={{
                    backgroundColor: theme.palettes?.[0]?.colors?.[0] || "#4169E1",
                  }}
                ></span>
                <span>{theme.name}</span>
                {theme.isDefault && <span className="text-xs text-primary ml-auto">Default</span>}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

