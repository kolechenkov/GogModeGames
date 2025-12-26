
import React, { useState, useEffect } from 'react';
import { Tile } from '../types';

interface TileProps {
  tile: Tile;
  gridSize: number;
  onDelete: (id: number) => void;
  godMode: boolean;
  onDragStart: (e: React.DragEvent, id: number) => void;
  onDrop: (e: React.DragEvent, targetTileId: number) => void;
  isDragTarget?: boolean;
  isSelected?: boolean;
  onSelect?: (tileId: number) => void;
  onDeselectAll?: () => void;
}

const getTileStyles = (value: number) => {
  const styles: Record<number, string> = {
    2: 'bg-slate-200 text-slate-800',
    4: 'bg-slate-100 text-slate-800',
    8: 'bg-orange-200 text-slate-800',
    16: 'bg-orange-400 text-white',
    32: 'bg-orange-500 text-white',
    64: 'bg-orange-600 text-white',
    128: 'bg-yellow-400 text-white shadow-[0_0_15px_rgba(250,204,21,0.5)]',
    256: 'bg-yellow-500 text-white shadow-[0_0_20px_rgba(234,179,8,0.6)]',
    512: 'bg-yellow-600 text-white shadow-[0_0_25px_rgba(202,138,4,0.7)]',
    1024: 'bg-yellow-700 text-white shadow-[0_0_30px_rgba(161,98,7,0.8)]',
    2048: 'bg-emerald-500 text-white shadow-[0_0_40px_rgba(16,185,129,0.9)] scale-105',
  };

  return styles[value] || 'bg-slate-900 text-white border-2 border-emerald-400';
};

const TileComponent: React.FC<TileProps> = ({ 
  tile, 
  gridSize, 
  onDelete, 
  godMode, 
  onDragStart, 
  onDrop,
  isDragTarget,
  isSelected = false,
  onSelect,
  onDeselectAll
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const cellSize = 100 / gridSize;
  
  const baseClass = `absolute flex items-center justify-center font-bold transition-all duration-150 rounded-lg select-none group ${
    godMode ? 'cursor-grab active:cursor-grabbing hover:brightness-110' : 'cursor-default'
  } ${isDragTarget ? 'ring-4 ring-white ring-offset-2 ring-offset-slate-900 scale-110 z-50' : ''} ${
    isDragging ? 'opacity-40 grayscale-[0.5]' : ''
  }`;
  
  const sizeStyle = {
    width: `calc(${cellSize}% - 8px)`,
    height: `calc(${cellSize}% - 8px)`,
    margin: '4px',
    top: `${tile.row * cellSize}%`,
    left: `${tile.col * cellSize}%`,
    zIndex: isDragTarget ? 50 : (godMode ? 10 : 1),
  };

  const valueClass = tile.value > 1000 ? "text-xl" : tile.value > 100 ? "text-2xl" : "text-4xl";
  const animationClass = tile.isNew ? "tile-new" : "";

  const handleLocalDragStart = (e: React.DragEvent) => {
    setIsDragging(true);
    onDragStart(e, tile.id);
  };

  const handleLocalDragEnd = () => {
    setIsDragging(false);
  };

  return (
    <div
      draggable={godMode}
      onDragStart={handleLocalDragStart}
      onDragEnd={handleLocalDragEnd}
      onDragOver={(e) => {
        if (godMode) e.preventDefault();
      }}
      onDrop={(e) => onDrop(e, tile.id)}
      onClick={(e) => {
        if (godMode && !isDragging && !isDragTarget) {
          e.stopPropagation();
          if (onSelect) {
            onSelect(tile.id);
          }
        }
      }}
      className={`${baseClass} ${valueClass} ${animationClass} ${getTileStyles(tile.value)}`}
      style={sizeStyle}
    >
      {tile.value}
      
      {godMode && (
        <>
          {/* Subtle glow when being targeted for a swap */}
          <div className={`absolute inset-0 rounded-lg transition-all duration-200 ${isDragTarget ? 'bg-blue-500/20 shadow-[0_0_20px_rgba(59,130,246,0.5)]' : 'bg-transparent'}`}></div>

          {/* DYNAMIC ACTION ICON IN TOP RIGHT CORNER */}
          {isSelected && (
            <div 
              className={`absolute top-1 right-1 w-6 h-6 flex items-center justify-center rounded-md transition-all duration-200 shadow-sm z-30 ${
                isDragging ? 'bg-emerald-500 text-white opacity-100' : 
                isDragTarget ? 'bg-blue-500 text-white opacity-100 animate-pulse' :
                'bg-slate-900/80 text-red-400 opacity-100 hover:bg-red-500 hover:text-white cursor-pointer'
              }`}
              onClick={(e) => {
                // Delete only works if not currently dragging/being targeted
                if (isDragging || isDragTarget) return;
                e.stopPropagation();
                if (onDeselectAll) {
                  onDeselectAll();
                }
                onDelete(tile.id);
              }}
              title={isDragging ? "Moving Tile..." : isDragTarget ? "Swap Target" : "Delete Tile"}
            >
              {isDragging ? (
                <i className="fa-solid fa-arrows-up-down-left-right text-[10px]"></i>
              ) : isDragTarget ? (
                <i className="fa-solid fa-right-left text-[10px]"></i>
              ) : (
                <i className="fa-solid fa-trash-can text-[10px]"></i>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TileComponent;
