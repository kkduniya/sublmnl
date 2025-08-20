"use client"

import { useState } from "react"
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
import { X } from "lucide-react"

export default function AccountCreationPopup({ 
  open, 
  onOpenChange, 
  onAccountCreated,
  onClose 
}) {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  
  const { login, register } = useAuth()
  const { toast } = useToast()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      if (isLogin) {
        // Handle login
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
      } else {
        // Handle registration
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

        if (!isLogin && !acceptTerms) {
          setError("Please accept the terms and conditions")
          setIsLoading(false)
          return
        }

        const result = await register({
          firstName,
          lastName,
          email,
          password,
        })
       
        if (result.success) {
          // Switch to login mode with success message
          setIsLogin(true)
          setError("")
          toast({
            title: "Success!",
            description: "Account created successfully! Please login to continue.",
            variant: "success",
          })
        } else {
          setError(result.error || "Registration failed")
        }
      }
    } catch (error) {
      setError(error.message || "An unexpected error occurred")
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
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
                          onOpenChange(isOpen)
                          if (!isOpen) {
                            handleClose()
                          }
                        }}>
      <DialogContent className="w-[90vw] max-w-[450px] bg-gray-900 text-white border-gray-800">
        <DialogHeader>
          <div className="flex justify-center items-start">
            <div className="text-center">
              <DialogTitle>{isLogin ? "Sign In" : "Create Account"}</DialogTitle>
              <DialogDescription className="text-gray-400 my-2">
              {isLogin ? "Sign in to access your subliminal audio tracks" : "Create an account to start your manifestation journey"}
              </DialogDescription>
            </div>
            {/* <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="text-gray-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </Button> */}
          </div>
        </DialogHeader>
        
        {error && (
          <div className="p-3 bg-red-900/30 border border-red-500 rounded-md text-red-200 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="firstName" className="text-sm font-medium text-gray-300">
                  First Name
                </Label>
                <Input
                  id="firstName"
                  name="firstName"
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="mt-1 bg-gray-800 border-gray-700 text-white focus-visible:ring-1 ring-offset-2 focus-visible:ring-[#e4ffa8]"
                  placeholder="John"
                />
              </div>
              <div>
                <Label htmlFor="lastName" className="text-sm font-medium text-gray-300">
                  Last Name
                </Label>
                <Input
                  id="lastName"
                  name="lastName"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="mt-1 bg-gray-800 border-gray-700 text-white focus-visible:ring-1 ring-offset-2 focus-visible:ring-[#e4ffa8]"
                  placeholder="Doe"
                />
              </div>
            </div>
          )}

          <div>
            <Label htmlFor="email" className="text-sm font-medium text-gray-300">
              Email
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 bg-gray-800 border-gray-700 text-white focus-visible:ring-1 ring-offset-2 focus-visible:ring-[#e4ffa8]"
              placeholder="john@example.com"
            />
          </div>

          <div>
            <Label htmlFor="password" className="text-sm font-medium text-gray-300">
              Password
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 bg-gray-800 border-gray-700 text-white focus-visible:ring-1 ring-offset-2 focus-visible:ring-[#e4ffa8]"
              placeholder="••••••••"
            />
          </div>

          {!isLogin && (
            <div className="flex items-center space-x-2">
              <Checkbox
                id="acceptTerms"
                checked={acceptTerms}
                onCheckedChange={setAcceptTerms}
                 className="border-[#b1d239]/80 data-[state=checked]:bg-[#b1d239]/80 data-[state=checked]:text-black"
              />
              <Label htmlFor="acceptTerms" className="text-sm text-gray-300">
                I accept the terms and conditions
              </Label>
            </div>
          )}

          <div className="flex flex-col space-y-2 pt-4">
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-[#e4ffa8] to-[#b1d239] text-black font-semibold"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin h-4 w-4 border-2 border-black border-t-transparent rounded-full mr-2"></div>
                  {isLogin ? "Signing In..." : "Creating Account..."}
                </div>
              ) : (
                isLogin ? "Sign In" : "Create Account"
              )}
            </Button>
            
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsLogin(!isLogin)}
              className="text-gray-400 hover:text-white hover:bg-white/10"
            >
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
