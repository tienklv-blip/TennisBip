/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Match } from '../types';
import { Calendar, CheckCircle2, CircleDollarSign, Compass, Search, Swords, User, Watch } from 'lucide-react';

interface ScheduleTabProps {
  matches: Match[];
  players: string[];
  onPlayMatch?: (matchId: string) => void;
}

type StatusFilterType = 'all' | 'played' | 'unplayed';

export default function ScheduleTab({ matches, players, onPlayMatch }: ScheduleTabProps) {
  const [statusFilter, setStatusFilter] = useState<StatusFilterType>('all');
  const [playerFilter, setPlayerFilter] = useState<string>('');
  const [roundFilter, setRoundFilter] = useState<string>('');

  // 14 Rounds array for quick selection filter
  const ROUNDS = useMemo(() => Array.from({ length: 14 }, (_, i) => i + 1), []);

  // Filtered array
  const filteredMatches = useMemo(() => {
    return matches.filter(m => {
      // 1. Status Filter
      if (statusFilter === 'played' && !m.played) return false;
      if (statusFilter === 'unplayed' && m.played) return false;

      // 2. Player Filter
      if (playerFilter && m.player1 !== playerFilter && m.player2 !== playerFilter) {
        return false;
      }

      // 3. Round Filter
      if (roundFilter && m.round.toString() !== roundFilter) {
        return false;
      }

      return true;
    });
  }, [matches, statusFilter, playerFilter, roundFilter]);

  return (
    <div className="space-y-5 pb-24">
      
      {/* FILTER CONTROLLERS SURFACE */}
      <div id="schedule-filters-card" className="bg-tennis-dark border border-zinc-800/80 rounded-2xl p-4.5 space-y-3.5 shadow-lg">
        <div className="flex items-center space-x-2 text-zinc-400 text-xs font-semibold uppercase tracking-wider">
          <Compass className="w-4 h-4 text-tennis-green" />
          <span>Bộ Lọc Lịch Thi Đấu</span>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {/* F1: Play Status */}
          <div className="space-y-1">
            <label className="text-[10px] text-zinc-500 font-bold uppercase block px-0.5">Trạng thái</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilterType)}
              className="w-full px-3 py-2.5 bg-zinc-900 text-zinc-200 text-xs font-semibold rounded-xl border border-zinc-800 focus:outline-none focus:ring-1 focus:ring-tennis-green/60"
            >
              <option value="all">Tất cả trận đấu</option>
              <option value="played">✓ Đã hoàn tất</option>
              <option value="unplayed">⏳ Chưa đấu</option>
            </select>
          </div>

          {/* F2: Player filter */}
          <div className="space-y-1">
            <label className="text-[10px] text-zinc-500 font-bold uppercase block px-0.5">Người chơi</label>
            <select
              value={playerFilter}
              onChange={(e) => setPlayerFilter(e.target.value)}
              className="w-full px-3 py-2.5 bg-zinc-900 text-zinc-200 text-xs font-semibold rounded-xl border border-zinc-800 focus:outline-none focus:ring-1 focus:ring-tennis-green/60"
            >
              <option value="">Tất cả người chơi</option>
              {players.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
        </div>

        {/* F3: Round quick links */}
        <div className="space-y-1">
          <label className="text-[10px] text-zinc-500 font-bold uppercase block px-0.5">Theo vòng chơi (Tuần)</label>
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            <button
              onClick={() => setRoundFilter('')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg shrink-0 border ${
                roundFilter === ''
                  ? 'bg-tennis-green text-black border-tennis-green'
                  : 'bg-zinc-900 border-zinc-800/80 text-zinc-400 hover:bg-zinc-800'
              }`}
            >
              Tất cả Vòng
            </button>
            {ROUNDS.map(r => (
              <button
                key={r}
                onClick={() => setRoundFilter(r.toString())}
                className={`px-3 py-1.5 text-xs font-mono font-bold rounded-lg shrink-0 border ${
                  roundFilter === r.toString()
                    ? 'bg-tennis-green text-black border-tennis-green'
                    : 'bg-zinc-900 border-zinc-800/80 text-zinc-400 hover:bg-zinc-800'
                }`}
              >
                Vòng {r}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* SCHEDULE CARDS FEED */}
      <div className="space-y-3">
        <div className="flex justify-between items-center px-1">
          <h2 className="text-xs font-semibold tracking-wider text-zinc-500 uppercase font-display">
            📆 DANH SÁCH LỊCH THI ĐẤU
          </h2>
          <span className="text-xs font-mono text-zinc-500 font-bold">
            {filteredMatches.length} trận
          </span>
        </div>

        {filteredMatches.length === 0 ? (
          <div className="bg-zinc-900/30 border border-zinc-800/80 rounded-2xl p-10 text-center text-zinc-500 space-y-2">
            <Swords className="w-8 h-8 text-zinc-700 mx-auto" />
            <div className="text-sm font-semibold">Không tìm thấy trận đấu phù hợp!</div>
            <div className="text-xs">Vui lòng thay đổi cấu hình bộ lọc ở trên.</div>
          </div>
        ) : (
          <div className="space-y-2.5 max-h-[60vh] overflow-y-auto pr-1 no-scrollbar">
            {filteredMatches.map(m => {
              const scoreWinnerName = m.winner;
              const isP1Winner = scoreWinnerName === m.player1;
              const isP2Winner = scoreWinnerName === m.player2;

              return (
                <div
                  key={m.id}
                  className={`border rounded-2xl p-4 transition-all ${
                    m.played
                      ? 'bg-zinc-900/50 border-zinc-800/60'
                      : 'bg-zinc-950 border-zinc-900'
                  }`}
                >
                  <div className="flex justify-between items-center text-[10px] text-zinc-500 font-mono font-bold mb-3 border-b border-zinc-900 pb-2">
                    <span className="bg-zinc-900 px-2.5 py-0.5 rounded-full border border-zinc-800">
                      VÒNG {m.round} • {m.leg === 1 ? 'Lượt đi' : 'Lượt về'}
                    </span>
                    
                    {/* Status badge */}
                    {m.played ? (
                      <span className="text-emerald-400 font-semibold flex items-center gap-1 bg-emerald-950/20 px-2 py-0.5 rounded border border-emerald-500/10">
                        ✓ Đã đấu
                      </span>
                    ) : (
                      <button
                        onClick={() => onPlayMatch?.(m.id)}
                        className="text-tennis-green font-bold text-[11px] flex items-center gap-1 bg-tennis-green/10 hover:bg-tennis-green/20 border border-tennis-green/30 px-2.5 py-1 rounded-xl active:scale-95 transition-all cursor-pointer"
                      >
                        ⚡ Chơi
                      </button>
                    )}
                  </div>

                  {/* Core Match Row */}
                  <div className="flex justify-between items-center h-12">
                    {/* Player 1 details */}
                    <div className="w-[40%] flex items-center space-x-2.5">
                      <div className={`p-1.5 rounded-full ${isP1Winner ? 'bg-tennis-green/10 text-tennis-green border border-tennis-green/20' : 'bg-zinc-900 text-zinc-600'}`}>
                        <User className="w-4 h-4" />
                      </div>
                      <span className={`text-sm tracking-tight truncate ${
                        m.played 
                          ? isP1Winner 
                            ? 'font-black text-white' 
                            : 'font-medium text-zinc-500 line-through decoration-zinc-800'
                          : 'font-bold text-zinc-200'
                      }`}>
                        {m.player1}
                      </span>
                    </div>

                    {/* Scores Middle Segment */}
                    <div className="w-[20%] flex flex-col justify-center items-center">
                      {m.played && m.score1 !== null && m.score2 !== null ? (
                        <div className="text-center font-display">
                          <kbd className="bg-zinc-900 px-3.5 py-1 rounded-xl text-base font-black text-white border border-zinc-800 tracking-wider">
                            {m.score1}-{m.score2}
                          </kbd>
                          {m.isTieBreak && (
                            <div className="text-[8px] uppercase font-black tracking-widest text-tennis-green mt-1">
                              Tiebreak
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-zinc-700 text-xs font-black select-none tracking-widest animate-pulse font-display">
                          VS
                        </div>
                      )}
                    </div>

                    {/* Player 2 details */}
                    <div className="w-[40%] flex items-center justify-end space-x-2.5 text-right">
                      <span className={`text-sm tracking-tight truncate ${
                        m.played 
                          ? isP2Winner 
                            ? 'font-black text-white' 
                            : 'font-medium text-zinc-500 line-through decoration-zinc-800'
                          : 'font-bold text-zinc-200'
                      }`}>
                        {m.player2}
                      </span>
                      <div className={`p-1.5 rounded-full ${isP2Winner ? 'bg-tennis-green/10 text-tennis-green border border-tennis-green/20' : 'bg-zinc-900 text-zinc-600'}`}>
                        <User className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
