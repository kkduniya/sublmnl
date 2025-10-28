"use client"

import { Play, Pause, MoreVertical, Download, Edit2, Trash2, Lock, Crown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import LockedAudioPopup from "./LockedAudioPopup"

export default function AudioCard({ audio, isPlaying, isActive, onPlay, onDownload, onDelete, onNameUpdate }) {
  // Format date
  const formatDate = (date) => {
    if (!date) return "Unknown date"
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  // Helper function to safely get voice type
  const getVoiceType = (audio) => {
    if (!audio || !audio.voiceType) return "Default"
    const parts = audio.voiceType.split("-")
    return parts.length > 0 ? parts[parts.length - 1] : "Default"
  }

  const [editOpen, setEditOpen] = useState(false)
  const [newName, setNewName] = useState(audio.name)
  const [loading, setLoading] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [lockedPopupOpen, setLockedPopupOpen] = useState(false)

  const handleEditClick = () => {
    setNewName(audio.name)
    setEditOpen(true)
  }

  const handleEditSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch("/api/audio/update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: audio.id || audio._id, updates: { name: newName } }),
      })
      const data = await res.json()
      if (data.success) {
        if (onNameUpdate) onNameUpdate(newName)
        setEditOpen(false)
      } else {
        alert(data.message || "Failed to update name")
      }
    } catch (err) {
      alert("Error updating name")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteClick = () => {
    setDeleteOpen(true)
  }

  const handleDeleteConfirm = async () => {
    setDeleteLoading(true)
    try {
      const res = await fetch("/api/audio/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: audio.id || audio._id }),
      })
      const data = await res.json()
      if (data.success) {
        if (onDelete) onDelete()
        setDeleteOpen(false)
      } else {
        alert(data.message || "Failed to delete audio")
      }
    } catch (err) {
      alert("Error deleting audio")
    } finally {
      setDeleteLoading(false)
    }
  }

  const handleLockClick = (e) => {
    e.stopPropagation()
    setLockedPopupOpen(true)
  }

  return (
    <div
      className={cn(
        "flex items-start sm:items-center p-3 rounded-lg transition-colors",
        audio.isLocked 
          ? "bg-gray-800/20 opacity-60" 
          : isActive 
            ? "bg-gray-800/50" 
            : "hover:bg-gray-800/30",
      )}
    >
      <div className="flex-shrink-0 mr-4">
        {/* <div className="w-12 h-12 bg-gray-800/70 rounded-md flex items-center justify-center">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M9 18V6L21 12L9 18Z"
              stroke="#888888"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div> */}

        <button
          onClick={audio.isLocked ? handleLockClick : onPlay}
          className={cn(
            "p-2 rounded-full transition-colors",
            audio.isLocked 
              ? "bg-gray-600/20 hover:bg-gray-600/30 cursor-pointer" 
              : "bg-gradient-to-r from-primary/20 to-purple-500/20 hover:from-primary/30 hover:to-purple-500/30"
          )}
          aria-label={audio.isLocked ? "Unlock audio" : (isPlaying ? "Pause" : "Play")}
        >
          {audio.isLocked ? (
            <Lock className="h-5 w-5 text-gray-500 hover:text-yellow-500 transition-colors" />
          ) : isPlaying ? (
            <Pause className="h-5 w-5 text-primary" />
          ) : (
            <Play className="h-5 w-5 text-primary" />
          )}
        </button>
      </div>


      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1">
          <h3 className={cn("font-medium truncate cursor-pointer", audio.isLocked && "text-gray-500 hover:text-yellow-500")} onClick={audio.isLocked ? handleLockClick : onPlay}>{audio.name}</h3>
          {audio.isPurchased && !audio.isLocked && (
            <Crown className="min-w-[16px] h-4 w-4 text-yellow-500" title="Purchased Audio" />
          )}
          <button onClick={handleEditClick} className="ml-1 p-1 rounded hover:bg-gray-700/40" aria-label="Edit name">
            <Edit2 className="h-4 w-4 text-gray-400 hover:text-primary" />
          </button>
        </div>
        <div className="flex items-center text-xs text-gray-400 mt-1">
          <span>{formatDate(audio.createdAt)}</span>
          <span className="mx-2">•</span>
          <span>{audio.category || "General"}</span>
          <span className="mx-2 hidden sm:inline">•</span>
          <span className="hidden sm:inline">{audio?.voiceName ? audio?.voiceName : audio?.voiceType}</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button onClick={handleDeleteClick} className="p-1 rounded hover:bg-red-900/30" aria-label="Delete audio">
          <Trash2 className="h-5 w-5 text-red-400 hover:text-red-600" />
        </button>
      </div>
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Audio Name</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <Input
              value={newName}
              onChange={e => setNewName(e.target.value)}
              disabled={loading}
              autoFocus
              maxLength={100}
            />
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setEditOpen(false)} disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading || !newName.trim()}>
                {loading ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Audio</DialogTitle>
          </DialogHeader>
          <div className="text-center">Are you sure you want to delete <span className="font-semibold">{audio.name}</span>? <br /> This action cannot be undone.</div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setDeleteOpen(false)} disabled={deleteLoading}>
              Cancel
            </Button>
            <Button type="button" variant="destructive" onClick={handleDeleteConfirm} disabled={deleteLoading}>
              {deleteLoading ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Locked Audio Popup */}
      <LockedAudioPopup
        open={lockedPopupOpen}
        onOpenChange={setLockedPopupOpen}
        audioName={audio.name}
        audioId={audio.id || audio._id}
      />
    </div>
  )
}

