import { GoogleGenAI } from "@google/genai";

// DON'T DELETE THIS COMMENT
// Follow these instructions when using this blueprint:
// - Note that the newest Gemini model series is "gemini-2.5-flash" or gemini-2.5-pro"
//   - do not change this unless explicitly requested by the user

// This API key is from Gemini Developer API Key, not vertex AI API Key
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function refineStatusText(text: string): Promise<string> {
  try {
    const systemPrompt = `Fix spelling and grammar errors in the user's text. Reword unclear sentences to be clearer. 
Do not add any new information, ideas, or structure. 
Do not make it more professional or formal. 
Just fix what the user wrote and make it readable.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      config: {
        systemInstruction: systemPrompt,
      },
      contents: text,
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
