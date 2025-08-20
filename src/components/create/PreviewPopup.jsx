"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { X, Headphones, Music, Sparkles } from "lucide-react"

export default function PreviewPopup({ 
  open,
  onOpenChange, 
  onCreateAccount,
  onClose 
}) {

  const handleOpenChange = (isOpen) => {
    onOpenChange(isOpen)
    if (!isOpen && onClose) {
      onClose()
    }
  }
  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className=" w-[90vw] max-w-[450px] bg-gray-900 text-white border-gray-800">
        <DialogHeader>
          <div className="flex justify-between items-start">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-[#e4ffa8]/20 to-[#b1d239]/20 rounded-lg">
                <Headphones className="h-6 w-6 text-[#e4ffa8]" />
              </div>
              <div>
                <DialogTitle className="text-xl">How did that sound?</DialogTitle>
                <DialogDescription className="text-gray-400">
                  Create an account to listen to the full track and save it to your library.
                </DialogDescription>
              </div>
            </div>
            {/* <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </Button> */}
          </div>
        </DialogHeader>
        
        <div className="space-y-4 mt-4">
          <div className="bg-gray-800/50 rounded-lg p-4 space-y-3">
            <div className="flex items-center space-x-3">
              <Music className="h-5 w-5 text-[#e4ffa8]" />
              <span className="text-white font-medium">Full Track Access</span>
            </div>
            <div className="flex items-center space-x-3">
              <Sparkles className="h-5 w-5 text-[#e4ffa8]" />
              <span className="text-white font-medium">Save to Your Library</span>
            </div>
            <div className="flex items-center space-x-3">
              <Headphones className="h-5 w-5 text-[#e4ffa8]" />
              <span className="text-white font-medium">Unlimited Creation</span>
            </div>
          </div>

          <div className="flex flex-col space-y-3 pt-2">
            <Button
              onClick={onCreateAccount}
              className="w-full bg-gradient-to-r from-[#e4ffa8] to-[#b1d239] text-black font-semibold py-3"
            >
              Create Account & Continue
            </Button>
            
            <Button
              variant="ghost"
              onClick={onClose}
              className="text-gray-400 hover:text-white hover:bg-white/10 "
            >
              Maybe Later
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
