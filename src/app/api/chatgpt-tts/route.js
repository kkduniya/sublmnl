// app/api/chatgpt-tts/route.js
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// UI → API mapping
const CHATGPT_VOICE_MAP = {
  breeze: "alloy",
  cove: "echo",
  ember: "fable",
  juniper: "onyx",
  arbor: "nova",
  maple: "shimmer",
  sol: "coral",
  spruce: "verse",
  vale: "ballad",
};

export async function POST(req) {
  try {
    const { text, voice } = await req.json();

    if (!text || !voice) {
      return new Response(JSON.stringify({ error: "Missing text or voice" }), { status: 400 });
    }

    // Map UI name → API name
    const apiVoice = CHATGPT_VOICE_MAP[voice] || voice;

    const response = await openai.audio.speech.create({
      model: "gpt-4o-mini-tts",
      voice: apiVoice,
      input: text,
    });

    const buffer = Buffer.from(await response.arrayBuffer());
    return new Response(buffer, {
      headers: { "Content-Type": "audio/mpeg" },
    });
  } catch (err) {
    console.error("ChatGPT TTS API error:", err);
    return new Response(JSON.stringify({ error: "TTS failed", details: err.message }), {
      status: 500,
    });
  }
}
