
import { GoogleGenAI, Type } from "@google/genai";
import { SYMPTOMS } from "./data";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface ChatResponse {
  message: string;
  detectedSymptoms: string[]; // IDs of symptoms
  detectedAge?: number;
  detectedGender?: string;
}

export async function processChatMessage(
  history: ChatMessage[],
  userInput: string,
  currentSymptoms: string[]
): Promise<ChatResponse> {
  const symptomList = SYMPTOMS.map(s => `${s.label} (id: ${s.id})`).join(', ');
  
  const systemInstruction = `
    You are a helpful medical intake assistant for an educational app. 
    Your goal is to help the user identify their symptoms from a specific list.
    
    Available Symptoms: [${symptomList}]
    
    Current selected symptoms: [${currentSymptoms.join(', ')}]
    
    Guidelines:
    1. Be professional, empathetic, and concise.
    2. If the user describes a symptom that matches one in the list, acknowledge it and add it to the detectedSymptoms array.
    3. If the user mentions age or gender, extract them.
    4. Ask clarifying questions if the user is vague.
    5. Remind the user this is an educational tool, not real medical advice, if they seem distressed.
    6. ALWAYS return a JSON response.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        { role: 'user', parts: [{ text: `System Instruction: ${systemInstruction}` }] },
        ...history.map(m => ({ role: m.role, parts: [{ text: m.text }] })),
        { role: 'user', parts: [{ text: userInput }] }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            message: { type: Type.STRING, description: "Your conversational response to the user." },
            detectedSymptoms: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "List of symptom IDs detected in the user's input that match the available list."
            },
            detectedAge: { type: Type.NUMBER, description: "Age if mentioned by the user." },
            detectedGender: { type: Type.STRING, description: "Gender if mentioned by the user." }
          },
          required: ["message", "detectedSymptoms"]
        }
      }
    });

    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Chat error:", error);
    return {
      message: "I'm sorry, I'm having trouble processing that. Could you try describing your symptoms again?",
      detectedSymptoms: []
    };
  }
}
