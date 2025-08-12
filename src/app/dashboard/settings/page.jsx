"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/context/AuthContext"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function SettingsPage() {
  const { user, updateProfile } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [audioSettings, setAudioSettings] = useState({
    affirmationsVolume: 0.2,
    repetitionInterval: 10,
    musicVolume: 1.0,
    speed: 1,
  })
  const [isProfileLoading, setIsProfileLoading] = useState(false)
  const [isPasswordLoading, setIsPasswordLoading] = useState(false)
  const [isAudioSettingsLoading, setIsAudioSettingsLoading] = useState(false)
  const [message, setMessage] = useState({ type: "", text: "" })
  const [userProfile , setUserProfile] = useState({})

  const isAdmin = user?.role === "admin"

  // Update form data when user data changes
  useEffect(() => {
    if (user) {
      // setFormData((prev) => ({
      //   ...prev,
      //   firstName: user.firstName || "",
      //   lastName: user.lastName || "",
      //   email: user.email || "",
      // }))
      fetchUserProfile()
    }

    // Fetch user audio settings
    fetchAudioSettings()
  }, [user])

  const fetchUserProfile = async () => {
  try {

    const response = await fetch("/api/user/profile", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${user?.id}`,
      },
    })

    const data = await response.json()
    setUserProfile(data?.user)
    setFormData((prev) => ({
        ...prev,
        firstName: data?.user?.firstName || "",
        lastName: data?.user?.lastName || "",
        email: data?.user?.email || "",
      }))
    

    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch user profile")
    }

  } catch (error) {
    console.error("Error fetching user profile:", error.message)
    return null
  }
}


  const fetchAudioSettings = async () => {
    try {
      const response = await fetch("/api/user/settings/audio")
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.settings) {
          setAudioSettings(data.settings)
        }
      }
    } catch (error) {
      console.error("Error fetching audio settings:", error)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleAudioSettingChange = (name, value) => {
    setAudioSettings((prev) => ({ ...prev, [name]: value }))
  }

  // Update the handleProfileUpdate function to use the context's updateProfile
  const handleProfileUpdate = async (e) => {
    e.preventDefault()
    setIsProfileLoading(true)
    setMessage({ type: "", text: "" })

    try {
      // Add await here - this was missing
      const result = await updateProfile({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
      })

      if (result.success) {
        setMessage({ type: "success", text: "Profile updated successfully" })
        toast({
          title: "Success",
          description: "Profile updated successfully",
          variant: "default",
        })
      } else {
        throw new Error(result.error || "Failed to update profile")
      }
    } catch (error) {
      console.error("Profile update error:", error)
      setMessage({ type: "error", text: `An error occurred: ${error.message}` })
      toast({
        title: "Error",
        description: `An error occurred: ${error.message}`,
        variant: "destructive",
      })
    } finally {
      setIsProfileLoading(false)
    }
  }

  // Update the handlePasswordUpdate function
 const handlePasswordUpdate = async (e) => {
  e.preventDefault();

  if (formData.newPassword !== formData.confirmPassword) {
    setMessage({ type: "error", text: "New passwords do not match" });
    toast({
      title: "Error",
      description: "New passwords do not match",
      variant: "destructive",
    });
    return;
  }

  setIsPasswordLoading(true);
  setMessage({ type: "", text: "" });

  try {
    const response = await fetch("/api/user/password", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user?.id}`,
      },
      body: JSON.stringify({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to update password");
    }

    setMessage({ type: "success", text: data.message });
    toast({
      title: "Success",
      description: data.message,
      variant: "default",
    });

    setFormData((prev) => ({
      ...prev,
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    }));
  } catch (error) {
    console.error("Password update error:", error);
    setMessage({ type: "error", text: `An error occurred: ${error.message}` });
    toast({
      title: "Error",
      description: `An error occurred: ${error.message}`,
      variant: "destructive",
    });
  } finally {
    setIsPasswordLoading(false);
  }
};

  // Handle audio settings update
  const handleAudioSettingsUpdate = async (e) => {
    e.preventDefault()
    setIsAudioSettingsLoading(true)
    setMessage({ type: "", text: "" })

    try {
      const response = await fetch("/api/user/settings/audio", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(audioSettings),
      })

      const data = await response.json()

      if (data.success) {
        setMessage({ type: "success", text: "Audio settings updated successfully" })
        toast({
          title: "Success",
          description: "Audio settings updated successfully",
          variant: "default",
        })

        // Update localStorage for immediate effect
        localStorage.setItem("musicVolume", audioSettings.musicVolume.toString())
        localStorage.setItem("affirmationsVolume", audioSettings.affirmationsVolume.toString())
        localStorage.setItem("repetitionInterval", audioSettings.repetitionInterval.toString())
        localStorage.setItem("speed", audioSettings.speed.toString())

      } else {
        throw new Error(data.message || "Failed to update audio settings")
      }
    } catch (error) {
      console.error("Audio settings update error:", error)
      setMessage({ type: "error", text: `An error occurred: ${error.message}` })
      toast({
        title: "Error",
        description: `An error occurred: ${error.message}`,
        variant: "destructive",
      })
    } finally {
      setIsAudioSettingsLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Account Settings</h1>

      {message.text && (
        <div
          className={`p-4 mb-6 rounded-md ${message.type === "success"
              ? "bg-green-900/30 border border-green-500 text-green-200"
              : "bg-red-900/30 border border-red-500 text-red-200"
            }`}
        >
          {message.text}
        </div>
      )}

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="mb-6 bg-gray-800/50 p-1 rounded-lg">
          <TabsTrigger value="profile" className="rounded-md data-[state=active]:bg-gray-700">
            Profile
          </TabsTrigger>
          <TabsTrigger value="security" className="rounded-md data-[state=active]:bg-gray-700">
            Security
          </TabsTrigger>
          {
            isAdmin &&
            <TabsTrigger value="audio" className="rounded-md data-[state=active]:bg-gray-700">
              Audio Settings
            </TabsTrigger>
          }
        </TabsList>

        <TabsContent value="profile">
          <div className="glass-card p-6">
            <h2 className="text-xl font-semibold mb-4">Profile Information</h2>
            <form onSubmit={handleProfileUpdate}>
              <div className="mb-4">
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-300 mb-2">
                  First Name
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>

              <div className="mb-4">
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-300 mb-2">
                  Last Name
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>

              <div className="mb-6">
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>

              <button
                type="submit"
                className="bg-secondary rounded-md text-sm py-3 px-3 hover:bg-accent"
                disabled={isProfileLoading}
              >
                {isProfileLoading ? "Updating..." : "Update Profile"}
              </button>
            </form>
          </div>
        </TabsContent>

        <TabsContent value="security">
          <div className="glass-card p-6">
            <h2 className="text-xl font-semibold mb-4">Change Password</h2>
            <form onSubmit={handlePasswordUpdate}>
              <div className="mb-4">
                <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-300 mb-2">
                  Current Password
                </label>
                <input
                  id="currentPassword"
                  name="currentPassword"
                  type="password"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  className="input-field"
                  required
                />
              </div>

              <div className="mb-4">
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-300 mb-2">
                  New Password
                </label>
                <input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  value={formData.newPassword}
                  onChange={handleChange}
                  className="input-field"
                  required
                />
              </div>

              <div className="mb-6">
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                  Confirm New Password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="input-field"
                  required
                />
              </div>

              <button
                type="submit"
                className="bg-secondary rounded-md py-3 text-sm px-3 hover:bg-accent"
                disabled={isPasswordLoading}
              >
                {isPasswordLoading ? "Updating..." : "Change Password"}
              </button>
            </form>
          </div>
        </TabsContent>

        {
          isAdmin &&
          <TabsContent value="audio">
            <div className="glass-card p-6">
              <h2 className="text-xl font-semibold mb-4">Audio Playback Settings</h2>
              <form onSubmit={handleAudioSettingsUpdate}>
                {/* <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <label htmlFor="musicVolume" className="block text-sm font-medium text-gray-300">
                    Music Volume
                  </label>
                  <span className="text-sm text-gray-400">{Math.round(audioSettings.musicVolume * 100)}%</span>
                </div>
                <Slider
                  id="musicVolume"
                  value={[audioSettings.musicVolume]}
                  min={0}
                  max={1}
                  step={0.01}
                  onValueChange={(value) => handleAudioSettingChange("musicVolume", value[0])}
                  className="w-full"
                />
                <p className="text-xs text-gray-500 mt-1">Control the volume of background music tracks.</p>
              </div> */}

                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <label htmlFor="affirmationsVolume" className="block text-sm font-medium text-gray-300">
                      Affirmations Volume
                    </label>
                    <span className="text-sm text-gray-400">{Math.round(audioSettings.affirmationsVolume * 100)}%</span>
                  </div>
                  <Slider
                    id="affirmationsVolume"
                    value={[audioSettings.affirmationsVolume]}
                    min={0}
                    max={1}
                    step={0.01}
                    onValueChange={(value) => handleAudioSettingChange("affirmationsVolume", value[0])}
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500 mt-1">Control the volume of Sublmnl affirmation voice.</p>
                </div>

                <div className="mb-6">
                  <label htmlFor="repetitionInterval" className="block text-sm font-medium text-gray-300 mb-2">
                    Repetition Interval (seconds)
                  </label>
                  <input
                    id="repetitionInterval"
                    name="repetitionInterval"
                    type="number"
                    min="1"
                    max="60"
                    value={audioSettings.repetitionInterval}
                    onChange={(e) => handleAudioSettingChange("repetitionInterval", Number.parseInt(e.target.value))}
                    className="input-field"
                  />
                  <p className="text-xs text-gray-500 mt-1">How often affirmations should repeat (in seconds).</p>
                </div>

                <div className="mb-6">
                  <label htmlFor="speed" className="block text-sm font-medium text-gray-300 mb-2">
                    Affirmation Speed
                  </label>
                  <select
                    id="speed"
                    name="speed"
                    value={audioSettings.speed}
                    onChange={(e) => handleAudioSettingChange("speed", Number(e.target.value))}
                    className="input-field"
                  >
                    <option value={1}>1x</option>
                    <option value={2}>2x</option>
                    <option value={3}>3x</option>
                    <option value={4}>4x</option>
                    <option value={5}>5x</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">Control the playback speed of affirmations.</p>
              </div>

                <button
                  type="submit"
                  className="bg-secondary rounded-md text-sm py-3 px-3 hover:bg-accent"
                  disabled={isAudioSettingsLoading}
                >
                  {isAudioSettingsLoading ? "Updating..." : "Save Audio Settings"}
                </button>
              </form>
            </div>
          </TabsContent>
        }
      </Tabs>
    </div>
  )
}

