/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { 
  Wallet, 
  LogOut, 
  User, 
  Shield, 
  TrendingUp, 
  Briefcase, 
  ChevronDown, 
  Key,
  HelpCircle,
  Sparkles,
  Lock,
  Mail,
  Check,
  UserCheck
} from "lucide-react";

export const Header: React.FC = () => {
  const { userProfile, loginCustom, registerCustom, logout } = useAuth();
  
  // Login modal states
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [registerName, setRegisterName] = useState("");
  const [registerRole, setRegisterRole] = useState<"usuario" | "cambista">("usuario");

  const getRoleLabelAndColor = (role: string) => {
    switch (role) {
      case "admin":
        return { label: "Administrador", bg: "bg-blue-600/20 text-blue-400 border border-blue-500/30" };
      case "cambista":
        return { label: "Cambista Credenciado", bg: "bg-sky-500/20 text-sky-400 border border-sky-400/35" };
      default:
        return { label: "Apostador", bg: "bg-slate-700/30 text-white border border-slate-500/25" };
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    try {
      if (isRegisterMode) {
        const isDefaultAdmin = loginEmail === "admin@phbet.com" || loginEmail === "phbet@x.com";
        const roleAssigned = isDefaultAdmin ? "admin" : registerRole;
        
        await registerCustom(loginEmail, loginPassword, registerName || "Apostador PH", roleAssigned);
        
        alert("Conta registrada com sucesso! Agora você pode fazer login.");
        setIsRegisterMode(false);
      } else {
        await loginCustom(loginEmail, loginPassword);
        setShowLoginModal(false);
        setLoginEmail("");
        setLoginPassword("");
      }
    } catch (err: any) {
      console.error("Login fail", err);
      setLoginError("Credenciais inválidas ou falha de rede.");
    }
  };

  return (
    <>
      <header id="ph-header" className="sticky top-0 z-40 w-full border-b border-blue-900/40 bg-[#0F172A] backdrop-blur-md px-4 py-3 flex items-center justify-between">
        {/* Left Side: Brand Logo */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => window.location.reload()}>
            <img 
              src="https://i.postimg.cc/k4Wszn56/Chat-GPT-Image-26-de-mai-de-2026-13-03-24.png" 
              alt="PH BET" 
              referrerPolicy="no-referrer"
              className="h-12 w-auto object-contain filter drop-shadow-[0_0_8px_rgba(59,130,246,0.25)]"
            />
          </div>
        </div>

        {/* Right Side: Account Actions, Balance, and Role Badges */}
        <div className="flex items-center gap-3">
          {userProfile ? (
            <div className="flex items-center gap-2.5">
              {/* Balance Card */}
              <div id="balance-display" className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-blue-950/40 border border-blue-800/40 max-w-[150px] md:max-w-none">
                <div className="p-1 rounded-lg bg-blue-500/20 text-blue-400">
                  <Wallet className="h-4 w-4" />
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-[10px] text-blue-300 uppercase tracking-widest font-mono leading-none">Minha Banca</span>
                  <span className="text-sm font-mono font-bold text-white mt-0.5">
                    R$ {userProfile.balance.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {/* Active Role Badge (Clean display only, switcher is removed) */}
              <div id="role-badge" className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold ${getRoleLabelAndColor(userProfile.role).bg}`}>
                {userProfile.role === "admin" ? (
                  <Shield className="h-3.5 w-3.5 text-blue-400" />
                ) : userProfile.role === "cambista" ? (
                  <Briefcase className="h-3.5 w-3.5 text-sky-450" />
                ) : (
                  <User className="h-3.5 w-3.5 text-white" />
                )}
                <span className="hidden sm:inline">{getRoleLabelAndColor(userProfile.role).label}</span>
              </div>

              {/* Logout Button */}
              <button
                id="logout-btn"
                onClick={logout}
                title="Sair da Conta"
                className="p-2 rounded-xl bg-slate-800/50 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700 transition active:scale-95 cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              {/* Ultra modern Login portal button */}
              <button
                id="btn-login-trigger"
                onClick={() => { setShowLoginModal(true); setIsRegisterMode(false); }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20 active:translate-y-0.5 transition cursor-pointer"
              >
                <Lock className="h-3.5 w-3.5" />
                Acessar Conta / Painéis
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Extreme Modern Blue & White Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-lg flex items-center justify-center p-4 z-50 animate-fadeIn font-sans">
          <div className="w-full max-w-md bg-[#0F172A] border-2 border-blue-600/30 rounded-2xl overflow-hidden shadow-2xl relative flex flex-col">
            
            {/* Header banner */}
            <div className="px-6 py-5 bg-gradient-to-r from-blue-900 to-blue-700 text-white relative text-left">
              <h3 className="font-display font-black text-2xl tracking-tight">
                {isRegisterMode ? "Criar Nova Conta" : "Portal de Acesso"}
              </h3>
              <p className="text-xs text-blue-200 mt-1">
                {isRegisterMode ? "Cadastre-se na plataforma de apostas esportivas." : "Faça login para ver o feed de odds, painel do cambista ou área administrativa."}
              </p>
            </div>

            {/* Form body */}
            <form onSubmit={handleLoginSubmit} className="p-6 space-y-4 text-left flex-1">
              {loginError && (
                <div className="p-3 bg-red-950/45 border border-red-500/30 text-red-400 text-xs rounded-xl">
                  {loginError}
                </div>
              )}

              {isRegisterMode && (
                <div>
                  <label className="block text-[10px] font-mono tracking-widest text-slate-400 uppercase font-black mb-1.5">
                    Nome Completo
                  </label>
                  <input
                    type="text"
                    required
                    value={registerName}
                    onChange={(e) => setRegisterName(e.target.value)}
                    placeholder="Seu nome ou apelido"
                    className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-[10px] font-mono tracking-widest text-slate-400 uppercase font-black mb-1.5">
                  Endereço de E-mail
                </label>
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="Seu email de login"
                  className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono tracking-widest text-slate-400 uppercase font-black mb-1.5">
                  Senha do Usuário
                </label>
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Sua senha secreta"
                  className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {isRegisterMode && (
                <div>
                  <label className="block text-[10px] font-mono tracking-widest text-slate-400 uppercase font-black mb-1.5">
                    Perfil Solicitado
                  </label>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <button
                      type="button"
                      onClick={() => setRegisterRole("usuario")}
                      className={`py-2 px-3 text-xs font-bold rounded-xl border text-center transition ${registerRole === "usuario" ? "bg-blue-600 border-blue-500 text-white" : "bg-slate-900 border-slate-700 text-slate-400"}`}
                    >
                      Apostador Comum
                    </button>
                    <button
                      type="button"
                      onClick={() => setRegisterRole("cambista")}
                      className={`py-2 px-3 text-xs font-bold rounded-xl border text-center transition ${registerRole === "cambista" ? "bg-blue-600 border-blue-500 text-white" : "bg-slate-900 border-slate-700 text-slate-400"}`}
                    >
                      Cambista Físico
                    </button>
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-500/10 transition active:scale-95"
              >
                {isRegisterMode ? "Cadastrar minha Conta" : "Realizar Login Seguro"}
              </button>

              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => setIsRegisterMode(!isRegisterMode)}
                  className="text-[11px] text-blue-400 hover:underline"
                >
                  {isRegisterMode ? "Já tem conta? Faça login aqui" : "Ainda não tem conta? Crie aqui"}
                </button>
              </div>
            </form>

            <div className="px-6 py-3.5 bg-slate-900/60 border-t border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setShowLoginModal(false)}
                className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-slate-805 text-slate-400 hover:text-white transition"
              >
                Voltar ao Site
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
