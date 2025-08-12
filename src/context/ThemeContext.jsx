"use client"

import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { toast } from "@/components/ui/use-toast"

const ThemeContext = createContext()

export function ThemeProvider({ children }) {
  const [themes, setThemes] = useState([])
  const [currentTheme, setCurrentTheme] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch all themes from the API
  const fetchThemes = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch("/api/themes")

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()

      if (data.success) {
        setThemes(data.themes)

        // Find the default theme or use the first one
        const defaultTheme = data.themes.find((theme) => theme.isDefault) || data.themes[0]

        if (defaultTheme) {
          setCurrentTheme(defaultTheme)
        } else {
          console.log("No themes available")
        }
      } else {
        throw new Error(data.message || "Failed to fetch themes")
      }
    } catch (err) {
      console.error("Error fetching themes:", err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  // Fetch themes on initial load
  useEffect(() => {
    fetchThemes()
  }, [fetchThemes])

  // Apply the current theme whenever it changes
  useEffect(() => {
    if (currentTheme) {
      applyTheme(currentTheme)
    }
  }, [currentTheme])

  // Create a new theme
  const createTheme = async (themeData) => {
    try {
      const response = await fetch("/api/themes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(themeData),
      })

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()

      if (data.success) {
        setThemes((prevThemes) => [...prevThemes, data.theme])
        toast({
          title: "Theme created",
          description: `Theme "${data.theme.name}" has been created successfully.`,
        })
        return data.theme
      } else {
        throw new Error(data.message || "Failed to create theme")
      }
    } catch (err) {
      console.error("Error creating theme:", err)
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      })
      throw err
    }
  }

  // Update an existing theme
  const updateTheme = async (id, updates) => {
    try {
      const response = await fetch(`/api/themes/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      })

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()

      if (data.success) {
        setThemes((prevThemes) => prevThemes.map((theme) => (theme._id === id ? data.theme : theme)))

        // If we updated the current theme, update it in state
        if (currentTheme && currentTheme._id === id) {
          setCurrentTheme(data.theme)
        }

        toast({
          title: "Theme updated",
          description: `Theme "${data.theme.name}" has been updated successfully.`,
        })
        return data.theme
      } else {
        throw new Error(data.message || "Failed to update theme")
      }
    } catch (err) {
      console.error("Error updating theme:", err)
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      })
      throw err
    }
  }

  // Delete a theme
  const deleteTheme = async (id) => {
    try {
      const response = await fetch(`/api/themes/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()

      if (data.success) {
        setThemes((prevThemes) => prevThemes.filter((theme) => theme._id !== id))

        // If we deleted the current theme, switch to the default
        if (currentTheme && currentTheme._id === id) {
          const defaultTheme = themes.find((theme) => theme.isDefault && theme._id !== id)
          if (defaultTheme) {
            setCurrentTheme(defaultTheme)
          } else if (themes.length > 1) {
            // If no default, use the first available theme
            const newCurrentTheme = themes.find((theme) => theme._id !== id)
            setCurrentTheme(newCurrentTheme)
          }
        }

        toast({
          title: "Theme deleted",
          description: "The theme has been deleted successfully.",
        })
        return true
      } else {
        throw new Error(data.message || "Failed to delete theme")
      }
    } catch (err) {
      console.error("Error deleting theme:", err)
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      })
      throw err
    }
  }

  // Set a theme as default
  const setDefaultTheme = async (id) => {
    try {
      const response = await fetch(`/api/themes/${id}/default`, {
        method: "PUT",
      })

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()

      if (data.success) {

        // Update all themes to reflect the new default
        setThemes((prevThemes) =>
          prevThemes.map((theme) => ({
            ...theme,
            isDefault: theme._id === id,
          })),
        )

        // Also set this theme as the current theme
        const updatedTheme = data.theme
        setCurrentTheme(updatedTheme)

        toast({
          title: "Default theme set",
          description: `Theme "${data.theme.name}" is now the default.`,
        })
        return data.theme
      } else {
        throw new Error(data.message || "Failed to set default theme")
      }
    } catch (err) {
      console.error("Error setting default theme:", err)
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      })
      throw err
    }
  }

  // Apply theme by setting CSS variables - IMPROVED VERSION
  const applyTheme = (theme) => {
    if (!theme) {
      console.error("Cannot apply null theme")
      return
    }


    try {
      const root = document.documentElement

      // Apply the theme variables
      if (theme.variables) {
        Object.entries(theme.variables).forEach(([key, value]) => {
          root.style.setProperty(`--${key}`, value)
        })
      }

      // Get the active palette
      const activePalette = theme.palettes?.find((p) => p.isActive) || theme.palettes?.[0]

      if (activePalette?.colors?.length > 0) {
        // Convert hex colors to HSL values
        const hslColors = activePalette.colors.map(hexToHSL)

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

        // Dark mode variables - adjust lightness for dark mode
        const darkHslColors = hslColors.map(adjustHslForDarkMode)

        // Remove any previous dark mode style
        const prevDarkStyle = document.getElementById("dark-theme-vars")
        if (prevDarkStyle) prevDarkStyle.remove()

        // Apply dark mode variables (these will be used when .dark class is active)
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

        // Apply direct color variables for components that don't use HSL
        if (activePalette.colors.length >= 1) root.style.setProperty("--primary-color", activePalette.colors[0])
        if (activePalette.colors.length >= 2) root.style.setProperty("--secondary-color", activePalette.colors[1])
        if (activePalette.colors.length >= 3) root.style.setProperty("--accent-color", activePalette.colors[2])

        // For gradients
        if (activePalette.colors.length >= 1) root.style.setProperty("--gradient-start", activePalette.colors[0])
        if (activePalette.colors.length >= 2) root.style.setProperty("--gradient-end", activePalette.colors[1])
      }

      // Store the current theme ID in localStorage
      localStorage.setItem("current-theme-id", theme._id)

      // Dispatch a custom event that components can listen for
      const themeChangeEvent = new CustomEvent("themechange", { detail: theme })
      document.dispatchEvent(themeChangeEvent)
    } catch (err) {
      console.error("Error applying theme:", err)
    }
  }

  // Helper function to convert hex to HSL
  const hexToHSL = (hex) => {
    try {
      // Remove the hash if it exists
      hex = hex.replace(/^#/, "")

      // Parse the hex values
      let r, g, b
      if (hex.length === 3) {
        r = Number.parseInt(hex[0] + hex[0], 16) / 255
        g = Number.parseInt(hex[1] + hex[1], 16) / 255
        b = Number.parseInt(hex[2] + hex[2], 16) / 255
      } else {
        r = Number.parseInt(hex.substring(0, 2), 16) / 255
        g = Number.parseInt(hex.substring(2, 4), 16) / 255
        b = Number.parseInt(hex.substring(4, 6), 16) / 255
      }

      // Find the min and max values to calculate saturation
      const max = Math.max(r, g, b)
      const min = Math.min(r, g, b)

      // Calculate HSL values
      let h,
        s,
        l = (max + min) / 2

      if (max === min) {
        // Achromatic (gray)
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

      // Convert to degrees, percentage, percentage
      h = Math.round(h * 360)
      s = Math.round(s * 100)
      l = Math.round(l * 100)

      return `${h} ${s}% ${l}%`
    } catch (err) {
      console.error("Error converting hex to HSL:", err, "for hex value:", hex)
      return "0 0% 0%"
    }
  }

  // Helper function to adjust HSL for dark mode
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

  const value = {
    themes,
    currentTheme,
    loading,
    error,
    fetchThemes,
    createTheme,
    updateTheme,
    deleteTheme,
    setDefaultTheme,
    applyTheme,
    setCurrentTheme,
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}

