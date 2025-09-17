"use client"

import { useState } from "react"
import Link from "next/link"
import { useAuth } from "@/context/AuthContext"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle2 } from "lucide-react"

export default function AccountCreationPopup({ 
  open, 
  onOpenChange, 
  onAccountCreated,
  onClose 
}) {
  const [mode, setMode] = useState("login") // "login" | "register" | "forgot"
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const { login, register } = useAuth()
  const { toast } = useToast()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      if (mode === "login") {
        // login
        const result = await login(email, password)
        if (result.success) {
          toast({
            title: "Success!",
            description: "Welcome back! You can now listen to the full track.",
            variant: "success",
          })
          onAccountCreated()
        } else {
          setError(result.error || "Login failed")
        }
      } else if (mode === "register") {
        // registration
        if (!firstName.trim()) {
          setError("First name is required")
          setIsLoading(false)
          return
        }
        if (!email.trim()) {
          setError("Email is required")
          setIsLoading(false)
          return
        }
        if (!password.trim()) {
          setError("Password is required")
          setIsLoading(false)
          return
        }
        if (!acceptTerms) {
          setError("Please accept the terms and conditions")
          setIsLoading(false)
          return
        }

        const result = await register({ firstName, lastName, email, password })
        if (result.success) {
          setMode("login")
          toast({
            title: "Success!",
            description: "Account created successfully! Please login to continue.",
            variant: "success",
          })
        } else {
          setError(result.error || "Registration failed")
        }
      } else if (mode === "forgot") {
        // forgot password
        try {
          const response = await fetch("/api/auth/forgot-password", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
          })
          const data = await response.json()
          if (!response.ok) {
            throw new Error(data.error || "Failed to send reset email")
          }
          setSuccess(true)
        } catch (err) {
          setError(err.message)
        }
      }
    } catch (err) {
      setError(err.message || "Unexpected error")
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setError("")
    setEmail("")
    setPassword("")
    setFirstName("")
    setLastName("")
    setAcceptTerms(false)
    setSuccess(false)
    setMode("login")
    onClose()
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        onOpenChange(isOpen)
        if (!isOpen) handleClose()
      }}
    >
      <DialogContent className="w-[90vw] max-w-[450px] bg-gray-900 text-white border-gray-800">
        <DialogHeader>
          <div className="text-center">
            <DialogTitle>
              {mode === "login" && "Sign In"}
              {mode === "register" && "Create Account"}
              {mode === "forgot" && "Forgot Password"}
            </DialogTitle>
            <DialogDescription className="text-gray-400 my-2">
              {mode === "login" && "Sign in to access your subliminal audio tracks"}
              {mode === "register" && "Create an account to start your manifestation journey"}
              {mode === "forgot" && "Enter your email to reset your password"}
            </DialogDescription>
          </div>
        </DialogHeader>

        {error && (
          <div className="p-3 bg-red-900/30 border border-red-500 rounded-md text-red-200 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "register" && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="firstName" className="text-sm font-medium text-gray-300">First Name</Label>
                <Input
                  id="firstName"
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="mt-1 bg-gray-800 border-gray-700 text-white focus-visible:ring-1 focus-visible:ring-[#e4ffa8]"
                />
              </div>
              <div>
                <Label htmlFor="lastName" className="text-sm font-medium text-gray-300">Last Name</Label>
                <Input
                  id="lastName"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="mt-1 bg-gray-800 border-gray-700 text-white focus-visible:ring-1 focus-visible:ring-[#e4ffa8]"
                />
              </div>
            </div>
          )}

          {/* Email always visible */}
          <div>
            <Label htmlFor="email" className="text-sm font-medium text-gray-300">Email</Label>
            <Input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 bg-gray-800 border-gray-700 text-white focus-visible:ring-1 focus-visible:ring-[#e4ffa8]"
              placeholder="john@example.com"
            />
          </div>

          {mode !== "forgot" && (
            <div>
              <Label htmlFor="password" className="text-sm font-medium text-gray-300">Password</Label>
              <div className="relative mt-1">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 bg-gray-800 border-gray-700 text-white focus-visible:ring-1 focus-visible:ring-[#e4ffa8]"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-[#b1d239]/80"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M2 5.27L3.28 4L20 20.72L18.73 22l-3.08-3.08c-1.15.38-2.37.58-3.65.58c-5 0-9.27-3.11-11-7.5c.69-1.76 1.79-3.31 3.19-4.54zM12 9a3 3 0 0 1 3 3a3 3 0 0 1-.17 1L11 9.17A3 3 0 0 1 12 9m0-4.5c5 0 9.27 3.11 11 7.5a11.8 11.8 0 0 1-4 5.19l-1.42-1.43A9.86 9.86 0 0 0 20.82 12A9.82 9.82 0 0 0 12 6.5c-1.09 0-2.16.18-3.16.5L7.3 5.47c1.44-.62 3.03-.97 4.7-.97M3.18 12A9.82 9.82 0 0 0 12 17.5c.69 0 1.37-.07 2-.21L11.72 15A3.064 3.064 0 0 1 9 12.28L5.6 8.87c-.99.85-1.82 1.91-2.42 3.13"/></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M12 9a3 3 0 0 1 3 3a3 3 0 0 1-3 3a3 3 0 0 1-3-3a3 3 0 0 1 3-3m0-4.5c5 0 9.27 3.11 11 7.5c-1.73 4.39-6 7.5-11 7.5S2.73 16.39 1 12c1.73-4.39 6-7.5 11-7.5M3.18 12a9.821 9.821 0 0 0 17.64 0a9.821 9.821 0 0 0-17.64 0"/></svg>
                  )}
                </button>
              </div>
            </div>
          )}

          {mode === "login" && (
            <div
              className="flex items-center justify-end cursor-pointer"
              onClick={() => setMode("forgot")}
            >
              <span className="text-sm text-[#b1d239]/80 hover:underline">Forgot password?</span>
            </div>
          )}

          {mode === "register" && (
            <div className="flex items-center space-x-2">
              <Checkbox
                id="acceptTerms"
                checked={acceptTerms}
                onCheckedChange={setAcceptTerms}
                className="border-[#b1d239]/80 data-[state=checked]:bg-[#b1d239]/80 data-[state=checked]:text-black"
              />
              <Label htmlFor="acceptTerms" className="text-sm text-gray-300">
                I accept the{" "}
                <Link href="/terms" target="_blank" className="text-[#b1d239]/80 hover:text-[#b1d239] transition-colors duration-200">
                  Terms and Conditions
                </Link>
              </Label>
            </div>
          )}

          {/* Success for forgot password */}
          {mode === "forgot" && success && (
            <div className="flex flex-col items-center justify-center gap-4 py-4">
              <CheckCircle2 className="h-12 w-12 text-green-500" />
              <p className="text-center text-gray-300">
                We’ve sent a password reset link to {email}. Please check your inbox.
              </p>
            </div>
          )}

          <div className="flex flex-col space-y-2">
            {/* Show main action only if not success */}
            {(!success || mode !== "forgot") && (
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-[#e4ffa8] to-[#b1d239] text-black font-semibold"
              >
                {isLoading
                  ? (mode === "login" ? "Signing In..." : mode === "register" ? "Creating Account..." : "Sending Reset Link...")
                  : (mode === "login" ? "Sign In" : mode === "register" ? "Create Account" : "Send Reset Link")}
              </Button>
            )}

            {/* Login/Register switcher */}
            {mode !== "forgot" && (
              <Button
                type="button"
                variant="ghost"
                onClick={() => setMode(mode === "login" ? "register" : "login")}
                className="text-gray-400 hover:text-white hover:bg-white/10"
              >
                {mode === "login"
                  ? "Don't have an account? Sign up"
                  : "Already have an account? Sign in"}
              </Button>
            )}

            {/* Always show Back to Login when in forgot mode */}
            {mode === "forgot" && (
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setSuccess(false) // reset state
                  setMode("login")
                }}
                className="text-gray-400 hover:text-white hover:bg-white/10"
              >
                Back to Login
              </Button>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
