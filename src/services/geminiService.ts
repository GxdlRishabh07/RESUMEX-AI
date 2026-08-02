/**
 * Gemini Service for ATS Resume Optimization
 * Uses the official @google/genai SDK on the server side.
 */

import { GoogleGenAI, Type } from "@google/genai";
import { buildAtsOptimizationPrompt, buildAtsAnalysisPrompt, PromptInput } from "./promptBuilder.js";
import { OptimizeResumeResponse, AtsAnalysisResponse } from "../types.js";

let aiInstance: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    throw new Error(
      'GEMINI_API_KEY is not configured. Please set a valid Gemini API key in AI Studio Settings > Secrets.'
    );
  }
  if (!aiInstance) {
    aiInstance = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiInstance;
}

/**
 * Verify Gemini API key with a minimal test call
 */
export async function testGeminiConnection(): Promise<{ ok: boolean; message: string }> {
  try {
    const ai = getGeminiClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: 'Respond with a simple JSON object: {"status": "ok", "message": "Gemini API connection successful"}',
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text || '';
    if (text.includes('status') || text.includes('ok')) {
      return { ok: true, message: 'Gemini API is fully operational and authenticated.' };
    }
    return { ok: true, message: 'Gemini API responded successfully.' };
  } catch (error: any) {
    console.error('Gemini connection test failed:', error);
    return {
      ok: false,
      message: error?.message || 'Failed to connect to Google Gemini API.',
    };
  }
}

/**
 * Perform a fast pre-optimization ATS Audit on the unedited resume
 */
export async function analyzeAtsScoreWithGemini(input: PromptInput): Promise<AtsAnalysisResponse> {
  const ai = getGeminiClient();
  const promptText = buildAtsAnalysisPrompt(input);

  const response = await ai.models.generateContent({
    model: 'gemini-3.6-flash',
    contents: promptText,
    config: {
      temperature: 0.2,
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          initialScore: { type: Type.NUMBER, description: 'Objective ATS score between 0 and 100 for original text' },
          matchedKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
          missingKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
          criticalGaps: { type: Type.ARRAY, items: { type: Type.STRING } },
          formattingIssues: { type: Type.ARRAY, items: { type: Type.STRING } },
          recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
          summary: { type: Type.STRING },
        },
        required: [
          'initialScore',
          'matchedKeywords',
          'missingKeywords',
          'criticalGaps',
          'formattingIssues',
          'recommendations',
          'summary',
        ],
      },
    },
  });

  const responseText = response.text;
  if (!responseText) {
    throw new Error('Received an empty analysis response from Gemini API.');
  }

  try {
    const parsedData = JSON.parse(responseText.trim());
    return {
      success: true,
      initialScore: Math.min(100, Math.max(0, Number(parsedData.initialScore) || 50)),
      matchedKeywords: Array.isArray(parsedData.matchedKeywords) ? parsedData.matchedKeywords : [],
      missingKeywords: Array.isArray(parsedData.missingKeywords) ? parsedData.missingKeywords : [],
      criticalGaps: Array.isArray(parsedData.criticalGaps) ? parsedData.criticalGaps : [],
      formattingIssues: Array.isArray(parsedData.formattingIssues) ? parsedData.formattingIssues : [],
      recommendations: Array.isArray(parsedData.recommendations) ? parsedData.recommendations : [],
      summary: typeof parsedData.summary === 'string' ? parsedData.summary : '',
    };
  } catch (parseError) {
    console.error('Failed to parse Gemini ATS analysis response:', responseText, parseError);
    throw new Error('Invalid JSON format returned from AI audit service.');
  }
}

/**
 * Generate optimized ATS Resume using Gemini 3.6 Flash
 */
export async function optimizeResumeWithGemini(input: PromptInput): Promise<OptimizeResumeResponse> {
  const ai = getGeminiClient();
  const promptText = buildAtsOptimizationPrompt(input);

  const response = await ai.models.generateContent({
    model: 'gemini-3.6-flash',
    contents: promptText,
    config: {
      temperature: 0.3,
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          initialScore: { type: Type.NUMBER, description: 'ATS score of the original resume (0-100)' },
          optimizedScore: { type: Type.NUMBER, description: 'ATS score of rewritten resume (80-100)' },
          keyKeywordsMatched: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          missingKeywordsAdded: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          improvementsSummary: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          optimizedResume: {
            type: Type.STRING,
          },
          atsFormattingTips: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          rawAnalysis: {
            type: Type.OBJECT,
            properties: {
              strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
              gapsIdentified: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: ['strengths', 'gapsIdentified'],
          },
        },
        required: [
          'initialScore',
          'optimizedScore',
          'keyKeywordsMatched',
          'missingKeywordsAdded',
          'improvementsSummary',
          'optimizedResume',
          'atsFormattingTips',
        ],
      },
    },
  });

  const responseText = response.text;
  if (!responseText) {
    throw new Error('Received an empty response from Gemini API.');
  }

  try {
    const parsedData = JSON.parse(responseText.trim());
    const initScore = Math.min(100, Math.max(0, Number(parsedData.initialScore) || 52));
    const optScore = Math.min(100, Math.max(initScore, Number(parsedData.optimizedScore) || 92));

    return {
      success: true,
      initialScore: initScore,
      optimizedScore: optScore,
      scoreBoost: Math.max(0, optScore - initScore),
      matchScore: optScore,
      keyKeywordsMatched: Array.isArray(parsedData.keyKeywordsMatched) ? parsedData.keyKeywordsMatched : [],
      missingKeywordsAdded: Array.isArray(parsedData.missingKeywordsAdded) ? parsedData.missingKeywordsAdded : [],
      improvementsSummary: Array.isArray(parsedData.improvementsSummary) ? parsedData.improvementsSummary : [],
      optimizedResume: typeof parsedData.optimizedResume === 'string' ? parsedData.optimizedResume : '',
      atsFormattingTips: Array.isArray(parsedData.atsFormattingTips) ? parsedData.atsFormattingTips : [],
      rawAnalysis: parsedData.rawAnalysis || { strengths: [], gapsIdentified: [] },
    };
  } catch (parseError) {
    console.error('Failed to parse Gemini JSON response:', responseText, parseError);
    throw new Error('Invalid JSON format returned from AI service. Please try submitting again.');
  }
}
