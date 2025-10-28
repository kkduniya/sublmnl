"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckoutButton } from "@/components/stripe/checkout/CheckoutButton"
import { useAuth } from "@/context/AuthContext"
import { format } from "date-fns"
import { Music, Crown, Loader2 } from "lucide-react"

export default function AudioSelectionPopup({ 
  open, 
  onOpenChange, 
  onPurchaseComplete 
}) {
  const [userAudios, setUserAudios] = useState([])
  const [selectedAudios, setSelectedAudios] = useState([])
  const [loading, setLoading] = useState(false)
  const [purchasing, setPurchasing] = useState(false)
  const [userData, setUserData] = useState(null)
  const { user } = useAuth()

  useEffect(() => {
    if (open && user?.id) {
      fetchUserData()
    }
  }, [open, user?.id])

  const fetchUserData = async () => {
    try {
      setLoading(true)
      
      // Fetch both user data and audios in parallel
      const [userResponse, audiosResponse] = await Promise.all([
        fetch(`/api/user/data`),
        fetch(`/api/user/audios?userId=${user.id}`)
      ])

      const [userData, audiosData] = await Promise.all([
        userResponse.json(),
        audiosResponse.json()
      ])

      if (userResponse.ok && userData.user) {
        setUserData(userData.user)
      }

      if (audiosResponse.ok && audiosData.audios) {
        // Filter out already purchased audios using the complete user data
        const purchasedAudioIds = userData.user?.purchasedAudios || []
        const unpurchasedAudios = audiosData.audios.filter(audio => 
          !purchasedAudioIds.some(purchasedId => 
            purchasedId.toString() === (audio._id || audio.id).toString()
          )
        )
        setUserAudios(unpurchasedAudios)
      }
    } catch (error) {
      console.error("Error fetching user data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAudioSelect = (audioId, isSelected) => {
    if (isSelected) {
      setSelectedAudios(prev => [...prev, audioId])
    } else {
      setSelectedAudios(prev => prev.filter(id => id !== audioId))
    }
  }

  const handleSelectAll = () => {
    if (selectedAudios.length === userAudios.length) {
      setSelectedAudios([])
    } else {
      setSelectedAudios(userAudios.map(audio => audio._id || audio.id))
    }
  }

  const handlePurchaseSelected = async () => {
    if (selectedAudios.length === 0) return

    setPurchasing(true)
    try {
      const response = await fetch("/api/stripe/purchase-multiple-audios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          audioIds: selectedAudios
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create purchase sessions")
      }

       if (data.checkoutUrl) {
         // Redirect to the single checkout session with quantity
         window.location.href = data.checkoutUrl
       } else {
         throw new Error("No checkout session created")
       }

    } catch (error) {
      console.error("Error creating purchase sessions:", error)
      alert("Failed to process purchase. Please try again.")
    } finally {
      setPurchasing(false)
    }
  }

  const totalPrice = selectedAudios.length * 22.50

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-4xl max-h-[90vh] 2xl:max-h-[80vh] overflow-hidden flex flex-col p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-center text-xl sm:text-2xl font-bold text-white">
            Select Audios to Purchase
          </DialogTitle>
          <DialogDescription className="text-center text-gray-300 text-sm sm:text-base">
            Choose which audios you'd like to purchase at 50% off ($22.50 CAD each)
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col">
          {loading ? (
            <div className="flex items-center justify-center py-8 sm:py-12">
              <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-primary" />
              <span className="ml-2 text-gray-300 text-sm sm:text-base">Loading your audios...</span>
            </div>
          ) : userAudios.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <Music className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-300 text-base sm:text-lg">No audios available for purchase</p>
              <p className="text-gray-400 text-xs sm:text-sm mt-2 px-4">
                You may have already purchased all your audios or haven't created any yet.
              </p>
            </div>
          ) : (
            <>
              {/* Header with select all and count */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 pb-4 border-b border-gray-700 space-y-2 sm:space-y-0">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="select-all"
                    checked={selectedAudios.length === userAudios.length}
                    onCheckedChange={handleSelectAll}
                  />
                  <label htmlFor="select-all" className="text-xs sm:text-sm font-medium text-white cursor-pointer">
                    Select All ({userAudios.length} audios)
                  </label>
                </div>
                <Badge variant="outline" className="text-primary border-primary text-xs sm:text-sm w-fit">
                  {selectedAudios.length} selected
                </Badge>
              </div>

              {/* Audio List */}
              <div className="flex-1 overflow-y-auto space-y-2 sm:space-y-3 pr-1 sm:pr-2">
                {userAudios.map((audio) => {
                  const isSelected = selectedAudios.includes(audio._id || audio.id)
                  return (
                    <Card 
                      key={audio._id || audio.id} 
                      className={`cursor-pointer transition-all duration-200 ${
                        isSelected 
                          ? "border-primary bg-primary/5" 
                          : "border-gray-700 hover:border-gray-600"
                      }`}
                      onClick={() => handleAudioSelect(audio._id || audio.id, !isSelected)}
                    >
                      <CardContent className="p-3 sm:p-4">
                        <div className="flex items-start sm:items-center space-x-2 sm:space-x-3">
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={(checked) => 
                              handleAudioSelect(audio._id || audio.id, checked)
                            }
                            onClick={(e) => e.stopPropagation()}
                            className="mt-1 sm:mt-0"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1 sm:gap-2 mb-1">
                              <h3 className="font-medium text-white truncate text-sm sm:text-base">
                                {audio.name}
                              </h3>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-center text-xs text-gray-400 space-y-1 sm:space-y-0 sm:space-x-4">
                              <span>{format(new Date(audio.createdAt), "MMM dd, yyyy")}</span>
                              <span className="hidden sm:inline">•</span>
                              <span>{audio.category || "General"}</span>
                              <span className="hidden sm:inline">•</span>
                              <span className="truncate">{audio.voiceName || audio.voiceType || "Default Voice"}</span>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <div className="text-base sm:text-lg font-bold text-white">$22.50</div>
                            <div className="text-xs text-gray-400">CAD</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </>
          )}
        </div>

        {/* Footer with purchase button */}
        {userAudios.length > 0 && (
          <div className="border-t border-gray-700 pt-3 sm:pt-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 sm:mb-4 space-y-2 sm:space-y-0">
              <div>
                <p className="text-xs sm:text-sm text-gray-400">Total for {selectedAudios.length} audio(s)</p>
                <p className="text-xl sm:text-2xl font-bold text-white">
                  ${totalPrice.toFixed(2)} CAD
                </p>
              </div>
              <div className="text-left sm:text-right">
                <p className="text-xs sm:text-sm text-gray-400">Regular price: ${(selectedAudios.length * 45).toFixed(2)}</p>
                <p className="text-xs sm:text-sm text-green-400 font-medium">
                  You save: ${((selectedAudios.length * 45) - totalPrice).toFixed(2)}
                </p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="w-full sm:flex-1 text-gray-200 border-gray-600 hover:bg-gray-700 py-2 sm:py-3"
                disabled={purchasing}
              >
                Cancel
              </Button>
              <Button
                onClick={handlePurchaseSelected}
                disabled={selectedAudios.length === 0 || purchasing}
                className="w-full sm:flex-1 text-black font-semibold bg-gradient-to-r from-pink-200 to-pink-500 hover:from-pink-300 hover:to-pink-600 rounded-lg py-2 sm:py-3 transition-all duration-200"
              >
                {purchasing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Processing...
                  </>
                ) : (
                  `Purchase ${selectedAudios.length} Audio${selectedAudios.length !== 1 ? 's' : ''}`
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
