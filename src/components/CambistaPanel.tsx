/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase";
import { Bet } from "../types";
import { 
  Briefcase, 
  CircleDollarSign, 
  Clock, 
  CheckCircle,
  TrendingUp,
  XCircle,
  Stamp,
  Users
} from "lucide-react";

export const CambistaPanel: React.FC = () => {
  const { userProfile } = useAuth();
  const [bets, setBets] = useState<Bet[]>([]);
  const [loading, setLoading] = useState(true);
  const [commissionRatePercent, setCommissionRatePercent] = useState<number>(10); // default to 10%

  // Fallback mock bets for cambista to preview styling before Firestore database entries
  const localSimulatedCambistaBets: Bet[] = [
    {
      betId: "BILHETE-55102",
      userId: "guest",
      customerName: "Ricardo Santos",
      cambistaId: userProfile?.userId || "cambista-demo",
      status: "pending",
      stake: 100,
      odds: 2.10,
      potentialPayout: 210.00,
      type: "simple",
      selections: [
        { gameId: "BSA-1", homeTeam: "Flamengo", awayTeam: "Palmeiras", league: "Brasileirão Série A", market: "Resultado Final", selection: "Casa", odds: 2.10 }
      ],
      createdAt: new Date(Date.now() - 1200000).toISOString(),
      updatedAt: new Date(Date.now() - 1200000).toISOString()
    },
    {
      betId: "BILHETE-12845",
      userId: "guest",
      customerName: "Mariana Alencar",
      cambistaId: userProfile?.userId || "cambista-demo",
      status: "won",
      stake: 150,
      odds: 2.40,
      potentialPayout: 360.00,
      type: "simple",
      selections: [
        { gameId: "UCL-1", homeTeam: "Real Madrid", awayTeam: "Manchester City", league: "Champions League", market: "Resultado Final", selection: "Casa", odds: 2.40 }
      ],
      createdAt: new Date(Date.now() - 5 * 3600000).toISOString(),
      updatedAt: new Date(Date.now() - 5 * 3600000).toISOString()
    }
  ];

  // Fetch real-time specific commission percentage for this cambista
  useEffect(() => {
    if (!userProfile?.email) return;

    const colRef = collection(db, "cambistas");
    const q = query(colRef, where("email", "==", userProfile.email.toLowerCase().trim()));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const item = snapshot.docs[0].data();
        if (item && item.commission !== undefined) {
          setCommissionRatePercent(Number(item.commission));
        }
      }
    }, (error) => {
      console.warn("Could not query individual commission. Using 10% default.", error);
    });

    return () => unsubscribe();
  }, [userProfile?.email]);

  useEffect(() => {
    if (!userProfile) return;

    setLoading(true);
    // Fetch bets bound to this Cambista
    const colRef = collection(db, "bets");
    const q = query(colRef, where("cambistaId", "==", userProfile.userId));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched: Bet[] = [];
      snapshot.forEach((doc) => {
        fetched.push({ ...doc.data() } as Bet);
      });

      // Sort chronological descending
      fetched.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      if (fetched.length === 0) {
        setBets(localSimulatedCambistaBets);
      } else {
        setBets(fetched);
      }
      setLoading(false);
    }, (error) => {
      console.warn("Firestore error in Cambista Panel, loading simulated commission data.", error);
      setBets(localSimulatedCambistaBets);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userProfile]);

  // Cambistas receive dynamic commission of the stakes registered
  const commissionRate = commissionRatePercent / 100; 
  const totalWagered = bets.reduce((acc, curr) => acc + curr.stake, 0);
  const commissionEarned = Number((totalWagered * commissionRate).toFixed(2));
  const activeClientsCount = Array.from(new Set(bets.map(b => b.customerName || "Geral"))).length;

  const formatDate = (isoStr: string) => {
    try {
      return new Date(isoStr).toLocaleString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch (e) {
      return isoStr;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "won":
        return <span className="text-[10px] bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 font-bold uppercase tracking-wider px-2 py-0.5 rounded-lg">GANHOU</span>;
      case "lost":
        return <span className="text-[10px] bg-rose-500/10 border border-rose-500/25 text-rose-400 font-bold uppercase tracking-wider px-2 py-0.5 rounded-lg">PERDEU</span>;
      case "cancelled":
        return <span className="text-[10px] bg-slate-500/10 border border-slate-500/25 text-slate-400 font-bold uppercase tracking-wider px-2 py-0.5 rounded-lg">CANCELADO</span>;
      default:
        return <span className="text-[10px] bg-amber-500/10 border border-amber-500/25 text-amber-400 font-bold uppercase tracking-wider px-2 py-0.5 rounded-lg animate-pulse">PENDENTE</span>;
    }
  };

  return (
    <div id="cambista-panel-feed" className="flex-1 bg-slate-900/10 p-4 md:p-6 space-y-6 overflow-y-auto">
      
      {/* Introduction banner */}
      <div className="purple-gradient-glow p-5 rounded-2xl border border-blue-900/35 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-[#0F172A]/90">
        <div>
          <span className="text-[10px] font-mono tracking-widest text-[#F8FAFC] uppercase font-extrabold flex items-center gap-1.5 leading-none bg-blue-600 px-3 py-1 rounded-full border border-blue-400/40 w-fit">
            <Stamp className="h-4 w-4" />
            Área de Vendas Cambista
          </span>
          <h1 className="font-display font-black text-2xl text-white mt-3 Pl-0.5">
            Registro do Cambista
          </h1>
          <p className="text-xs text-slate-350 text-slate-300 mt-2 pl-0.5 leading-relaxed">
            Monitore suas emissões de palpites virtuais, comissão unificada ({commissionRatePercent}% garantidos) e gere comprovantes imediatos de bilhetes para clientes parceiros.
          </p>
        </div>

        {/* Quick commission dashboard panels */}
        <div className="grid grid-cols-3 gap-2.5 w-full md:w-auto">
          <div className="bg-[#080D1A] border border-blue-900/35 p-3 rounded-xl text-left">
            <span className="text-[8px] text-slate-400 font-mono uppercase tracking-wider block font-bold">Clientes</span>
            <span className="text-sm font-black font-mono text-white flex items-center gap-1">
              <Users className="h-3.5 w-3.5 text-blue-400" />
              {activeClientsCount}
            </span>
          </div>

          <div className="bg-[#080D1A] border border-blue-900/35 p-3 rounded-xl text-left">
            <span className="text-[8px] text-slate-400 font-mono uppercase tracking-wider block font-bold">Vendas Totais</span>
            <span className="text-sm font-black font-mono text-white block">
              R$ {totalWagered.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="bg-emerald-950/25 border border-emerald-900/30 p-3 rounded-xl text-left">
            <span className="text-[8px] text-emerald-400 font-mono uppercase tracking-wider block font-bold">Comissão ({commissionRatePercent}%)</span>
            <span className="text-sm font-black font-mono text-emerald-400 block">
              R$ {commissionEarned.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>

      {/* Guide Box instructions */}
      <div className="p-4 rounded-xl bg-blue-950/20 border border-blue-800/25 text-left space-y-1.5 font-sans">
        <h3 className="font-bold text-white text-xs flex items-center gap-1.5 uppercase font-mono text-blue-300">
          <CircleDollarSign className="h-4 w-4 text-emerald-400" />
          Como registrar um bilhete presencial?
        </h3>
        <p className="text-xs text-slate-300 leading-relaxed">
          Basta montar os palpites escolhidos pelo seu cliente utilizando o <strong>Feed Esportivo de Odds</strong> no menu ao lado. Ao preencher o cupom à direita, o sistema abrirá um campo obrigatório para você digitar o <strong>Nome do Cliente</strong>. Ao gravar o palpite, o voucher é emitido, seu saldo é preservado, e sua comissão de {commissionRatePercent}% é creditada de imediato no relatório abaixo!
        </p>
      </div>

      {/* Relatório detailed table */}
      <div>
        <h2 className="font-display font-black text-sm text-white mb-3 text-left tracking-wide uppercase">
          Vouchers Emitidos na sua Rede
        </h2>

        {loading ? (
          <div className="flex justify-center items-center py-10">
            <div className="h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : bets.length === 0 ? (
          <div className="p-10 border border-blue-900/15 rounded-xl text-center">
            <span className="text-xs text-slate-400 font-semibold block">Nenhum bilhete emitido por você ainda.</span>
          </div>
        ) : (
          <div className="bg-[#0F172A] rounded-2xl border border-blue-900/35 overflow-hidden shadow-xl">
            <div className="p-3 bg-[#080D1A] border-b border-blue-900/35 hidden sm:grid grid-cols-12 text-[10px] font-mono tracking-wider uppercase text-slate-400 text-left select-none font-bold">
              <span className="col-span-2">CÓDIGO</span>
              <span className="col-span-3">NOME DO CLIENTE</span>
              <span className="col-span-3">PALPITES EMBUTIDOS</span>
              <span className="col-span-1.5 text-right">STAKE</span>
              <span className="col-span-1.5 text-right">PRÊMIO PROPOSTO</span>
              <span className="col-span-1 text-center">STATUS</span>
            </div>

            <div className="divide-y divide-blue-900/25">
              {bets.map((bet) => {
                const selectionsSummary = bet.selections.map(s => `${s.homeTeam} x ${s.awayTeam}`).join(" | ");
                return (
                  <div key={bet.betId} className="p-4 sm:grid sm:grid-cols-12 flex flex-col gap-2 text-left font-sans text-xs items-center justify-between sm:gap-0 hover:bg-slate-850/10 transition">
                    
                    {/* ID */}
                    <div className="sm:col-span-2 text-blue-400 font-mono font-bold">
                      {bet.betId}
                    </div>

                    {/* Customer */}
                    <div className="sm:col-span-3 text-white font-extrabold text-sm sm:text-xs">
                      {bet.customerName || "Consumidor Geral"}
                    </div>

                    {/* Summary selections descs */}
                    <div className="sm:col-span-3 text-slate-400 text-[11px] truncate pr-4 text-left w-full sm:w-auto" title={selectionsSummary}>
                      {selectionsSummary}
                    </div>

                    {/* Stake */}
                    <div className="sm:col-span-1.5 text-slate-200 font-mono font-bold sm:text-right">
                      R$ {bet.stake.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </div>

                    {/* Return potential payout */}
                    <div className="sm:col-span-1.5 text-emerald-400 font-bold font-mono sm:text-right">
                      R$ {bet.potentialPayout.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </div>

                    {/* Badge Status */}
                    <div className="sm:col-span-1 flex justify-center mt-2 sm:mt-0">
                      {getStatusBadge(bet.status)}
                    </div>

                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

    </div>
  );
};
