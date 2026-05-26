/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Game, BetSelection } from "../types";
import { StandingsTable } from "./StandingsTable";
import { 
  Tv, 
  Clock, 
  Award, 
  Flame, 
  Calendar,
  Sparkles,
  ArrowUpRight,
  ListFilter,
  BarChart4
} from "lucide-react";

interface HomeMainProps {
  games: Game[];
  loading: boolean;
  selectedLeague: string | null;
  onOddsSelect: (game: Game, market: string, selection: string, odds: number) => void;
  onOpenBetBuilder: (game: Game) => void;
  selectedSelections: BetSelection[];
}

export const HomeMain: React.FC<HomeMainProps> = ({
  games,
  loading,
  selectedLeague,
  onOddsSelect,
  onOpenBetBuilder,
  selectedSelections,
}) => {
  const [activeTab, setActiveTab] = useState<"TODOS" | "LIVE" | "UPCOMING">("TODOS");
  const [viewMode, setViewMode] = useState<"JOGOS" | "TABELA">("JOGOS");

  // Helper to restrict matches to Today (Hoje) and Tomorrow (Amanhã) only
  const isTodayOrTomorrow = (dateStr: string) => {
    try {
      const gDate = new Date(dateStr);
      const today = new Date();
      const tomorrow = new Date();
      tomorrow.setDate(today.getDate() + 1);

      const isSameDate = (d1: Date, d2: Date) => {
        return d1.getFullYear() === d2.getFullYear() &&
               d1.getMonth() === d2.getMonth() &&
               d1.getDate() === d2.getDate();
      };

      // Also include matches that are live right now
      const isPastButRecent = gDate.getTime() < today.getTime() && (today.getTime() - gDate.getTime()) < 4 * 3600000;

      return isSameDate(gDate, today) || isSameDate(gDate, tomorrow) || isPastButRecent;
    } catch {
      return true; // safe fallback
    }
  };

  // Filter games based on selected league & active tab
  const filteredGames = games.filter((game) => {
    // 1. Strictly show games of the current and next day only
    if (!isTodayOrTomorrow(game.date)) return false;

    // 2. League Filter
    if (selectedLeague && game.league !== selectedLeague) return false;

    // 3. Tab Filter
    if (activeTab === "LIVE" && game.status !== "LIVE") return false;
    if (activeTab === "UPCOMING" && game.status !== "SCHEDULED") return false;

    return true;
  });

  const isSelected = (gameId: string, selection: string) => {
    return selectedSelections.some(
      (s) => s.gameId === gameId && s.selection === selection
    );
  };

  const formatDate = (isoStr: string) => {
    try {
      const d = new Date(isoStr);
      return d.toLocaleString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (e) {
      return isoStr;
    }
  };

  return (
    <div id="sport-feed" className="flex-1 bg-slate-900/10 p-4 md:p-6 space-y-5 font-sans overflow-y-auto">
      
      {/* Dynamic Filter Banner */}
      <div className="purple-gradient-glow flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-5 rounded-2xl border border-blue-900/35 bg-[#0F172A]/90">
        <div>
          <span className="text-[10px] font-mono tracking-widest text-[#F8FAFC] font-extrabold uppercase bg-blue-600 px-3 py-1 rounded-full border border-blue-400/40">
            MERCADO ESPORTIVO VERIFICADO
          </span>
          <h1 className="font-display font-black text-2xl text-white mt-2.5 pl-0.5">
            {selectedLeague ? `${selectedLeague}` : "Jogos em Destaque"}
          </h1>
          <p className="text-xs text-blue-350 text-slate-300 pl-0.5 mt-1 font-sans">
            As melhores odds do mercado esportivo com premiações super multiplicadas em tempo real.
          </p>
        </div>

        {/* View Switch Headers - Only visible when viewing Matches list */}
        {viewMode === "JOGOS" && (
          <div className="flex bg-[#080D1A]/90 p-1.5 rounded-xl border border-blue-900/35">
            <button
              onClick={() => setActiveTab("TODOS")}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === "TODOS" ? "bg-blue-600 text-white font-black" : "text-slate-300 hover:text-white"
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setActiveTab("LIVE")}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === "LIVE" ? "bg-red-600 text-white font-black shadow-lg" : "text-slate-300 hover:text-white"
              }`}
            >
              <Tv className="h-3.5 w-3.5 animate-pulse text-red-100" />
              Ao Vivo
            </button>
            <button
              onClick={() => setActiveTab("UPCOMING")}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === "UPCOMING" ? "bg-blue-600 text-white font-black" : "text-slate-300 hover:text-white"
              }`}
            >
              Próximos
            </button>
          </div>
        )}
      </div>

      {/* Modern View Mode Selection Tabs (Seção de Navegação Interna) */}
      <div className="flex bg-[#0F172A] border border-blue-900/35 p-1 rounded-xl w-fit">
        <button
          onClick={() => setViewMode("JOGOS")}
          className={`flex items-center gap-2 px-4-5 px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer border ${
            viewMode === "JOGOS"
              ? "bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20"
              : "text-slate-400 border-transparent hover:text-white hover:bg-slate-800/40"
          }`}
        >
          <ListFilter className="h-4 w-4 text-sky-400" />
          Partidas (Hoje e Amanhã)
        </button>
        <button
          onClick={() => setViewMode("TABELA")}
          className={`flex items-center gap-2 px-4-5 px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer border ${
            viewMode === "TABELA"
              ? "bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20"
              : "text-slate-400 border-transparent hover:text-white hover:bg-slate-800/40"
          }`}
        >
          <BarChart4 className="h-4 w-4 text-emerald-400" />
          Tabelas de Classificação Real
        </button>
      </div>

      {/* Conditionally render Standings Table or Main Matches Feed */}
      {viewMode === "TABELA" ? (
        <StandingsTable league={selectedLeague} />
      ) : loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="h-8 w-8 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
          <span className="text-xs text-slate-400 font-mono">Buscando cotações atualizadas...</span>
        </div>
      ) : filteredGames.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 border border-blue-900/25 rounded-2xl bg-blue-950/5">
          <Clock className="h-10 w-10 text-slate-500 mb-2" />
          <span className="text-sm font-semibold text-slate-200">Nenhuma partida encontrada</span>
          <p className="text-xs text-slate-400 mt-1">Não há eventos marcados para hoje ou amanhã nesta categoria.</p>
        </div>
      ) : (
        <div className="space-y-8 pl-0.5 pr-0.5">
          {Object.entries(
            filteredGames.reduce((acc, game) => {
              if (!acc[game.league]) acc[game.league] = [];
              acc[game.league].push(game);
              return acc;
            }, {} as Record<string, Game[]>)
          ).map(([leagueName, val]) => {
            const leagueGames = val as Game[];
            const isLibertadores = leagueName === "Copa Libertadores";

            return (
              <div key={leagueName} className="space-y-4">
                {/* Custom League Header Branded / Standard */}
                {isLibertadores ? (
                  <div className="flex flex-col items-center justify-center text-center pb-5 pt-3 pointer-events-none select-none">
                    {/* Golden Owl Icon from Screenshot */}
                    <div className="relative flex items-center justify-center p-3 rounded-full bg-slate-950/90 border border-amber-500/35 shadow-xl shadow-amber-500/10 mb-2">
                      <svg className="w-14 h-14 text-amber-500" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                        {/* Owl Ears / Tufts */}
                        <path d="M20 30L35 15L45 25L55 25L65 15L80 30" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
                        {/* Owl Eyebrows */}
                        <path d="M25 45L45 40M75 45L55 40" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/>
                        {/* Owl Face & Beak */}
                        <path d="M50 43L46 55H54L50 43Z" fill="currentColor"/>
                        {/* Owl Eyes */}
                        <circle cx="37" cy="52" r="10" stroke="currentColor" strokeWidth="3"/>
                        <circle cx="37" cy="52" r="5" fill="currentColor"/>
                        <circle cx="63" cy="52" r="10" stroke="currentColor" strokeWidth="3"/>
                        <circle cx="63" cy="52" r="5" fill="currentColor"/>
                        {/* Geometric Feathers / Cheeks */}
                        <path d="M20 50L30 65H70L80 50" stroke="currentColor" strokeWidth="3" strokeLinejoin="round"/>
                        <path d="M35 65L50 82L65 65" stroke="currentColor" strokeWidth="3" strokeLinejoin="round"/>
                      </svg>
                    </div>

                    {/* Brand Name */}
                    <h2 className="text-[#F1F5F9] text-3xl font-extrabold italic tracking-wider bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-200 bg-clip-text text-transparent drop-shadow">
                      PHBET
                    </h2>
                    
                    {/* Golden separator: JOGOS DO DIA */}
                    <div className="flex items-center gap-3 my-1">
                      <div className="h-[1px] w-8 bg-gradient-to-r from-transparent to-amber-500/60" />
                      <span className="text-amber-400 font-display font-black tracking-[0.25em] text-xs uppercase">
                        JOGOS DO DIA
                      </span>
                      <div className="h-[1px] w-8 bg-gradient-to-l from-transparent to-amber-500/60" />
                    </div>

                    {/* CONMEBOL Copa Libertadores tag */}
                    <div className="flex flex-col items-center mt-1">
                      <div className="text-[9px] font-bold text-amber-500/80 tracking-widest uppercase font-mono">
                        - CONMEBOL -
                      </div>
                      <div className="text-sm font-black text-white tracking-wider flex items-center gap-1.5 mt-0.5">
                        <span className="text-amber-400">🏆</span>
                        <span className="text-xs uppercase tracking-wider font-mono">COPA LIBERTADORES</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 pb-2.5 pt-3 border-b border-blue-900/20 select-none">
                    <Award className="h-4.5 w-4.5 text-blue-400" />
                    <span className="text-xs font-mono font-bold uppercase text-slate-300 tracking-wider">
                      {leagueName}
                    </span>
                  </div>
                )}

                {/* Matches layout inside this league category */}
                <div className="space-y-3.5">
                  {leagueGames.map((game) => {
                    const matchTime = (() => {
                      try {
                        const d = new Date(game.date);
                        return d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", hour12: false });
                      } catch {
                        return "19:00";
                      }
                    })();

                    return (
                      <div 
                        key={game.gameId} 
                        className="group relative bg-[#0F172A] border border-blue-900/30 rounded-xl overflow-hidden hover:border-amber-500/40 transition duration-200 flex flex-col pt-3.5 pb-3.5 px-4 md:px-5 gap-3"
                      >
                        {/* Main row */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          
                          {/* Teams display vertical stack matching the image */}
                          <div className="flex-1 flex flex-col gap-2.5">
                            {/* Home Team */}
                            <div className="flex items-center gap-3">
                              <img 
                                src={game.homeLogo} 
                                onError={(e) => { (e.target as HTMLImageElement).src = `https://placehold.co/40x44/1e3a8a/ffffff?text=${game.homeTeam[0]}` }} 
                                alt="Logo" 
                                referrerPolicy="no-referrer"
                                className="h-6 w-6 object-contain shrink-0" 
                              />
                              <span className="font-semibold text-xs md:text-sm text-slate-200">{game.homeTeam}</span>
                            </div>

                            {/* Away Team */}
                            <div className="flex items-center gap-3">
                              <img 
                                src={game.awayLogo} 
                                onError={(e) => { (e.target as HTMLImageElement).src = `https://placehold.co/40x44/1e3a8a/ffffff?text=${game.awayTeam[0]}` }} 
                                alt="Logo" 
                                referrerPolicy="no-referrer"
                                className="h-6 w-6 object-contain shrink-0" 
                              />
                              <span className="font-semibold text-xs md:text-sm text-slate-200">{game.awayTeam}</span>
                            </div>
                          </div>

                          {/* Middle column: PREVIEW Badge & Clock Hour (from Photo) */}
                          <div className="flex items-center gap-3 bg-slate-900/35 p-2 sm:p-0 rounded-lg sm:bg-transparent justify-end sm:justify-start">
                            <span className="text-[9px] font-mono font-bold text-slate-400 bg-slate-950/60 px-2.5 py-1 rounded-md border border-slate-800 uppercase tracking-widest select-none shrink-0">
                              PREVIEW
                            </span>

                            {game.status === "LIVE" ? (
                              <span className="text-[10px] font-black text-rose-500 animate-pulse bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20 shrink-0">
                                AO VIVO
                              </span>
                            ) : (
                              <span className="text-amber-400 font-mono text-sm font-bold tracking-wide shrink-0">
                                {matchTime}
                              </span>
                            )}
                          </div>

                          {/* Rightmost column: Standard outcome odds selectors and custom bet builder */}
                          <div className="flex items-center gap-2.5 shrink-0 self-stretch sm:self-center justify-end">
                            <div className="flex items-center bg-slate-950/80 p-1.5 rounded-xl border border-slate-800">
                              
                              {/* Option 1: HOME */}
                              <button
                                onClick={() => onOddsSelect(game, "Resultado Final", "Casa", game.oddsHome)}
                                className={`flex items-center justify-between gap-4 px-3 py-1.5 w-24 sm:w-20 rounded-lg transition duration-150 select-none cursor-pointer border ${
                                  isSelected(game.gameId, "Casa")
                                    ? "bg-blue-600 text-white font-black border-blue-500 shadow-md shadow-blue-500/20"
                                    : "bg-transparent border-transparent hover:bg-slate-900 text-slate-300 hover:text-white"
                                }`}
                              >
                                <span className="text-[9px] text-slate-500 font-mono font-bold">1</span>
                                <span className="font-mono text-xs font-black text-slate-200 group-hover:text-white">{game.oddsHome.toFixed(2)}</span>
                              </button>

                              {/* Option X: DRAW */}
                              <button
                                onClick={() => onOddsSelect(game, "Resultado Final", "Empate", game.oddsDraw)}
                                className={`flex items-center justify-between gap-4 px-3 py-1.5 w-24 sm:w-20 rounded-lg transition duration-150 select-none cursor-pointer border ${
                                  isSelected(game.gameId, "Empate")
                                    ? "bg-blue-600 text-white font-black border-blue-500 shadow-md shadow-blue-500/20"
                                    : "bg-transparent border-transparent hover:bg-slate-900 text-slate-300 hover:text-white"
                                }`}
                              >
                                <span className="text-[9px] text-slate-500 font-mono font-bold">X</span>
                                <span className="font-mono text-xs font-black text-slate-200 group-hover:text-white">{game.oddsDraw.toFixed(2)}</span>
                              </button>

                              {/* Option 2: AWAY */}
                              <button
                                onClick={() => onOddsSelect(game, "Resultado Final", "Fora", game.oddsAway)}
                                className={`flex items-center justify-between gap-4 px-3 py-1.5 w-24 sm:w-20 rounded-lg transition duration-150 select-none cursor-pointer border ${
                                  isSelected(game.gameId, "Fora")
                                    ? "bg-blue-600 text-white font-black border-blue-500 shadow-md shadow-blue-500/20"
                                    : "bg-transparent border-transparent hover:bg-slate-900 text-slate-300 hover:text-white"
                                }`}
                              >
                                <span className="text-[9px] text-slate-500 font-mono font-bold">2</span>
                                <span className="font-mono text-xs font-black text-slate-200 group-hover:text-white">{game.oddsAway.toFixed(2)}</span>
                              </button>

                            </div>

                            {/* Bet Builder toggle action */}
                            <button
                              title="Criar aposta múltipla para este jogo"
                              onClick={() => onOpenBetBuilder(game)}
                              className="h-[44px] w-[44px] flex items-center justify-center rounded-xl bg-[#0F172A] border border-blue-900/30 text-blue-400 hover:text-white hover:border-blue-500/50 hover:bg-blue-950/20 transition duration-150 cursor-pointer"
                            >
                              <Sparkles className="h-4 w-4" />
                            </button>
                          </div>

                        </div>
                      </div>
                    );
                  })}
                </div>


              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
