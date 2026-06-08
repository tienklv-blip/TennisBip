/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Match, PlayerStats, TabName } from './types';
import { TENNIS_PLAYERS, generateSchedule, calculateStandings } from './utils/tennis';
import RankingTab from './components/RankingTab';
import InputResultTab from './components/InputResultTab';
import ScheduleTab from './components/ScheduleTab';
import AdminPanel from './components/AdminPanel';
import { Trophy, Swords, Calendar, Settings, Info, CheckCircle2, ChevronRight, Zap } from 'lucide-react';

const LOCAL_STORAGE_KEY = 'vtb_matches_2026';

export default function App() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [activeTab, setActiveTab] = useState<TabName>('bxh');
  const [showAdmin, setShowAdmin] = useState<boolean>(false);
  const [selectedMatchIdForScoring, setSelectedMatchIdForScoring] = useState<string | null>(null);
  
  // Toast notifications state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Redirection when tapping ⚡ Chơi on other tabs
  const handlePlayMatchRedirection = (matchId: string) => {
    setSelectedMatchIdForScoring(matchId);
    setActiveTab('nhap-kq');
  };

  // Initialize schedules on load
  useEffect(() => {
    const rawData = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (rawData) {
      try {
        setMatches(JSON.parse(rawData));
      } catch (e) {
        console.error('Failed to parse local tennis storage, regenerating.', e);
        const newFixtures = generateSchedule(TENNIS_PLAYERS);
        setMatches(newFixtures);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newFixtures));
      }
    } else {
      const newFixtures = generateSchedule(TENNIS_PLAYERS);
      setMatches(newFixtures);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newFixtures));
    }
  }, []);

  // Utility to show temporary iOS style banner toasts
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  // Recalculate standings on-the-fly dynamically
  const standings = useMemo(() => {
    return calculateStandings(TENNIS_PLAYERS, matches);
  }, [matches]);

  // Played vs unplayed lists for clean component feed segregation
  const { unplayedMatches, playedMatches } = useMemo(() => {
    const unplayed = matches.filter(m => !m.played);
    const played = matches.filter(m => m.played);
    return { unplayedMatches: unplayed, playedMatches: played };
  }, [matches]);

  // Action: Save new match result
  const handleSaveResult = (
    matchId: string,
    score1: number,
    score2: number,
    winner: string,
    isTieBreak: boolean
  ) => {
    const updated = matches.map(m => {
      if (m.id === matchId) {
        return {
          ...m,
          score1,
          score2,
          played: true,
          winner,
          isTieBreak,
          playedAt: new Date().toISOString(),
        };
      }
      return m;
    });

    setMatches(updated);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    triggerToast(`🏆 Đã lưu kết quả trận đấu thành công!`);
    
    // Auto jump to standings so players see rankings adjust instantly
    setTimeout(() => {
      setActiveTab('bxh');
    }, 500);
  };

  // Action: Reset entire tournament
  const handleResetSeason = () => {
    const freshFixtures = generateSchedule(TENNIS_PLAYERS);
    setMatches(freshFixtures);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(freshFixtures));
    triggerToast('🧹 Đã dọn sạch giải đấu & thiết lập lịch 56 trận rỗng!');
    setActiveTab('bxh');
    setShowAdmin(false);
  };

  // Action: Clear (Delete) a match result
  const handleClearMatchResult = (matchId: string) => {
    const updated = matches.map(m => {
      if (m.id === matchId) {
        return {
          ...m,
          score1: null,
          score2: null,
          played: false,
          winner: null,
          isTieBreak: false,
          playedAt: null,
        };
      }
      return m;
    });

    setMatches(updated);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    triggerToast('🗑️ Đã xoá kết quả trận đấu!');
  };

  // Action: Update/Edit an entered match result
  const handleUpdateMatchResult = (
    matchId: string,
    score1: number,
    score2: number,
    winner: string,
    isTieBreak: boolean
  ) => {
    const updated = matches.map(m => {
      if (m.id === matchId) {
        return {
          ...m,
          score1,
          score2,
          played: true,
          winner,
          isTieBreak,
          playedAt: new Date().toISOString(),
        };
      }
      return m;
    });

    setMatches(updated);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    triggerToast('✏️ Đã cập nhật kết quả thành công!');
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-tennis-green selection:text-black">
      
      {/* GLOBAL TOAST ALERTS DIALOG */}
      {toastMessage && (
        <div className="fixed top-8 left-4 right-4 z-50 flex justify-center pointer-events-none animate-bounce">
          <div className="bg-zinc-900/95 border border-tennis-green text-zinc-100 px-5 py-3.5 rounded-2xl shadow-[0_4px_25px_rgba(194,251,52,0.18)] flex items-center space-x-2.5 max-w-sm">
            <CheckCircle2 className="w-5.5 h-5.5 text-tennis-green shrink-0" />
            <span className="text-xs font-bold leading-normal">{toastMessage}</span>
          </div>
        </div>
      )}

      {/* ADMIN CONTROLS OVERLAY DRAWER */}
      {showAdmin && (
        <AdminPanel
          playedMatches={playedMatches}
          onResetSeason={handleResetSeason}
          onClearMatchResult={handleClearMatchResult}
          onUpdateMatchResult={handleUpdateMatchResult}
          onClose={() => setShowAdmin(false)}
        />
      )}

      {/* MAIN CONTAINER OPTIMIZED FOR APP PORTRAIT SCREEN LAYOUTS */}
      <main className="max-w-md mx-auto min-h-screen px-4 pt-14 pb-28 relative flex flex-col space-y-6">
        
        {/* APP CORE STATUS BRANDING HEADER */}
        <header className="space-y-2 mt-4">
          <div className="flex justify-between items-start">
            <div>
              {/* Crown Symbol Title */}
              <div className="flex items-center space-x-1.5">
                <span className="text-2xl">👑</span>
                <h1 className="text-2xl font-black font-display tracking-tight text-white uppercase bg-gradient-to-r from-white via-zinc-100 to-tennis-green bg-clip-text">
                  VUA TENNIS BỊP
                </h1>
                <span className="bg-tennis-green text-black text-[10px] uppercase font-black px-1.5 py-0.5 rounded-md leading-none h-4.5 flex items-center">
                  2026
                </span>
              </div>
              <p className="text-[10px] text-zinc-500 font-bold select-none uppercase tracking-wide">
                Hội tennis đơn nội bộ tranh vị - 8 Tay vợt
              </p>
            </div>

            {/* Apple Gear Settings Button */}
            <button
              onClick={() => setShowAdmin(true)}
              className="p-3 bg-zinc-900 border border-zinc-800 rounded-2xl active:bg-zinc-800 text-zinc-400 hover:text-tennis-green active:scale-90 transition-transform cursor-pointer"
              title="Quản trị giải đấu"
            >
              <Settings className="w-5 h-5 text-zinc-400 stroke-[2.2]" />
            </button>
          </div>

          {/* Slogan Banner */}
          <div className="bg-gradient-to-r from-tennis-dark via-zinc-950 to-tennis-dark border border-zinc-900 px-4 py-3 rounded-2xl">
            <p className="text-[11px] font-medium italic text-zinc-400 text-center leading-relaxed">
              “Đánh hay chưa chắc vô địch, đánh bịp mới có cơ hội.”
            </p>
          </div>
        </header>

        {/* ACTIVE MODULE CONTAINER TABS */}
        <section className="flex-1">
          {activeTab === 'bxh' && (
            <RankingTab standings={standings} matches={matches} />
          )}
          {activeTab === 'nhap-kq' && (
            <InputResultTab 
              unplayedMatches={unplayedMatches} 
              players={TENNIS_PLAYERS}
              preSelectedMatchId={selectedMatchIdForScoring}
              onClearPreSelected={() => setSelectedMatchIdForScoring(null)}
              onSaveResult={handleSaveResult} 
            />
          )}
          {activeTab === 'lich-dau' && (
            <ScheduleTab 
              matches={matches} 
              players={TENNIS_PLAYERS} 
              onPlayMatch={handlePlayMatchRedirection}
            />
          )}
        </section>

        {/* FLOATING BOTTOM IOS-STYLE MAIN NAVIGATION BAR */}
        <nav className="fixed bottom-6 left-4 right-4 max-w-md mx-auto z-40 bg-zinc-950/95 backdrop-blur-md rounded-2xl border border-zinc-800 shadow-[0_10px_30px_rgba(0,0,0,0.8)] px-2.5 py-2.5">
          <div className="grid grid-cols-3 gap-2 text-center h-14">
            
            {/* Tab 1: Ranking (BXH) */}
            <button
              onClick={() => setActiveTab('bxh')}
              className={`flex flex-col items-center justify-center rounded-xl transition-all ${
                activeTab === 'bxh'
                  ? 'bg-tennis-green/10 text-tennis-green font-extrabold'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <Trophy className={`w-5.2 h-5.2 mb-0.5 ${activeTab === 'bxh' ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
              <span className="text-[10px] font-bold uppercase tracking-wider">🏆 BXH</span>
            </button>

            {/* Tab 2: Write Score (Nhập KQ) */}
            <button
              onClick={() => setActiveTab('nhap-kq')}
              className={`flex flex-col items-center justify-center rounded-xl transition-all relative ${
                activeTab === 'nhap-kq'
                  ? 'bg-tennis-green/10 text-tennis-green font-extrabold'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {unplayedMatches.length > 0 && (
                <span className="absolute top-2 right-6 flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-tennis-green opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-tennis-green"></span>
                </span>
              )}
              <Swords className={`w-5.2 h-5.2 mb-0.5 ${activeTab === 'nhap-kq' ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
              <span className="text-[10px] font-bold uppercase tracking-wider">🎾 Nhập KQ</span>
            </button>

            {/* Tab 3: Fixture (Lịch Đấu) */}
            <button
              onClick={() => setActiveTab('lich-dau')}
              className={`flex flex-col items-center justify-center rounded-xl transition-all ${
                activeTab === 'lich-dau'
                  ? 'bg-tennis-green/10 text-tennis-green font-extrabold'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <Calendar className={`w-5.2 h-5.2 mb-0.5 ${activeTab === 'lich-dau' ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
              <span className="text-[10px] font-bold uppercase tracking-wider">📅 Lịch</span>
            </button>

          </div>
        </nav>

      </main>
    </div>
  );
}
