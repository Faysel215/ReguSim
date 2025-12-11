import { GoogleGenAI } from "@google/genai";
import { SimulationConfig, AIAnalysisResult, TimeStepData } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generatePreSimulationBrief = async (config: SimulationConfig): Promise<string> => {
  try {
    const model = 'gemini-2.5-flash';
    const prompt = `
      You are ReguSim, an advanced AI for Islamic Finance regulation.
      Generate a short, professional pre-simulation brief (max 100 words).
      
      Parameters:
      - Tangibility Ratio Requirement: ${config.tangibilityRatio}%
      - Market Liquidity Base: ${config.marketLiquidity}/100
      - Investor Panic Sensitivity: ${config.investorPanicSensitivity}/100
      - Shock Event: ${config.shockType}

      Explain the theoretical risk before the simulation starts.
    `;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });

    return response.text || "Simulation initialized. Ready for stress testing.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "ReguSim AI systems offline. Proceeding with manual simulation.";
  }
};

export const generatePostSimulationReport = async (
  config: SimulationConfig, 
  data: TimeStepData[]
): Promise<AIAnalysisResult> => {
  try {
    const finalState = data[data.length - 1];
    const initialIndex = data[0].sukukIndex;
    const finalIndex = finalState.sukukIndex;
    const drop = ((initialIndex - finalIndex) / initialIndex * 100).toFixed(2);
    
    const prompt = `
      You are ReguSim, a central bank regulatory AI.
      Analyze the results of a Q-ABM stress test on the Sukuk market.
      
      Configuration:
      - Tangibility Ratio: ${config.tangibilityRatio}%
      - Shock: ${config.shockType}
      
      Results:
      - Total Market Drop: ${drop}%
      - Final Systemic Risk Score: ${finalState.systemicRisk.toFixed(0)}/100
      - Defaults Count: ${finalState.defaults}
      
      Provide a JSON response with the following structure:
      {
        "summary": "A concise executive summary of the contagion event.",
        "riskAssessment": "Assessment of the systemic fragility exposed.",
        "recommendations": ["Policy recommendation 1", "Policy recommendation 2", "Policy recommendation 3"]
      }
      Do not use Markdown formatting in the response, just the raw JSON string.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response text");
    
    return JSON.parse(text) as AIAnalysisResult;
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return {
      summary: "Analysis failed due to connection error.",
      riskAssessment: "Unknown",
      recommendations: ["Check network connection", "Retry simulation"]
    };
  }
};