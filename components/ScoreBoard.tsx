
import React from 'react';

interface ScoreBoardProps {
  score: number;
  bestScore: number;
}

const ScoreBoard: React.FC<ScoreBoardProps> = ({ score, bestScore }) => {
  return (
    <div className="flex gap-4">
      <div className="bg-slate-800 px-6 py-2 rounded-xl border border-slate-700 shadow-lg text-center min-w-[100px]">
        <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Score</div>
        <div className="text-2xl font-bold text-white">{score}</div>
      </div>
      <div className="bg-slate-800 px-6 py-2 rounded-xl border border-slate-700 shadow-lg text-center min-w-[100px]">
        <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Best</div>
        <div className="text-2xl font-bold text-white">{bestScore}</div>
      </div>
    </div>
  );
};

export default ScoreBoard;
