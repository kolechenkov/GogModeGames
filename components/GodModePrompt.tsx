import React from 'react';

interface GodModePromptProps {
  onEnable: () => void;
  onSkip: () => void;
}

const GodModePrompt: React.FC<GodModePromptProps> = ({ onEnable, onSkip }) => {
  return (
    <div className="fixed inset-0 z-50 bg-slate-900/90 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-800 border-2 border-emerald-500/50 rounded-2xl p-6 max-w-md w-full shadow-2xl animate-in zoom-in duration-300">
        <div className="flex items-center justify-center mb-4">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center">
            <i className="fa-solid fa-hand-sparkles text-emerald-400 text-3xl"></i>
          </div>
        </div>
        
        <h2 className="text-2xl font-bold text-white text-center mb-3">
          Try God Mode
        </h2>
        
        <p className="text-slate-300 text-center mb-6 leading-relaxed">
          Try God Mode to control tiles, move them around, add new ones, and remove unwanted tiles. Get full control over the game!
        </p>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={onSkip}
            className="flex-1 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-semibold transition-all hover:scale-105 active:scale-95"
          >
            Skip
          </button>
          <button
            onClick={onEnable}
            className="flex-1 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-semibold shadow-lg shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95"
          >
            Enable
          </button>
        </div>
      </div>
    </div>
  );
};

export default GodModePrompt;

