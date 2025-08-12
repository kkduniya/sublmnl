"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

export function SaveAudioDialog({ open, onOpenChange, defaultTitle = "", onSave, isSaving, getThemeColor }) {
  const [audioTitle, setAudioTitle] = useState(defaultTitle)
  const [titleError, setTitleError] = useState("")

  const handleSave = () => {
    // Validate the title
    if (!audioTitle.trim()) {
      setTitleError("Please enter a title for your audio")
      return
    }

    setTitleError("")
    onSave(audioTitle.trim())
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-gray-900 text-white border-gray-800">
        <DialogHeader>
          <DialogTitle>Save Audio to Library</DialogTitle>
          <DialogDescription className="text-gray-400">
            Enter a title for your audio track. This will help you identify it in your library.
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
              className="col-span-3 bg-gray-800 border-gray-700 text-white"
              placeholder="Enter a title for your audio"
              autoFocus
            />
            {titleError && <p className="col-span-4 text-red-500 text-sm mt-1">{titleError}</p>}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            style={{
              backgroundImage: getThemeColor
                ? `linear-gradient(to right, ${getThemeColor(2, "#22c55e")}, ${getThemeColor(1, "#1E90FF")})`
                : undefined,
            }}
          >
            {isSaving ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
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
  )
}

