import { NextResponse } from "next/server"
import { connectToDatabase } from "@/server/db"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { ObjectId } from "mongodb"
import { createAudio } from "@/server/models/audio"
import { findMusicTrackById } from "@/server/models/music"
import fs from "fs"
import path from "path"
import { spawn } from "child_process"

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const db = await connectToDatabase()
    const {
      affirmations,
      voiceType,
      voiceLanguage = "en-US",
      voicePitch,
      voiceSpeed,
      volume = 0.3, // Default to 30% volume
      musicTrackId,
      name,
    } = await request.json()

    // Validate inputs
    if (!affirmations || !Array.isArray(affirmations) || affirmations.length === 0) {
      return NextResponse.json({ success: false, message: "Affirmations are required" }, { status: 400 })
    }

    if (!musicTrackId) {
      return NextResponse.json({ success: false, message: "Music track is required" }, { status: 400 })
    }

    // Get music track details
    const musicTrack = await findMusicTrackById(new ObjectId(musicTrackId))
    if (!musicTrack) {
      return NextResponse.json({ success: false, message: "Music track not found" }, { status: 404 })
    }

    // Create unique directory for this audio
    const audioId = new ObjectId()
    const outputDir = path.join(process.cwd(), "public", "generated", audioId.toString())
    await fs.promises.mkdir(outputDir, { recursive: true })

    // Generate TTS for each affirmation using a TTS API
    const ttsFiles = []
    for (let i = 0; i < affirmations.length; i++) {
      const affirmation = affirmations[i]
      const ttsFilePath = path.join(outputDir, `affirmation_${i}.mp3`)

      // Use a TTS API (example with ElevenLabs - replace with your preferred service)
      await generateTTSWithAPI(affirmation, ttsFilePath, {
        voiceId: voiceType,
        language: voiceLanguage,
        pitch: Number.parseFloat(voicePitch) / 10,
        speed: Number.parseFloat(voiceSpeed) + 1.0,
      })

      ttsFiles.push(ttsFilePath)
    }

    // Combine all TTS files into one
    const combinedTtsPath = path.join(outputDir, "combined_affirmations.mp3")
    await runFFmpegCommand(["-i", `concat:${ttsFiles.join("|")}`, "-c", "copy", combinedTtsPath])

    // Speed up the combined TTS file
    const speedupTtsPath = path.join(outputDir, "speedup_affirmations.mp3")
    await runFFmpegCommand(["-i", combinedTtsPath, "-filter:a", "atempo=1.5", speedupTtsPath])

    // Adjust volume of the TTS file
    const volumeAdjustedTtsPath = path.join(outputDir, "volume_adjusted_affirmations.mp3")
    await runFFmpegCommand(["-i", speedupTtsPath, "-filter:a", `volume=${volume}`, volumeAdjustedTtsPath])

    // Get music track duration
    const musicDuration = await getAudioDuration(musicTrack.path)

    // Create a looped version of the affirmations to match music duration
    const loopedTtsPath = path.join(outputDir, "looped_affirmations.mp3")
    await runFFmpegCommand([
      "-stream_loop",
      "-1",
      "-i",
      volumeAdjustedTtsPath,
      "-c",
      "copy",
      "-t",
      musicDuration.toString(),
      loopedTtsPath,
    ])

    // Mix the looped TTS with the music track
    const finalOutputPath = path.join("public", "generated", audioId.toString(), "final_audio.mp3")
    await runFFmpegCommand([
      "-i",
      musicTrack.path,
      "-i",
      loopedTtsPath,
      "-filter_complex",
      "[0:a][1:a]amix=inputs=2:duration=longest",
      finalOutputPath,
    ])

    // Create audio record in database
    const audioData = {
      userId: new ObjectId(session.user.id),
      name: name || `${musicTrack.name} Affirmations`,
      affirmations,
      musicTrack: {
        id: musicTrack._id.toString(),
        name: musicTrack.name,
        path: musicTrack.path,
        duration: musicDuration,
      },
      voiceType,
      voiceLanguage,
      voicePitch: Number.parseFloat(voicePitch),
      voiceSpeed: Number.parseFloat(voiceSpeed),
      volume,
      audioUrl: `/generated/${audioId.toString()}/final_audio.mp3`,
    }

    await createAudio(audioData)

    return NextResponse.json({
      success: true,
      audio: {
        ...audioData,
        id: audioId.toString(),
      },
    })
  } catch (error) {
    console.error("Error creating audio:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to create subliminal audio",
        error: error.message,
      },
      { status: 500 },
    )
  }
}

// Function to generate TTS using a web API
async function generateTTSWithAPI(text, outputPath, options) {
  try {
    // Example using ElevenLabs API - replace with your preferred TTS API
    const response = await fetch("https://api.elevenlabs.io/v1/text-to-speech/" + options.voiceId, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": process.env.ELEVENLABS_API_KEY,
      },
      body: JSON.stringify({
        text: text,
        model_id: "eleven_monolingual_v1",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5,
          style: 0.0,
          use_speaker_boost: true,
          speaking_rate: options.speed,
        },
      }),
    })

    if (!response.ok) {
      throw new Error(`TTS API error: ${response.status} ${response.statusText}`)
    }

    // Get the audio data as an ArrayBuffer
    const audioBuffer = await response.arrayBuffer()

    // Write the audio data to the file
    await fs.promises.writeFile(outputPath, Buffer.from(audioBuffer))
  } catch (error) {
    console.error("Error generating TTS:", error)
    throw error
  }
}

// Function to run FFmpeg commands using spawn
function runFFmpegCommand(args) {
  return new Promise((resolve, reject) => {
    const ffmpeg = spawn("ffmpeg", args, { stdio: ["ignore", "pipe", "pipe"] })

    const stdoutChunks = []
    const stderrChunks = []

    ffmpeg.stdout.on("data", (data) => {
      stdoutChunks.push(data)
    })

    ffmpeg.stderr.on("data", (data) => {
      stderrChunks.push(data)
    })

    ffmpeg.on("close", (code) => {
      if (code === 0) {
        resolve(Buffer.concat(stdoutChunks).toString())
      } else {
        const errorOutput = Buffer.concat(stderrChunks).toString()
        reject(new Error(`FFmpeg exited with code ${code}: ${errorOutput}`))
      }
    })

    ffmpeg.on("error", (err) => {
      reject(new Error(`Failed to start FFmpeg process: ${err.message}`))
    })
  })
}

// Function to get audio duration using FFprobe
async function getAudioDuration(filePath) {
  try {
    const output = await runFFprobeCommand([
      "-v",
      "error",
      "-show_entries",
      "format=duration",
      "-of",
      "default=noprint_wrappers=1:nokey=1",
      filePath,
    ])
    return Number.parseFloat(output.trim())
  } catch (error) {
    console.error("Error getting audio duration:", error)
    throw error
  }
}

// Function to run FFprobe commands using spawn
function runFFprobeCommand(args) {
  return new Promise((resolve, reject) => {
    const ffprobe = spawn("ffprobe", args, { stdio: ["ignore", "pipe", "pipe"] })

    const stdoutChunks = []
    const stderrChunks = []

    ffprobe.stdout.on("data", (data) => {
      stdoutChunks.push(data)
    })

    ffprobe.stderr.on("data", (data) => {
      stderrChunks.push(data)
    })

    ffprobe.on("close", (code) => {
      if (code === 0) {
        resolve(Buffer.concat(stdoutChunks).toString())
      } else {
        const errorOutput = Buffer.concat(stderrChunks).toString()
        reject(new Error(`FFprobe exited with code ${code}: ${errorOutput}`))
      }
    })

    ffprobe.on("error", (err) => {
      reject(new Error(`Failed to start FFprobe process: ${err.message}`))
    })
  })
}

