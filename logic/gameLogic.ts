
import { Tile, Direction, GameState } from '../types';

let nextId = 0;

export const createTile = (row: number, col: number, value: number = Math.random() < 0.9 ? 2 : 4): Tile => ({
  id: nextId++,
  value,
  row,
  col,
  isNew: true
});

export const initGame = (gridSize: number = 4): Partial<GameState> => {
  const tiles: Tile[] = [];
  tiles.push(createTile(Math.floor(Math.random() * gridSize), Math.floor(Math.random() * gridSize)));
  
  let secondTilePos = { 
    row: Math.floor(Math.random() * gridSize), 
    col: Math.floor(Math.random() * gridSize) 
  };
  while (secondTilePos.row === tiles[0].row && secondTilePos.col === tiles[0].col) {
    secondTilePos = { 
      row: Math.floor(Math.random() * gridSize), 
      col: Math.floor(Math.random() * gridSize) 
    };
  }
  tiles.push(createTile(secondTilePos.row, secondTilePos.col));

  return {
    tiles,
    score: tiles.reduce((sum, t) => sum + t.value, 0),
    over: false,
    won: false,
    winAcknowledged: false,
    gridSize
  };
};

export const getTileAt = (tiles: Tile[], row: number, col: number): Tile | undefined => {
  return tiles.find(t => t.row === row && t.col === col);
};

export const move = (state: GameState, direction: Direction): GameState => {
  if (state.over) return state;

  const { tiles, gridSize } = state;
  // Deep clone tiles to avoid mutating state directly
  let newTiles: Tile[] = JSON.parse(JSON.stringify(tiles));
  let moved = false;

  const isVertical = direction === 'UP' || direction === 'DOWN';
  const isForward = direction === 'UP' || direction === 'LEFT'; // UP moves to row 0, LEFT to col 0

  for (let i = 0; i < gridSize; i++) {
    // 1. Extract tiles in the current line (row or column)
    let lineTiles = newTiles.filter(t => (isVertical ? t.col : t.row) === i);
    
    // 2. Sort them by their position in the coordinate system
    lineTiles.sort((a, b) => isVertical ? a.row - b.row : a.col - b.col);
    
    // If moving DOWN or RIGHT, we process them from the end of the coordinate system
    if (!isForward) lineTiles.reverse();

    // 3. Merge identical neighbors in the sorted line
    const mergedLine: Tile[] = [];
    for (let j = 0; j < lineTiles.length; j++) {
      const current = lineTiles[j];
      const next = lineTiles[j + 1];

      if (next && current.value === next.value) {
        const newValue = current.value * 2;
        
        // Update the current tile's value
        current.value = newValue;
        
        // Remove the 'next' tile from the pool since it's merged into 'current'
        newTiles = newTiles.filter(t => t.id !== next.id);
        
        mergedLine.push(current);
        j++; // Skip the next tile
        moved = true;
      } else {
        mergedLine.push(current);
      }
    }

    // 4. Update the positions of remaining tiles in the line
    mergedLine.forEach((tile, index) => {
      const newPos = isForward ? index : gridSize - 1 - index;
      const oldRow = tile.row;
      const oldCol = tile.col;
      
      if (isVertical) {
        tile.row = newPos;
      } else {
        tile.col = newPos;
      }

      if (tile.row !== oldRow || tile.col !== oldCol) {
        moved = true;
      }
      tile.isNew = false;
    });
  }

  if (moved) {
    // 5. Add a new random tile if something moved
    const emptySpaces: {r: number, c: number}[] = [];
    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        if (!newTiles.some(t => t.row === r && t.col === c)) {
          emptySpaces.push({ r, c });
        }
      }
    }

    if (emptySpaces.length > 0) {
      const spot = emptySpaces[Math.floor(Math.random() * emptySpaces.length)];
      newTiles.push(createTile(spot.r, spot.c));
    }

    const won = newTiles.some(t => t.value === 2048);
    const over = !canMove(newTiles, gridSize);
    // Recalculate score as the sum of all tile values on the board
    const score = newTiles.reduce((sum, t) => sum + t.value, 0);

    return { ...state, tiles: newTiles, score, won: state.won || won, over };
  }

  return state;
};

export const canMove = (tiles: Tile[], gridSize: number): boolean => {
  if (tiles.length < gridSize * gridSize) return true;

  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      const tile = getTileAt(tiles, r, c);
      if (!tile) return true;

      const neighbors = [
        getTileAt(tiles, r + 1, c),
        getTileAt(tiles, r, c + 1)
      ];

      if (neighbors.some(n => n && n.value === tile.value)) return true;
    }
  }
  return false;
};
