"use client"

import { ThemeProvider as NextThemesProvider } from "next-themes"
import { useEffect, useState } from "react"
import { ThemeProvider as CustomThemeProvider } from "@/context/ThemeContext"

export function ThemeProvider({ children, ...props }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)

    // Load and apply custom theme if one is saved
    try {
      const savedThemeName = localStorage.getItem("sublmnl-current-theme")
      const savedPaletteIndex = localStorage.getItem("sublmnl-current-theme-palette")

      if (savedThemeName) {
        const savedThemes = JSON.parse(localStorage.getItem("sublmnl-custom-themes") || "[]")
        const currentTheme = savedThemes.find((theme) => theme.name === savedThemeName)

        if (currentTheme) {
          const paletteIndex = savedPaletteIndex ? Number.parseInt(savedPaletteIndex, 10) : 0
          if (paletteIndex >= 0 && currentTheme.palettes && currentTheme.palettes.length > paletteIndex) {
            const selectedPalette = currentTheme.palettes[paletteIndex]

            if (selectedPalette && selectedPalette.colors && selectedPalette.colors.length > 0) {
              // Apply CSS variables
              const root = document.documentElement

              // Apply base CSS variables
              if (currentTheme.cssVariables) {
                Object.entries(currentTheme.cssVariables).forEach(([key, value]) => {
                  root.style.setProperty(`--${key}`, value)
                })
              }

              // Convert hex colors to HSL values
              const hslColors = selectedPalette.colors.map(hexToHSL)

              // Apply the HSL values to various CSS variables
              if (hslColors.length >= 1) root.style.setProperty("--primary", hslColors[0])
              if (hslColors.length >= 2) root.style.setProperty("--secondary", hslColors[1])
              if (hslColors.length >= 3) root.style.setProperty("--accent", hslColors[2])
              if (hslColors.length >= 4) root.style.setProperty("--muted", hslColors[3])

              // Chart colors
              for (let i = 0; i < Math.min(hslColors.length, 5); i++) {
                root.style.setProperty(`--chart-${i + 1}`, hslColors[i])
              }

              // Sidebar colors
              if (hslColors.length >= 1) root.style.setProperty("--sidebar-primary", hslColors[0])
              if (hslColors.length >= 2) root.style.setProperty("--sidebar-accent", hslColors[1])

              // Dark mode variables
              const darkHslColors = hslColors.map(adjustHslForDarkMode)

              // Apply dark mode variables
              const darkRoot = document.createElement("style")
              darkRoot.innerHTML = `
              .dark {
                --primary: ${darkHslColors[0] || "0 0% 98%"};
                --secondary: ${darkHslColors[1] || "0 0% 14.9%"};
                --accent: ${darkHslColors[2] || "0 0% 14.9%"};
                --muted: ${darkHslColors[3] || "0 0% 14.9%"};
                --chart-1: ${darkHslColors[0] || "220 70% 50%"};
                --chart-2: ${darkHslColors[1] || "160 60% 45%"};
                --chart-3: ${darkHslColors[2] || "30 80% 55%"};
                --chart-4: ${darkHslColors[3] || "280 65% 60%"};
                --chart-5: ${darkHslColors[4] || "340 75% 55%"};
                --sidebar-primary: ${darkHslColors[0] || "224.3 76.3% 48%"};
                --sidebar-accent: ${darkHslColors[1] || "240 3.7% 15.9%"};
              }
            `

              darkRoot.id = "dark-theme-vars"
              document.head.appendChild(darkRoot)

              console.log("Theme applied successfully from localStorage:", savedThemeName)
            }
          }
        }
      }
    } catch (e) {
      console.error("Error applying saved theme:", e)
    }
  }, [])

  // Helper function to convert hex to HSL
  const hexToHSL = (hex) => {
    try {
      // Remove the # if present
      hex = hex.replace(/^#/, "")

      // Parse the hex values
      const r = Number.parseInt(hex.substring(0, 2), 16) / 255
      const g = Number.parseInt(hex.substring(2, 4), 16) / 255
      const b = Number.parseInt(hex.substring(4, 6), 16) / 255

      // Find the min and max values to determine lightness
      const max = Math.max(r, g, b)
      const min = Math.min(r, g, b)
      let h,
        s,
        l = (max + min) / 2

      if (max === min) {
        // Achromatic
        h = s = 0
      } else {
        const d = max - min
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

        switch (max) {
          case r:
            h = (g - b) / d + (g < b ? 6 : 0)
            break
          case g:
            h = (b - r) / d + 2
            break
          case b:
            h = (r - g) / d + 4
            break
        }

        h /= 6
      }

      // Convert to degrees, percentage, percentage format
      h = Math.round(h * 360)
      s = Math.round(s * 100)
      l = Math.round(l * 100)

      return `${h} ${s}% ${l}%`
    } catch (err) {
      console.error("Error converting hex to HSL:", err, "for hex value:", hex)
      return "0 0% 0%"
    }
  }

  // Adjust HSL color for dark mode
  const adjustHslForDarkMode = (hsl) => {
    if (!hsl) return null

    try {
      const [h, s, l] = hsl.split(" ")
      const hValue = Number.parseInt(h, 10)
      const sValue = Number.parseInt(s, 10)
      let lValue = Number.parseInt(l, 10)

      // For dark mode, we want to ensure colors are visible
      if (lValue < 40) {
        lValue = Math.min(lValue + 30, 85)
      }

      return `${hValue} ${sValue}% ${lValue}%`
    } catch (err) {
      console.error("Error adjusting HSL for dark mode:", err, "for HSL value:", hsl)
      return "0 0% 50%"
    }
  }

  // Render a div with no special attributes during SSR
  if (!mounted) {
    return <div className="contents">{children}</div>
  }

  return (
    <CustomThemeProvider>
      <NextThemesProvider {...props} defaultTheme="dark">
        <div className="dark">{children}</div>
      </NextThemesProvider>
    </CustomThemeProvider>
  )
}

