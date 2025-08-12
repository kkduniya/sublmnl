"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Pencil, Trash, Plus, Check, Loader2, RefreshCw } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

export default function ThemeManager() {
  const [themes, setThemes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [newThemeName, setNewThemeName] = useState("")
  const [creatingTheme, setCreatingTheme] = useState(false)
  const [editingTheme, setEditingTheme] = useState(null)
  const [editedTheme, setEditedTheme] = useState(null)
  const [activeTab, setActiveTab] = useState("themes")
  const [currentThemeId, setCurrentThemeId] = useState(null)

  // Load themes on component mount
  useEffect(() => {
    fetchThemes()

    // Get the current theme ID from localStorage
    const storedThemeId = localStorage.getItem("current-theme-id")
    if (storedThemeId) {
      setCurrentThemeId(storedThemeId)
    }
  }, [])

  // Fetch themes from the API
  const fetchThemes = async () => {
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

        // If no current theme is set, use the default theme
        if (!currentThemeId) {
          const defaultTheme = data.themes.find((theme) => theme.isDefault)
          if (defaultTheme) {
            setCurrentThemeId(defaultTheme._id)
            handleApplyTheme(defaultTheme)
          }
        }
      } else {
        throw new Error(data.message || "Failed to fetch themes")
      }
    } catch (err) {
      console.error("Error fetching themes:", err)
      setError(err.message)
      toast({
        title: "Error",
        description: `Failed to load themes: ${err.message}`,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Create a new theme
  const handleCreateTheme = async () => {
    if (!newThemeName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a theme name",
        variant: "destructive",
      })
      return
    }

    try {
      setCreatingTheme(true)

      // Create a new theme with default palettes
      const newTheme = {
        name: newThemeName,
        isDefault: themes.length === 0, // Make it default if it's the first theme
        palettes: [
          {
            name: "Default Palette",
            isActive: true,
            colors: [
              "#4169E1", // Royal Blue
              "#87CEEB", // Sky Blue
              "#1E90FF", // Dodger Blue
              "#6495ED", // Cornflower Blue
            ],
          },
        ],
        variables: {
          primary: "220 70% 50%",
          secondary: "210 60% 45%",
          accent: "200 80% 55%",
          background: "220 20% 10%",
          foreground: "0 0% 98%",
        },
      }

      const response = await fetch("/api/themes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newTheme),
      })

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()

      if (data.success) {
        const updatedThemes = [...themes, data.theme]
        setThemes(updatedThemes)
        setNewThemeName("")

        // If this is the first theme, apply it automatically
        if (updatedThemes.length === 1) {
          handleApplyTheme(data.theme)
        }

        toast({
          title: "Success",
          description: `Theme "${data.theme.name}" created successfully`,
        })
      } else {
        throw new Error(data.message || "Failed to create theme")
      }
    } catch (err) {
      console.error("Error creating theme:", err)
      toast({
        title: "Error",
        description: `Failed to create theme: ${err.message}`,
        variant: "destructive",
      })
    } finally {
      setCreatingTheme(false)
    }
  }

  // Start editing a theme
  const handleEditTheme = (theme) => {
    setEditingTheme(theme)
    setEditedTheme(JSON.parse(JSON.stringify(theme))) // Deep clone
    setActiveTab("edit")
  }

  // Save edited theme
  const handleSaveTheme = async () => {
    if (!editedTheme) return

    try {
      const response = await fetch(`/api/themes/${editedTheme._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editedTheme),
      })

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()

      if (data.success) {
        const updatedThemes = themes.map((theme) => (theme._id === editedTheme._id ? data.theme : theme))
        setThemes(updatedThemes)

        // If the current theme was edited, reapply it
        if (currentThemeId === editedTheme._id) {
          handleApplyTheme(data.theme)
        }

        setEditingTheme(null)
        setEditedTheme(null)
        setActiveTab("themes")
        toast({
          title: "Success",
          description: `Theme "${data.theme.name}" updated successfully`,
        })
      } else {
        throw new Error(data.message || "Failed to update theme")
      }
    } catch (err) {
      console.error("Error saving theme:", err)
      toast({
        title: "Error",
        description: `Failed to save theme: ${err.message}`,
        variant: "destructive",
      })
    }
  }

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingTheme(null)
    setEditedTheme(null)
    setActiveTab("themes")
  }

  // Delete a theme
  const handleDeleteTheme = async (id) => {
    if (!window.confirm("Are you sure you want to delete this theme?")) {
      return
    }

    try {
      const response = await fetch(`/api/themes/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()

      if (data.success) {
        const updatedThemes = themes.filter((theme) => theme._id !== id)
        setThemes(updatedThemes)

        // If the deleted theme was the current theme, switch to the default
        if (currentThemeId === id) {
          const defaultTheme = updatedThemes.find((theme) => theme.isDefault)
          if (defaultTheme) {
            handleApplyTheme(defaultTheme)
          } else if (updatedThemes.length > 0) {
            // If no default, use the first available theme
            handleApplyTheme(updatedThemes[0])
          }
        }

        toast({
          title: "Success",
          description: "Theme deleted successfully",
        })
      } else {
        throw new Error(data.message || "Failed to delete theme")
      }
    } catch (err) {
      console.error("Error deleting theme:", err)
      toast({
        title: "Error",
        description: `Failed to delete theme: ${err.message}`,
        variant: "destructive",
      })
    }
  }

  // Set a theme as default
  const handleSetDefaultTheme = async (id) => {
    try {
      const response = await fetch(`/api/themes/${id}/default`, {
        method: "PUT",
      })

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()

      if (data.success) {
        const updatedThemes = themes.map((theme) => ({
          ...theme,
          isDefault: theme._id === id,
        }))
        setThemes(updatedThemes)

        // Apply the theme when it's set as default
        const themeToApply = updatedThemes.find((theme) => theme._id === id)
        if (themeToApply) {
          handleApplyTheme(themeToApply)
        }

        toast({
          title: "Success",
          description: `Theme set as default successfully`,
        })
      } else {
        throw new Error(data.message || "Failed to set default theme")
      }
    } catch (err) {
      console.error("Error setting default theme:", err)
      toast({
        title: "Error",
        description: `Failed to set default theme: ${err.message}`,
        variant: "destructive",
      })
    }
  }

  // Convert hex to HSL
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

  // Adjust HSL for dark mode
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

  // Apply a theme - ENHANCED VERSION
  const handleApplyTheme = (theme) => {
    try {
      // Get the active palette
      const activePalette = theme.palettes.find((p) => p.isActive) || theme.palettes[0]

      if (!activePalette || !activePalette.colors || activePalette.colors.length === 0) {
        throw new Error("No valid palette found in theme")
      }

      // Apply CSS variables
      const root = document.documentElement

      // Apply theme variables
      if (theme.variables) {
        Object.entries(theme.variables).forEach(([key, value]) => {
          root.style.setProperty(`--${key}`, value)
        })
      }

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

      // Store the current theme ID in localStorage and state
      localStorage.setItem("current-theme-id", theme._id)
      setCurrentThemeId(theme._id)

      // Dispatch a custom event that components can listen for
      const themeChangeEvent = new CustomEvent("themechange", { detail: theme })
      document.dispatchEvent(themeChangeEvent)

      toast({
        title: "Success",
        description: `Theme "${theme.name}" applied successfully`,
      })
    } catch (err) {
      console.error("Error applying theme:", err)
      toast({
        title: "Error",
        description: `Failed to apply theme: ${err.message}`,
        variant: "destructive",
      })
    }
  }

  // Update palette name
  const handlePaletteNameChange = (index, name) => {
    if (!editedTheme) return

    const updatedPalettes = [...editedTheme.palettes]
    updatedPalettes[index] = {
      ...updatedPalettes[index],
      name,
    }

    setEditedTheme({
      ...editedTheme,
      palettes: updatedPalettes,
    })
  }

  // Set a palette as active
  const handleSetActivePalette = (index) => {
    if (!editedTheme) return

    const updatedPalettes = editedTheme.palettes.map((palette, i) => ({
      ...palette,
      isActive: i === index,
    }))

    setEditedTheme({
      ...editedTheme,
      palettes: updatedPalettes,
    })
  }

  // Update a color in a palette
  const handleColorChange = (paletteIndex, colorIndex, color) => {
    if (!editedTheme) return

    const updatedPalettes = [...editedTheme.palettes]
    const updatedColors = [...updatedPalettes[paletteIndex].colors]
    updatedColors[colorIndex] = color

    updatedPalettes[paletteIndex] = {
      ...updatedPalettes[paletteIndex],
      colors: updatedColors,
    }

    setEditedTheme({
      ...editedTheme,
      palettes: updatedPalettes,
    })
  }

  // Add a color to a palette
  const handleAddColor = (paletteIndex) => {
    if (!editedTheme) return

    const updatedPalettes = [...editedTheme.palettes]
    updatedPalettes[paletteIndex] = {
      ...updatedPalettes[paletteIndex],
      colors: [...updatedPalettes[paletteIndex].colors, "#FFFFFF"],
    }

    setEditedTheme({
      ...editedTheme,
      palettes: updatedPalettes,
    })
  }

  // Remove a color from a palette
  const handleRemoveColor = (paletteIndex, colorIndex) => {
    if (!editedTheme) return

    const updatedPalettes = [...editedTheme.palettes]
    const updatedColors = [...updatedPalettes[paletteIndex].colors]
    updatedColors.splice(colorIndex, 1)

    updatedPalettes[paletteIndex] = {
      ...updatedPalettes[paletteIndex],
      colors: updatedColors,
    }

    setEditedTheme({
      ...editedTheme,
      palettes: updatedPalettes,
    })
  }

  // Render color circles
  const renderColorCircles = (colors) => {
    return colors.map((color, index) => (
      <div key={index} className="w-8 h-8 rounded-full" style={{ backgroundColor: color }} title={color} />
    ))
  }

  // Render editable color circles
  const renderEditableColorCircles = (paletteIndex, colors) => {
    return colors.map((color, colorIndex) => (
      <div key={colorIndex} className="flex flex-col items-center gap-1">
        <input
          type="color"
          value={color}
          onChange={(e) => handleColorChange(paletteIndex, colorIndex, e.target.value)}
          className="w-8 h-8 rounded-full cursor-pointer"
          style={{ backgroundColor: color }}
        />
        <button
          onClick={() => handleRemoveColor(paletteIndex, colorIndex)}
          className="text-xs text-red-500 hover:text-red-700"
          disabled={colors.length <= 1}
        >
          Remove
        </button>
      </div>
    ))
  }

  // Preview the theme being edited
  const handlePreviewTheme = () => {
    if (!editedTheme) return

    // Create a temporary copy to avoid modifying the editing state
    const previewTheme = JSON.parse(JSON.stringify(editedTheme))
    handleApplyTheme(previewTheme)

    toast({
      title: "Preview Mode",
      description: "This is a preview. Save the theme to make these changes permanent.",
    })
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading themes...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 bg-red-500/20 border border-red-500 rounded-md text-red-100">
        <h3 className="text-lg font-semibold mb-2">Error loading themes</h3>
        <p>{error}</p>
        <Button variant="outline" className="mt-4" onClick={fetchThemes}>
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Theme Management</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="themes">Themes</TabsTrigger>
          {editingTheme && <TabsTrigger value="edit">Edit Theme</TabsTrigger>}
        </TabsList>

        <TabsContent value="themes">
          <div className="flex items-center mb-6">
            <Input
              placeholder="New theme name"
              value={newThemeName}
              onChange={(e) => setNewThemeName(e.target.value)}
              className="max-w-xs mr-4"
            />
            <Button onClick={handleCreateTheme} disabled={creatingTheme || !newThemeName.trim()}>
              {creatingTheme ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Theme
                </>
              )}
            </Button>
          </div>

          {themes.length === 0 ? (
            <div className="text-center p-8 bg-gray-800/50 rounded-lg">
              <p className="text-gray-400 mb-4">No themes found. Create your first theme to get started.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {themes.map((theme) => (
                <Card
                  key={theme._id}
                  className={`overflow-hidden ${currentThemeId === theme._id ? "border-2 border-primary" : ""}`}
                >
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-xl">
                      {theme.name}
                      {theme.isDefault && <span className="ml-2 text-sm text-green-500">(Default)</span>}
                      {currentThemeId === theme._id && !theme.isDefault && (
                        <span className="ml-2 text-sm text-blue-500">(Active)</span>
                      )}
                    </CardTitle>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEditTheme(theme)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteTheme(theme._id)}
                        disabled={theme.isDefault && themes.length <= 1}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>

                  <CardContent>
                    {theme.palettes &&
                      theme.palettes.map((palette, index) => (
                        <div key={index} className={`mb-4 ${palette.isActive ? "border-l-4 border-primary pl-2" : ""}`}>
                          <p className="text-sm font-medium mb-2">{palette.name}</p>
                          <div className="flex space-x-2 mb-2">{renderColorCircles(palette.colors)}</div>
                        </div>
                      ))}
                  </CardContent>

                  <CardFooter className="flex justify-between">
                    {!theme.isDefault && (
                      <Button variant="outline" size="sm" onClick={() => handleSetDefaultTheme(theme._id)}>
                        Set as Default
                      </Button>
                    )}
                    <Button
                      variant={currentThemeId === theme._id ? "secondary" : "default"}
                      size="sm"
                      onClick={() => handleApplyTheme(theme)}
                      disabled={currentThemeId === theme._id}
                    >
                      {currentThemeId === theme._id ? "Current Theme" : "Apply Theme"}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="edit">
          {editedTheme && (
            <div>
              <div className="flex items-center mb-6">
                <Input
                  placeholder="Theme name"
                  value={editedTheme.name}
                  onChange={(e) => setEditedTheme({ ...editedTheme, name: e.target.value })}
                  className="max-w-xs mr-4"
                />
                <Button variant="outline" onClick={handlePreviewTheme} className="ml-auto">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Preview Changes
                </Button>
              </div>

              <h3 className="text-lg font-medium mb-4">Color Palettes</h3>

              {editedTheme.palettes.map((palette, paletteIndex) => (
                <Card key={paletteIndex} className="mb-6">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <Input
                        placeholder="Palette name"
                        value={palette.name}
                        onChange={(e) => handlePaletteNameChange(paletteIndex, e.target.value)}
                        className="max-w-xs"
                      />
                      <div className="flex items-center ml-4">
                        <input
                          type="radio"
                          id={`palette-${paletteIndex}`}
                          name="activePalette"
                          checked={palette.isActive}
                          onChange={() => handleSetActivePalette(paletteIndex)}
                          className="mr-2"
                        />
                        <label htmlFor={`palette-${paletteIndex}`}>Active</label>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <div className="flex flex-wrap gap-4 mb-4">
                      {renderEditableColorCircles(paletteIndex, palette.colors)}
                      <Button variant="outline" size="icon" onClick={() => handleAddColor(paletteIndex)}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}

              <div className="flex justify-end space-x-4 mt-6">
                <Button variant="outline" onClick={handleCancelEdit}>
                  Cancel
                </Button>
                <Button onClick={handleSaveTheme}>
                  <Check className="mr-2 h-4 w-4" /> Save Theme
                </Button>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

