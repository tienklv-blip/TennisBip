/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Match, ValidScoreString } from '../types';
import { Search, CheckCircle, Zap, ShieldAlert, Award, X } from 'lucide-react';

interface InputResultTabProps {
  unplayedMatches: Match[];
  players: string[];
  preSelectedMatchId?: string | null;
  onClearPreSelected?: () => void;
  onSaveResult: (
    matchId: string,
    score1: number,
    score2: number,
    winner: string,
    isTieBreak: boolean
  ) => void;
}

export default function InputResultTab({ unplayedMatches, players, preSelectedMatchId, onClearPreSelected, onSaveResult }: InputResultTabProps) {
  const [selectedPlayerFilter, setSelectedPlayerFilter] = useState<string>('');
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  
  // Track currently selected outcome
  const [selectedWinner, setSelectedWinner] = useState<string | null>(null);
  const [selectedScoreLabel, setSelectedScoreLabel] = useState<ValidScoreString | null>(null);

  // Auto select preselected match
  React.useEffect(() => {
    if (preSelectedMatchId) {
      const found = unplayedMatches.find(m => m.id === preSelectedMatchId);
      if (found) {
        setSelectedMatch(found);
        setSelectedWinner(null);
        setSelectedScoreLabel(null);
      }
      if (onClearPreSelected) {
        onClearPreSelected();
      }
    }
  }, [preSelectedMatchId, unplayedMatches, onClearPreSelected]);

  // Filter matches based on player filter
  const filteredMatches = useMemo(() => {
    if (!selectedPlayerFilter) return unplayedMatches;
    return unplayedMatches.filter(
      m => m.player1 === selectedPlayerFilter || m.player2 === selectedPlayerFilter
    );
  }, [unplayedMatches, selectedPlayerFilter]);

  // Available scores
  const SCORES: { label: ValidScoreString; winnerGames: number; loserGames: number; isTb: boolean }[] = [
    { label: '6-0', winnerGames: 6, loserGames: 0, isTb: false },
    { label: '6-1', winnerGames: 6, loserGames: 1, isTb: false },
    { label: '6-2', winnerGames: 6, loserGames: 2, isTb: false },
    { label: '6-3', winnerGames: 6, loserGames: 3, isTb: false },
    { label: '6-4', winnerGames: 6, loserGames: 4, isTb: false },
    { label: '6-5(TB)', winnerGames: 6, loserGames: 5, isTb: true },
  ];

  const handleMatchSelect = (match: Match) => {
    setSelectedMatch(match);
    setSelectedWinner(null);
    setSelectedScoreLabel(null);
  };

  const handleSelectOutcome = (winnerName: string, label: ValidScoreString) => {
    setSelectedWinner(winnerName);
    setSelectedScoreLabel(label);
  };

  const handleSave = () => {
    if (!selectedMatch || !selectedWinner || !selectedScoreLabel) return;

    const findScore = SCORES.find(s => s.label === selectedScoreLabel);
    if (!findScore) return;

    const isPlayer1Winner = selectedWinner === selectedMatch.player1;
    
    const s1 = isPlayer1Winner ? findScore.winnerGames : findScore.loserGames;
    const s2 = isPlayer1Winner ? findScore.loserGames : findScore.winnerGames;

    // Trigger parent callback
    onSaveResult(selectedMatch.id, s1, s2, selectedWinner, findScore.isTb);

    // Clean local UI states
    setSelectedMatch(null);
    setSelectedWinner(null);
    setSelectedScoreLabel(null);
  };

  return (
    <div className="space-y-6 pb-24">
      
      {/* 2. POPUP MODAL FOR DIRECT SCORE ENTRY */}
      {selectedMatch ? (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div 
            id="match-scoring-popup" 
            className="bg-zinc-900 border-2 border-tennis-green rounded-3xl p-5 w-full max-w-sm space-y-5 shadow-[0_0_30px_rgba(194,251,52,0.2)]"
          >
            {/* Header / Info segment */}
            <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
              <span className="text-zinc-400 text-xs font-mono font-bold uppercase tracking-wider">
                Vòng {selectedMatch.round} • {selectedMatch.leg === 1 ? 'Lượt đi' : 'Lượt về'}
              </span>
              <button 
                onClick={() => setSelectedMatch(null)}
                className="text-zinc-400 hover:text-white p-1 rounded-full bg-zinc-800/80 active:scale-90 transition-transform"
                title="Đóng"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Match title */}
            <div className="text-center space-y-1">
              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest block">Trận đấu</span>
              <h2 className="text-lg font-extrabold text-white flex items-center justify-center space-x-2">
                <span>{selectedMatch.player1}</span>
                <span className="text-tennis-green text-xs font-semibold px-2 py-0.5 bg-tennis-green/10 rounded-full">VS</span>
                <span>{selectedMatch.player2}</span>
              </h2>
            </div>

            {/* Dual Score Picker Columns */}
            <div className="grid grid-cols-2 gap-3.5 pt-2">
              
              {/* Left Column: Player 1 (Selected Match Player 1 Thắng) */}
              <div className="space-y-2">
                <div className={`text-center py-2 px-1.5 rounded-xl border truncate ${
                  selectedWinner === selectedMatch.player1 
                    ? 'bg-tennis-green/10 text-tennis-green border-tennis-green/45' 
                    : 'bg-zinc-950 text-zinc-400 border-zinc-800/60'
                }`}>
                  <span className="text-xs font-black tracking-tight">{selectedMatch.player1} thắng</span>
                </div>
                
                <div className="flex flex-col gap-1.5">
                  {SCORES.map((scoreItem) => {
                    const isSelected = selectedWinner === selectedMatch.player1 && selectedScoreLabel === scoreItem.label;
                    return (
                      <button
                        key={`p1-${scoreItem.label}`}
                        type="button"
                        onClick={() => handleSelectOutcome(selectedMatch.player1, scoreItem.label)}
                        className={`py-2 px-1 rounded-xl text-center border font-display text-xs font-black transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-tennis-green text-black border-tennis-green shadow-md scale-[1.03]'
                            : 'bg-zinc-950 border-zinc-800/70 text-zinc-300 hover:bg-zinc-800'
                        }`}
                      >
                        {scoreItem.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Right Column: Player 2 (Selected Match Player 2 Thắng) */}
              <div className="space-y-2">
                <div className={`text-center py-2 px-1.5 rounded-xl border truncate ${
                  selectedWinner === selectedMatch.player2 
                    ? 'bg-tennis-green/10 text-tennis-green border-tennis-green/45' 
                    : 'bg-zinc-950 text-zinc-400 border-zinc-800/60'
                }`}>
                  <span className="text-xs font-black tracking-tight">{selectedMatch.player2} thắng</span>
                </div>

                <div className="flex flex-col gap-1.5">
                  {SCORES.map((scoreItem) => {
                    const isSelected = selectedWinner === selectedMatch.player2 && selectedScoreLabel === scoreItem.label;
                    return (
                      <button
                        key={`p2-${scoreItem.label}`}
                        type="button"
                        onClick={() => handleSelectOutcome(selectedMatch.player2, scoreItem.label)}
                        className={`py-2 px-1 rounded-xl text-center border font-display text-xs font-black transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-tennis-green text-black border-tennis-green shadow-md scale-[1.03]'
                            : 'bg-zinc-950 border-zinc-800/70 text-zinc-300 hover:bg-zinc-800'
                        }`}
                      >
                        {scoreItem.label}
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* Confirm Details & Action Trigger */}
            <div className="pt-3 border-t border-zinc-800 space-y-3">
              {selectedWinner && selectedScoreLabel ? (
                <div className="bg-zinc-950 border border-zinc-800/80 px-3.5 py-3 rounded-2xl text-center space-y-1 animate-fade-in">
                  <span className="text-[10px] text-zinc-500 font-bold block uppercase">Ghi nhận:</span>
                  <div className="text-xs text-zinc-200">
                    <span className="text-tennis-green font-black">{selectedWinner}</span> thắng <span className="font-extrabold text-white">{selectedScoreLabel}</span>
                  </div>
                </div>
              ) : (
                <div className="text-center text-zinc-500 text-xs py-2">
                  👉 Vui lòng chọn tỷ số của một trong hai người chơi ở trên.
                </div>
              )}

              <button
                type="button"
                onClick={handleSave}
                disabled={!selectedWinner || !selectedScoreLabel}
                className="w-full bg-tennis-green disabled:opacity-30 text-black font-display font-extrabold text-sm py-4 rounded-xl shadow-lg border border-lime-400 cursor-pointer flex items-center justify-center space-x-2"
              >
                <CheckCircle className="w-4 h-4 text-black stroke-[3]" />
                <span>LƯU KẾT QUẢ</span>
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* MATCH PICKER LIST SECTION (UNCOMPLETED MATCHES) */}
      {!selectedMatch && (
        <div className="space-y-4">
          <div className="flex flex-col gap-3">
            <h2 className="text-sm font-semibold tracking-wider text-zinc-400 font-display uppercase px-1">
              🎾 CHỌN TRẬN ĐẤU NHẬP KẾT QUẢ
            </h2>

            {/* Quick Filter Bar by Player */}
            <div className="relative flex items-center bg-zinc-950 rounded-2xl">
              <span className="absolute left-3.5 text-zinc-400">
                <Search className="w-4 h-4" />
              </span>
              <select
                value={selectedPlayerFilter}
                onChange={(e) => setSelectedPlayerFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-3.5 bg-zinc-900 text-zinc-200 text-sm font-semibold rounded-2xl border border-zinc-850 focus:outline-none focus:ring-1 focus:ring-tennis-green/60 appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23a1a1aa%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:1rem] bg-[right_1rem_center] bg-no-repeat"
              >
                <option value="">Lọc theo người chơi (Tất cả)</option>
                {players.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
          </div>

          {/* List display */}
          {filteredMatches.length === 0 ? (
            <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-8 text-center text-zinc-500 space-y-2">
              <ShieldAlert className="w-8 h-8 text-zinc-600 mx-auto" />
              <div className="text-sm font-semibold">Tất cả trận đấu đã được đấu!</div>
              <div className="text-xs">Chuyển sang Quản trị hoặc Lịch thi đấu để xem chi tiết.</div>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[50vh] overflow-y-auto pr-1 no-scrollbar">
              {filteredMatches.map((m) => (
                <button
                  key={m.id}
                  onClick={() => handleMatchSelect(m)}
                  className="w-full bg-zinc-900/80 hover:bg-zinc-900/40 border border-zinc-800/80 active:border-zinc-700 p-4 rounded-2xl flex items-center justify-between text-left transition-all hover:scale-[1.01] cursor-pointer"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2 text-[10px] font-mono font-bold text-zinc-500">
                      <span>Vòng {m.round}</span>
                      <span>•</span>
                      <span>{m.leg === 1 ? 'Lượt đi' : 'Lượt về'}</span>
                    </div>
                    {/* Players Matchup */}
                    <div className="text-base font-extrabold text-zinc-100 flex items-center space-x-2">
                      <span className="text-white">{m.player1}</span>
                      <span className="text-lime-500 font-normal px-1 text-xs">vs</span>
                      <span className="text-white">{m.player2}</span>
                    </div>
                  </div>

                  {/* Play Action Badge */}
                  <div className="flex items-center space-x-2 bg-tennis-green/10 text-tennis-green px-3 py-1.5 rounded-xl border border-tennis-green/20">
                    <Zap className="w-3.5 h-3.5 fill-tennis-green text-tennis-green" />
                    <span className="text-xs font-bold leading-none">⚡ Chơi</span>
                  </div>
                </button>
              ))}
            </div>
          )}

          <div className="text-center">
            <span className="text-[11px] font-medium text-zinc-500 font-sans">
              🔥 Hiển thị {filteredMatches.length} trận đấu chưa hoàn thành
            </span>
          </div>
        </div>
      )}

    </div>
  );
}
