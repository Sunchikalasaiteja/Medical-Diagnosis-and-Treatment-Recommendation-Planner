
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface TreatmentPlan {
  precautions: string[];
  medications: string[];
  lifestyleAdvice: string[];
}

export async function generateTreatmentPlan(diseaseName: string, symptoms: string[], age: number, gender?: string): Promise<TreatmentPlan> {
  const prompt = `
    Generate a structured treatment plan for a patient with the following details:
    Predicted Disease: ${diseaseName}
    Symptoms: ${symptoms.join(', ')}
    Age: ${age}
    Gender: ${gender || 'Not specified'}

    Provide the plan in JSON format with the following structure:
    {
      "precautions": ["list of basic precautions"],
      "medications": ["list of suggested general over-the-counter medications"],
      "lifestyleAdvice": ["list of lifestyle advice"]
    }

    Note: This is for an educational simulation. Include general advice only.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            precautions: { type: Type.ARRAY, items: { type: Type.STRING } },
            medications: { type: Type.ARRAY, items: { type: Type.STRING } },
            lifestyleAdvice: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: ["precautions", "medications", "lifestyleAdvice"],
        },
      },
    });

    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Error generating treatment plan:", error);
    return {
      precautions: ["Rest and hydrate.", "Monitor symptoms."],
      medications: ["Consult a pharmacist for OTC options."],
      lifestyleAdvice: ["Eat balanced meals.", "Avoid strenuous activity."],
    };
  }
}
