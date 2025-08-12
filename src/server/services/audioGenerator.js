import fs from "fs"
import path from "path"
import { spawn } from "child_process"
import fetch from "node-fetch"
import { v4 as uuidv4 } from "uuid"
import os from "os"

/**
 * Generates audio with embedded affirmations
 * @param {Object} options - The options for audio generation
 * @param {string} options.musicTrackUrl - URL of the music track
 * @param {Array<string>} options.affirmations - List of affirmations to embed
 * @param {Object} options.voiceSettings - Voice settings
 * @param {string} options.voiceSettings.voice - Voice type
 * @param {number} options.voiceSettings.volume - Volume level (0-1)
 * @param {number} options.voiceSettings.repetitionInterval - Interval between affirmations in seconds
 * @param {string} options.outputPath - Path to save the output file
 */
export async function generateAudio({ musicTrackUrl, affirmations, voiceSettings, outputPath }) {
  try {
    // Create a temporary directory for processing
    const tempDir = path.join(os.tmpdir(), "sublmnl-" + uuidv4())
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true })
    }

    // Download the music track
    const musicPath = path.join(tempDir, "music.mp3")
    await downloadFile(musicTrackUrl, musicPath)

    // Generate audio files for each affirmation
    const affirmationPaths = []
    for (let i = 0; i < affirmations.length; i++) {
      const affirmationPath = path.join(tempDir, `affirmation-${i}.mp3`)
      await generateSpeech(affirmations[i], affirmationPath, voiceSettings.voice)
      affirmationPaths.push(affirmationPath)
    }

    // Combine the music and affirmations
    await combineAudioFiles({
      musicPath,
      affirmationPaths,
      outputPath,
      voiceSettings,
    })

    // Clean up temporary files
    cleanupTempFiles(tempDir)

    return outputPath
  } catch (error) {
    console.error("Error in audio generation:", error)
    throw new Error(`Failed to generate audio: ${error.message}`)
  }
}

/**
 * Downloads a file from a URL
 */
async function downloadFile(url, outputPath) {
  // Handle local file paths (for development)
  if (url.startsWith("/")) {
    const localPath = path.join(process.cwd(), "public", url)
    fs.copyFileSync(localPath, outputPath)
    return
  }

  // Download from URL
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to download file: ${response.statusText}`)
  }

  const fileStream = fs.createWriteStream(outputPath)
  await new Promise((resolve, reject) => {
    response.body.pipe(fileStream)
    response.body.on("error", reject)
    fileStream.on("finish", resolve)
  })
}

/**
 * Generates speech from text using browser's speech synthesis
 */
async function generateSpeech(text, outputPath, voiceType) {
  // For server-side, we'll use a simple text-to-speech API or library
  // This is a simplified implementation - in production, you'd use a proper TTS service

  // For this example, we'll use a mock implementation
  return new Promise((resolve, reject) => {
    try {
      // In a real implementation, you would call a TTS service here
      // For now, we'll create a silent audio file as a placeholder
      const ffmpeg = spawn("ffmpeg", [
        "-f",
        "lavfi",
        "-i",
        "anullsrc=r=44100:cl=mono",
        "-t",
        "3",
        "-q:a",
        "0",
        "-acodec",
        "libmp3lame",
        outputPath,
      ])

      ffmpeg.on("close", (code) => {
        if (code === 0) {
          resolve(outputPath)
        } else {
          reject(new Error(`FFmpeg process exited with code ${code}`))
        }
      })

      ffmpeg.stderr.on("data", (data) => {
        console.log(`FFmpeg stderr: ${data}`)
      })
    } catch (error) {
      reject(error)
    }
  })
}

/**
 * Combines music and affirmation audio files
 */
async function combineAudioFiles({ musicPath, affirmationPaths, outputPath, voiceSettings }) {
  return new Promise((resolve, reject) => {
    try {
      // In a real implementation, you would use FFmpeg to mix the audio files
      // For this example, we'll just copy the music file as a placeholder
      fs.copyFileSync(musicPath, outputPath)
      resolve(outputPath)
    } catch (error) {
      reject(error)
    }
  })
}

/**
 * Cleans up temporary files
 */
function cleanupTempFiles(tempDir) {
  try {
    if (fs.existsSync(tempDir)) {
      const files = fs.readdirSync(tempDir)
      for (const file of files) {
        fs.unlinkSync(path.join(tempDir, file))
      }
      fs.rmdirSync(tempDir)
    }
  } catch (error) {
    console.error("Error cleaning up temporary files:", error)
  }
}

