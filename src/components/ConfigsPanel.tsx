/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  Key, 
  Save, 
  HelpCircle, 
  CheckCircle,
  Database,
  RefreshCw,
  FileKey,
  Wifi,
  AlertTriangle
} from "lucide-react";

export interface ConfigsPanelProps {
  isEmbedded?: boolean;
}

export const ConfigsPanel: React.FC<ConfigsPanelProps> = ({ isEmbedded = false }) => {
  const [footballDataKey, setFootballDataKey] = useState("");
  const [oddsKey, setOddsKey] = useState("");
  const [apiFootballKey, setApiFootballKey] = useState("");
  const [theSportsDbKey, setTheSportsDbKey] = useState("");
  
  const [connectionStatus, setConnectionStatus] = useState<"connected" | "disconnected">("disconnected");
  const [isConfigured, setIsConfigured] = useState({
    hasFootballDataKey: false,
    hasOddsApiKey: false,
    hasApiFootballKey: false,
    hasTheSportsDbKey: false
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Load configuration status from our proxy server
  const fetchConfigStatus = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/config");
      if (res.ok) {
        const data = await res.json();
        setIsConfigured({
          hasFootballDataKey: data.hasFootballDataKey,
          hasOddsApiKey: data.hasOddsApiKey,
          hasApiFootballKey: data.hasApiFootballKey,
          hasTheSportsDbKey: data.hasTheSportsDbKey
        });
        setFootballDataKey(data.footballDataApiKey || "");
        setOddsKey(data.oddsApiKey || "");
        setApiFootballKey(data.apiFootballKey || "");
        setTheSportsDbKey(data.theSportsDbKey || "");
        setConnectionStatus(data.connectionStatus || "disconnected");
      }
    } catch (e) {
      console.error("Config fetch error server", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfigStatus();
  }, []);

  const handleSaveKeys = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatusMessage(null);

    try {
      const res = await fetch("/api/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          footballDataApiKey: footballDataKey,
          oddsApiKey: oddsKey,
          apiFootballKey: apiFootballKey,
          theSportsDbKey: theSportsDbKey
        })
      });

      if (res.ok) {
        setStatusMessage("Configurações persistidas com sucesso no Firebase e localmente!");
        fetchConfigStatus();
        setTimeout(() => setStatusMessage(null), 4000);
      } else {
        alert("Erro ao persistir configurações.");
      }
    } catch (e) {
      alert("Erro de conexão ao servidor de APIs.");
    } finally {
      setSaving(false);
    }
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setStatusMessage(null);
    try {
      const res = await fetch("/api/config/test", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setConnectionStatus(data.status);
        if (data.status === "connected") {
          setStatusMessage("🟢 Pings das APIs bem-sucedidos! Status: Conectado.");
        } else {
          setStatusMessage("⚠️ Sem chaves instaladas ou APIs offline. Ativo em Modo Simulado de Segurança.");
        }
        setTimeout(() => setStatusMessage(null), 4000);
      }
    } catch (e) {
      alert("Erro ao testar conexão.");
    } finally {
      setTesting(false);
    }
  };

  const handleRefreshDataNow = async () => {
    setRefreshing(true);
    setStatusMessage(null);
    try {
      const res = await fetch("/api/config/refresh", { method: "POST" });
      if (res.ok) {
        setStatusMessage("🟢 Sincronização e recarga completa forçadas em todos os feeds Firebase!");
        setTimeout(() => setStatusMessage(null), 4000);
      }
    } catch (e) {
      alert("Erro salvando e sincronizando dados.");
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <div id="configs-panel-card" className={isEmbedded ? "space-y-6 text-left" : "flex-1 bg-slate-900/10 p-4 md:p-6 space-y-6 overflow-y-auto font-sans text-left"}>
      
      {/* Introduction header */}
      {!isEmbedded && (
        <div className="p-5 rounded-2xl border border-blue-900/35 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#0F172A]/90">
          <div>
            <span className="text-[10px] font-mono tracking-widest text-[#F8FAFC] uppercase font-extrabold flex items-center gap-1.5 leading-none bg-blue-600 px-3 py-1 rounded-full border border-blue-400/40 w-fit">
              <Key className="h-4 w-4" />
              PAINEL DE CONFIGURAÇÕES DE APIS DE ESPORTES
            </span>
            <h1 className="font-display font-black text-2xl text-white mt-3.5">
               Configurações de APIs
            </h1>
            <p className="text-xs text-slate-300 mt-2 pl-0.5 leading-relaxed">
               Configure suas chaves esportivas individuais. Os dados fluem de forma automática: <strong>API → Firebase → Site</strong> com cachings inteligentes.
            </p>
          </div>
        </div>
      )}

      {/* Connection Status Banner */}
      <div className="p-4 bg-[#080D1A]/60 border border-blue-900/35 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl border ${
            connectionStatus === "connected" 
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" 
              : "bg-rose-500/10 border-rose-500/20 text-rose-400"
          }`}>
            <Wifi className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <h4 className="text-xs font-mono font-black text-slate-400 uppercase tracking-widest leading-none">STATUS DE CONEXÃO</h4>
            <div className="flex items-center gap-1.5 mt-2.5">
              {connectionStatus === "connected" ? (
                <span className="text-sm font-bold text-emerald-400 flex items-center gap-1 font-mono uppercase">
                  🟢 Conectado
                </span>
              ) : (
                <span className="text-sm font-bold text-rose-400 flex items-center gap-1 font-mono uppercase">
                  🔴 Desconectado
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Admin Quick Action Actions Triggers */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleTestConnection}
            disabled={testing}
            className="px-3.5 py-2 bg-gradient-to-r from-blue-900 to-blue-850 hover:from-blue-800 border border-blue-500/40 hover:border-blue-400 text-white font-mono font-extrabold text-[10px] tracking-wide uppercase rounded-xl transition cursor-pointer flex items-center gap-1.5 active:translate-y-0.5"
          >
            <RefreshCw className={`h-3 w-3 ${testing ? "animate-spin" : ""}`} />
            {testing ? "Testando..." : "Testar Conexão"}
          </button>
          <button
            type="button"
            onClick={handleRefreshDataNow}
            disabled={refreshing}
            className="px-3.5 py-2 bg-gradient-to-r from-emerald-950 to-emerald-900 hover:from-emerald-900 border border-emerald-500/35 text-white font-mono font-extrabold text-[10px] tracking-wide uppercase rounded-xl transition cursor-pointer flex items-center gap-1.5 active:translate-y-0.5"
          >
            <Database className={`h-3 w-3 ${refreshing ? "animate-spin" : ""}`} />
            {refreshing ? "Sincronizando..." : "Atualizar Dados Agora"}
          </button>
        </div>
      </div>

      {statusMessage && (
        <div className="p-3 bg-blue-950/30 border border-blue-500/25 text-blue-300 text-xs rounded-xl flex items-center gap-2 select-none">
          <CheckCircle className="h-4 w-4 shrink-0 text-emerald-400 animate-bounce" />
          <span className="font-semibold">{statusMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* API keys credentials form */}
        <form onSubmit={handleSaveKeys} className="lg:col-span-7 bg-[#0F172A] border border-blue-900/35 rounded-2xl p-5 space-y-5">
          <div className="flex items-center gap-2 pb-2.5 border-b border-blue-900/30 select-none">
            <FileKey className="h-5 w-5 text-blue-400" />
            <h3 className="text-xs font-mono font-black text-white uppercase tracking-wider">Configuração de APIs</h3>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-6">
              <RefreshCw className="h-5 w-5 text-blue-400 animate-spin" />
            </div>
          ) : (
            <div className="space-y-4 font-sans text-xs">
              
              <div className="space-y-1.5 text-left">
                <label className="text-[10px] font-mono uppercase text-slate-400 font-black block pl-1">
                  API_FOOTBALL_KEY (API-Football API Sports)
                </label>
                <input
                  type="password"
                  value={apiFootballKey}
                  onChange={(e) => setApiFootballKey(e.target.value)}
                  placeholder={isConfigured.hasApiFootballKey ? "●●●●●●● (Salvo no Firebase - Digite para alterar)" : "Digite sua API Key de API-Football"}
                  className="w-full text-xs bg-slate-950 border border-slate-700/65 p-2.5 rounded-xl text-white font-medium outline-none focus:border-blue-500 hover:border-slate-600 transition"
                />
              </div>

              <div className="space-y-1.5 text-left">
                <label className="text-[10px] font-mono uppercase text-slate-400 font-black block pl-1">
                  THE_SPORTS_DB_KEY (Informações de Times/Estádios)
                </label>
                <input
                  type="password"
                  value={theSportsDbKey}
                  onChange={(e) => setTheSportsDbKey(e.target.value)}
                  placeholder={isConfigured.hasTheSportsDbKey ? "●●●●●●● (Salvo no Firebase - Digite para alterar)" : "Digite sua API Key de TheSportsDB"}
                  className="w-full text-xs bg-slate-950 border border-slate-700/65 p-2.5 rounded-xl text-white font-medium outline-none focus:border-blue-500 hover:border-slate-600 transition"
                />
              </div>

              <div className="space-y-1.5 text-left">
                <label className="text-[10px] font-mono uppercase text-slate-400 font-black block pl-1">
                  THE_ODDS_API_KEY (Cotações de Odds e Apostas)
                </label>
                <input
                  type="password"
                  value={oddsKey}
                  onChange={(e) => setOddsKey(e.target.value)}
                  placeholder={isConfigured.hasOddsApiKey ? "●●●●●●● (Salvo no Firebase - Digite para alterar)" : "Digite sua API Key de The Odds API"}
                  className="w-full text-xs bg-slate-950 border border-slate-700/65 p-2.5 rounded-xl text-white font-medium outline-none focus:border-blue-500 hover:border-slate-600 transition"
                />
              </div>

              <div className="space-y-1.5 text-left">
                <label className="text-[10px] font-mono uppercase text-slate-400 font-black block pl-1">
                  FOOTBALL_DATA_API_KEY (Partidas e Jogos Calendários)
                </label>
                <input
                  type="password"
                  value={footballDataKey}
                  onChange={(e) => setFootballDataKey(e.target.value)}
                  placeholder={isConfigured.hasFootballDataKey ? "●●●●●●● (Salvo no Firebase - Digite para alterar)" : "Digite sua API Key de Football-Data.org"}
                  className="w-full text-xs bg-slate-950 border border-slate-700/65 p-2.5 rounded-xl text-white font-medium outline-none focus:border-blue-500 hover:border-slate-600 transition"
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 text-white font-black tracking-widest font-display text-xs uppercase rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-lg active:translate-y-0.5 border border-blue-500"
              >
                <Save className="h-4 w-4" />
                {saving ? "Salvando..." : "Salvar APIs"}
              </button>

            </div>
          )}
        </form>

        {/* Informative help content panel */}
        <div className="lg:col-span-5 bg-[#0F172A] border border-blue-900/35 rounded-2xl p-5 space-y-4 text-left">
          <div className="flex items-center gap-2 pb-2.5 border-b border-blue-900/30 select-none">
            <HelpCircle className="h-5 w-5 text-blue-400" />
            <h3 className="text-xs font-mono font-black text-white uppercase tracking-wider">Como obter credenciais?</h3>
          </div>

          <div className="space-y-3 pl-1 font-sans text-xs leading-relaxed text-slate-300">
            <div>
              <h4 className="font-extrabold text-white text-xs mb-1 font-mono text-blue-300">1. API-Football / Sports</h4>
              <p>Hospeda partidas e escalações ao vivo do futebol sul-americano e brasileiro de elite.</p>
            </div>
            
            <div>
              <h4 className="font-extrabold text-white text-xs mb-1 font-mono text-blue-300">2. TheSportsDB</h4>
              <p>Fornece dados amplos sobre escudos de times de prestígio, arenas de futebol e fotos oficiais.</p>
            </div>

            <div>
              <h4 className="font-extrabold text-white text-xs mb-1 font-mono text-blue-300">3. The Odds API</h4>
              <p>Captura cotes e probabilidades de dezenas de casas globais de esportes.</p>
            </div>

            <div className="pt-2 border-t border-blue-900/25">
              <span className="text-[10px] text-white bg-blue-600 px-2 py-0.5 rounded-lg border border-blue-400/40 font-mono font-black uppercase inline-block mb-1.5">
                MODO SEGURO DE CACHING
              </span>
              <p className="text-[10px] leading-relaxed text-slate-400 text-left">
                Se as APIs Key permanecerem sem preenchimento, o portal PH BET automatiza o seu catálogo inteiro usando uma central de <strong>Geração Esportiva Realista de Inteligência</strong> no Firebase. Todas as sessões, classificação, detalhes de times e controle de bilhetes operam com taxas de atualização de altíssimo desempenho sem limites de quota!
              </p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
