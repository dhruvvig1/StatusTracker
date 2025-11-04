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

export async function generateNewsletter(projectsData: string): Promise<string> {
  try {
    const systemPrompt = `You are a professional newsletter writer for Visa's project management team.
Your task is to create a comprehensive monthly project status newsletter.

Format the newsletter with:
1. **Executive Summary**: Brief overview of all active projects and key highlights
2. **Project Updates**: For each project, provide:
   - Project name and type
   - Current status
   - Key accomplishments and progress from the last month
   - Notable updates or blockers
3. **Key Highlights**: Bullet points of major achievements across all projects
4. **Next Steps**: High-level action items and focus areas

Use a professional, informative tone. Keep it concise but comprehensive.
Format using clear headings, bullet points, and paragraphs for readability.
Make sure the content is suitable for executive-level stakeholders.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      config: {
        systemInstruction: systemPrompt,
      },
      contents: `Generate a monthly project status newsletter based on the following data:\n\n${projectsData}`,
    });

    return response.text || "Unable to generate newsletter at this time.";
  } catch (error) {
    console.error("Failed to generate newsletter with Gemini:", error);
    throw new Error("Failed to generate newsletter");
  }
}
