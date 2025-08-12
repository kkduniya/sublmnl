"use client"

import { useState } from "react"
import { Play, Pause, SkipBack, SkipForward, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

/**
 * @param {Object} props
 * @param {string} props.title - Title of the track
 * @param {boolean} props.isPlaying - Whether audio is currently playing
 * @param {Function} props.onPlayPause - Function to call when play/pause button is clicked
 * @param {Function} [props.onNext] - Function to call when next button is clicked
 * @param {Function} [props.onPrevious] - Function to call when previous button is clicked
 * @param {number} [props.progress] - Current playback progress (0-1)
 * @param {Function} [props.onClose] - Function to call when close button is clicked
 * @param {boolean} [props.visible] - Whether the mini player is visible
 */
export default function MiniPlayer({
  title,
  isPlaying,
  onPlayPause,
  onNext,
  onPrevious,
  progress = 0,
  onClose,
  visible = true,
}) {
  const [minimized, setMinimized] = useState(false)

  if (!visible) return null

  return (
    <div
      className={cn(
        "fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-lg border-t border-white/10 p-2 z-50 transition-all duration-300",
        minimized ? "h-2 p-0" : "h-auto",
      )}
    >
      {minimized ? (
        <div
          className="w-full h-2 bg-primary/30 cursor-pointer"
          onClick={() => setMinimized(false)}
          role="button"
          aria-label="Expand player"
        >
          <div className="h-full bg-primary" style={{ width: `${progress * 100}%` }} />
        </div>
      ) : (
        <div className="container mx-auto flex items-center justify-between max-w-6xl">
          <div className="flex-1 min-w-0 mr-4">
            <p className="truncate text-sm font-medium">{title}</p>
            <div className="w-full bg-gray-700 h-1 mt-1 rounded-full overflow-hidden">
              <div className="bg-primary h-full rounded-full" style={{ width: `${progress * 100}%` }} />
            </div>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={onPrevious}
              disabled={!onPrevious}
            >
              <SkipBack className="h-4 w-4" />
            </Button>

            <Button
              variant="default"
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={() => onPlayPause(!isPlaying)}
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
            </Button>

            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={onNext} disabled={!onNext}>
              <SkipForward className="h-4 w-4" />
            </Button>

            <div className="flex gap-1 ml-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full hover:bg-gray-700/50"
                onClick={() => setMinimized(true)}
                aria-label="Minimize player"
              >
                <span className="h-1 w-4 bg-gray-400 rounded-full"></span>
              </Button>

              {onClose && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full hover:bg-gray-700/50"
                  onClick={onClose}
                  aria-label="Close player"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

