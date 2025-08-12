"use client"

import { useRef, useEffect } from "react"

export default function AudioVisualizer({ audioElement, isPlaying, themeColor, themeSecColor }) {
  const canvasRef = useRef(null)
  const animationRef = useRef(null)
  const analyserRef = useRef(null)
  const audioContextRef = useRef(null)
  const sourceRef = useRef(null)

  useEffect(() => {
    if (!audioElement) return

    // Initialize audio context and analyzer
    const initializeAudioContext = () => {
      if (!audioContextRef.current) {
        const AudioContext = window.AudioContext || window.webkitAudioContext
        audioContextRef.current = new AudioContext()
        analyserRef.current = audioContextRef.current.createAnalyser()
        analyserRef.current.fftSize = 256

        // Connect the audio element to the analyzer
        sourceRef.current = audioContextRef.current.createMediaElementSource(audioElement)
        sourceRef.current.connect(analyserRef.current)
        analyserRef.current.connect(audioContextRef.current.destination)
      }
    }

    // Only initialize if we have an audio element
    if (audioElement) {
      try {
        initializeAudioContext()
      } catch (error) {
        console.error("Error initializing audio context:", error)
      }
    }

    return () => {
      // Clean up animation frame
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }

      // Clean up audio context
      if (audioContextRef.current && audioContextRef.current.state !== "closed") {
        // Just disconnect, don't close (as it would make the audio element unusable)
        if (sourceRef.current) {
          sourceRef.current.disconnect()
        }
      }
    }
  }, [audioElement])

  // Draw visualization when playing state changes
  useEffect(() => {
    if (!canvasRef.current || !analyserRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    const analyser = analyserRef.current

    // Set canvas dimensions
    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio
      canvas.height = canvas.offsetHeight * window.devicePixelRatio
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
    }

    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    // Create gradient for the bars
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height / window.devicePixelRatio)
    gradient.addColorStop(0, themeColor || "#4169E1")
    gradient.addColorStop(1, themeSecColor || "#87CEEB")

    const bufferLength = analyser.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)

    const draw = () => {
      if (!isPlaying) {
        return;
        // Draw idle state (subtle waves)
        ctx.clearRect(0, 0, canvas.width, canvas.height)

        const centerY = canvas.height / (2 * window.devicePixelRatio)
        const amplitude = 5
        const frequency = 0.05

        ctx.beginPath()
        ctx.moveTo(0, centerY)

        for (let x = 0; x < canvas.width / window.devicePixelRatio; x++) {
          const y = centerY + Math.sin(x * frequency) * amplitude
          ctx.lineTo(x, y)
        }

        ctx.strokeStyle = gradient
        ctx.lineWidth = 2
        ctx.stroke()

        animationRef.current = requestAnimationFrame(draw)
        return
      }

      animationRef.current = requestAnimationFrame(draw)
      analyser.getByteFrequencyData(dataArray)
 
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const barWidth = (canvas.width / window.devicePixelRatio / bufferLength) * 2.5
      let x = 0

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * (canvas.height / window.devicePixelRatio) * 0.7

        ctx.fillStyle = gradient
        ctx.fillRect(x, canvas.height / window.devicePixelRatio - barHeight, barWidth - 1, barHeight)

        x += barWidth
      }
    }

    draw()

    return () => {
      cancelAnimationFrame(animationRef.current)
      window.removeEventListener("resize", resizeCanvas)
    }
  }, [isPlaying, themeColor, themeSecColor])

  return (
    <div className="w-full h-full min-h-[120px] flex items-center justify-center">
      <canvas ref={canvasRef} className="w-full h-full" style={{ display: "block" }} />
    </div>
  )
}

