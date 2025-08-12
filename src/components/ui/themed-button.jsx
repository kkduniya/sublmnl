"use client"

import { useState } from "react"
import Link from "next/link"
import { useTheme } from "@/context/ThemeContext"

export const ThemedButton = ({
  children,
  href,
  variant = "primary",
  className = "",
  colorIndices = [0, 1], // Default to first two colors for gradient
  gradientDirection = "to right", // Default gradient direction
  onClick,
  ...props
}) => {
  const { currentTheme } = useTheme()
  const [isHovered, setIsHovered] = useState(false)

  // Get colors from the active palette
  const getThemeColor = (index, fallback) => {
    if (!currentTheme || !currentTheme.palettes) return fallback

    const activePalette = currentTheme.palettes.find((p) => p.isActive) || currentTheme.palettes[0]
    if (!activePalette || !activePalette.colors || activePalette.colors.length <= index) {
      return fallback
    }

    return activePalette.colors[index]
  }

  // Get gradient colors
  const startColor = getThemeColor(colorIndices[0], "#4169E1")
  const endColor = getThemeColor(colorIndices[1] || colorIndices[0], "#8A2BE2")

  // Calculate text color based on background color brightness
  const getTextColor = (bgColor) => {
    // Convert hex to RGB
    const hex = bgColor.replace("#", "")
    const r = Number.parseInt(hex.substring(0, 2), 16)
    const g = Number.parseInt(hex.substring(2, 4), 16)
    const b = Number.parseInt(hex.substring(4, 6), 16)

    // Calculate brightness (YIQ formula)
    const brightness = (r * 299 + g * 587 + b * 114) / 1000

    // Return white for dark backgrounds, black for light backgrounds
    return brightness > 128 ? "#000000" : "#FFFFFF"
  }

  const textColor = variant === "primary" ? getTextColor(startColor) : "#FFFFFF"

  const baseClasses = "px-6 py-3 rounded-lg font-medium transition-all duration-300 inline-block text-center"

  // Style based on variant
  let buttonStyle = {}

  if (variant === "primary") {
    // Primary button with gradient
    buttonStyle = {
      background: `linear-gradient(${gradientDirection}, ${startColor}, ${endColor})`,
      color: textColor,
      transform: isHovered ? "translateY(-2px)" : "translateY(0)",
      boxShadow: isHovered ? `0 10px 20px -10px ${startColor}80` : "none",
    }
  } else if (variant === "secondary") {
    // Secondary button with border and transparent background
    buttonStyle = {
      background: "transparent",
      color: textColor,
      borderWidth: "1px",
      borderStyle: "solid",
      borderColor: "white",
      transform: isHovered ? "translateY(-2px)" : "translateY(0)",
    }
  } else if (variant === "outline") {
    // Outline button with gradient border
    buttonStyle = {
      background: "transparent",
      color: startColor,
      borderWidth: "2px",
      borderStyle: "solid",
      borderImage: `linear-gradient(${gradientDirection}, ${startColor}, ${endColor}) 1`,
      transform: isHovered ? "translateY(-2px)" : "translateY(0)",
    }
  }

  // Combine all classes
  const allClasses = `${baseClasses} ${className}`

  // Event handlers for hover effects
  const handleMouseEnter = () => setIsHovered(true)
  const handleMouseLeave = () => setIsHovered(false)

  // If href is provided, render as Link, otherwise as button
  if (href) {
    return (
      <Link
        href={href}
        className={allClasses}
        style={buttonStyle}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        {...props}
      >
        {children}
      </Link>
    )
  }

  return (
    <button
      className={allClasses}
      style={buttonStyle}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      {children}
    </button>
  )
}

