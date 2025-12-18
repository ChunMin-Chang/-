
import { GoogleGenAI, Type } from "@google/genai";
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";
//const API_KEY = process.env.API_KEY || "";

export interface SearchResponse {
  text: string;
  links: { title: string; uri: string }[];
}

export const getCompetitionAnalysis = async (compName: string, description: string) => {
  if (!API_KEY) return "請先配置 API Key。";

  try {
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `身為一位資深的學生活動顧問，請針對以下競賽資訊提供簡短的「奪獎建議」與「參賽價值分析」：
      競賽名稱：${compName}
      競賽內容：${description}
      
      請用兩小段話總結，並使用 Markdown 格式呈現。`,
      config: {
        thinkingConfig: { thinkingBudget: 0 }
      }
    });

    return response.text || "無法生成分析，請稍後再試。";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "獲取 AI 分析時出錯。";
  }
};

export const searchNewCompetitions = async (query: string): Promise<SearchResponse> => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `根據用戶的需求「${query}」，搜尋並列出 3 個目前(2024-2025年)適合台灣大專生的相關競賽資訊。
    請包含：競賽名稱、獎金、截止日期、官網連結。`,
    config: {
      tools: [{ googleSearch: {} }]
    }
  });
  
  const text = response.text || "";
  const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
  
  const links = groundingChunks
    .map((chunk: any) => ({
      title: chunk.web?.title || "相關連結",
      uri: chunk.web?.uri || ""
    }))
    .filter((link: any) => link.uri !== "");

  return { text, links };
};
