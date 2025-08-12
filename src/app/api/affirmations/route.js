import { NextResponse } from "next/server"

export async function POST(request) {
  try {
    const { category, goal, customOnly, customAffirmations } = await request.json()

    // In a real app, you would use OpenAI API to generate affirmations
    // For demo purposes, we'll return mock affirmations

    let affirmations = []

    if (customOnly && customAffirmations && customAffirmations.length > 0) {
      affirmations = customAffirmations
    } else {
      // Mock AI-generated affirmations based on category
      switch (category) {
        case "career":
          affirmations = [
            "I am confident and successful in my career",
            "I attract opportunities that align with my skills and passions",
            "I am worthy of success and recognition in my field",
            "Every day I am becoming more skilled and valuable in my work",
            "I easily overcome challenges and turn them into opportunities",
          ]
          break
        case "relationships":
          affirmations = [
            "I attract healthy and loving relationships into my life",
            "I am worthy of love and respect in all my relationships",
            "I communicate openly and honestly with those around me",
            "I release past relationship pain and welcome new connections",
            "My relationships are balanced, harmonious, and fulfilling",
          ]
          break
        case "health":
          affirmations = [
            "My body is healthy, strong, and full of energy",
            "I make choices that nourish my body and mind",
            "I am committed to my health and well-being",
            "My body heals quickly and efficiently",
            "I love and appreciate my body exactly as it is",
          ]
          break
        case "wealth":
          affirmations = [
            "Money flows to me easily and abundantly",
            "I am worthy of financial prosperity and success",
            "I make wise financial decisions that increase my wealth",
            "I release all limiting beliefs about money",
            "New opportunities for income are constantly coming to me",
          ]
          break
        default:
          affirmations = [
            "I am capable of achieving anything I set my mind to",
            "Every day, in every way, I am getting better and better",
            "I am confident, capable, and strong",
            "I attract positivity and success into my life",
            "I am worthy of all the good things life has to offer",
          ]
      }
    }

    return NextResponse.json({
      success: true,
      affirmations,
    })
  } catch (error) {
    console.error("Error generating affirmations:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to generate affirmations",
      },
      { status: 500 },
    )
  }
}

