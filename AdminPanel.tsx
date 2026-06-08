/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Match, ValidScoreString } from '../types';
import { Settings, RefreshCw, Trash2, Edit2, AlertTriangle, ShieldCheck, XCircle, ChevronRight, Award, Trash } from 'lucide-react';

interface AdminPanelProps {
  playedMatches: Match[];
  onResetSeason: () => void;
  onClearMatchResult: (matchId: string) => void;
  onUpdateMatchResult: (
    matchId: string,
    score1: number,
    score2: number,
    winner: string,
    isTieBreak: boolean
  ) => void;
  onClose: () => void;
}

export default function AdminPanel({
  playedMatches,
  onResetSeason,
  onClearMatchResult,
  onUpdateMatchResult,
  onClose,
}: AdminPanelProps) {
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const [editingMatch, setEditingMatch] = useState<Match | null>(null);
  const [editWinner, setEditWinner] = useState<string | null>(null);
  const [editScoreLabel, setEditScoreLabel] = useState<ValidScoreString | null>(null);

  const SCORES: { label: ValidScoreString; winnerGames: number; loserGames: number; isTb: boolean }[] = [
    { label: '6-0', winnerGames: 6, loserGames: 0, isTb: false },
    { label: '6-1', winnerGames: 6, loserGames: 1, isTb: false },
    { label: '6-2', winnerGames: 6, loserGames: 2, isTb: false },
    { label: '6-3', winnerGames: 6, loserGames: 3, isTb: false },
    { label: '6-4', winnerGames: 6, loserGames: 4, isTb: false },
    { label: '6-5(TB)', winnerGames: 6, loserGames: 5, isTb: true },
  ];

  const handleEditInit = (match: Match) => {
    setEditingMatch(match);
    setEditWinner(match.winner || match.player1);
    
    // Reverse determine current label
    const maxScore = Math.max(match.score1 || 0, match.score2 || 0);
    const minScore = Math.min(match.score1 || 0, match.score2 || 0);

    if (match.isTieBreak) {
      setEditScoreLabel('6-5(TB)');
    } else {
      const label = `6-${minScore}` as ValidScoreString;
      setEditScoreLabel(label);
    }
  };

  const handleEditSave = () => {
    if (!editingMatch || !editWinner || !editScoreLabel) return;

    const selectedConfig = SCORES.find(s => s.label === editScoreLabel);
    if (!selectedConfig) return;

    const isP1Winner = editWinner === editingMatch.player1;
    const s1 = isP1Winner ? selectedConfig.winnerGames : selectedConfig.loserGames;
    const s2 = isP1Winner ? selectedConfig.loserGames : selectedConfig.winnerGames;

    onUpdateMatchResult(editingMatch.id, s1, s2, editWinner, selectedConfig.isTb);
    setEditingMatch(null);
    setEditWinner(null);
    setEditScoreLabel(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/95 overflow-y-auto font-sans safe-pt safe-pb p-5 space-y-6">
      
      {/* HEADER BAR */}
      <div className="flex justify-between items-center border-b border-zinc-800 pb-4">
        <div className="flex items-center space-x-2">
          <Settings className="w-5 h-5 text-tennis-green animate-spin-slow" />
          <h1 className="text-xl font-black font-display tracking-tight text-white">
            QUẢN TRỊ VIÊN
          </h1>
        </div>
        <button
          onClick={onClose}
          className="text-xs bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 active:scale-95 text-zinc-300 font-bold px-4 py-2 rounded-xl cursor-pointer"
        >
          Đóng (X)
        </button>
      </div>

      {/* DANGGER SELECTION: SEASON RESET */}
      <div className="bg-zinc-950 border border-red-950/80 rounded-2xl p-4.5 space-y-3 shadow-md">
        <div className="flex items-center space-x-2 text-red-400">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <h2 className="text-xs font-bold uppercase tracking-wider font-display">
            VÙNG NGUY HIỂM (CẨN THẬN)
          </h2>
        </div>
        <p className="text-xs text-zinc-400 leading-normal">
          Xóa sạch toàn bộ lịch đấu cũ, tạo mới 14 vòng đấu rỗng cho 8 tay vợt. Mọi dữ liệu đã chơi sẽ bốc hơi.
        </p>
        
        {showConfirmReset ? (
          <div className="bg-red-950/25 border border-red-800/40 rounded-xl p-3.5 space-y-3">
            <p className="text-xs font-bold text-red-400 text-center uppercase tracking-wide">
              ⚠️ ĐIỀU NÀY KHÔNG THỂ KHÔI PHỤC! XỬ TRÍ CHẮC CHẮN CHƯA?
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setShowConfirmReset(false)}
                className="bg-zinc-900 text-zinc-300 font-bold text-xs py-2.5 rounded-lg border border-zinc-800"
              >
                Không, Huỷ bỏ
              </button>
              <button
                onClick={() => {
                  onResetSeason();
                  setShowConfirmReset(false);
                }}
                className="bg-red-600 text-white font-extrabold text-xs py-2.5 rounded-lg border border-red-500 hover:bg-red-700"
              >
                Tôi chắc chắn, Reset!
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowConfirmReset(true)}
            className="w-full bg-red-950/10 hover:bg-red-950/40 border border-red-900 text-red-400 font-bold text-xs py-3 rounded-xl flex items-center justify-center space-x-1.5 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>RESET TOÀN BỘ MÙA GIẢI DISK</span>
          </button>
        )}
      </div>

      {/* EDITING INTERACTIVE MODAL COMPONENT */}
      {editingMatch && (
        <div id="editing-overlay" className="bg-zinc-900/90 border border-tennis-green rounded-2xl p-4.5 space-y-5">
          <div className="flex justify-between items-center pb-2 border-b border-zinc-800">
            <span className="text-xs font-bold text-zinc-400 uppercase">Chỉnh Sửa Trận Đấu</span>
            <button 
              onClick={() => setEditingMatch(null)}
              className="text-zinc-500 scale-90 px-1 hover:text-zinc-300"
            >
              <XCircle className="w-5 h-5" />
            </button>
          </div>

          {/* Winner Edit select */}
          <div className="space-y-2">
            <span className="text-[10px] text-zinc-500 font-bold uppercase block px-1">1. Chọn đấu thủ thắng</span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setEditWinner(editingMatch.player1)}
                className={`py-3.5 rounded-xl text-center border-2 leading-tight transition-all font-bold text-xs truncate max-w-full relative ${
                  editWinner === editingMatch.player1
                    ? 'bg-tennis-green/10 border-tennis-green text-tennis-green'
                    : 'bg-zinc-950 border-zinc-900 text-zinc-500'
                }`}
              >
                {editingMatch.player1}
              </button>
              <button
                type="button"
                onClick={() => setEditWinner(editingMatch.player2)}
                className={`py-3.5 rounded-xl text-center border-2 leading-tight transition-all font-bold text-xs truncate max-w-full relative ${
                  editWinner === editingMatch.player2
                    ? 'bg-tennis-green/10 border-tennis-green text-tennis-green'
                    : 'bg-zinc-950 border-zinc-900 text-zinc-500'
                }`}
              >
                {editingMatch.player2}
              </button>
            </div>
          </div>

          {/* Score Edit Select */}
          <div className="space-y-2">
            <span className="text-[10px] text-zinc-500 font-bold uppercase block px-1">2. Chọn tỷ số mới</span>
            <div className="grid grid-cols-3 gap-2">
              {SCORES.map(s => (
                <button
                  key={s.label}
                  type="button"
                  onClick={() => setEditScoreLabel(s.label)}
                  className={`py-3.5 rounded-xl font-bold font-display text-xs border leading-none ${
                    editScoreLabel === s.label
                      ? 'bg-tennis-green text-black border-tennis-green'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-300'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleEditSave}
            disabled={!editWinner || !editScoreLabel}
            className="w-full bg-tennis-green text-black font-display font-extrabold text-xs py-3.5 rounded-xl flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50"
          >
            <ShieldCheck className="w-4 h-4 text-black" />
            <span>CẬP NHẬT KẾT QUẢ</span>
          </button>
        </div>
      )}

      {/* COMPLETED FIXTURES MANAGEMENT LIST */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold tracking-wider text-zinc-500 uppercase font-display block px-1">
          🔨 QUẢN LÝ CÁC TRẬN ĐÃ ĐẤU ({playedMatches.length})
        </h2>

        {playedMatches.length === 0 ? (
          <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-2xl py-12 px-6 text-center text-zinc-500 space-y-1">
            <ShieldCheck className="w-7 h-7 text-zinc-600 mx-auto" />
            <div className="text-sm font-semibold">Chưa có trận đấu nào được đấu</div>
            <div className="text-xs">Tiến hành đấu và lưu kết quả trước khi chỉnh sửa.</div>
          </div>
        ) : (
          <div className="space-y-2.5 max-h-[50vh] overflow-y-auto pr-1 no-scrollbar">
            {playedMatches.map(m => (
              <div
                key={m.id}
                className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-4.5 flex items-center justify-between"
              >
                <div className="space-y-1.5 w-[55%]">
                  <span className="text-[9px] font-mono font-bold text-zinc-500 bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800">
                    R{m.round} • {m.leg === 1 ? 'Lđi' : 'Lve'}
                  </span>
                  
                  {/* Match Matchups with Score Highlight */}
                  <div className="text-xs font-bold text-zinc-300 space-y-0.5 truncate">
                    <div className="flex items-center space-x-1">
                      <span className={m.winner === m.player1 ? 'text-white' : 'text-zinc-500'}>{m.player1}</span>
                      <span className="text-zinc-600 text-[10px] font-normal font-sans">vs</span>
                      <span className={m.winner === m.player2 ? 'text-white' : 'text-zinc-500'}>{m.player2}</span>
                    </div>
                    {/* Raw score */}
                    <div className="text-[11px] font-display font-black text-tennis-green">
                      Tỷ số: {m.score1}-{m.score2} {m.isTieBreak ? '(TB)' : ''}
                    </div>
                  </div>
                </div>

                {/* Operations Buttons */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleEditInit(m)}
                    className="p-3 bg-zinc-900 border border-zinc-800 active:bg-zinc-800 rounded-xl text-zinc-400 hover:text-tennis-green transition-transform active:scale-95 cursor-pointer"
                    title="Chỉnh sửa tỷ số"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => {
                      if (confirm(`Bạn có chắc muốn xoá kết quả trận đấu giữa ${m.player1} và ${m.player2}? Trận này sẽ trở thành chưa đấu.`)) {
                        onClearMatchResult(m.id);
                      }
                    }}
                    className="p-3 bg-zinc-900 border border-zinc-800 active:bg-zinc-800 rounded-xl text-zinc-500 hover:text-red-500 transition-transform active:scale-95 cursor-pointer"
                    title="Xoá kết quả"
                  >
                    <Trash className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
