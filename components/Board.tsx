
import React, { useState, useEffect } from 'react';
import { Tile } from '../types';
import TileComponent from './TileComponent';

interface BoardProps {
  tiles: Tile[];
  gridSize: number;
  onDeleteTile: (id: number) => void;
  onMoveTile: (id: number, row: number, col: number) => void;
  onSwapTiles: (sourceId: number, targetId: number) => void;
  onSpawnAt: (row: number, col: number) => void;
  godMode: boolean;
  onSwipeDetected?: () => void;
}

const Board: React.FC<BoardProps> = ({ tiles, gridSize, onDeleteTile, onMoveTile, onSwapTiles, onSpawnAt, godMode, onSwipeDetected }) => {
  const [dragOverCell, setDragOverCell] = useState<{r: number, c: number} | null>(null);
  const [dragOverTileId, setDragOverTileId] = useState<number | null>(null);
  const [cellTouchStart, setCellTouchStart] = useState<{r: number, c: number, time: number, x: number, y: number} | null>(null);
  const [selectedCell, setSelectedCell] = useState<{r: number, c: number} | null>(null);
  const [wasSwipe, setWasSwipe] = useState(false);

  const handleDragStart = (e: React.DragEvent, id: number) => {
    e.dataTransfer.setData('text/plain', id.toString());
    e.dataTransfer.effectAllowed = 'move';
    setTimeout(() => {
        setDragOverTileId(null);
        setDragOverCell(null);
    }, 0);
  };

  const handleCellDragOver = (e: React.DragEvent, r: number, c: number) => {
    if (!godMode) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverCell({ r, c });
    setDragOverTileId(null);
  };

  const handleTileDragOver = (e: React.DragEvent, tId: number) => {
    if (!godMode) return;
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
    setDragOverTileId(tId);
    setDragOverCell(null);
  };

  const handleDragLeave = () => {
    setDragOverCell(null);
    setDragOverTileId(null);
  };

  // Reset selected cell when godMode is turned off
  useEffect(() => {
    if (!godMode) {
      setSelectedCell(null);
    }
  }, [godMode]);

  const handleDropOnCell = (e: React.DragEvent, row: number, col: number) => {
    e.preventDefault();
    setDragOverCell(null);
    if (!godMode) return;
    const sourceId = parseInt(e.dataTransfer.getData('text/plain'));
    if (isNaN(sourceId)) return;
    onMoveTile(sourceId, row, col);
  };

  const handleDropOnTile = (e: React.DragEvent, targetTileId: number) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverTileId(null);
    if (!godMode) return;
    const sourceId = parseInt(e.dataTransfer.getData('text/plain'));
    if (isNaN(sourceId) || sourceId === targetTileId) return;
    onSwapTiles(sourceId, targetTileId);
  };

  const cells = [];
  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      const isOver = dragOverCell?.r === r && dragOverCell?.c === c;
      const isOccupied = tiles.some(t => t.row === r && t.col === c);

      const isSelected = selectedCell?.r === r && selectedCell?.c === c;
      
      cells.push(
        <div 
          key={`${r}-${c}`} 
          className={`bg-slate-700/30 rounded-lg w-full h-full transition-all duration-200 flex items-center justify-center select-none ${
            isOver ? 'bg-emerald-500/20 ring-2 ring-emerald-500 scale-[0.98]' : ''
          } ${godMode && !isOccupied ? 'cursor-cell hover:bg-emerald-500/10' : ''}`}
          style={{ touchAction: 'manipulation' }}
          onDragOver={(e) => handleCellDragOver(e, r, c)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDropOnCell(e, r, c)}
          onTouchStart={(e) => {
            if (godMode && !isOccupied) {
              const touch = e.touches[0];
              setCellTouchStart({ r, c, time: Date.now(), x: touch.clientX, y: touch.clientY });
              setWasSwipe(false);
            }
          }}
          onTouchMove={(e) => {
            if (godMode && !isOccupied && cellTouchStart && cellTouchStart.r === r && cellTouchStart.c === c && e.touches.length > 0) {
              const touch = e.touches[0];
              const dx = Math.abs(touch.clientX - cellTouchStart.x);
              const dy = Math.abs(touch.clientY - cellTouchStart.y);
              // If movement is significant, mark as swipe and clear selection
              if (dx > 10 || dy > 10) {
                setWasSwipe(true);
                setSelectedCell(null);
                if (onSwipeDetected) {
                  onSwipeDetected();
                }
              }
            }
          }}
          onTouchEnd={(e) => {
            if (godMode && !isOccupied && cellTouchStart && cellTouchStart.r === r && cellTouchStart.c === c) {
              // Always reset selection if it was a swipe
              if (wasSwipe) {
                setSelectedCell(null);
                setCellTouchStart(null);
                setWasSwipe(false);
                return;
              }

              const touchDuration = Date.now() - cellTouchStart.time;
              const touch = e.changedTouches[0];
              const dx = Math.abs(touch.clientX - cellTouchStart.x);
              const dy = Math.abs(touch.clientY - cellTouchStart.y);
              
              // Only handle if it was a quick tap (less than 300ms) with minimal movement (not a swipe)
              if (touchDuration < 300 && dx < 10 && dy < 10) {
                e.preventDefault();
                e.stopPropagation();
                if (isSelected) {
                  onSpawnAt(r, c);
                  setSelectedCell(null);
                } else {
                  setSelectedCell({ r, c });
                }
              } else {
                // Was a swipe or too long, hide selection
                setSelectedCell(null);
              }
              setCellTouchStart(null);
              setWasSwipe(false);
            }
          }}
          onTouchCancel={() => {
            // Reset on touch cancel
            setCellTouchStart(null);
            setWasSwipe(false);
          }}
          onClick={(e) => { 
            if (godMode && !isOccupied) {
              e.preventDefault();
              e.stopPropagation();
              if (isSelected) {
                onSpawnAt(r, c);
                setSelectedCell(null);
              } else {
                // Reset previous selection and set new one
                setSelectedCell({ r, c });
              }
            } else if (godMode && isOccupied) {
              // Clicking on occupied cell clears selection
              setSelectedCell(null);
            }
          }}
        >
            {isOver && <i className="fa-solid fa-arrows-up-down-left-right text-emerald-400 text-lg"></i>}
            {!isOccupied && godMode && !isOver && isSelected && (
              <i className="fa-solid fa-plus text-emerald-400 text-lg transition-opacity"></i>
            )}
        </div>
      );
    }
  }

  return (
    <div 
      className={`relative w-full max-w-[500px] bg-slate-800/50 p-2 rounded-2xl border transition-all duration-300 shadow-2xl overflow-hidden backdrop-blur-sm group select-none ${
        godMode ? 'border-red-500/50 ring-2 ring-red-500/20' : 'border-slate-700'
      }`}
      onDragLeave={handleDragLeave}
      style={{ 
        touchAction: 'none',
        aspectRatio: '1 / 1',
        height: 'min(100vw - 2rem, 500px)',
        maxHeight: '500px'
      }}
    >
      <div 
        className="grid gap-2 h-full w-full"
        style={{ 
          gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${gridSize}, minmax(0, 1fr))`
        }}
      >
        {cells}
      </div>
      
      <div className="absolute inset-0 p-2 pointer-events-none">
        <div className="relative w-full h-full">
          {tiles.map(tile => (
            <div 
              key={tile.id} 
              className="pointer-events-auto"
              onDragOver={(e) => handleTileDragOver(e, tile.id)}
            >
              <TileComponent 
                tile={tile} 
                gridSize={gridSize} 
                onDelete={onDeleteTile}
                godMode={godMode}
                onDragStart={handleDragStart}
                onDrop={handleDropOnTile}
                isDragTarget={dragOverTileId === tile.id}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Board;
