import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function POST(request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    // Parse request body
    const body = await request.json()
    const { category, goal } = body

    if (!category || !goal) {
      return NextResponse.json({ success: false, message: "Category and goal are required" }, { status: 400 })
    }

    // Try to generate affirmations using OpenAI if API key exists
    const openaiApiKey = process.env.NEXT_OPENAI_API_KEY

    if (openaiApiKey && openaiApiKey.startsWith("sk-")) {
      try {
        // Attempt to call OpenAI API
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${openaiApiKey}`,
          },
          body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [
              {
                role: "system",
                content:
                  "You are an expert in creating powerful, effective affirmations that help people achieve their goals.",
              },
              {
                role: "user",
                content: `Generate 5 powerful, positive affirmations for the category "${category}" based on this goal: "${goal}". 
                Each affirmation should be in the present tense, be positive, personal (using "I"), and specific.
                Format the response as a JSON array of strings, with no additional text.`,
              },
            ],
            temperature: 0.7,
          }),
        })

        if (!response.ok) {
          throw new Error(`OpenAI API error: ${response.status}`)
        }

        const data = await response.json()
        const content = data.choices[0]?.message?.content

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

        return NextResponse.json({
          success: true,
          affirmations: affirmations,
        })
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

