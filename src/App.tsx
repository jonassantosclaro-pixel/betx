/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Header } from "./components/Header";
import { LeftSidebar } from "./components/LeftSidebar";
import { HomeMain } from "./components/HomeMain";
import { BetSlip } from "./components/BetSlip";
import { BetBuilderModal } from "./components/BetBuilderModal";
import { UserPanel } from "./components/UserPanel";
import { CambistaPanel } from "./components/CambistaPanel";
import { AdminPanel } from "./components/AdminPanel";
import { Game, BetSelection, OperationType } from "./types";
import { doc, setDoc } from "firebase/firestore";
import { db, handleFirestoreError } from "./firebase";
import { ClassificacaoView } from "./components/ClassificacaoView";
import { TeamDetailsView } from "./components/TeamDetailsView";
import { IntroSplash } from "./components/IntroSplash";
import { 
  Trophy, 
  Coins, 
  Settings, 
  Briefcase, 
  ShieldCheck, 
  History,
  FileCode,
  Tv,
  Lock,
  Compass,
  Star
} from "lucide-react";

const LoginFormGate: React.FC<{ roleRequired: "cambista" | "admin" }> = ({ roleRequired }) => {
  const { loginCustom } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSubmitting(true);
    try {
      await loginCustom(email, password);
    } catch (err) {
      setErrorMsg("Falha ao autenticar. Verifique suas credenciais.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-6 bg-slate-950/10 font-sans">
      <div className="w-full max-w-sm bg-[#0F172A] border border-blue-900/40 rounded-2xl p-6 text-left space-y-4 shadow-xl">
        <div className="text-center pb-2 border-b border-blue-900/20">
          <Lock className="h-8 w-8 text-blue-500 mx-auto mb-2" />
          <h2 className="text-sm font-mono font-black text-white uppercase tracking-wider">Acesso Restrito</h2>
          <p className="text-[11px] text-slate-450 text-slate-300 mt-1">
            Esta área é restrita para contas do tipo {roleRequired === "admin" ? "Master Admin" : "Cambistas Credenciados"}. Faça login abaixo.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {errorMsg && (
            <div className="p-2 bg-red-950/40 border border-red-500/20 text-red-000 text-red-400 text-[11px] rounded-lg">
              {errorMsg}
            </div>
          )}

          <div>
            <label className="block text-[9px] font-mono tracking-widest text-[#94A3B8] uppercase font-black mb-1">
              E-mail de Operador
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#080D1A] border border-slate-700/60 rounded-xl px-3 py-1.5 text-xs text-white outline-none focus:border-blue-500 transition"
              placeholder="exemplo@phbet.com"
            />
          </div>

          <div>
            <label className="block text-[9px] font-mono tracking-widest text-[#94A3B8] uppercase font-black mb-1">
              Senha do Sistema
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#080D1A] border border-slate-700/60 rounded-xl px-3 py-1.5 text-xs text-white outline-none focus:border-blue-500 transition"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-black uppercase rounded-lg transition active:scale-95 cursor-pointer"
          >
            {submitting ? "Autenticando..." : "Entrar agora"}
          </button>
        </form>
      </div>
    </div>
  );
};

const AppContent: React.FC = () => {
  const { 
    userProfile, 
    loading, 
    loginCustom, 
    registerCustom, 
    logout,
    updateUserBalance 
  } = useAuth();
  
  const [introActive, setIntroActive] = useState(true);
  
  // Login/Register custom form states
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [registerName, setRegisterName] = useState("");
  const [registerRole, setRegisterRole] = useState<"usuario" | "cambista">("usuario");

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    try {
      if (isRegisterMode) {
        const isDefaultAdmin = loginEmail === "admin@phbet.com" || loginEmail === "phbet@x.com" || loginEmail === "jonassantosclaro@gmail.com";
        const roleAssigned = isDefaultAdmin ? "admin" : registerRole;
        
        await registerCustom(loginEmail, loginPassword, registerName || "Apostador PH", roleAssigned);
        
        alert("Conta registrada com sucesso! Agora você pode fazer login.");
        setIsRegisterMode(false);
      } else {
        await loginCustom(loginEmail, loginPassword);
        setLoginEmail("");
        setLoginPassword("");
      }
    } catch (err: any) {
      console.error("Login fail", err);
      setLoginError("Credenciais inválidas ou e-mail/senha incorretos.");
    }
  };

  // App-wide views navigation state
  const [activeView, setActiveView] = useState<"FEED" | "HISTORICO" | "CAMBISTA" | "ADMIN" | "CLASSIFICACAO" | "TEAM_DETAILS">("FEED");
  const [selectedLeague, setSelectedLeague] = useState<string | null>(null);
  const [selectedTeamName, setSelectedTeamName] = useState<string>("");
  
  // Games & Odds state
  const [games, setGames] = useState<Game[]>([]);
  const [loadingGames, setLoadingGames] = useState(true);
  
  // Selections inside active bet slip list
  const [selectedSelections, setSelectedSelections] = useState<BetSelection[]>([]);
  
  // Bet Builder active state
  const [builderGame, setBuilderGame] = useState<Game | null>(null);
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);

  // Load sports fixtures from Express unified backend proxy
  const loadActiveGames = async () => {
    try {
      setLoadingGames(true);
      const res = await fetch("/api/games");
      if (res.ok) {
        const list = await res.json();
        setGames(list);
      }
    } catch (e) {
      console.error("Express backend game listings load failed", e);
    } finally {
      setLoadingGames(false);
    }
  };

  useEffect(() => {
    loadActiveGames();
  }, []);

  // Sync navigation view if user role changes dynamically
  useEffect(() => {
    if (userProfile) {
      if (userProfile.role === "admin") {
        setActiveView("ADMIN"); // Admin loads straight into admin center
      } else if (userProfile.role === "cambista") {
        setActiveView("CAMBISTA"); // Cambista loads straight into their terminal
      } else {
        setActiveView("FEED"); // Regular user loads into Feed
      }
    }
  }, [userProfile?.userId]);

  // Handle standard Match Winner odd selections clicked from Home Feed
  const handleSelectOdd = (game: Game, market: string, selection: string, odds: number) => {
    const existsIndex = selectedSelections.findIndex(
      (s) => s.gameId === game.gameId && s.market === market
    );

    if (existsIndex !== -1) {
      const currentChoice = selectedSelections[existsIndex];
      if (currentChoice.selection === selection) {
        setSelectedSelections(prev => prev.filter((_, idx) => idx !== existsIndex));
      } else {
        const updated = [...selectedSelections];
        updated[existsIndex] = {
          gameId: game.gameId,
          homeTeam: game.homeTeam,
          awayTeam: game.awayTeam,
          league: game.league,
          market,
          selection,
          odds,
        };
        setSelectedSelections(updated);
      }
    } else {
      const newSel: BetSelection = {
        gameId: game.gameId,
        homeTeam: game.homeTeam,
        awayTeam: game.awayTeam,
        league: game.league,
        market,
        selection,
        odds,
      };
      setSelectedSelections([...selectedSelections, newSel]);
    }
  };

  // Remove selection callback
  const handleRemoveSelection = (gameId: string, selectionName: string) => {
    setSelectedSelections(prev =>
      prev.filter((s) => !(s.gameId === gameId && s.selection === selectionName))
    );
  };

  // Setup / trigger Bet Builder Modal Custom add
  const handleAddBetBuilderChoice = (customChoice: BetSelection) => {
    const filteredOutSameGame = selectedSelections.filter(s => s.gameId !== customChoice.gameId);
    setSelectedSelections([...filteredOutSameGame, customChoice]);
  };

  // Submit and write ticket wagers to Firestore database containing custom error catches
  const handlePlaceBet = async (stake: number, type: "simple" | "multiple" | "builder", customerName?: string) => {
    if (stake < 5) {
      throw new Error("O valor mínimo para realizar um palpite é de R$ 5,00!");
    }

    const randomTicketSuffix = Math.floor(10000 + Math.random() * 90000);
    const generatedBetId = `BILHETE-${randomTicketSuffix}`;
    const calculatedOdds = selectedSelections.reduce((acc, curr) => acc * curr.odds, 1.00);
    const rawPayout = stake * calculatedOdds;
    const finalPayout = Math.min(Number(rawPayout.toFixed(2)), 10000);

    const betTicketData = {
      betId: generatedBetId,
      userId: userProfile ? userProfile.userId : "guest",
      customerName: customerName || (userProfile ? userProfile.name : "Apostador Visitante"),
      cambistaId: userProfile && userProfile.role === "cambista" ? userProfile.userId : null,
      status: "pending",
      stake: Number(stake.toFixed(2)),
      odds: Number(calculatedOdds.toFixed(2)),
      potentialPayout: finalPayout,
      type,
      selections: selectedSelections,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const targetDocPath = `bets/${generatedBetId}`;
    try {
      await setDoc(doc(db, "bets", generatedBetId), betTicketData);

      if (userProfile && userProfile.role !== "cambista") {
        await updateUserBalance(-stake);
      }
      
      return generatedBetId;
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, targetDocPath);
      return null;
    }
  };

  // Get active role display string to make site ultra modern and intuitive
  const getDisplayHeaderLabel = () => {
    if (!userProfile) return "Visitante";
    if (userProfile.role === "admin") return "Painel Master Admin";
    if (userProfile.role === "cambista") return "Terminal de Vendas cambista";
    return "Menu Principal";
  };

  if (introActive) {
    return <IntroSplash onComplete={() => setIntroActive(false)} />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080D1A] flex items-center justify-center font-sans text-slate-100 bg-[#080D1A]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-slate-400 font-mono tracking-widest uppercase">Carregando PH BET...</span>
        </div>
      </div>
    );
  }

  return (
    <div id="phbet-hub" className="min-h-screen flex flex-col bg-[#080D1A] text-slate-100">
      
      {/* Top Banner Navigation Header */}
      <Header />

      {/* Main Container Layout */}
      <div className="flex-1 flex flex-col lg:flex-row items-stretch col-span-1 border-slate-100">
        
        {/* Left Column Controls */}
        <div className="w-full lg:w-64 flex flex-col shrink-0 border-r border-blue-900/35 bg-[#0F172A]">
          
          {/* Main Navigation menu list */}
          <div className="p-4 space-y-2 border-b border-blue-900/35 select-none text-left">
            <span className="text-[10px] uppercase font-mono tracking-widest text-slate-400 font-extrabold block pl-1.5 mb-2">
              MENU DE OPERAÇÕES
            </span>
            
            <button
              id="nav-feed"
              onClick={() => { setActiveView("FEED"); setSelectedLeague(null); }}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-black transition text-left cursor-pointer border ${
                activeView === "FEED" 
                  ? "bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20" 
                  : "text-slate-300 border-transparent hover:bg-slate-800/40 hover:text-white"
              }`}
            >
              <Trophy className="h-4 w-4 text-blue-400" />
              Feed Esportivo (Odds)
            </button>

            <button
              id="nav-classificacao"
              onClick={() => setActiveView("CLASSIFICACAO")}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-black transition text-left cursor-pointer border ${
                activeView === "CLASSIFICACAO" 
                  ? "bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20" 
                  : "text-slate-300 border-transparent hover:bg-slate-800/40 hover:text-white"
              }`}
            >
              <Trophy className="h-4 w-4 text-yellow-400" />
              Classificações (Tabelas)
            </button>

            <button
              id="nav-history"
              onClick={() => setActiveView("HISTORICO")}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-black transition text-left cursor-pointer border ${
                activeView === "HISTORICO" 
                  ? "bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20" 
                  : "text-slate-350 text-slate-300 border-transparent hover:bg-slate-800/40 hover:text-white"
              }`}
            >
              <History className="h-4 w-4 text-sky-400" />
              {userProfile ? "Minhas Apostas (Bilhetes)" : "Conferir Bilhete (Voucher)"}
            </button>

            {/* Cambista panel view toggle - visible for everyone but gate-guarded */}
            <button
              id="nav-cambista"
              onClick={() => setActiveView("CAMBISTA")}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-black transition text-left cursor-pointer border ${
                activeView === "CAMBISTA" 
                  ? "bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20" 
                  : "text-slate-300 border-transparent hover:bg-slate-800/40 hover:text-white"
              }`}
            >
              <Briefcase className="h-4 w-4 text-emerald-400" />
              Painel do Cambista
            </button>

            {/* Admin panel view toggle - visible for everyone but gate-guarded */}
            <button
              id="nav-admin"
              onClick={() => setActiveView("ADMIN")}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-black transition text-left cursor-pointer border ${
                activeView === "ADMIN" 
                  ? "bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20" 
                  : "text-slate-300 border-transparent hover:bg-slate-800/40 hover:text-white"
              }`}
            >
              <ShieldCheck className="h-4 w-4 text-red-400" />
              Painel Admin Master
            </button>

          </div>

          {/* Sidebar league filtration (only renders when viewing the general listings feed) */}
          {activeView === "FEED" ? (
            <LeftSidebar 
              selectedLeague={selectedLeague} 
              onSelectLeague={setSelectedLeague} 
              className="flex-1"
            />
          ) : (
            <div className="p-5 text-xs text-slate-400 leading-relaxed italic text-left select-none bg-slate-900/20 flex-1">
              <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-blue-400 font-bold mb-2">
                <Compass className="h-4 w-4" />
                DICA DO PORTAL
              </div>
              Você está navegando na visão de <strong className="text-white block not-italic mt-0.5">{getDisplayHeaderLabel()}</strong>. Use o menu acima para transitar livremente de forma instantânea.
            </div>
          )}
        </div>

        {/* Dynamic Center Workstream Views Container */}
        <div className="flex-1 flex flex-col min-w-0">
          {activeView === "FEED" && (
            <HomeMain 
              games={games}
              loading={loadingGames}
              selectedLeague={selectedLeague}
              onOddsSelect={handleSelectOdd}
              onOpenBetBuilder={(g) => { setBuilderGame(g); setIsBuilderOpen(true); }}
              selectedSelections={selectedSelections}
            />
          )}

          {activeView === "CLASSIFICACAO" && (
            <ClassificacaoView 
              onSelectTeam={(name) => {
                setSelectedTeamName(name);
                setActiveView("TEAM_DETAILS");
              }} 
            />
          )}

          {activeView === "TEAM_DETAILS" && (
            <TeamDetailsView 
              teamName={selectedTeamName} 
              onBack={() => setActiveView("CLASSIFICACAO")} 
            />
          )}

          {activeView === "HISTORICO" && <UserPanel />}

          {activeView === "CAMBISTA" && (
            userProfile && (userProfile.role === "cambista" || userProfile.role === "admin") ? (
              <CambistaPanel />
            ) : (
              <LoginFormGate roleRequired="cambista" />
            )
          )}

          {activeView === "ADMIN" && (
            userProfile && userProfile.role === "admin" ? (
              <AdminPanel games={games} onRefreshGames={loadActiveGames} />
            ) : (
              <LoginFormGate roleRequired="admin" />
            )
          )}
        </div>

        {/* Right Sidebar: Active Interactive Bet Slip */}
        <BetSlip 
          selections={selectedSelections}
          onRemoveSelection={handleRemoveSelection}
          onClearSlip={() => setSelectedSelections([])}
          userProfile={userProfile}
          onPlaceBet={handlePlaceBet}
        />

      </div>

      {/* Bet Builder popup modal */}
      {builderGame && (
        <BetBuilderModal 
          game={builderGame}
          isOpen={isBuilderOpen}
          onClose={() => { setBuilderGame(null); setIsBuilderOpen(false); }}
          onAddToSlip={handleAddBetBuilderChoice}
        />
      )}

    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
