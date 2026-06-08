/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Player {
  id: string;
  name: string;
}

export type ValidScoreString = '6-0' | '6-1' | '6-2' | '6-3' | '6-4' | '6-5(TB)';

export interface Match {
  id: string;
  round: number;
  leg: 1 | 2;
  player1: string; // Player Name
  player2: string; // Player Name
  score1: number | null; // Games won by player 1
  score2: number | null; // Games won by player 2
  played: boolean;
  winner: string | null;  // Winning player name
  isTieBreak: boolean;    // If match went to tiebreak
  playedAt: string | null; // ISO timestamp
}

export interface PlayerStats {
  rank: number;
  name: string;
  points: number;
  wins: number;
  losses: number;
  gamesWon: number;
  gamesLost: number;
  gameDiff: number;
}

export type TabName = 'bxh' | 'nhap-kq' | 'lich-dau';
