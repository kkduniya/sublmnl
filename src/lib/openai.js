import { OpenAI } from "openai"

// Initialize the OpenAI client with your API key
let openai = null

export const initializeOpenAI = () => {
  openai = new OpenAI({
    apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
    dangerouslyAllowBrowser: true, // Note: In production, it's better to call OpenAI API from the server
  })
  return openai
}

export const getOpenAIClient = () => {
  if (!openai) {
    throw new Error("OpenAI client not initialized. Call initializeOpenAI first.")
  }
  return openai
}

export const generateAffirmationsWithAI = async (category, goal, count = 6) => {
  try {
    const client = getOpenAIClient()

    const response = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "You are an expert in creating positive, empowering affirmations that help people achieve their goals.",
        },
        {
          role: "user",
          content: `Generate ${count} unique, powerful affirmations for the category "${category}" related to this goal: "${goal}". 
          Return ONLY the affirmations as a JSON array of strings, with no additional text or explanation.
          Each affirmation should be personal, present tense, positive, and specific.`,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    })

    const content = response.choices[0]?.message?.content
    if (!content) {
      throw new Error("No content returned from OpenAI")
    }

    try {
      const parsedResponse = JSON.parse(content)
      if (Array.isArray(parsedResponse.affirmations)) {
        return parsedResponse.affirmations
      } else {
        // If the response doesn't have an affirmations array, try to find any array in the response
        const firstArrayKey = Object.keys(parsedResponse).find(
          (key) => Array.isArray(parsedResponse[key]) && parsedResponse[key].every((item) => typeof item === "string"),
        )

        if (firstArrayKey) {
          return parsedResponse[firstArrayKey]
        }

        throw new Error("Invalid response format from OpenAI")
      }
    } catch (parseError) {
      console.error("Error parsing OpenAI response:", parseError)
      throw new Error("Failed to parse affirmations from AI response")
    }
  } catch (error) {
    console.error("Error generating affirmations with AI:", error)
    throw error
  }
}
