import { GoogleGenAI } from "@google/genai";
import { UploadedImage } from '../types';

// Initialize safely to prevent crash if env var is missing during render
const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("API Key is missing. AI features will not work.");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const polishText = async (originalText: string, type: 'enrich' | 'simplify'): Promise<string> => {
  const ai = getAiClient();
  if (!ai) return "API 키가 설정되지 않았습니다. 설정(환경변수)을 확인해주세요.";

  const prompt = type === 'enrich' 
    ? `다음 생기부 특기사항 문구를 더 구체적이고 교육적인 표현으로 풍성하게 다듬어주세요. 원래 의미는 유지하되, 학생의 성장이 돋보이도록 문장을 업그레이드해주세요. 결과물은 완성된 문장 하나만 출력하세요.\n\n문구: "${originalText}"`
    : `다음 생기부 특기사항 문구를 간결하고 명확하게 요약해주세요. 결과물은 문장 하나만 출력하세요.\n\n문구: "${originalText}"`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    return response.text?.trim() || originalText;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "AI 서비스 연결 중 오류가 발생했습니다.";
  }
};

export const generateNoteFromImages = async (images: UploadedImage[], instruction: string): Promise<string> => {
  const ai = getAiClient();
  if (!ai) return "API 키가 설정되지 않았습니다. 설정(환경변수)을 확인해주세요.";

  // Convert images to Gemini Part objects
  const imageParts = images.map(img => ({
    inlineData: {
      mimeType: img.mimeType,
      data: img.base64
    }
  }));

  const prompt = `
    당신은 고등학교 생활기록부 작성 전문가입니다.
    
    [입력 데이터 설명]
    - 총 ${images.length}장의 이미지가 순서대로 제공되었습니다.
    - 입력된 순서대로 "1번 이미지", "2번 이미지", ..., "${images.length}번 이미지"입니다.
    - 사용자 요청사항: "${instruction}"

    [작성 가이드]
    1. 사용자가 특정 번호의 이미지(예: "6번 사진", "마지막 사진")를 **스타일, 문체, 형식 참고용**으로 지정했다면, 해당 이미지의 서술 방식(어조, 문장 길이, 표현 패턴 등)을 철저히 모방하세요. 내용은 가져오지 마세요.
    2. 나머지 이미지들(활동 사진, 엑셀 기록 등)에서 식별 가능한 **활동 날짜, 구체적인 활동 내용, 학생의 역할** 등 팩트(Fact)를 추출하여 내용을 구성하세요.
    3. 별도의 스타일 지시가 없다면, 학생의 구체적인 성장과 활동 태도가 잘 드러나도록 긍정적이고 교육적인 어조(우수 사례)로 작성하세요.
    4. 문장은 개조식이 아닌 완성된 서술형 문장으로 자연스럽게 이어지도록 작성하세요.

    결과물은 오직 생기부 특기사항 텍스트만 출력하세요.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [...imageParts, { text: prompt }]
      }
    });
    return response.text?.trim() || "생성된 내용이 없습니다. 이미지를 다시 확인해주세요.";
  } catch (error) {
    console.error("Gemini Vision API Error:", error);
    return "이미지 분석 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
  }
};