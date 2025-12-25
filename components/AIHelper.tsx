
import React, { useState } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import { GameState, AIAdvice } from '../types';

interface AIHelperProps {
  gameState: GameState;
}

const AIHelper: React.FC<AIHelperProps> = ({ gameState }) => {
  const [advice, setAdvice] = useState<AIAdvice | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getAIAdvice = async () => {
    if (gameState.over) return;
    
    setLoading(true);
    setError(null);
    try {
      // Initialize Gemini AI with API key from environment
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      // Serialize board for AI
      const { gridSize } = gameState;
      const grid = Array.from({ length: gridSize }, (_, r) => 
        Array.from({ length: gridSize }, (_, c) => {
          const t = gameState.tiles.find(tile => tile.row === r && tile.col === c);
          return t ? t.value : 0;
        })
      );

      const prompt = `
        Current 2048 board (${gridSize}x${gridSize}, 0 is empty):
        ${JSON.stringify(grid)}
        
        Current Score: ${gameState.score}
        
        Suggest the BEST next move (UP, DOWN, LEFT, RIGHT). 
        Rules of 2048 apply. Aim for high values in corners.
      `;

      // Use gemini-3-pro-preview for complex reasoning tasks like game strategy
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          // Recommended way to get structured JSON output
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              move: {
                type: Type.STRING,
                description: 'The recommended next move: UP, DOWN, LEFT, or RIGHT.',
              },
              reasoning: {
                type: Type.STRING,
                description: 'A brief explanation of why this move is strategically sound.',
              },
            },
            required: ["move", "reasoning"],
          },
          // Setting thinkingBudget allows the model to process complex game states more effectively
          thinkingConfig: { thinkingBudget: 4000 }
        }
      });

      // Directly access .text property from GenerateContentResponse
      const jsonStr = response.text?.trim();
      if (jsonStr) {
        const result = JSON.parse(jsonStr);
        setAdvice(result);
      }
    } catch (err) {
      console.error('AI Strategy Error:', err);
      setError("Quantum Strategist unavailable. Please check your connectivity.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700 w-full lg:w-80 h-fit">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <i className="fa-solid fa-microchip text-emerald-400"></i>
          Gemini Strategist
        </h3>
        <button 
          onClick={getAIAdvice}
          disabled={loading || gameState.over}
          className="text-xs bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-700 text-white px-3 py-1 rounded-full transition-colors font-bold uppercase tracking-wider"
        >
          {loading ? 'Analyzing...' : 'Get Hint'}
        </button>
      </div>

      {advice ? (
        <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-500/20 text-emerald-400 p-2 rounded-lg text-xl">
              <i className={`fa-solid fa-arrow-${advice.move?.toLowerCase()}`}></i>
            </div>
            <div>
              <div className="text-xs text-slate-400 uppercase font-bold tracking-tighter">Recommended Move</div>
              <div className="text-lg font-extrabold text-white uppercase">{advice.move}</div>
            </div>
          </div>
          <p className="text-sm text-slate-300 italic leading-relaxed">"{advice.reasoning}"</p>
        </div>
      ) : (
        <p className="text-sm text-slate-500 text-center py-4 italic">
          {error ? error : "Press 'Get Hint' to consult the Quantum Strategist."}
        </p>
      )}
    </div>
  );
};

export default AIHelper;
