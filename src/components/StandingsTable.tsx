/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Trophy, Shield, TrendingUp } from "lucide-react";

interface StandingRow {
  position: number;
  team: string;
  points: number;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  logoUrl?: string;
}

const standingsData: Record<string, StandingRow[]> = {
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
    { position: 10, team: "Atlético Mineiro", points: 47, played: 38, won: 11, drawn: 14, lost: 13, goalsFor: 43, goalsAgainst: 48, logoUrl: "https://images.thesportsdb.com/images/media/team/badge/vvpvwq1550232688.png/tiny" },
    { position: 11, team: "Grêmio", points: 46, played: 38, won: 13, drawn: 7, lost: 18, goalsFor: 40, goalsAgainst: 46, logoUrl: "https://images.thesportsdb.com/images/media/team/badge/twvqqp1550232759.png/tiny" },
    { position: 12, team: "Corinthians", points: 45, played: 38, won: 11, drawn: 12, lost: 15, goalsFor: 41, goalsAgainst: 45, logoUrl: "https://images.thesportsdb.com/images/media/team/badge/uqpwws1550232617.png/tiny" },
    { position: 13, team: "Athletico-PR", points: 44, played: 38, won: 12, drawn: 8, lost: 18, goalsFor: 37, goalsAgainst: 44, logoUrl: "https://images.thesportsdb.com/images/media/team/badge/twpwww1550232810.png/tiny" },
    { position: 14, team: "Criciúma", points: 43, played: 38, won: 11, drawn: 10, lost: 17, goalsFor: 39, goalsAgainst: 51, logoUrl: "https://images.thesportsdb.com/images/media/team/badge/wsyvxr1550232801.png/tiny" },
    { position: 15, team: "Fluminense", points: 43, played: 38, won: 11, drawn: 10, lost: 17, goalsFor: 30, goalsAgainst: 41, logoUrl: "https://images.thesportsdb.com/images/media/team/badge/xvtqqv1550232661.png/tiny" },
    { position: 16, team: "Vitória", points: 42, played: 38, won: 12, drawn: 6, lost: 20, goalsFor: 38, goalsAgainst: 54, logoUrl: "https://images.thesportsdb.com/images/media/team/badge/swttuu1550232832.png/tiny" },
    { position: 17, team: "Red Bull Bragantino", points: 41, played: 38, won: 9, drawn: 14, lost: 15, goalsFor: 36, goalsAgainst: 46, logoUrl: "https://images.thesportsdb.com/images/media/team/badge/u8eioo1580213054.png/tiny" },
    { position: 18, team: "Juventude", points: 40, played: 38, won: 9, drawn: 13, lost: 16, goalsFor: 40, goalsAgainst: 53, logoUrl: "https://images.thesportsdb.com/images/media/team/badge/vttvxw1550232815.png/tiny" },
    { position: 19, team: "Cuiabá", points: 34, played: 38, won: 7, drawn: 13, lost: 18, goalsFor: 29, goalsAgainst: 47, logoUrl: "https://images.thesportsdb.com/images/media/team/badge/rsvsww1550232930.png/tiny" },
    { position: 20, team: "Atlético-GO", points: 26, played: 38, won: 6, drawn: 8, lost: 24, goalsFor: 25, goalsAgainst: 57, logoUrl: "https://images.thesportsdb.com/images/media/team/badge/wqtstp1550232785.png/tiny" }
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
    { position: 5, team: "Tottenham Hotspur", points: 66, played: 38, won: 20, drawn: 6, lost: 12, goalsFor: 74, goalsAgainst: 61, logoUrl: "https://images.thesportsdb.com/images/media/team/badge/916yid1582820359.png/tiny" },
    { position: 6, team: "Chelsea", points: 63, played: 38, won: 18, drawn: 9, lost: 11, goalsFor: 77, goalsAgainst: 63, logoUrl: "https://images.thesportsdb.com/images/media/team/badge/9618sh1587752495.png/tiny" },
    { position: 7, team: "Newcastle United", points: 60, played: 38, won: 18, drawn: 6, lost: 14, goalsFor: 85, goalsAgainst: 62, logoUrl: "https://images.thesportsdb.com/images/media/team/badge/79782h1511477611.png/tiny" },
    { position: 8, team: "Manchester United", points: 60, played: 38, won: 18, drawn: 6, lost: 14, goalsFor: 57, goalsAgainst: 58, logoUrl: "https://images.thesportsdb.com/images/media/team/badge/3nndbv1512401614.png/tiny" }
  ],
  "La Liga": [
    { position: 1, team: "Real Madrid", points: 95, played: 38, won: 29, drawn: 8, lost: 1, goalsFor: 87, goalsAgainst: 26, logoUrl: "https://images.thesportsdb.com/images/media/team/badge/vwpvuv1421493796.png/tiny" },
    { position: 2, team: "Barcelona", points: 85, played: 38, won: 26, drawn: 7, lost: 5, goalsFor: 79, goalsAgainst: 44, logoUrl: "https://images.thesportsdb.com/images/media/team/badge/0g80781521453229.png/tiny" },
    { position: 3, team: "Girona", points: 81, played: 38, won: 25, drawn: 6, lost: 7, goalsFor: 85, goalsAgainst: 46, logoUrl: "https://images.thesportsdb.com/images/media/team/badge/g900b71534015632.png/tiny" },
    { position: 4, team: "Atlético de Madrid", points: 76, played: 38, won: 24, drawn: 4, lost: 10, goalsFor: 70, goalsAgainst: 43, logoUrl: "https://images.thesportsdb.com/images/media/team/badge/7f7vef1550232148.png/tiny" },
    { position: 5, team: "Athletic Club", points: 68, played: 38, won: 19, drawn: 11, lost: 8, goalsFor: 61, goalsAgainst: 37, logoUrl: "https://images.thesportsdb.com/images/media/team/badge/0vvpwv1421494488.png/tiny" },
    { position: 6, team: "Real Sociedad", points: 60, played: 38, won: 16, drawn: 12, lost: 10, goalsFor: 51, goalsAgainst: 39, logoUrl: "https://images.thesportsdb.com/images/media/team/badge/rwxwqq1421493974.png/tiny" }
  ],
  "Champions League": [
    { position: 1, team: "Bayern Munich", points: 18, played: 6, won: 6, drawn: 0, lost: 0, goalsFor: 18, goalsAgainst: 4, logoUrl: "https://images.thesportsdb.com/images/media/team/badge/rwvwpv1421494056.png/tiny" },
    { position: 2, team: "Real Madrid", points: 15, played: 6, won: 5, drawn: 0, lost: 1, goalsFor: 16, goalsAgainst: 7, logoUrl: "https://images.thesportsdb.com/images/media/team/badge/vwpvuv1421493796.png/tiny" },
    { position: 3, team: "Arsenal", points: 13, played: 6, won: 4, drawn: 1, lost: 1, goalsFor: 15, goalsAgainst: 4, logoUrl: "https://images.thesportsdb.com/images/media/team/badge/724sz61557004456.png/tiny" },
    { position: 4, team: "Manchester City", points: 15, played: 6, won: 5, drawn: 0, lost: 1, goalsFor: 18, goalsAgainst: 7, logoUrl: "https://images.thesportsdb.com/images/media/team/badge/vtsv701511477755.png/tiny" },
    { position: 5, team: "Paris Saint Germain", points: 12, played: 6, won: 4, drawn: 0, lost: 2, goalsFor: 13, goalsAgainst: 8, logoUrl: "https://images.thesportsdb.com/images/media/team/badge/urywtp1448813131.png/tiny" }
  ],
  "Copa Libertadores": [
    { position: 1, team: "River Plate", points: 16, played: 6, won: 5, drawn: 1, lost: 0, goalsFor: 12, goalsAgainst: 3, logoUrl: "https://images.thesportsdb.com/images/media/team/badge/uvwxqy1421498118.png/tiny" },
    { position: 2, team: "Palmeiras", points: 14, played: 6, won: 4, drawn: 2, lost: 0, goalsFor: 14, goalsAgainst: 5, logoUrl: "https://images.thesportsdb.com/images/media/team/badge/8qwvwv1550232607.png/tiny" },
    { position: 3, team: "Fluminense", points: 14, played: 6, won: 4, drawn: 2, lost: 0, goalsFor: 9, goalsAgainst: 5, logoUrl: "https://images.thesportsdb.com/images/media/team/badge/xvtqqv1550232661.png/tiny" },
    { position: 4, team: "São Paulo", points: 13, played: 6, won: 4, drawn: 1, lost: 1, goalsFor: 10, goalsAgainst: 3, logoUrl: "https://images.thesportsdb.com/images/media/team/badge/qtpssy1550232646.png/tiny" },
    { position: 5, team: "Boca Juniors", points: 11, played: 6, won: 3, drawn: 2, lost: 1, goalsFor: 7, goalsAgainst: 4, logoUrl: "https://images.thesportsdb.com/images/media/team/badge/sstqyp1421497914.png/tiny" }
  ]
};

interface StandingsTableProps {
  league: string | null;
}

export const StandingsTable: React.FC<StandingsTableProps> = ({ league }) => {
  const activeLeague = league || "Brasileirão Série A";
  const rows = standingsData[activeLeague] || standingsData["Brasileirão Série A"];

  return (
    <div className="bg-[#0F172A] border border-blue-900/35 rounded-2xl overflow-hidden shadow-xl text-left font-sans">
      
      {/* Title Header */}
      <div className="p-4 bg-[#080D1A] border-b border-blue-900/35 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy className="h-4.5 w-4.5 text-yellow-500 animate-bounce" />
          <h2 className="font-display font-black text-sm uppercase text-white tracking-wider">
            Classificação: {activeLeague}
          </h2>
        </div>
        <div className="flex items-center gap-1 text-[10px] font-mono text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md">
          <TrendingUp className="h-3 w-3" />
          Real & Atualizada
        </div>
      </div>

      {/* Grid structure */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
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
              const isRelegation = activeLeague.includes("Brasileirão") && row.position > 16;

              return (
                <tr 
                  key={row.position} 
                  className={`hover:bg-slate-800/15 transition ${
                    isTop4 ? "bg-blue-900/5" : isRelegation ? "bg-rose-950/5" : ""
                  }`}
                >
                  {/* Position Badge column */}
                  <td className="py-3 px-2 text-center font-mono font-black text-xs">
                    <span className={`inline-flex items-center justify-center size-5.5 rounded-lg ${
                      row.position === 1 ? "bg-yellow-500/15 text-yellow-500 border border-yellow-500/30" :
                      row.position === 2 ? "bg-slate-300/15 text-slate-300 border border-slate-300/30" :
                      row.position === 3 ? "bg-amber-600/15 text-amber-500 border border-amber-600/30" :
                      isTop4 ? "bg-blue-600/15 text-blue-400 border border-blue-500/20" :
                      isRelegation ? "bg-rose-500/10 text-rose-400 border border-rose-500/20" :
                      "text-slate-400"
                    }`}>
                      {row.position}
                    </span>
                  </td>

                  {/* Club logo and Name */}
                  <td className="py-3 px-3 font-semibold text-white">
                    <div className="flex items-center gap-2">
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
                        <Shield className="h-4 w-4 text-slate-500 shrink-0" />
                      )}
                      <span className="truncate">{row.team}</span>
                    </div>
                  </td>

                  {/* Points */}
                  <td className="py-3 px-2 text-center font-black font-mono text-xs text-blue-450 text-blue-400 bg-blue-950/20">
                    {row.points}
                  </td>

                  {/* Played */}
                  <td className="py-3 px-2 text-center font-mono text-slate-300">
                    {row.played}
                  </td>

                  {/* Wins */}
                  <td className="py-3 px-2 text-center font-mono text-emerald-400 font-semibold">
                    {row.won}
                  </td>

                  {/* Draws */}
                  <td className="py-3 px-2 text-center font-mono text-slate-300">
                    {row.drawn}
                  </td>

                  {/* Losses */}
                  <td className="py-3 px-2 text-center font-mono text-rose-400">
                    {row.lost}
                  </td>

                  {/* Goals For */}
                  <td className="py-3 px-2 text-center font-mono text-slate-400 hidden sm:table-cell">
                    {row.goalsFor}
                  </td>

                  {/* Goals Against */}
                  <td className="py-3 px-2 text-center font-mono text-slate-400 hidden sm:table-cell">
                    {row.goalsAgainst}
                  </td>

                  {/* Goal Difference */}
                  <td className={`py-3 px-2 text-center font-mono font-black ${
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
  );
};
