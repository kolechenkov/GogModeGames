
import React, { useState, useEffect, useCallback } from 'react';
import ScoreBoard from './components/ScoreBoard';
import Board from './components/Board';
// Import the AIHelper component
import AIHelper from './components/AIHelper';
import { GameState, Direction } from './types';
import { initGame, move as moveLogic, canMove, createTile } from './logic/gameLogic';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(() => {
    const savedBest = localStorage.getItem('bestScore');
    const initialState = initGame(5);
    return {
      ...initialState,
      bestScore: savedBest ? parseInt(savedBest) : 0,
    } as GameState;
  });

  const [godMode, setGodMode] = useState(false);

  const handleRestart = () => {
    setGameState(prev => ({
      ...initGame(5),
      bestScore: prev.bestScore
    } as GameState));
    setGodMode(false);
  };

  const handleManualSpawn = useCallback(() => {
    setGameState(prev => {
      const emptySpaces: {r: number, c: number}[] = [];
      for (let r = 0; r < prev.gridSize; r++) {
        for (let c = 0; c < prev.gridSize; c++) {
          if (!prev.tiles.some(t => t.row === r && t.col === c)) {
            emptySpaces.push({ r, c });
          }
        }
      }

      if (emptySpaces.length === 0) return prev;

      const spot = emptySpaces[Math.floor(Math.random() * emptySpaces.length)];
      const newTile = createTile(spot.r, spot.c);
      const newTiles = [...prev.tiles, newTile];
      const over = !canMove(newTiles, prev.gridSize);

      return { ...prev, tiles: newTiles, over };
    });
  }, []);

  const handleDeleteTile = (id: number) => {
    if (!godMode) return;
    
    setGameState(prev => {
      const newTiles = prev.tiles.filter(t => t.id !== id);
      const over = !canMove(newTiles, prev.gridSize);
      return { ...prev, tiles: newTiles, over };
    });
  };

  const handleMoveTile = (id: number, row: number, col: number) => {
    if (!godMode) return;

    setGameState(prev => {
      // Check if spot is occupied
      if (prev.tiles.some(t => t.row === row && t.col === col && t.id !== id)) return prev;

      const newTiles = prev.tiles.map(t => 
        t.id === id ? { ...t, row, col, isNew: false } : t
      );
      return { ...prev, tiles: newTiles };
    });
  };

  const handleSwapTiles = (sourceId: number, targetId: number) => {
    if (!godMode) return;

    setGameState(prev => {
      const sourceTile = prev.tiles.find(t => t.id === sourceId);
      const targetTile = prev.tiles.find(t => t.id === targetId);

      if (!sourceTile || !targetTile) return prev;

      const newTiles = prev.tiles.map(t => {
        if (t.id === sourceId) return { ...t, row: targetTile.row, col: targetTile.col, isNew: false };
        if (t.id === targetId) return { ...t, row: sourceTile.row, col: sourceTile.col, isNew: false };
        return t;
      });

      return { ...prev, tiles: newTiles };
    });
  };

  const handleContinue = () => {
    setGameState(prev => ({
      ...prev,
      winAcknowledged: true,
      over: false
    }));
  };

  const handleMove = useCallback((direction: Direction) => {
    setGameState(prev => {
      if (prev.over || (prev.won && !prev.winAcknowledged)) return prev;
      const newState = moveLogic(prev, direction);
      
      if (newState.score > prev.bestScore) {
        localStorage.setItem('bestScore', newState.score.toString());
        return { ...newState, bestScore: newState.score };
      }
      return newState;
    });
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Space key for manual spawning in God Mode
      if (e.code === 'Space' && godMode) {
        e.preventDefault();
        handleManualSpawn();
        return;
      }

      switch (e.key) {
        case 'ArrowUp': case 'w': handleMove('UP'); break;
        case 'ArrowDown': case 's': handleMove('DOWN'); break;
        case 'ArrowLeft': case 'a': handleMove('LEFT'); break;
        case 'ArrowRight': case 'd': handleMove('RIGHT'); break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleMove, godMode, handleManualSpawn]);

  const [touchStart, setTouchStart] = useState<{x: number, y: number} | null>(null);
  
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart) return;
    const x = e.changedTouches[0].clientX;
    const y = e.changedTouches[0].clientY;
    const dx = x - touchStart.x;
    const dy = y - touchStart.y;

    if (Math.abs(dx) > Math.abs(dy)) {
      if (Math.abs(dx) > 30) handleMove(dx > 0 ? 'RIGHT' : 'LEFT');
    } else {
      if (Math.abs(dy) > 30) handleMove(dy > 0 ? 'DOWN' : 'UP');
    }
    setTouchStart(null);
  };

  const showOverlay = gameState.over || (gameState.won && !gameState.winAcknowledged);
  const isWin = gameState.won && !gameState.winAcknowledged;

  return (
    <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center p-4 selection:bg-emerald-500/30">
      <div className="w-full max-w-6xl flex flex-col lg:flex-row gap-8 items-center lg:items-start justify-center">
        
        {/* Main Game Column */}
        <div className="flex flex-col gap-6 w-full max-w-[500px]">
          <header className="flex items-end justify-between w-full">
            <div>
              <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-500 tracking-tighter">
                2048 <span className="text-xl align-top font-semibold opacity-60">Quantum</span>
              </h1>
              <p className="text-slate-400 font-medium mt-1">Merge tiles to reach 2048!</p>
            </div>
            <ScoreBoard score={gameState.score} bestScore={gameState.bestScore} />
          </header>

          <div 
            className="relative"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <Board 
              tiles={gameState.tiles} 
              gridSize={gameState.gridSize} 
              onDeleteTile={handleDeleteTile} 
              onMoveTile={handleMoveTile}
              onSwapTiles={handleSwapTiles}
              godMode={godMode}
            />
            
            {showOverlay && (
              <div className="absolute inset-0 z-20 bg-slate-900/80 backdrop-blur-md flex flex-col items-center justify-center rounded-2xl border-2 border-emerald-500/50 p-8 text-center animate-in zoom-in duration-300">
                <h2 className="text-4xl font-black text-white mb-2">
                  {isWin ? "Quantum Achieved!" : "Simulation Ended"}
                </h2>
                <p className="text-slate-300 mb-8 font-medium">
                  {isWin 
                    ? `You reached 2048 with a score of ${gameState.score}!` 
                    : `No more moves left. Your final score is ${gameState.score}.`}
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <button 
                    onClick={handleRestart}
                    className="px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95"
                  >
                    Restart Universe
                  </button>
                  {isWin ? (
                    <button 
                      onClick={handleContinue}
                      className="px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-500/20 transition-all hover:scale-105 active:scale-95"
                    >
                      Continue Playing
                    </button>
                  ) : (
                    <button 
                      onClick={() => setGameState(prev => ({...prev, over: false}))}
                      className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-bold transition-all"
                    >
                      Keep Observing
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-between items-center bg-slate-800/30 p-4 rounded-xl border border-slate-700/50">
             <div className="flex flex-col gap-1">
                <div className="flex gap-2">
                  <kbd className="px-2 py-1 bg-slate-700 text-slate-300 rounded text-xs border border-slate-600">↑</kbd>
                  <kbd className="px-2 py-1 bg-slate-700 text-slate-300 rounded text-xs border border-slate-600">←</kbd>
                  <kbd className="px-2 py-1 bg-slate-700 text-slate-300 rounded text-xs border border-slate-600">↓</kbd>
                  <kbd className="px-2 py-1 bg-slate-700 text-slate-300 rounded text-xs border border-slate-600">→</kbd>
                  <span className="text-slate-500 text-xs self-center ml-2 uppercase font-bold tracking-widest">Move</span>
                </div>
             </div>
             <button 
                onClick={handleRestart}
                className="text-slate-300 hover:text-white transition-colors flex items-center gap-2 text-sm font-semibold"
              >
                <i className="fa-solid fa-rotate-right"></i>
                Reset Game
              </button>
          </div>
        </div>

        {/* Control Column */}
        <div className="flex flex-col gap-6 w-full lg:w-80">
          {/* Include Gemini AI Strategist */}
          <AIHelper gameState={gameState} />

          <div className={`p-5 rounded-2xl border transition-all duration-300 ${godMode ? 'bg-red-500/10 border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.2)]' : 'bg-slate-800/40 border-slate-700'}`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-bold flex items-center gap-2 ${godMode ? 'text-red-400' : 'text-white'}`}>
                <i className={`fa-solid ${godMode ? 'fa-bolt-lightning animate-pulse' : 'fa-hand-sparkles text-emerald-400'}`}></i>
                God Mode
              </h3>
              <button 
                onClick={() => setGodMode(!godMode)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${godMode ? 'bg-red-500' : 'bg-slate-700'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${godMode ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>

            {godMode ? (
              <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                <p className="text-red-400 font-bold text-sm uppercase tracking-wider mb-2">Divine Instructions:</p>
                <div className="space-y-3">
                  <p className="text-slate-200 text-sm leading-relaxed bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                    <span className="text-white font-bold block mb-1">⚛️ Displacement:</span>
                    Drag a tile to an empty spot.
                  </p>
                  <p className="text-slate-200 text-sm leading-relaxed bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                    <span className="text-white font-bold block mb-1">🔀 Entanglement:</span>
                    Drag onto another tile to swap.
                  </p>
                  <p className="text-slate-200 text-sm leading-relaxed bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                    <span className="text-white font-bold block mb-1">✨ Manifestation:</span>
                    Press <kbd className="px-1 py-0.5 bg-red-500 text-white rounded text-[10px] font-bold border border-red-400">SPACE</kbd> to add a new tile.
                  </p>
                  <p className="text-slate-200 text-sm leading-relaxed bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                    <span className="text-white font-bold block mb-1">🗑️ Annihilation:</span>
                    Click the <strong>corner icon</strong> to delete.
                  </p>
                  <p className="text-blue-400 text-xs font-semibold italic border-t border-red-500/20 pt-2">
                    Keyboard moves remain enabled!
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-400 leading-relaxed italic">
                Toggle God Mode to manipulate the quantum state of the board while maintaining control.
              </p>
            )}
          </div>
          
          <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl">
            <h4 className="text-sm font-bold text-blue-400 mb-2 flex items-center gap-2">
              <i className="fa-solid fa-circle-info"></i>
              Quantum Reality
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              When God Mode is active, natural physics and direct manipulation coexist perfectly. Use your power wisely.
            </p>
          </div>
        </div>
      </div>

      <footer className="mt-12 text-slate-600 text-xs font-medium tracking-widest uppercase">
        Engineered with Precision &bull; 2024
      </footer>
    </div>
  );
};

export default App;
