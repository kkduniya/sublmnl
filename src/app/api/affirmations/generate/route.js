import { NextResponse } from "next/server"
import { OpenAI } from "openai"

// Lightweight in-memory rate limiter per IP
const requestsByIp = new Map()
const WINDOW_MS = 5 * 60 * 1000 // 5 minutes
const MAX_REQUESTS = 20 // per window

export async function POST(request) {
  try {
    // Rate limit by IP
    const ipHeader = request.headers.get("x-forwarded-for") || "unknown"
    const clientIp = ipHeader.split(",")[0].trim()
    const now = Date.now()
    const entry = requestsByIp.get(clientIp) || { count: 0, reset: now + WINDOW_MS }
    if (now > entry.reset) {
      entry.count = 0
      entry.reset = now + WINDOW_MS
    }
    entry.count += 1
    requestsByIp.set(clientIp, entry)
    if (entry.count > MAX_REQUESTS) {
      return NextResponse.json({ success: false, message: "Rate limit exceeded. Try again later." }, { status: 429 })
    }

    // Parse request body
    const body = await request.json()
    const { category, goal } = body

    if (!category || !goal) {
      return NextResponse.json({ success: false, message: "Category and goal are required" }, { status: 400 })
    }

    // Try to generate affirmations using OpenAI if API key exists
    const openaiApiKey = process.env.OPENAI_API_KEY

    if (openaiApiKey && openaiApiKey.startsWith("sk-")) {
      try {
        const client = new OpenAI({ apiKey: openaiApiKey })
        const completion = await client.chat.completions.create({
          model: "gpt-4o-mini",
          temperature: 0.7,
          messages: [
            {
              role: "system",
              content:
                "You are an expert in creating powerful, effective affirmations that help people achieve goals.",
            },
            {
              role: "user",
              content: `Generate 6 powerful, positive affirmations for the category "${category}" based on this goal: "${goal}". Return ONLY a JSON array of strings, no extra text. Each item should be first-person present tense beginning with 'I'.`,
            },
          ],
        })

        const content = completion.choices[0]?.message?.content

        // Parse the response as JSON
        let affirmations
        try {
          affirmations = JSON.parse(content)
        } catch (e) {
          // If parsing fails, try to extract an array from the text
          const match = content.match(/\[[\s\S]*\]/)
          if (match) {
            affirmations = JSON.parse(match[0])
          } else {
            // Split by newlines and clean up as fallback
            affirmations = content
              .split("\n")
              .filter((line) => line.trim().startsWith('"') || line.trim().startsWith("I "))
              .map((line) =>
                line
                  .trim()
                  .replace(/^["']|["']$/g, "")
                  .replace(/^[0-9]+\.\s*/, ""),
              )
              .filter((line) => line.length > 0)
              .slice(0, 5)
          }
        }

        return NextResponse.json({ success: true, affirmations })
      } catch (error) {
        console.error("OpenAI API error:", error)
        // Fall through to use fallback affirmations
      }
    }

    // If OpenAI call failed or API key not available, use fallback affirmations
    console.log("Using fallback affirmations due to missing/invalid API key or API error")
    const fallbackAffirmations = getFallbackAffirmations(category)

    return NextResponse.json({
      success: true,
      affirmations: fallbackAffirmations,
      note: "Used fallback affirmations",
    })
  } catch (error) {
    console.error("Error generating affirmations:", error)
    return NextResponse.json({ success: false, message: "Failed to generate affirmations" }, { status: 500 })
  }
}

// Fallback affirmations if AI generation fails
function getFallbackAffirmations(category) {
  const affirmations = {
    career: [
      "I am confident and successful in my career",
      "I attract opportunities that align with my skills and passions",
      "I am worthy of success and recognition in my field",
      "Every day I am becoming more skilled and valuable in my work",
      "I easily overcome challenges and turn them into opportunities",
    ],
    relationships: [
      "I attract healthy and loving relationships into my life",
      "I am worthy of love and respect in all my relationships",
      "I communicate openly and honestly with those around me",
      "I release past relationship pain and welcome new connections",
      "My relationships are balanced, harmonious, and fulfilling",
    ],
    health: [
      "My body is healthy, strong, and full of energy",
      "I make choices that nourish my body and mind",
      "I am committed to my health and well-being",
      "My body heals quickly and efficiently",
      "I love and appreciate my body exactly as it is",
    ],
    wealth: [
      "Money flows to me easily and abundantly",
      "I am worthy of financial prosperity and success",
      "I make wise financial decisions that increase my wealth",
      "I release all limiting beliefs about money",
      "New opportunities for income are constantly coming to me",
    ],
    default: [
      "I am capable of achieving anything I set my mind to",
      "Every day, in every way, I am getting better and better",
      "I am confident, capable, and strong",
      "I attract positivity and success into my life",
      "I am worthy of all the good things life has to offer",
    ],
  }

  return affirmations[category] || affirmations.default
}

