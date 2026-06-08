/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { PlayerStats, Match } from '../types';
import { Award, Trophy, Share2, Camera, Loader2 } from 'lucide-react';
import { toPng } from 'html-to-image';

interface RankingTabProps {
  standings: PlayerStats[];
  matches: Match[];
}

export default function RankingTab({ standings, matches }: RankingTabProps) {
  const totalMatches = matches.length;
  const completedMatches = matches.filter(m => m.played).length;
  const remainingMatches = totalMatches - completedMatches;
  
  const hasAnyPlayedMatches = completedMatches > 0;
  
  const leader = standings[0];
  const top3 = standings.slice(0, 3);

  // Calculate percentage progress
  const progressPercent = Math.round((completedMatches / totalMatches) * 100);

  // Sharing loading state
  const [isExporting, setIsExporting] = useState(false);

  const handleExportPNG = async () => {
    const targetElement = document.getElementById('share-standings-area');
    if (!targetElement) return;

    setIsExporting(true);
    try {
      // Small timeout to allow state rendering to settle
      await new Promise((resolve) => setTimeout(resolve, 300));
      
      const dataUrl = await toPng(targetElement, {
        cacheBust: true,
        backgroundColor: '#000000',
        style: {
          transform: 'scale(1)',
          padding: '16px',
        },
      });

      // Create download element triggers
      const downloadLink = document.createElement('a');
      downloadLink.download = `Vua_Tennis_Bip_BXH_2026.png`;
      downloadLink.href = dataUrl;
      downloadLink.click();
    } catch (err) {
      console.error('Failed to export image:', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      
      {/* EXPORT CONTAINER WRAPPER - This gets screenshotted */}
      <div id="share-standings-area" className="bg-black space-y-5 rounded-2xl p-4 border border-zinc-900">
        
        {/* BRAND HEADER INCLUDED IN IMAGE EXPORT */}
        <div className="border-b border-zinc-800/80 pb-4 pt-1 flex items-center space-x-3">
          <span className="text-2xl select-none">🏆</span>
          <div className="text-left">
            <h1 className="text-base font-black font-display text-white uppercase tracking-wider leading-none">
              Vua Tennis Bịp 2026
            </h1>
            <span className="text-[9px] text-tennis-green font-bold uppercase tracking-widest leading-none mt-1.5 block">
              Bảng xếp hạng chính thức
            </span>
          </div>
        </div>

        {/* SECTION: TOURNAMENT SUMMARY (TRANG CHỦ) */}
        <div id="tournament-overview-card" className="bg-tennis-dark border border-zinc-800/80 rounded-3xl p-5 shadow-xl space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xs font-semibold tracking-wider text-zinc-400 font-display uppercase">
              📊 Tổng Quan Giải Đấu
            </h2>
            <span className="text-xs bg-lime-400/10 text-tennis-green border border-tennis-green/30 px-2.5 py-0.5 rounded-full font-mono font-bold">
              Live
            </span>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-zinc-900/60 rounded-2xl p-3 border border-zinc-800/40 text-center">
              <div className="text-[10px] text-zinc-500 font-medium mb-1">Tổng Số Trận</div>
              <div className="text-lg font-bold font-display text-white">{totalMatches}</div>
            </div>
            <div className="bg-zinc-900/60 rounded-2xl p-3 border border-zinc-800/40 text-center">
              <div className="text-[10px] text-zinc-500 font-medium mb-1">Đã Đấu</div>
              <div className="text-lg font-bold font-display text-tennis-green">{completedMatches}</div>
            </div>
            <div className="bg-zinc-900/60 rounded-2xl p-3 border border-zinc-800/40 text-center">
              <div className="text-[10px] text-zinc-500 font-medium mb-1">Còn Lại</div>
              <div className="text-lg font-bold font-display text-zinc-400">{remainingMatches}</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs text-zinc-400">
              <span className="text-[11px]">Tiến độ giải đấu</span>
              <span className="font-mono font-bold text-tennis-green">{progressPercent}%</span>
            </div>
            <div className="w-full bg-zinc-900 h-2 rounded-full overflow-hidden border border-zinc-800/30">
              <div 
                className="bg-gradient-to-r from-lime-500 to-tennis-green h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* SECTION: TOP 3 SPOTLIGHT PODIUM - Only display if at least one match has been completed */}
        {hasAnyPlayedMatches && standings.length > 0 ? (
          <div className="space-y-3">
            <h2 className="text-[10px] font-semibold tracking-wider text-zinc-500 uppercase px-1 font-display">
              🏆 TOP 3 VUA BỊP LÂM THỜI
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Top 1 / Leader (Golden Glow) */}
              {top3[0] && (
                <div 
                  id="podium-gold"
                  className="relative bg-gradient-to-b from-yellow-950/30 to-black border-2 border-yellow-500/50 rounded-2xl p-4 flex items-center justify-between shadow-lg overflow-hidden group"
                >
                  {/* Visual Accent */}
                  <div className="absolute right-0 top-0 w-24 h-24 bg-yellow-500/10 rounded-full blur-2xl group-hover:scale-125 transition-transform" />
                  <div className="flex items-center space-x-3.5 z-10">
                    <div className="relative flex items-center justify-center w-11 h-11 rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                      <Trophy className="w-6 h-6 animate-pulse" />
                      <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-yellow-500 text-[10px] font-black text-black">
                        1
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center space-x-1.5">
                        <span className="font-display font-extrabold text-white text-base">
                          {top3[0].name}
                        </span>
                        <span className="text-[10px] bg-yellow-500/10 text-yellow-300 border border-yellow-500/20 px-1.5 py-0.5 rounded-sm font-semibold max-sm:hidden">
                          Đầu bảng
                        </span>
                      </div>
                      <div className="text-xs text-zinc-400 font-medium">
                        Bại tướng khiếp sợ • {top3[0].wins} thắng
                      </div>
                    </div>
                  </div>
                  <div className="text-right z-10">
                    <div className="text-xl font-black font-display text-yellow-400">{top3[0].points}đ</div>
                    <div className="text-[10px] text-zinc-500 font-mono">Hiệu số {top3[0].gameDiff > 0 ? `+${top3[0].gameDiff}` : top3[0].gameDiff}</div>
                  </div>
                </div>
              )}

              {/* Top 2 / Silver Badge */}
              {top3[1] && (
                <div 
                  id="podium-silver"
                  className="bg-zinc-900/80 border border-zinc-700/60 rounded-2xl p-4 flex items-center justify-between shadow-md"
                >
                  <div className="flex items-center space-x-3.5">
                    <div className="relative flex items-center justify-center w-10 h-10 rounded-full bg-zinc-400/10 text-zinc-300 border border-zinc-400/20">
                      <Award className="w-5.5 h-5.5 text-zinc-300" />
                      <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-zinc-400 text-[10px] font-bold text-black">
                        2
                      </span>
                    </div>
                    <div>
                      <span className="font-display font-bold text-zinc-100 text-sm">
                        {top3[1].name}
                      </span>
                      <div className="text-xs text-zinc-500">
                        {top3[1].wins} thắng • {top3[1].losses} thua
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold font-display text-zinc-300">{top3[1].points}đ</div>
                    <div className="text-[10px] text-zinc-500 font-mono">HS {top3[1].gameDiff > 0 ? `+${top3[1].gameDiff}` : top3[1].gameDiff}</div>
                  </div>
                </div>
              )}

              {/* Top 3 / Bronze Badge */}
              {top3[2] && (
                <div 
                  id="podium-bronze"
                  className="bg-zinc-900/80 border border-zinc-700/60 rounded-2xl p-4 flex items-center justify-between shadow-md"
                >
                  <div className="flex items-center space-x-3.5">
                    <div className="relative flex items-center justify-center w-10 h-10 rounded-full bg-amber-700/20 text-amber-500 border border-amber-500/20">
                      <Award className="w-5.5 h-5.5 text-amber-400" />
                      <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-600 text-[10px] font-bold text-black">
                        3
                      </span>
                    </div>
                    <div>
                      <span className="font-display font-bold text-amber-100 text-sm">
                        {top3[2].name}
                      </span>
                      <div className="text-xs text-zinc-500">
                        {top3[2].wins} thắng • {top3[2].losses} thua
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold font-display text-amber-400">{top3[2].points}đ</div>
                    <div className="text-[10px] text-zinc-500 font-mono">HS {top3[2].gameDiff > 0 ? `+${top3[2].gameDiff}` : top3[2].gameDiff}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* "CHƯA CÓ KẾT QUẢ THI ĐẤU" CALLOUT NOTICE CARD */
          <div className="bg-zinc-900/50 border border-dashed border-zinc-800 py-6 px-4 rounded-3xl text-center space-y-1.5 my-2">
            <span className="text-2xl block select-none">⏳</span>
            <h3 className="text-xs font-extrabold tracking-wide uppercase text-zinc-300">
              Chưa có kết quả thi đấu
            </h3>
            <p className="text-[10px] text-zinc-500 max-w-[280px] mx-auto leading-relaxed">
              Bảng xếp hạng và Top 3 vinh danh sẽ tự động xuất hiện sau khi trận đấu đầu tiên được lưu.
            </p>
          </div>
        )}

        {/* SECTION: DETAILED STANDINGS TABLE */}
        <div className="space-y-3">
          <div className="flex justify-between items-center px-1">
            <h2 className="text-[10px] font-semibold tracking-wider text-zinc-500 uppercase font-display">
              📈 BẢNG XẾP HẠNG CHI TIẾT
            </h2>
            
            {/* Share BXH via Image Exporter Button */}
            <button
              onClick={handleExportPNG}
              disabled={isExporting}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold bg-tennis-green text-black border border-lime-400 cursor-pointer active:scale-95 hover:bg-lime-400 disabled:opacity-50 transition-all font-sans"
            >
              {isExporting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Camera className="w-3.5 h-3.5" />
              )}
              <span>{isExporting ? 'Đang tạo...' : 'Chia sẻ BXH'}</span>
            </button>
          </div>

          {/* Table Container - fluid width min-w-0 optimized perfectly for iPhone screen layouts */}
          <div id="standings-table-container" className="bg-tennis-dark border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full text-left border-collapse min-w-0">
                <thead>
                  <tr className="border-b border-zinc-800 bg-zinc-900/50 text-[10px] uppercase tracking-wider text-zinc-400 font-bold h-11">
                    <th className="px-2.5 text-center w-11">Hạng</th>
                    <th className="px-2">Tên</th>
                    <th className="px-2 text-center w-12 text-tennis-green">Điểm</th>
                    <th className="px-2 text-center w-12">Thắng</th>
                    <th className="px-2 text-center w-11">Thua</th>
                    <th className="px-2 text-center w-20 hidden sm:table-cell text-zinc-500">Phân Số (T/B)</th>
                    <th className="px-3 text-center w-14">Hiệu số</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/80 font-sans text-[11px]">
                  {standings.map((p, index) => {
                    const isLeader = hasAnyPlayedMatches && index === 0;
                    const isTop3 = hasAnyPlayedMatches && index < 3;
                    
                    return (
                      <tr 
                        key={p.name}
                        className={`h-12 hover:bg-zinc-900/10 transition-colors ${
                          isLeader ? 'bg-tennis-green/[0.02] border-l-2 border-l-tennis-green' : ''
                        }`}
                      >
                        {/* Rank Column - Omit ranks when no matches are played (Không xếp hạng) */}
                        <td className="px-2.5 text-center">
                          {!hasAnyPlayedMatches ? (
                            <span className="text-xs font-mono font-black text-zinc-650 opacity-40">-</span>
                          ) : (
                            <>
                              {index === 0 && <span className="text-lg">🥇</span>}
                              {index === 1 && <span className="text-lg">🥈</span>}
                              {index === 2 && <span className="text-lg">🥉</span>}
                              {index >= 3 && (
                                <span className="text-[10px] font-mono font-bold text-zinc-400 bg-zinc-900/85 px-2 py-0.5 rounded-full">
                                  {p.rank}
                                </span>
                              )}
                            </>
                          )}
                        </td>

                        {/* Name Column */}
                        <td className="px-2">
                          <div className="flex items-center space-x-1.5">
                            <span className={`text-[12px] truncate ${isLeader ? 'font-black text-tennis-green' : isTop3 ? 'font-black text-white' : 'font-bold text-zinc-300'}`}>
                              {p.name}
                            </span>
                            {isLeader && (
                              <span className="inline-block w-1.5 h-1.5 rounded-full bg-tennis-green animate-pulse" />
                            )}
                          </div>
                        </td>

                        {/* Points Column */}
                        <td className="px-2 text-center text-[12px] font-black font-display text-tennis-green">
                          {p.points}
                        </td>

                        {/* Wins Column */}
                        <td className="px-2 text-center font-mono font-bold text-zinc-200">
                          {p.wins}
                        </td>

                        {/* Losses Column */}
                        <td className="px-2 text-center font-mono text-zinc-500">
                          {p.losses}
                        </td>

                        {/* Game record won-lost - Omitted entirely on mobile screens */}
                        <td className="px-2 text-center font-mono text-[10px] text-zinc-500 hidden sm:table-cell">
                          <span>{p.gamesWon}</span>
                          <span className="mx-0.5">/</span>
                          <span>{p.gamesLost}</span>
                        </td>

                        {/* Net game difference Column */}
                        <td className="px-3 text-center font-mono">
                          <span className={`px-1.5 py-0.5 rounded font-black text-[10px] ${
                            p.gameDiff > 0 
                              ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-500/10' 
                              : p.gameDiff < 0 
                              ? 'bg-rose-950/40 text-rose-400 border border-rose-500/10' 
                              : 'bg-zinc-900/70 text-zinc-500'
                          }`}>
                            {p.gameDiff > 0 ? `+${p.gameDiff}` : p.gameDiff}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Footnote on tie-breakers */}
          <p className="text-[9px] text-zinc-500 leading-relaxed italic px-1.5">
            * Điểm số &gt; Hiệu số game &gt; Đối đầu &gt; Tổng game thắng. <br />
            Thắng được 3đ, thua được 1đ (khuyến khích ra sân giao hữu bịp).
          </p>
        </div>
      </div>
    </div>
  );
}
