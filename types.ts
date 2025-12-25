
export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

export interface Tile {
  id: number;
  value: number;
  row: number;
  col: number;
  mergedFrom?: Tile[];
  isNew?: boolean;
}

export interface GameState {
  tiles: Tile[];
  score: number;
  bestScore: number;
  over: boolean;
  won: boolean;
  winAcknowledged: boolean;
  gridSize: number;
}

/**
 * Interface for the AI strategist's advice
 */
export interface AIAdvice {
  move: Direction;
  reasoning: string;
}
