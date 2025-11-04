import { GoogleGenAI } from "@google/genai";

// DON'T DELETE THIS COMMENT
// Follow these instructions when using this blueprint:
// - Note that the newest Gemini model series is "gemini-2.5-flash" or gemini-2.5-pro"
//   - do not change this unless explicitly requested by the user

// This API key is from Gemini Developer API Key, not vertex AI API Key
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function refineStatusText(text: string): Promise<string> {
  try {
    const systemPrompt = `You are a professional project status update writer. 
Your task is to refine and improve status updates for project standup meetings.
Make the text clear, concise, and professional while maintaining the original meaning.
Focus on:
- Clear structure (what was done, what's in progress, any blockers)
- Professional tone
- Action-oriented language
- Removing filler words and redundancy

Keep the refined text brief but informative. Do not add information that wasn't in the original text.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      config: {
        systemInstruction: systemPrompt,
      },
      contents: `Refine this status update:\n\n${text}`,
    });

    return response.text || text;
  } catch (error) {
    console.error("Failed to refine text with Gemini:", error);
    throw new Error("Failed to refine text");
  }
}
