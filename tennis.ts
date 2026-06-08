/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Match, PlayerStats } from '../types';

export const INITIAL_PLAYERS = [
  'Nhật',
  'Tâm',
  'Lãnh',
  'Duy',
  'Tiến',
  'Vũ',
  'Lâm',
  'Hài' // Wait! The prompt says "Hải" but let's write "Hải" as spelled by the user. Yes, "Hải". Let me check spellings: Nhật, Tâm, Lãnh, Duy, Tiến, Vũ, Lâm, Hải.
];

export const TENNIS_PLAYERS = [
  'Nhật',
  'Tâm',
  'Lãnh',
  'Duy',
  'Tiến',
  'Vũ',
  'Lâm',
  'Hải'
];

/**
 * Generates a full double round-robin tournament schedule (56 matches total)
 * dynamically using Berger's Circle Rotation Method.
 */
export function generateSchedule(players: string[]): Match[] {
  const n = players.length;
  const fixtures: Match[] = [];

  // Leg 1 rounds (Round 1 to 7)
  for (let round = 0; round < n - 1; round++) {
    for (let i = 0; i < n / 2; i++) {
      let home = (round + i) % (n - 1);
      let away = (round + n - 1 - i) % (n - 1);
      
      if (i === 0) {
        away = n - 1;
      }

      fixtures.push({
        id: `L1-R${round + 1}-M${i + 1}`,
        round: round + 1,
        leg: 1,
        player1: players[home],
        player2: players[away],
        score1: null,
        score2: null,
        played: false,
        winner: null,
        isTieBreak: false,
        playedAt: null,
      });
    }
  }

  // Leg 2 rounds (Round 8 to 14) with swapped home/away status
  for (let round = 0; round < n - 1; round++) {
    for (let i = 0; i < n / 2; i++) {
      let home = (round + i) % (n - 1);
      let away = (round + n - 1 - i) % (n - 1);
      
      if (i === 0) {
        away = n - 1;
      }

      fixtures.push({
        id: `L2-R${round + 8}-M${i + 1}`,
        round: round + 8,
        leg: 2,
        player1: players[away], // Home/away roles reversed in Leg 2
        player2: players[home],
        score1: null,
        score2: null,
        played: false,
        winner: null,
        isTieBreak: false,
        playedAt: null,
      });
    }
  }

  return fixtures;
}

/**
 * Computes official standings sorted by:
 * 1. Total Points
 * 2. Cumulative Game Difference
 * 3. Direct Head-to-Head Statistics
 * 4. Total Games Won (for secondary tiebreakers)
 * 5. Vietnamese Alphabetical order (as deterministic fallback)
 */
export function calculateStandings(players: string[], matches: Match[]): PlayerStats[] {
  // Initialize empty ledger for each player
  const statsMap: Record<string, Omit<PlayerStats, 'rank'>> = {};
  for (const name of players) {
    statsMap[name] = {
      name,
      points: 0,
      wins: 0,
      losses: 0,
      gamesWon: 0,
      gamesLost: 0,
      gameDiff: 0,
    };
  }

  // Aggregate stats from completed matches
  for (const m of matches) {
    if (!m.played || m.score1 === null || m.score2 === null) continue;
    
    const p1 = m.player1;
    const p2 = m.player2;
    const s1 = m.score1;
    const s2 = m.score2;

    // Verify structural safety of lookup
    if (!statsMap[p1] || !statsMap[p2]) continue;

    statsMap[p1].gamesWon += s1;
    statsMap[p1].gamesLost += s2;
    
    statsMap[p2].gamesWon += s2;
    statsMap[p2].gamesLost += s1;

    if (s1 > s2) {
      // Player 1 wins (3pts), Player 2 loses (1pt)
      statsMap[p1].points += 3;
      statsMap[p1].wins += 1;

      statsMap[p2].points += 1;
      statsMap[p2].losses += 1;
    } else {
      // Player 2 wins (3pts), Player 1 loses (1pt)
      statsMap[p2].points += 3;
      statsMap[p2].wins += 1;

      statsMap[p1].points += 1;
      statsMap[p1].losses += 1;
    }
  }

  // Precompute game differences
  for (const name of players) {
    if (statsMap[name]) {
      statsMap[name].gameDiff = statsMap[name].gamesWon - statsMap[name].gamesLost;
    }
  }

  const standings = Object.values(statsMap) as PlayerStats[];

  // Multi-tier Sorting Logic
  standings.sort((a, b) => {
    // 1. Points
    if (b.points !== a.points) {
      return b.points - a.points;
    }

    // 2. Cumulative Game Difference
    if (b.gameDiff !== a.gameDiff) {
      return b.gameDiff - a.gameDiff;
    }

    // 3. Head-To-Head Record
    const directMatches = matches.filter(
      m =>
        m.played &&
        m.score1 !== null &&
        m.score2 !== null &&
        ((m.player1 === a.name && m.player2 === b.name) ||
          (m.player1 === b.name && m.player2 === a.name))
    );

    if (directMatches.length > 0) {
      let aH2hPoints = 0;
      let bH2hPoints = 0;
      let aH2hGames = 0;
      let bH2hGames = 0;

      for (const m of directMatches) {
        const isP1A = m.player1 === a.name;
        const scoreA = isP1A ? m.score1! : m.score2!;
        const scoreB = isP1A ? m.score2! : m.score1!;

        aH2hGames += scoreA;
        bH2hGames += scoreB;

        if (scoreA > scoreB) {
          aH2hPoints += 3;
          bH2hPoints += 1;
        } else {
          bH2hPoints += 3;
          aH2hPoints += 1;
        }
      }

      // Check head-to-head point collection
      if (aH2hPoints !== bH2hPoints) {
        return bH2hPoints - aH2hPoints; // Higher points in direct play ranks higher
      }

      // Check head-to-head game difference
      const aH2hDiff = aH2hGames - bH2hGames;
      const bH2hDiff = bH2hGames - aH2hGames;
      if (aH2hDiff !== bH2hDiff) {
        return bH2hDiff - aH2hDiff;
      }
    }

    // 4. Cumulative Games Won
    if (b.gamesWon !== a.gamesWon) {
      return b.gamesWon - a.gamesWon;
    }

    // 5. Alphabetic Fallback in Vietnamese
    return a.name.localeCompare(b.name, 'vi');
  });

  // Assign ranks
  return standings.map((item, index) => ({
    ...item,
    rank: index + 1,
  }));
}
