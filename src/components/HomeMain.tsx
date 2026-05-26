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
        <div className="space-y-4 pl-0.5 pr-0.5">
          {filteredGames.map((game) => {
            return (
              <div 
                key={game.gameId} 
                className="group relative bg-[#0F172A] border border-blue-900/35 rounded-2xl overflow-hidden hover:border-blue-500/50 hover:shadow-xl hover:shadow-blue-900/5 transition duration-200 flex flex-col pt-4 pb-4 px-5 gap-3 md:gap-4 justify-between"
              >
                {/* Event header metadata */}
                <div className="flex items-center justify-between text-[11px] font-mono select-none">
                  <div className="flex items-center gap-2 text-slate-300 font-bold">
                    <Award className="h-4 w-4 text-blue-400" />
                    <span>{game.league}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {game.status === "LIVE" ? (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-rose-400 animate-pulse bg-rose-500/15 border border-rose-500/20 px-2.5 py-0.5 rounded-full">
                        <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                        AO VIVO
                      </span>
                    ) : (
                      <span className="text-slate-300 flex items-center gap-1 text-[10px] font-medium bg-slate-800/40 px-2.5 py-0.5 rounded-full border border-slate-700/30">
                        <Calendar className="h-3.5 w-3.5 text-blue-405 text-blue-400" />
                        {formatDate(game.date)}
                      </span>
                    )}

                    {game.manualOdds && (
                      <span className="bg-blue-400/15 border border-blue-400/25 px-2 py-0.5 rounded-full text-[9px] text-blue-300 font-extrabold uppercase">
                        Odds Fixadas
                      </span>
                    )}
                  </div>
                </div>

                {/* Team display and score tracking */}
                <div className="grid grid-cols-1 md:grid-cols-12 items-center gap-4">
                  
                  {/* Teams badges */}
                  <div className="md:col-span-5 flex items-center justify-between md:justify-start gap-4">
                    {/* Home Team */}
                    <div className="flex items-center gap-2.5">
                      <img 
                        src={game.homeLogo} 
                        onError={(e) => { (e.target as HTMLImageElement).src = `https://placehold.co/40x44/1e3a8a/ffffff?text=${game.homeTeam[0]}` }} 
                        alt="Logo" 
                        referrerPolicy="no-referrer"
                        className="h-9 w-9 object-contain shrink-0" 
                      />
                      <span className="font-display font-black text-sm text-white">{game.homeTeam}</span>
                    </div>

                    <span className="text-blue-500 font-mono text-sm font-black uppercase shrink-0">vs</span>

                    {/* Away Team */}
                    <div className="flex items-center gap-2.5">
                      <img 
                        src={game.awayLogo} 
                        onError={(e) => { (e.target as HTMLImageElement).src = `https://placehold.co/40x44/1e3a8a/ffffff?text=${game.awayTeam[0]}` }} 
                        alt="Logo" 
                        referrerPolicy="no-referrer"
                        className="h-9 w-9 object-contain shrink-0" 
                      />
                      <span className="font-display font-black text-sm text-white">{game.awayTeam}</span>
                    </div>
                  </div>

                  {/* Score indicators if match is LIVE or FINISHED */}
                  {(game.status === "LIVE" || game.status === "FINISHED") && (
                    <div className="md:col-span-2 flex items-center justify-center">
                      <div className="flex items-center bg-[#080D1A] px-3.5 py-1.5 rounded-xl border border-blue-900/40 gap-2 divide-x divide-blue-900">
                        <span className="font-mono text-base font-black text-blue-400 px-1">{game.scoreHome ?? 0}</span>
                        <span className="font-mono text-base font-black text-blue-400 px-1 pl-2">{game.scoreAway ?? 0}</span>
                      </div>
                    </div>
                  )}

                  {/* Odds area layout */}
                  <div className={`${(game.status === "LIVE" || game.status === "FINISHED") ? "md:col-span-5" : "md:col-span-7"} flex flex-wrap items-center justify-end gap-2.5`}>
                    
                    {/* Standard H2H multi buttons */}
                    <div className="flex items-center bg-[#080D1A]/90 p-1.5 rounded-xl border border-blue-900/35 gap-1.5 w-full sm:w-auto">
                      <button
                        onClick={() => onOddsSelect(game, "Resultado Final", "Casa", game.oddsHome)}
                        className={`flex-1 sm:flex-none flex flex-col items-center justify-center size-12 rounded-xl transition duration-150 select-none cursor-pointer border ${
                          isSelected(game.gameId, "Casa")
                            ? "bg-blue-600 text-white font-black border-blue-500 shadow-md shadow-blue-500/20"
                            : "bg-slate-900/60 border-transparent hover:bg-blue-900/30 text-slate-300 hover:text-white"
                        }`}
                      >
                        <span className="text-[9px] text-[#A5F3FC]/90 leading-none font-bold">1</span>
                        <span className="font-mono text-xs font-black text-white mt-1">{game.oddsHome.toFixed(2)}</span>
                      </button>

                      <button
                        onClick={() => onOddsSelect(game, "Resultado Final", "Empate", game.oddsDraw)}
                        className={`flex-1 sm:flex-none flex flex-col items-center justify-center size-12 rounded-xl transition duration-150 select-none cursor-pointer border ${
                          isSelected(game.gameId, "Empate")
                            ? "bg-blue-600 text-white font-black border-blue-500 shadow-md shadow-blue-500/20"
                            : "bg-slate-900/60 border-transparent hover:bg-blue-900/30 text-slate-300 hover:text-white"
                        }`}
                      >
                        <span className="text-[9px] text-[#A5F3FC]/90 leading-none font-bold">X</span>
                        <span className="font-mono text-xs font-black text-white mt-1">{game.oddsDraw.toFixed(2)}</span>
                      </button>

                      <button
                        onClick={() => onOddsSelect(game, "Resultado Final", "Fora", game.oddsAway)}
                        className={`flex-1 sm:flex-none flex flex-col items-center justify-center size-12 rounded-xl transition duration-150 select-none cursor-pointer border ${
                          isSelected(game.gameId, "Fora")
                            ? "bg-blue-600 text-white font-black border-blue-500 shadow-md shadow-blue-500/20"
                            : "bg-slate-900/60 border-transparent hover:bg-blue-900/30 text-slate-300 hover:text-white"
                        }`}
                      >
                        <span className="text-[9px] text-[#A5F3FC]/90 leading-none font-bold">2</span>
                        <span className="font-mono text-xs font-black text-white mt-1">{game.oddsAway.toFixed(2)}</span>
                      </button>
                    </div>

                    {/* Bet Builder trigger button */}
                    <button
                      id={`builder-btn-${game.gameId}`}
                      onClick={() => onOpenBetBuilder(game)}
                      className="w-full sm:w-auto h-12 flex items-center justify-center gap-1.5 px-4 rounded-xl text-xs font-black font-display uppercase tracking-wider text-white bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-500/20 active:translate-y-0.5 transition cursor-pointer border border-blue-500"
                    >
                      <Sparkles className="h-4 w-4 text-white animate-pulse" />
                      Criar Aposta
                      <ArrowUpRight className="h-4 w-4 hover:translate-x-0.5 hover:-translate-y-0.5 transition-transform" />
                    </button>

                  </div>

                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
