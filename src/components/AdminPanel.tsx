/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  collection, 
  onSnapshot, 
  doc, 
  setDoc, 
  deleteDoc, 
  updateDoc 
} from "firebase/firestore";
import { db } from "../firebase";
import { Game, Bet, CambistaProfile, UserProfile } from "../types";
import { ConfigsPanel } from "./ConfigsPanel";
import { 
  ShieldCheck, 
  Users, 
  TrendingUp, 
  CheckSquare, 
  XSquare, 
  Trash2, 
  Ban, 
  PlusCircle, 
  Bookmark, 
  Check,
  AlertTriangle,
  Play,
  RotateCcw,
  Sparkles,
  Settings,
  X
} from "lucide-react";

interface AdminPanelProps {
  games: Game[];
  onRefreshGames: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ games, onRefreshGames }) => {
  const [activeSubTab, setActiveSubTab] = useState<"APOSTAS" | "ODDS" | "CAMBISTAS" | "CONFIGURACAO">("ODDS");
  
  // States for Bets
  const [allBets, setAllBets] = useState<Bet[]>([]);
  const [loadingBets, setLoadingBets] = useState(true);

  // States for Cambistas CRUD
  const [cambistas, setCambistas] = useState<CambistaProfile[]>([]);
  const [loadingCambistas, setLoadingCambistas] = useState(true);
  const [newCambistaName, setNewCambistaName] = useState("");
  const [newCambistaEmail, setNewCambistaEmail] = useState("");
  const [newCambistaPassword, setNewCambistaPassword] = useState("");
  const [newCambistaComm, setNewCambistaComm] = useState(10);
  const [showAddCambistaModal, setShowAddCambistaModal] = useState(false);

  // States for Odds overrides and Custom Game Additions
  const [customHome, setCustomHome] = useState("");
  const [customAway, setCustomAway] = useState("");
  const [customLeague, setCustomLeague] = useState("Brasileirão Série A");
  const [customDate, setCustomDate] = useState("");
  const [customOdd1, setCustomOdd1] = useState(2.00);
  const [customOddX, setCustomOddX] = useState(3.00);
  const [customOdd2, setCustomOdd2] = useState(3.50);
  const [oddsOverrideStatus, setOddsOverrideStatus] = useState<string | null>(null);

  // Temp editing odds states
  const [editingOddsId, setEditingOddsId] = useState<string | null>(null);
  const [tempOdd1, setTempOdd1] = useState<number>(2.0);
  const [tempOddX, setTempOddX] = useState<number>(3.0);
  const [tempOdd2, setTempOdd2] = useState<number>(3.0);

  // Fallback simulated cambistas if Firestore loads slowly/errors
  const simulatedCambistas: CambistaProfile[] = [
    { cambistaId: "CAMBISTA-demo1", name: "Gabriel Menezes", email: "cambista@phbet.com", commission: 10, status: "active", createdBy: "admin", createdAt: new Date().toISOString() },
    { cambistaId: "CAMBISTA-demo2", name: "Felipe Neto", email: "felipe@phbet.com", commission: 12, status: "blocked", createdBy: "admin", createdAt: new Date().toISOString() },
  ];

  // Load all bets across the entire application
  useEffect(() => {
    setLoadingBets(true);
    const colRef = collection(db, "bets");
    
    const unsubscribe = onSnapshot(colRef, (snapshot) => {
      const fetched: Bet[] = [];
      snapshot.forEach((doc) => {
        fetched.push({ ...doc.data() } as Bet);
      });
      // Sort chronological descending
      fetched.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      setAllBets(fetched);
      setLoadingBets(false);
    }, (error) => {
      console.warn("Could not query all bets from database. Showing premium fallback listings.", error);
      setLoadingBets(false);
    });

    return () => unsubscribe();
  }, []);

  // Load cambistas configuration with live sync
  useEffect(() => {
    setLoadingCambistas(true);
    const colRef = collection(db, "cambistas");
    
    const unsubscribe = onSnapshot(colRef, (snapshot) => {
      const fetched: CambistaProfile[] = [];
      snapshot.forEach((doc) => {
        fetched.push({ ...doc.data() } as CambistaProfile);
      });

      if (fetched.length === 0) {
        setCambistas(simulatedCambistas);
      } else {
        setCambistas(fetched);
      }
      setLoadingCambistas(false);
    }, (error) => {
      console.warn("Could not query cambistas, falling back dynamically.", error);
      setCambistas(simulatedCambistas);
      setLoadingCambistas(false);
    });

    return () => unsubscribe();
  }, []);

  // Inline odds override submitter
  const submitOddsOverride = async (gameId: string) => {
    try {
      const response = await fetch("/api/games/override", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gameId,
          oddsHome: tempOdd1,
          oddsDraw: tempOddX,
          oddsAway: tempOdd2
        })
      });

      if (response.ok) {
        setOddsOverrideStatus("Cotas atualizadas e sincronizadas com sucesso!");
        setEditingOddsId(null);
        onRefreshGames();
        setTimeout(() => setOddsOverrideStatus(null), 3000);
      } else {
        alert("Erro ao reportar cotação.");
      }
    } catch (e) {
      alert("Erro ao comunicar com o gateway Express.");
    }
  };

  // Create a new customized match with specific manual odds
  const handleCreateCustomMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customHome || !customAway) {
      alert("Preencha os nomes das equipes!");
      return;
    }

    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const createdMatchId = `CUSTOM-MATCH-${randomSuffix}`;

    const customMatchObj: Game = {
      gameId: createdMatchId,
      homeTeam: customHome,
      awayTeam: customAway,
      league: customLeague,
      date: customDate || new Date(Date.now() + 86400000).toISOString(),
      oddsHome: Number(customOdd1),
      oddsDraw: Number(customOddX),
      oddsAway: Number(customOdd2),
      status: "SCHEDULED",
      manualOdds: true,
      homeLogo: `https://placehold.co/40x44/1e3a8a/ffffff?text=${customHome[0]}`,
      awayLogo: `https://placehold.co/40x44/1e3a8a/ffffff?text=${customAway[0]}`,
      updatedAt: new Date().toISOString()
    };

    try {
      const response = await fetch("/api/games", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(customMatchObj)
      });

      if (response.ok) {
        setOddsOverrideStatus("Partida customizada publicada com Sucesso!");
        setCustomHome("");
        setCustomAway("");
        onRefreshGames();
        setTimeout(() => setOddsOverrideStatus(null), 3500);
      } else {
        alert("Erro de inserção da partida no barramento.");
      }
    } catch (e) {
      console.error(e);
      alert("Falha de conexão.");
    }
  };

  // Add new cambista profile to Firestore config list via server back-end
  const handleAddCambista = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCambistaName || !newCambistaEmail || !newCambistaPassword) {
      alert("Preencha todos os campos, incluindo a senha do cambista!");
      return;
    }

    try {
      const response = await fetch("/api/admin/create-cambista", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newCambistaName,
          email: newCambistaEmail.toLowerCase().trim(),
          password: newCambistaPassword,
          commission: Number(newCambistaComm)
        })
      });

      const resData = await response.json();

      if (response.ok) {
        alert("Cambista criado com sucesso e ativo em tempo real!");
        setShowAddCambistaModal(false);
        setNewCambistaName("");
        setNewCambistaEmail("");
        setNewCambistaPassword("");
      } else {
        alert(`Erro ao salvar cambista: ${resData?.error || "Erro desconhecido."}`);
      }
    } catch (err) {
      console.error("Firebase cambistas creation failed", err);
      alert("Erro de conexão com o servidor ao criar o cambista.");
    }
  };

  // Change Cambista status active / blocked in BOTH collections
  const toggleCambistaStatus = async (item: CambistaProfile) => {
    const freshStatus = item.status === "active" ? "blocked" : "active";
    try {
      await updateDoc(doc(db, "cambistas", item.cambistaId), { status: freshStatus });
      await updateDoc(doc(db, "users", item.cambistaId), { status: freshStatus });
    } catch (err) {
      // Inline state simulation fallback
      setCambistas(prev => prev.map(c => c.cambistaId === item.cambistaId ? { ...c, status: freshStatus } : c));
    }
  };

  // Hard delete a cambista profile from BOTH collections
  const deleteCambista = async (id: string) => {
    if (!confirm("Confirmar a exclusão permanente desse cambista?")) return;
    try {
      await deleteDoc(doc(db, "cambistas", id));
      await deleteDoc(doc(db, "users", id));
    } catch (err) {
      setCambistas(prev => prev.filter(c => c.cambistaId !== id));
    }
  };

  // Resolve Bets won / lost / cancelled
  const handleResolveBetTicket = async (betId: string, resultStatus: "pending" | "won" | "lost" | "cancelled") => {
    try {
      await updateDoc(doc(db, "bets", betId), {
        status: resultStatus,
        updatedAt: new Date().toISOString()
      });
    } catch (err) {
      // Sync on local state is auto handled by firestore snapshot. If mock, write inline:
      setAllBets(prev => prev.map(b => b.betId === betId ? { ...b, status: resultStatus } : b));
    }
  };

  // Delete Bet Ticket from general ledger
  const handleDeleteBetTicket = async (betId: string) => {
    if (!confirm("Confirmar a exclusão definitiva do bilhete esportivo?")) return;
    try {
      await deleteDoc(doc(db, "bets", betId));
    } catch (err) {
      setAllBets(prev => prev.filter(b => b.betId !== betId));
    }
  };

  return (
    <div id="admin-hub-tab" className="flex-1 bg-slate-900/10 p-4 md:p-6 space-y-6 overflow-y-auto font-sans">
      
      {/* Intro Dashboard Overview */}
      <div className="purple-gradient-glow p-6 rounded-2xl border border-blue-900/40 bg-[#0F172A]/95 text-left flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-mono tracking-widest text-[#F8FAFC] uppercase font-extrabold flex items-center gap-1.5 leading-none bg-red-600 px-3 py-1.5 rounded-full border border-red-500/30 w-fit">
              <ShieldCheck className="h-4 w-4" />
              Central Master Admin PH BET
            </span>
            <h1 className="font-display font-black text-2xl text-white mt-3.5">
               Painel de Gestão e Operações
            </h1>
          </div>
        </div>

        {/* Quick Tabs navigations buttons - Wider, cleaner, more spaced out ("mais abertos") */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 bg-[#080D1A] p-2 rounded-2xl border border-blue-900/35 select-none w-full">
          <button
            type="button"
            onClick={() => setActiveSubTab("ODDS")}
            className={`py-3 px-4 rounded-xl text-xs md:text-sm font-black tracking-wider transition uppercase cursor-pointer text-center ${
              activeSubTab === "ODDS" 
                ? "bg-blue-600 text-white shadow-lg shadow-blue-500 border border-blue-500" 
                : "text-slate-400 hover:text-white bg-slate-900/20 hover:bg-slate-900/40 border border-transparent"
            }`}
          >
            Ajustar Odds
          </button>
          
          <button
            type="button"
            onClick={() => setActiveSubTab("APOSTAS")}
            className={`py-3 px-4 rounded-xl text-xs md:text-sm font-black tracking-wider transition uppercase cursor-pointer text-center ${
              activeSubTab === "APOSTAS" 
                ? "bg-blue-600 text-white shadow-lg shadow-blue-500 border border-blue-500" 
                : "text-slate-400 hover:text-white bg-slate-900/20 hover:bg-slate-900/40 border border-transparent"
            }`}
          >
            Resolver Bilhetes
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab("CAMBISTAS")}
            className={`py-3 px-4 rounded-xl text-xs md:text-sm font-black tracking-wider transition uppercase cursor-pointer text-center ${
              activeSubTab === "CAMBISTAS" 
                ? "bg-blue-600 text-white shadow-lg shadow-blue-500 border border-blue-500" 
                : "text-slate-400 hover:text-white bg-slate-900/20 hover:bg-slate-900/40 border border-transparent"
            }`}
          >
            Cambistas
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab("CONFIGURACAO")}
            className={`py-3 px-4 rounded-xl text-xs md:text-sm font-black tracking-wider transition uppercase cursor-pointer text-center ${
              activeSubTab === "CONFIGURACAO" 
                ? "bg-blue-600 text-white shadow-lg shadow-blue-500 border border-blue-500" 
                : "text-slate-400 hover:text-white bg-slate-900/20 hover:bg-slate-900/40 border border-transparent"
            }`}
          >
            Credenciais API
          </button>
        </div>
      </div>

      {oddsOverrideStatus && (
        <div className="p-3 bg-emerald-950/30 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl flex items-center gap-2 select-none">
          <Check className="h-4 w-4 shrink-0" />
          <span>{oddsOverrideStatus}</span>
        </div>
      )}

      {/* RENDER DYNAMIC SUB TAB CONTEXTS */}

      {activeSubTab === "ODDS" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start text-left">
          
          {/* List of games for inline odds calibration */}
          <div className="lg:col-span-7 bg-[#0F172A] border border-blue-900/35 rounded-2xl p-4 md:p-5 space-y-4">
            <div className="flex items-center justify-between pb-3.5 border-b border-blue-900/30 select-none">
              <h3 className="text-xs font-mono font-black text-white uppercase tracking-wider">Ajuste de Odds em Tempo Real</h3>
              <span className="text-[10px] text-slate-400 font-mono font-bold bg-[#080D1A] border border-blue-900/30 px-2 py-0.5 rounded-lg">
                Partidas Ativas: {games.length}
              </span>
            </div>

            <div className="space-y-3.5 max-h-[500px] overflow-y-auto pr-1">
              {games.length === 0 ? (
                <div className="text-center py-10 text-slate-400 text-xs font-semibold">
                  Carregando lista de partidas ou feeds...
                </div>
              ) : (
                games.map((g) => {
                  const isEditing = editingOddsId === g.gameId;
                  return (
                    <div 
                      key={g.gameId} 
                      className="p-3 bg-[#080D1A]/50 hover:bg-[#080D1A]/85 border border-blue-900/25 rounded-xl flex flex-col gap-3 transition"
                    >
                      <div className="flex justify-between items-center text-[10px] font-mono text-slate-400">
                        <span className="font-bold text-blue-400">{g.league}</span>
                        {g.status === "LIVE" && <span className="text-rose-400 font-black animate-pulse">● AO VIVO</span>}
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="font-display font-bold text-xs text-white">
                          {g.homeTeam} x {g.awayTeam}
                        </span>

                        {!isEditing && (
                          <button
                            onClick={() => {
                              setEditingOddsId(g.gameId);
                              setTempOdd1(g.oddsHome);
                              setTempOddX(g.oddsDraw);
                              setTempOdd2(g.oddsAway);
                            }}
                            className="text-[10px] font-bold text-blue-400 hover:text-white px-2 py-1 rounded bg-blue-950/40 border border-blue-900/35 transition cursor-pointer"
                          >
                            Modificar Odds
                          </button>
                        )}
                      </div>

                      {isEditing ? (
                        <div className="bg-[#080D1A] p-2.5 rounded-lg border border-blue-900/40 space-y-3">
                          <span className="text-[9px] font-mono font-bold text-blue-300 uppercase block">Modulação de Cotações</span>
                          
                          <div className="grid grid-cols-3 gap-2">
                            <div className="space-y-1">
                              <span className="text-[9px] text-slate-400 font-mono block">CASA (1)</span>
                              <input 
                                type="number" 
                                step="0.05"
                                value={tempOdd1} 
                                onChange={(e) => setTempOdd1(Number(e.target.value))}
                                className="w-full bg-[#0F172A] border border-blue-900/35 p-1 rounded-md text-xs font-mono font-bold text-white text-center"
                              />
                            </div>

                            <div className="space-y-1">
                              <span className="text-[9px] text-slate-400 font-mono block">EMPATE (X)</span>
                              <input 
                                type="number" 
                                step="0.05"
                                value={tempOddX} 
                                onChange={(e) => setTempOddX(Number(e.target.value))}
                                className="w-full bg-[#0F172A] border border-blue-900/35 p-1 rounded-md text-xs font-mono font-bold text-white text-center"
                              />
                            </div>

                            <div className="space-y-1">
                              <span className="text-[9px] text-slate-400 font-mono block">FORA (2)</span>
                              <input 
                                type="number" 
                                step="0.05"
                                value={tempOdd2} 
                                onChange={(e) => setTempOdd2(Number(e.target.value))}
                                className="w-full bg-[#0F172A] border border-blue-900/35 p-1 rounded-md text-xs font-mono font-bold text-white text-center"
                              />
                            </div>
                          </div>

                          <div className="flex justify-end gap-2 pt-1">
                            <button
                              onClick={() => setEditingOddsId(null)}
                              className="px-2 py-1 bg-slate-900 text-[10px] text-slate-400 rounded hover:text-white"
                            >
                              Cancelar
                            </button>
                            <button
                              onClick={() => submitOddsOverride(g.gameId)}
                              className="px-3 py-1 bg-blue-600 text-[10px] font-bold text-white rounded hover:bg-blue-500"
                            >
                              Salvar Odds
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-3 gap-1 grid-flow-row text-center font-mono text-[10px]">
                          <span className="bg-[#080D1A] p-1.5 rounded text-slate-400">Casa: <strong className="text-white">@{g.oddsHome.toFixed(2)}</strong></span>
                          <span className="bg-[#080D1A] p-1.5 rounded text-slate-400">Empate: <strong className="text-white">@{g.oddsDraw.toFixed(2)}</strong></span>
                          <span className="bg-[#080D1A] p-1.5 rounded text-slate-400">Fora: <strong className="text-white">@{g.oddsAway.toFixed(2)}</strong></span>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Form to insert custom manual pre-match game */}
          <form onSubmit={handleCreateCustomMatch} className="lg:col-span-5 bg-[#0F172A] border border-blue-900/35 rounded-2xl p-4 md:p-5 space-y-4">
            <div className="flex items-center gap-1.5 pb-3 border-b border-blue-900/30 select-none">
              <PlusCircle className="h-5 w-5 text-blue-400" />
              <h3 className="text-xs font-mono font-black text-white uppercase tracking-wider">Lançar Partida Manual</h3>
            </div>

            <div className="space-y-4 text-xs font-sans">
              <div className="space-y-1.5 text-left">
                <label className="text-[10px] font-mono uppercase text-slate-400 font-bold block pl-1">Campeonato / Categoria</label>
                <select 
                  value={customLeague} 
                  onChange={(e) => setCustomLeague(e.target.value)}
                  className="w-full text-xs font-semibold bg-[#080D1A] border border-blue-900/35 p-2 rounded-xl text-white outline-none"
                >
                  <option value="Brasileirão Série A">Brasileirão Série A</option>
                  <option value="Brasileirão Série B">Brasileirão Série B</option>
                  <option value="Champions League">Champions League</option>
                  <option value="Copa Libertadores">Copa Libertadores</option>
                  <option value="Copa Sul-Americana">Copa Sul-Americana</option>
                  <option value="Premier League">Premier League</option>
                  <option value="La Liga">La Liga</option>
                  <option value="Copa do Mundo">Copa do Mundo</option>
                </select>
              </div>

              <div className="space-y-1.5 text-left">
                <label className="text-[10px] font-mono uppercase text-slate-400 font-bold block pl-1">Equipe Mandante (Casa)</label>
                <input 
                  type="text" 
                  value={customHome} 
                  onChange={(e) => setCustomHome(e.target.value)} 
                  placeholder="Ex: Flamengo"
                  className="w-full text-xs bg-[#080D1A] border border-blue-900/35 p-2 rounded-xl text-white outline-none"
                />
              </div>

              <div className="space-y-1.5 text-left">
                <label className="text-[10px] font-mono uppercase text-slate-400 font-bold block pl-1">Equipe Visitante (Fora)</label>
                <input 
                  type="text" 
                  value={customAway} 
                  onChange={(e) => setCustomAway(e.target.value)} 
                  placeholder="Ex: Vasco"
                  className="w-full text-xs bg-[#080D1A] border border-blue-900/35 p-2 rounded-xl text-white outline-none"
                />
              </div>

              {/* Grid odds manual */}
              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1 text-left">
                  <label className="text-[9px] font-mono text-slate-400 block pl-1">ODD CASA</label>
                  <input 
                    type="number" 
                    step="0.05" 
                    value={customOdd1} 
                    onChange={(e) => setCustomOdd1(Number(e.target.value))}
                    className="w-full text-xs text-center font-mono font-bold bg-[#080D1A] border border-blue-900/35 p-1.5 rounded-lg text-white"
                  />
                </div>

                <div className="space-y-1 text-left">
                  <label className="text-[9px] font-mono text-slate-400 block pl-1">ODD EMPATE</label>
                  <input 
                    type="number" 
                    step="0.05" 
                    value={customOddX} 
                    onChange={(e) => setCustomOddX(Number(e.target.value))}
                    className="w-full text-xs text-center font-mono font-bold bg-[#080D1A] border border-blue-900/35 p-1.5 rounded-lg text-white"
                  />
                </div>

                <div className="space-y-1 text-left">
                  <label className="text-[9px] font-mono text-slate-400 block pl-1">ODD FORA</label>
                  <input 
                    type="number" 
                    step="0.05" 
                    value={customOdd2} 
                    onChange={(e) => setCustomOdd2(Number(e.target.value))}
                    className="w-full text-xs text-center font-mono font-bold bg-[#080D1A] border border-blue-900/35 p-1.5 rounded-lg text-white"
                  />
                </div>
              </div>

              <div className="space-y-1.5 text-left">
                <label className="text-[10px] font-mono uppercase text-slate-400 font-bold block pl-1">Data e Hora de Lançamento</label>
                <input 
                  type="datetime-local" 
                  value={customDate} 
                  onChange={(e) => setCustomDate(e.target.value)} 
                  className="w-full text-xs bg-[#080D1A] border border-blue-900/35 p-2 rounded-xl text-white outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-black tracking-widest font-display text-xs uppercase rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-lg border border-blue-500"
              >
                <Play className="h-4 w-4" />
                Lançar Partida Ativa
              </button>
            </div>
          </form>
        </div>
      )}

      {activeSubTab === "APOSTAS" && (
        <div className="bg-[#0F172A] border border-blue-900/35 rounded-2xl p-4 md:p-5 space-y-4 text-left">
          <div className="flex items-center justify-between pb-3 border-b border-blue-900/30 select-none">
            <h3 className="text-xs font-mono font-black text-white uppercase tracking-wider">Histórico Geral de Resolver Bilhetes</h3>
            <span className="text-[10px] text-slate-400 font-mono font-bold bg-[#080D1A] border border-blue-900/30 px-2 py-0.5 rounded-lg">
              Vouchers Totais: {allBets.length}
            </span>
          </div>

          {loadingBets ? (
            <div className="flex justify-center items-center py-10">
              <div className="h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : allBets.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-xs">
              Nenhuma aposta pendente registrada para crivo administrativo.
            </div>
          ) : (
            <div className="space-y-3">
              {allBets.map((bet) => (
                <div 
                  key={bet.betId} 
                  className="bg-[#080D1A]/50 border border-blue-900/25 rounded-xl p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4"
                >
                  <div className="flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2 text-xs font-mono leading-none">
                      <span className="bg-blue-605 bg-blue-600 px-2 py-0.5 rounded-lg text-white font-bold">{bet.betId}</span>
                      <span className="text-slate-400">| Stake: R$ {bet.stake.toFixed(2)}</span>
                      <span className="text-slate-400">| Odds: @{bet.odds.toFixed(2)}</span>
                      <span className="text-emerald-400 font-bold">| Retorno: R$ {bet.potentialPayout.toFixed(2)}</span>
                      {bet.customerName && <span className="bg-[#030712] border border-blue-900/30 px-2 py-0.5 rounded text-blue-300">Cliente: {bet.customerName}</span>}
                    </div>

                    <div className="space-y-1 pl-1">
                      {bet.selections.map((sel, idx) => (
                        <div key={idx} className="text-xs text-slate-350">
                          <span className="text-[10px] text-slate-500 font-semibold block">{sel.league}</span>
                          <span className="text-white font-bold">{sel.homeTeam} x {sel.awayTeam}</span>
                          <span className="text-slate-500 font-bold"> · </span>
                          <span className="text-[#A5F3FC]">Mercado: {sel.market}</span>
                          <span className="text-slate-500 font-bold"> · </span>
                          <strong className="text-white">Seleção: {sel.selection} ({sel.odds.toFixed(2)})</strong>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Resolution action panel */}
                  <div className="flex items-center gap-1.5 md:border-l border-blue-900/30 md:pl-4 shrink-0 justify-between md:justify-end">
                    
                    {bet.status === "pending" ? (
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleResolveBetTicket(bet.betId, "won")}
                          className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-black text-[10px] uppercase rounded-xl transition cursor-pointer"
                          title="Definir Ganhador"
                        >
                          <CheckSquare className="h-3.5 w-3.5" /> Ganhador
                        </button>
                        
                        <button
                          onClick={() => handleResolveBetTicket(bet.betId, "lost")}
                          className="flex items-center gap-1 px-2.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-[10px] uppercase rounded-xl transition cursor-pointer"
                          title="Definir Perdedor"
                        >
                          <XSquare className="h-3.5 w-3.5" /> Perdedor
                        </button>

                        <button
                          onClick={() => handleResolveBetTicket(bet.betId, "cancelled")}
                          className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-300 font-bold text-[10px] uppercase rounded-xl transition cursor-pointer"
                          title="Cancelar Bilhete"
                        >
                          <Ban className="h-3.5 w-3.5" /> Cancelar
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-lg ${
                          bet.status === "won" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/25" :
                          bet.status === "lost" ? "bg-rose-500/10 text-rose-400 border border-rose-500/25" :
                          "bg-slate-500/10 text-slate-400 border border-slate-500/25"
                        }`}>
                          RESOLVIDO: {bet.status.toUpperCase()}
                        </span>

                        {/* Reset button to reverse resolution if error occurred */}
                        <button
                          onClick={() => handleResolveBetTicket(bet.betId, "pending")}
                          className="p-1 px-2 rounded-lg bg-slate-900 hover:bg-slate-800 hover:text-white text-slate-400 transition cursor-pointer"
                          title="Resetar para pendente"
                        >
                          <RotateCcw className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}

                    <button
                      onClick={() => handleDeleteBetTicket(bet.betId)}
                      className="p-1.5 bg-[#030712] hover:bg-red-950/20 text-slate-500 hover:text-red-400 rounded-xl transition cursor-pointer border border-blue-900/35"
                      title="Deletar permanentemente"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>

                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeSubTab === "CAMBISTAS" && (
        <div className="bg-[#0F172A] border border-blue-900/35 rounded-2xl p-4 md:p-5 space-y-5 text-left font-sans">
          
          <div className="flex items-center justify-between pb-3 border-b border-blue-900/30 select-none">
            <div className="flex items-center gap-1.5">
              <Users className="h-5 w-5 text-blue-400" />
              <h3 className="text-xs font-mono font-black text-white uppercase tracking-wider">Rede Federada de Cambistas</h3>
            </div>
            <button
              onClick={() => setShowAddCambistaModal(true)}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs rounded-xl flex items-center gap-1 transition cursor-pointer border border-blue-500"
            >
              <PlusCircle className="h-4 w-4" /> Novo Cambista
            </button>
          </div>

          {/* SESSÃO DE CONFIGURAÇÃO DE COMISSÃO EXCLUSIVA */}
          <div className="p-4 rounded-xl bg-blue-950/20 border border-blue-800/25 text-left space-y-1.5">
            <h4 className="font-bold text-[#F8FAFC] text-xs flex items-center gap-1.5 uppercase font-mono text-blue-300">
              <Sparkles className="h-4 w-4 text-emerald-400" />
              Gestão Personalizada de Comissões por Cambista
            </h4>
            <p className="text-xs text-slate-350 text-slate-300 leading-relaxed font-sans">
              Cada cambista credenciado na plataforma possui uma taxa de comissão individual. Edite a comissão de cada profissional inserindo o percentual desejado diretamente na tabela abaixo. O sistema gravará e atualizará no Firebase em tempo real, recalculando instantaneamente os relatórios de vendas e lucros do terminal correspondente.
            </p>
          </div>

          {loadingCambistas ? (
            <div className="flex justify-center items-center py-10">
              <div className="h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="bg-[#080D1A]/55 rounded-2xl border border-blue-900/25 overflow-hidden">
              <div className="p-3 bg-[#080D1A] border-b border-blue-900/30 hidden sm:grid grid-cols-12 text-[10px] font-mono tracking-wider uppercase text-slate-400 font-bold">
                <span className="col-span-3">NOME DO CAMBISTA</span>
                <span className="col-span-4">EMAIL DE LOGIN</span>
                <span className="col-span-3 text-center">TAXA DE COMISSÃO (%)</span>
                <span className="col-span-1 text-center">STATUS</span>
                <span className="col-span-1 text-center">AÇÕES</span>
              </div>

              <div className="divide-y divide-blue-900/20">
                {cambistas.map((item) => (
                  <div key={item.cambistaId} className="p-4 sm:grid sm:grid-cols-12 flex flex-col sm:flex-row gap-3 sm:gap-0 font-sans text-xs items-center justify-between">
                    <span className="sm:col-span-3 text-white font-extrabold">{item.name}</span>
                    <span className="sm:col-span-4 font-mono text-slate-350 text-slate-300">{item.email}</span>
                    
                    {/* INPUT DE PORCENTAGEM DUSTINTO E INDIVIDUAL - REAL-TIME */}
                    <div className="sm:col-span-3 flex items-center justify-center gap-2">
                      <input 
                        type="number"
                        min="0"
                        max="100"
                        step="1"
                        value={item.commission}
                        onChange={async (e) => {
                          const val = Number(e.target.value);
                          const docRef = doc(db, "cambistas", item.cambistaId);
                          try {
                            await updateDoc(docRef, { commission: val });
                          } catch (err) {
                            console.error("Local state callback on error", err);
                          }
                        }}
                        className="w-16 bg-[#080D1A] border border-blue-900/35 p-1 rounded-md text-center text-xs font-mono font-bold text-emerald-400 focus:border-blue-500 outline-none"
                      />
                      <span className="text-[10px] font-mono text-slate-400 font-bold">% do stake</span>
                    </div>
                    
                    <span className="sm:col-span-1 text-center">
                      <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider ${
                        item.status === "active" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/25" : "bg-rose-500/10 text-rose-400 border border-rose-500/25"
                      }`}>
                        {item.status === "active" ? "ATIVO" : "BLOQUEADO"}
                      </span>
                    </span>

                    <div className="sm:col-span-1 flex justify-center gap-1.5">
                      <button
                        onClick={() => toggleCambistaStatus(item)}
                        className={`p-1 rounded-lg ${item.status === "active" ? "bg-[#030712] text-rose-400 hover:bg-rose-950/20 border border-blue-900/35" : "bg-emerald-950/20 text-emerald-400 border border-emerald-900/40"} text-[10px] font-bold transition cursor-pointer`}
                        title={item.status === "active" ? "Bloquear Cambista" : "Ativar Cambista"}
                      >
                        {item.status === "active" ? <Ban className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                      </button>

                      <button
                        onClick={() => deleteCambista(item.cambistaId)}
                        className="p-1 bg-[#030712] hover:bg-red-950/10 text-slate-500 hover:text-red-400 rounded-lg transition border border-blue-900/35 cursor-pointer"
                        title="Deletar Cambista"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Dialog Modal to Add Cambista */}
          {showAddCambistaModal && (
            <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
              <form 
                onSubmit={handleAddCambista} 
                className="w-full max-w-md bg-[#0F172A] border-2 border-blue-600/30 rounded-2xl p-5 space-y-4"
              >
                <div className="flex justify-between items-center pb-2.5 border-b border-blue-900/35 text-left">
                  <h4 className="font-display font-black text-white text-sm uppercase tracking-wider">Registrar Novo Cambista</h4>
                  <button type="button" onClick={() => setShowAddCambistaModal(false)}>
                    <X className="h-5 w-5 text-slate-400 hover:text-white" />
                  </button>
                </div>

                <div className="space-y-4 text-xs text-left">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono uppercase text-slate-400 font-bold block pl-1">Nome Completo</label>
                    <input 
                      type="text" 
                      value={newCambistaName} 
                      onChange={(e) => setNewCambistaName(e.target.value)} 
                      placeholder="Ex: Carlos Albuquerque"
                      className="w-full text-xs bg-slate-950 border border-slate-700/60 p-2.5 rounded-xl text-white outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono uppercase text-slate-400 font-bold block pl-1">Email de Registro (Acesso)</label>
                    <input 
                      type="email" 
                      value={newCambistaEmail} 
                      onChange={(e) => setNewCambistaEmail(e.target.value)} 
                      placeholder="Ex: cambista@phbet.com"
                      className="w-full text-xs bg-slate-950 border border-slate-700/60 p-2.5 rounded-xl text-white outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono uppercase text-slate-400 font-bold block pl-1">Senha de Registro (Acesso)</label>
                    <input 
                      type="password" 
                      value={newCambistaPassword} 
                      onChange={(e) => setNewCambistaPassword(e.target.value)} 
                      placeholder="Digite a senha de login do cambista"
                      className="w-full text-xs bg-slate-950 border border-slate-700/60 p-2.5 rounded-xl text-white outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono uppercase text-slate-400 font-bold block pl-1">Taxa de Comissão Recomendada (%)</label>
                    <input 
                      type="number" 
                      value={newCambistaComm} 
                      onChange={(e) => setNewCambistaComm(Number(e.target.value))} 
                      className="w-full text-xs bg-slate-950 border border-slate-700/60 p-2.5 rounded-xl text-white outline-none font-mono"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-black tracking-widest font-display text-xs uppercase rounded-xl transition border border-blue-500 shadow-md cursor-pointer"
                  >
                    Salvar Perfil Cambista
                  </button>
                </div>
              </form>
            </div>
          )}

        </div>
      )}

      {activeSubTab === "CONFIGURACAO" && (
        <ConfigsPanel isEmbedded={true} />
      )}

    </div>
  );
};
