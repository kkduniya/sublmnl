"use client"

import ThemeManager from "@/components/dashboard/ThemeManager"
import { ThemeProvider } from "@/context/ThemeContext"

export default function ThemesPage() {
  return (
    <ThemeProvider>
      <ThemeManager />
    </ThemeProvider>
  )
}

