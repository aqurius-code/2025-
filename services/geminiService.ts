import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const polishText = async (originalText: string, type: 'enrich' | 'simplify'): Promise<string> => {
  const prompt = type === 'enrich' 
    ? `다음 생기부 특기사항 문구를 더 구체적이고 교육적인 표현으로 풍성하게 다듬어주세요. 원래 의미는 유지하되, 학생의 성장이 돋보이도록 문장을 업그레이드해주세요. 결과물은 완성된 문장 하나만 출력하세요.\n\n문구: "${originalText}"`
    : `다음 생기부 특기사항 문구를 간결하고 명확하게 요약해주세요. 결과물은 문장 하나만 출력하세요.\n\n문구: "${originalText}"`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: { text: prompt },
    });
    return response.text?.trim() || originalText;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
