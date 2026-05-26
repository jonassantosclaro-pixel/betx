/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Trophy, Shield, TrendingUp, Search, RefreshCw } from "lucide-react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { StandingRow, LeagueStanding, LeagueDetail } from "../types";

// Static local fallbacks for high-performance instant loading
const defaultStandingsData: Record<string, StandingRow[]> = {
  "Brasileirão Série A": [
    { position: 1, team: "Botafogo", points: 78, played: 38, won: 23, drawn: 9, lost: 6, goalsFor: 62, goalsAgainst: 33, logoUrl: "https://images.thesportsdb.com/images/media/team/badge/vwpwyq1421494553.png/tiny" },
    { position: 2, team: "Palmeiras", points: 70, played: 38, won: 20, drawn: 10, lost: 8, goalsFor: 58, goalsAgainst: 35, logoUrl: "https://images.thesportsdb.com/images/media/team/badge/8qwvwv1550232607.png/tiny" },
    { position: 3, team: "Fortaleza", points: 68, played: 38, won: 19, drawn: 11, lost: 8, goalsFor: 49, goalsAgainst: 34, logoUrl: "https://images.thesportsdb.com/images/media/team/badge/5uprrw1550232845.png/tiny" },
    { position: 4, team: "Flamengo", points: 68, played: 38, won: 19, drawn: 11, lost: 8, goalsFor: 55, goalsAgainst: 39, logoUrl: "https://images.thesportsdb.com/images/media/team/badge/7vyv971550232585.png/tiny" },
    { position: 5, team: "São Paulo", points: 59, played: 38, won: 17, drawn: 8, lost: 13, goalsFor: 47, goalsAgainst: 42, logoUrl: "https://images.thesportsdb.com/images/media/team/badge/qtpssy1550232646.png/tiny" },
    { position: 6, team: "Internacional", points: 59, played: 38, won: 16, drawn: 11, lost: 11, goalsFor: 46, goalsAgainst: 40, logoUrl: "https://images.thesportsdb.com/images/media/team/badge/rsqvpy1550232653.png/tiny" },
    { position: 7, team: "Cruzeiro", points: 52, played: 38, won: 14, drawn: 10, lost: 14, goalsFor: 41, goalsAgainst: 40, logoUrl: "https://images.thesportsdb.com/images/media/team/badge/wvrtqx1550232768.png/tiny" },
    { position: 8, team: "Bahia", points: 52, played: 38, won: 14, drawn: 10, lost: 14, goalsFor: 45, goalsAgainst: 44, logoUrl: "https://images.thesportsdb.com/images/media/team/badge/swttvx1550232822.png/tiny" },
    { position: 9, team: "Vasco da Gama", points: 49, played: 38, won: 13, drawn: 10, lost: 15, goalsFor: 40, goalsAgainst: 47, logoUrl: "https://images.thesportsdb.com/images/media/team/badge/vpxuuv1550232938.png/tiny" },
    { position: 10, team: "Atlético Mineiro", points: 47, played: 38, won: 11, drawn: 14, lost: 13, goalsFor: 43, goalsAgainst: 48, logoUrl: "https://images.thesportsdb.com/images/media/team/badge/vvpvwq1550232688.png/tiny" }
  ],
  "Brasileirão Série B": [
    { position: 1, team: "Santos", points: 68, played: 38, won: 20, drawn: 8, lost: 10, goalsFor: 56, goalsAgainst: 30, logoUrl: "https://images.thesportsdb.com/images/media/team/badge/puvvty1550232637.png/tiny" },
    { position: 2, team: "Mirassol", points: 64, played: 38, won: 18, drawn: 10, lost: 10, goalsFor: 41, goalsAgainst: 26, logoUrl: "https://images.thesportsdb.com/images/media/team/badge/swptvt1550232890.png/tiny" },
    { position: 3, team: "Sport Recife", points: 63, played: 38, won: 18, drawn: 9, lost: 11, goalsFor: 55, goalsAgainst: 36, logoUrl: "https://images.thesportsdb.com/images/media/team/badge/vwstry1550232921.png/tiny" },
    { position: 4, team: "Ceará", points: 63, played: 38, won: 19, drawn: 6, lost: 13, goalsFor: 59, goalsAgainst: 41, logoUrl: "https://images.thesportsdb.com/images/media/team/badge/qtsvpr1550232838.png/tiny" },
    { position: 5, team: "Novorizontino", points: 63, played: 38, won: 18, drawn: 9, lost: 11, goalsFor: 43, goalsAgainst: 30, logoUrl: "https://images.thesportsdb.com/images/media/team/badge/sxvwsv1550232899.png/tiny" }
  ],
  "Premier League": [
    { position: 1, team: "Manchester City", points: 91, played: 38, won: 28, drawn: 7, lost: 3, goalsFor: 96, goalsAgainst: 34, logoUrl: "https://images.thesportsdb.com/images/media/team/badge/vtsv701511477755.png/tiny" },
    { position: 2, team: "Arsenal", points: 89, played: 38, won: 28, drawn: 5, lost: 5, goalsFor: 91, goalsAgainst: 29, logoUrl: "https://images.thesportsdb.com/images/media/team/badge/724sz61557004456.png/tiny" },
    { position: 3, team: "Liverpool", points: 82, played: 38, won: 24, drawn: 10, lost: 4, goalsFor: 86, goalsAgainst: 41, logoUrl: "https://images.thesportsdb.com/images/media/team/badge/0984g51571591871.png/tiny" },
    { position: 4, team: "Aston Villa", points: 68, played: 38, won: 20, drawn: 8, lost: 10, goalsFor: 76, goalsAgainst: 61, logoUrl: "https://images.thesportsdb.com/images/media/team/badge/9vux4o1582819864.png/tiny" },
    { position: 5, team: "Tottenham Hotspur", points: 66, played: 38, won: 20, drawn: 6, lost: 12, goalsFor: 74, goalsAgainst: 61, logoUrl: "https://images.thesportsdb.com/images/media/team/badge/916yid1582820359.png/tiny" }
  ],
  "La Liga": [
    { position: 1, team: "Real Madrid", points: 95, played: 38, won: 29, drawn: 8, lost: 1, goalsFor: 87, goalsAgainst: 26, logoUrl: "https://images.thesportsdb.com/images/media/team/badge/vwpvuv1421493796.png/tiny" },
    { position: 2, team: "Barcelona", points: 85, played: 38, won: 26, drawn: 7, lost: 5, goalsFor: 79, goalsAgainst: 44, logoUrl: "https://images.thesportsdb.com/images/media/team/badge/0g80781521453229.png/tiny" },
    { position: 3, team: "Girona", points: 81, played: 38, won: 25, drawn: 6, lost: 7, goalsFor: 85, goalsAgainst: 46, logoUrl: "https://images.thesportsdb.com/images/media/team/badge/g900b71534015632.png/tiny" },
    { position: 4, team: "Atlético de Madrid", points: 76, played: 38, won: 24, drawn: 4, lost: 10, goalsFor: 70, goalsAgainst: 43, logoUrl: "https://images.thesportsdb.com/images/media/team/badge/7f7vef1550232148.png/tiny" }
  ]
};

const CHAMPIONSHIPS = [
  "Brasileirão Série A",
  "Brasileirão Série B",
  "Copa do Brasil",
  "Champions League",
  "Copa Libertadores",
  "Premier League",
  "La Liga",
  "Bundesliga",
  "Serie A Itália",
  "Ligue 1",
  "Europa League",
  "Copa América",
  "Copa do Mundo"
];

interface ClassificacaoViewProps {
  onSelectTeam: (teamName: string) => void;
  leagues?: LeagueDetail[];
}

export const ClassificacaoView: React.FC<ClassificacaoViewProps> = ({ onSelectTeam, leagues }) => {
  const activeChampionships = leagues 
    ? CHAMPIONSHIPS.filter(c => !leagues.some(l => l.name === c && l.disabled))
    : CHAMPIONSHIPS;

  const [selectedLeague, setSelectedLeague] = useState<string>("Brasileirão Série A");
  const [rows, setRows] = useState<StandingRow[]>([]);
  const [loading, setLoading] = useState(false);

  // Keep selectedLeague in sync if active ones change or current becomes disabled
  useEffect(() => {
    if (activeChampionships.length > 0 && !activeChampionships.includes(selectedLeague)) {
      setSelectedLeague(activeChampionships[0]);
    }
  }, [activeChampionships, selectedLeague]);

  // Normalize name for Firestore doc paths (matches back-end normalizer)
  const docId = selectedLeague.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "-");

  useEffect(() => {
    setLoading(true);
    // Listen live to Firestore collection /standings/{docId}
    const unsub = onSnapshot(
      doc(db, "standings", docId),
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          if (data && Array.isArray(data.rows)) {
            setRows(data.rows);
            setLoading(false);
            return;
          }
        }
        // Fallback to offline premium datasets if doc doesn't exist
        const fallback = defaultStandingsData[selectedLeague] || defaultStandingsData["Brasileirão Série A"];
        setRows(fallback);
        setLoading(false);
      },
      (err) => {
        console.warn("Standings live-listener failed. Defaulting to local index:", err);
        const fallback = defaultStandingsData[selectedLeague] || defaultStandingsData["Brasileirão Série A"];
        setRows(fallback);
        setLoading(false);
      }
    );

    return () => unsub();
  }, [selectedLeague, docId]);

  return (
    <div className="flex-1 bg-slate-900/10 p-4 md:p-6 space-y-6 overflow-y-auto font-sans text-left">
      
      {/* Page Header banner */}
      <div className="p-5 rounded-2xl border border-blue-900/35 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-[#0F172A]/90">
        <div>
          <span className="text-[10px] font-mono tracking-widest text-emerald-400 font-extrabold flex items-center gap-1.5 leading-none bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full w-fit">
            <Trophy className="h-4 w-4 text-emerald-400" />
            TABELAS E CLASSIFICAÇÕES OFICIAIS
          </span>
          <h1 className="font-display font-black text-2xl text-white mt-3.5 flex items-center gap-2">
            Tabela do Campeonato
          </h1>
          <p className="text-xs text-slate-300 mt-2 pl-0.5 leading-relaxed">
            Consulte a classificação esportiva em tempo real sincronizada via Firebase. Clique em qualquer equipe para ver o escudo, estádio e calendário!
          </p>
        </div>

        {/* Championship Select Filter Dropdown */}
        <div className="flex flex-col justify-center min-w-[200px] sm:min-w-[240px]">
          <label className="text-[9px] font-mono font-black tracking-widest text-slate-450 uppercase mb-1.5 ml-1">SELECIONE O TORNEIO</label>
          <select
            value={selectedLeague}
            onChange={(e) => setSelectedLeague(e.target.value)}
            className="w-full text-xs font-bold bg-slate-950 text-white p-3 rounded-xl border border-slate-800 outline-none focus:border-blue-500 transition cursor-pointer"
          >
            {activeChampionships.map((league) => (
              <option key={league} value={league}>
                🏆 {league}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20 bg-[#0F172A]/50 border border-blue-900/15 rounded-2xl">
          <RefreshCw className="h-8 w-8 text-blue-500 animate-spin" />
        </div>
      ) : (
        <div className="bg-[#0F172A] border border-blue-900/35 rounded-2xl overflow-hidden shadow-xl">
          
          <div className="p-4 bg-[#080D1A] border-b border-blue-900/35 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="h-4.5 w-4.5 text-yellow-500" />
              <h2 className="font-display font-black text-sm uppercase text-white tracking-wider">
                {selectedLeague}
              </h2>
            </div>
            <div className="flex items-center gap-1 text-[10px] font-mono text-emerald-450 text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md">
              <TrendingUp className="h-3 w-3" />
              Sincronizado
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-[#080D1A]/50 border-b border-blue-900/25 text-[10px] font-mono uppercase tracking-wider text-slate-400 select-none">
                  <th className="py-3 px-3 text-center w-12 font-bold">Pos</th>
                  <th className="py-3 px-3 text-left font-bold">Clube</th>
                  <th className="py-3 px-2 text-center font-bold w-12">P</th>
                  <th className="py-3 px-2 text-center font-bold w-10">J</th>
                  <th className="py-3 px-2 text-center font-bold w-10">V</th>
                  <th className="py-3 px-2 text-center font-bold w-10">E</th>
                  <th className="py-3 px-2 text-center font-bold w-10">D</th>
                  <th className="py-3 px-2 text-center font-bold w-14 hidden sm:table-cell">GP</th>
                  <th className="py-3 px-2 text-center font-bold w-14 hidden sm:table-cell">GC</th>
                  <th className="py-3 px-2 text-center font-bold w-14 font-mono font-black text-slate-300">SG</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-900/20">
                {rows.map((row) => {
                  const goalDifference = row.goalsFor - row.goalsAgainst;
                  const isTop4 = row.position <= 4;
                  const isRelegation = selectedLeague.includes("Brasileirão") && row.position > 16;

                  return (
                    <tr 
                      key={row.position} 
                      onClick={() => onSelectTeam(row.team)}
                      className={`hover:bg-slate-800/20 transition cursor-pointer ${
                        isTop4 ? "bg-blue-950/10" : isRelegation ? "bg-rose-950/10" : ""
                      }`}
                    >
                      {/* Position badge */}
                      <td className="py-3.5 px-2 text-center font-mono font-black text-xs">
                        <span className={`inline-flex items-center justify-center size-5.5 rounded-lg ${
                          row.position === 1 ? "bg-yellow-500/15 text-yellow-500 border border-yellow-500/30" :
                          row.position === 2 ? "bg-slate-300/15 text-slate-300 border border-slate-300/30" :
                          row.position === 3 ? "bg-amber-600/15 text-amber-500 border border-amber-600/30" :
                          isTop4 ? "bg-blue-600/15 text-blue-400 border border-blue-500/20" :
                          isRelegation ? "bg-rose-500/10 text-rose-400 border border-rose-500/20" :
                          "text-slate-450 text-slate-300"
                        }`}>
                          {row.position}
                        </span>
                      </td>

                      {/* Team Logo and name */}
                      <td className="py-3.5 px-3 font-semibold text-white">
                        <div className="flex items-center gap-2.5">
                          {row.logoUrl ? (
                            <img 
                              src={row.logoUrl} 
                              alt="" 
                              className="h-5 w-5 object-contain shrink-0" 
                              referrerPolicy="no-referrer"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = "none";
                              }}
                            />
                          ) : (
                            <Shield className="h-4.5 w-4.5 text-slate-500 shrink-0" />
                          )}
                          <span className="truncate hover:text-blue-400 transition">{row.team}</span>
                        </div>
                      </td>

                      {/* Points */}
                      <td className="py-3.5 px-2 text-center font-black font-mono text-xs text-blue-400 bg-blue-950/15">
                        {row.points}
                      </td>

                      {/* Played */}
                      <td className="py-3.5 px-2 text-center font-mono text-slate-300">
                        {row.played}
                      </td>

                      {/* Won */}
                      <td className="py-3.5 px-2 text-center font-mono text-emerald-400 font-semibold">
                        {row.won}
                      </td>

                      {/* Drawn */}
                      <td className="py-3.5 px-2 text-center font-mono text-slate-300">
                        {row.drawn}
                      </td>

                      {/* Lost */}
                      <td className="py-3.5 px-2 text-center font-mono text-rose-400">
                        {row.lost}
                      </td>

                      {/* GP */}
                      <td className="py-3.5 px-2 text-center font-mono text-slate-400 hidden sm:table-cell">
                        {row.goalsFor}
                      </td>

                      {/* GC */}
                      <td className="py-3.5 px-2 text-center font-mono text-slate-400 hidden sm:table-cell">
                        {row.goalsAgainst}
                      </td>

                      {/* SG */}
                      <td className={`py-3.5 px-2 text-center font-mono font-black ${
                        goalDifference > 0 ? "text-emerald-400" :
                        goalDifference < 0 ? "text-rose-400" :
                        "text-slate-400"
                      }`}>
                        {goalDifference > 0 ? `+${goalDifference}` : goalDifference}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

        </div>
      )}

    </div>
  );
};
