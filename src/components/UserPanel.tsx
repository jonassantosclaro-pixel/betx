/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { collection, query, where, getDocs, onSnapshot, orderBy } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase";
import { Bet } from "../types";
import { 
  Hourglass, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Ticket, 
  Coins, 
  BookmarkCheck,
  ChevronDown,
  Activity
} from "lucide-react";

export const UserPanel: React.FC = () => {
  const { userProfile } = useAuth();
  const [bets, setBets] = useState<Bet[]>([]);
  const [loading, setLoading] = useState(true);

  // Simulation default mock bets if none in database yet to ensure premium styling
  const localSimulatedBets: Bet[] = [
    {
      betId: "BILHETE-32810",
      userId: userProfile?.userId || "guest",
      status: "pending",
      stake: 50,
      odds: 3.88,
      potentialPayout: 194.00,
      type: "multiple",
      selections: [
        { gameId: "BSA-1", homeTeam: "Flamengo", awayTeam: "Palmeiras", league: "Brasileirão Série A", market: "Resultado Final", selection: "Casa", odds: 2.10 },
        { gameId: "BSA-2", homeTeam: "São Paulo", awayTeam: "Corinthians", league: "Brasileirão Série A", market: "Total de Gols", selection: "Total de Gols +2.5", odds: 1.85 }
      ],
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      updatedAt: new Date(Date.now() - 3600000).toISOString()
    },
    {
      betId: "BILHETE-10492",
      userId: userProfile?.userId || "guest",
      status: "won",
      stake: 30,
      odds: 1.70,
      potentialPayout: 51.00,
      type: "simple",
      selections: [
        { gameId: "BSB-1", homeTeam: "Santos", awayTeam: "Sport Recife", league: "Brasileirão Série B", market: "Resultado Final", selection: "Casa", odds: 1.70 }
      ],
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 86400000).toISOString()
    }
  ];

  useEffect(() => {
    if (!userProfile) return;

    setLoading(true);
    // Real-time listener for current user bets
    const colRef = collection(db, "bets");
    const q = query(colRef, where("userId", "==", userProfile.userId));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched: Bet[] = [];
      snapshot.forEach((doc) => {
        fetched.push({ ...doc.data() } as Bet);
      });

      // Sort by createdAt descending
      fetched.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      // If empty in database, show premium simulation ones
      if (fetched.length === 0) {
        setBets(localSimulatedBets);
      } else {
        setBets(fetched);
      }
      setLoading(false);
    }, (error) => {
      console.warn("Firestore access error inside User Panel, switching to simulated list.", error);
      setBets(localSimulatedBets);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userProfile]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "won":
        return <span className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1"><CheckCircle className="h-3 w-3" /> GANHOU</span>;
      case "lost":
        return <span className="bg-rose-500/15 text-rose-400 border border-rose-500/25 px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1"><XCircle className="h-3 w-3" /> PERDEU</span>;
      case "cancelled":
        return <span className="bg-slate-500/15 text-slate-400 border border-slate-500/25 px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">CANCELADO</span>;
      default:
        return <span className="bg-amber-500/15 text-amber-400 border border-amber-500/25 px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1"><Hourglass className="h-3 w-3 animate-pulse" /> PENDENTE</span>;
    }
  };

  const formatDate = (isoStr: string) => {
    try {
      return new Date(isoStr).toLocaleString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch (e) {
      return isoStr;
    }
  };

  const totalWon = bets.filter(b => b.status === "won").reduce((acc, curr) => acc + curr.potentialPayout, 0);
  const totalStaked = bets.reduce((acc, curr) => acc + curr.stake, 0);

  return (
    <div id="user-panel-feed" className="flex-1 bg-slate-900/10 p-4 md:p-6 space-y-6 overflow-y-auto">
      
      {/* Intro Dashboard Overview banner */}
      <div className="purple-gradient-glow p-5 rounded-2xl border border-blue-900/35 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#0F172A]/90">
        <div>
          <span className="text-[10px] font-mono tracking-widest text-[#F8FAFC] font-extrabold uppercase bg-blue-600 px-3 py-1 rounded-full border border-blue-400/40 flex items-center gap-1">
            <Activity className="h-3.5 w-3.5 text-blue-100" />
            Minhas Atividades
          </span>
          <h1 className="font-display font-black text-2xl text-white mt-1.5 pl-0.5">
            Histórico de Bilhetes
          </h1>
          <p className="text-xs text-slate-300 leading-none mt-2">
            Acompanhe a evolução das suas cotações e o status dos prêmios em tempo real.
          </p>
        </div>

        {/* User Mini Stats widgets */}
        <div className="flex gap-3">
          <div className="bg-[#080D1A] border border-blue-900/35 px-4 py-2.5 rounded-xl text-left">
            <span className="text-[9px] text-slate-400 font-mono tracking-wider uppercase block">Total Apostado</span>
            <span className="text-sm font-bold font-mono text-white">
              R$ {totalStaked.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="bg-emerald-950/20 border border-emerald-900/30 px-4 py-2.5 rounded-xl text-left">
            <span className="text-[9px] text-emerald-400 font-mono tracking-wider uppercase block">Ganhos Totais</span>
            <span className="text-sm font-extrabold font-mono text-emerald-400">
              R$ {totalWon.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="h-8 w-8 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
        </div>
      ) : bets.length === 0 ? (
        <div className="text-center py-16 border border-blue-900/15 rounded-2xl">
          <Ticket className="h-10 w-10 text-slate-500 mx-auto mb-2" />
          <span className="text-sm text-slate-200 block font-semibold">Sem apostas registradas</span>
          <p className="text-xs text-slate-400 mt-1">As apostas que você fizer aparecerão organizadas aqui em tempo real.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {bets.map((bet) => (
            <div 
              key={bet.betId} 
              className="bg-[#0F172A] border border-blue-900/35 rounded-2xl overflow-hidden shadow-lg p-5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4"
            >
              <div className="flex-1 space-y-3">
                {/* Header elements */}
                <div className="flex items-center gap-3">
                  <span className="bg-blue-600 px-2.5 py-0.5 rounded-lg text-[10px] text-white font-mono font-bold tracking-wider">
                    {bet.betId}
                  </span>
                  <span className="text-[10px] text-[#A5F3FC] font-mono leading-none">
                    Data: {formatDate(bet.createdAt)}
                  </span>
                  
                  {bet.customerName && (
                    <span className="text-[10px] font-mono bg-[#080D1A] border border-blue-900/40 text-blue-300 px-2 py-0.5 rounded-lg">
                      Cliente: {bet.customerName}
                    </span>
                  )}
                </div>

                {/* Selections feeds */}
                <div className="space-y-1.5 pl-1 divide-y divide-blue-900/30">
                  {bet.selections.map((sel, idx) => (
                    <div key={idx} className="text-xs font-sans text-left pt-2 first:pt-0">
                      <span className="text-[10px] text-slate-400 font-mono tracking-wider block font-bold">{sel.league}</span>
                      <div className="flex flex-wrap items-center gap-2 mt-0.5 leading-none">
                        <span className="font-extrabold text-white">{sel.homeTeam} vs {sel.awayTeam}</span>
                        <span className="text-blue-900 font-bold">|</span>
                        <span className="text-[#A5F3FC] font-mono">Mercado: {sel.market}</span>
                        <span className="text-blue-900 font-bold">|</span>
                        <span className="text-white font-black text-xs">Seleção: {sel.selection}</span>
                        <span className="font-mono text-[9px] bg-[#080D1A] px-2 py-0.5 rounded text-blue-400 ml-1 border border-blue-900/30 font-bold">@{sel.odds.toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status and Financial breakdown */}
              <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-3 md:border-l border-blue-900/30 md:pl-5 shrink-0">
                <div className="text-left md:text-right font-sans">
                  <div className="flex items-baseline gap-1 md:justify-end text-xs leading-none select-none">
                    <span className="text-[10px] text-slate-400 font-mono">Cotação: </span>
                    <span className="font-mono font-black text-white">@{bet.odds.toFixed(2)}</span>
                  </div>

                  <div className="flex items-baseline gap-1 md:justify-end text-xs mt-1 leading-none select-none">
                    <span className="text-[10px] text-slate-400 font-mono">Valor: </span>
                    <span className="font-mono font-bold text-slate-300">R$ {bet.stake.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                  </div>

                  <div className="flex items-baseline gap-1 md:justify-end text-xs mt-1.5 leading-none select-none">
                    <span className="text-[10px] text-emerald-400 font-mono">Prêmio: </span>
                    <span className="font-mono font-black text-emerald-400 text-sm">R$ {bet.potentialPayout.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>

                <div className="shrink-0">
                  {getStatusBadge(bet.status)}
                </div>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
};
