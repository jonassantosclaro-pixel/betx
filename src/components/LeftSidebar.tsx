/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { 
  Trophy, 
  Flame, 
  Globe, 
  MapPin, 
  Calendar, 
  CheckCircle,
  Hash
} from "lucide-react";

interface LeftSidebarProps {
  selectedLeague: string | null;
  onSelectLeague: (league: string | null) => void;
  className?: string;
}

export const LeftSidebar: React.FC<LeftSidebarProps> = ({ selectedLeague, onSelectLeague, className }) => {
  const categories = [
    { name: "Principais Campeonatos", icon: Trophy, color: "text-blue-450 text-yellow-500" },
  ];

  const leagues = [
    // Brasil
    { name: "Brasileirão Série A", code: "BSA", region: "Brasil", flag: "🇧🇷" },
    { name: "Brasileirão Série B", code: "BSB", region: "Brasil", flag: "🇧🇷" },
    { name: "Copa do Brasil", code: "CDB", region: "Brasil", flag: "🏆" },
    // Internacionais
    { name: "Copa Libertadores", code: "CL", region: "América do Sul", flag: "🏆" },
    { name: "Copa Sul-Americana", code: "CS", region: "América do Sul", flag: "🌎" },
    { name: "Champions League", code: "UCL", region: "Europa", flag: "🇪🇺" },
    { name: "Europa League", code: "UEL", region: "Europa", flag: "🇪🇺" },
    { name: "Conference League", code: "UEC", region: "Europa", flag: "🇪🇺" },
    { name: "Premier League", code: "PL", region: "Inglaterra", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
    { name: "La Liga", code: "LL", region: "Espanha", flag: "🇪🇸" },
    { name: "Bundesliga", code: "BL", region: "Alemanha", flag: "🇩🇪" },
    { name: "Serie A Itália", code: "SA", region: "Itália", flag: "🇮🇹" },
    { name: "Ligue 1", code: "FL1", region: "França", flag: "🇫🇷" },
    { name: "Eredivisie", code: "ERE", region: "Holanda", flag: "🇳🇱" },
    { name: "Liga Portugal", code: "LPO", region: "Portugal", flag: "🇵🇹" },
    { name: "MLS", code: "MLS", region: "Estados Unidos", flag: "🇺🇸" },
    { name: "Saudi Pro League", code: "SPL", region: "Arábia Saudita", flag: "🇸🇦" },
    // Seleções & Amistosos
    { name: "Copa do Mundo", code: "WC", region: "Fifa", flag: "🌍" },
    { name: "Eliminatórias", code: "ELI", region: "Fifa Qualifiers", flag: "🗺️" },
    { name: "Nations League", code: "UNL", region: "Europa", flag: "🇪🇺" },
    { name: "Eurocopa", code: "EUR", region: "Europa", flag: "🇪🇺" },
    { name: "Copa América", code: "CA", region: "América", flag: "🏆" },
    { name: "Amistosos de Seleções", code: "INT", region: "Amistosos", flag: "🤝" }
  ];

  return (
    <aside id="competitions-sidebar" className={`w-full md:w-64 bg-slate-900/40 p-4 border-r border-blue-900/35 flex flex-col gap-4 font-sans shrink-0 overflow-y-auto max-h-[85vh] ${className || ""}`}>
      
      {/* Quick Stats / Filter Indicator */}
      <div>
        <div className="flex items-center gap-2 mb-2 text-xs font-mono tracking-widest text-[#FFF] font-bold uppercase">
          <Flame className="h-4 w-4 text-emerald-500 animate-pulse" />
          MENU ESPORTIVO
        </div>
        <button
          onClick={() => onSelectLeague(null)}
          className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-black tracking-wide transition capitalize text-left cursor-pointer border ${
            selectedLeague === null 
              ? "bg-blue-600 text-white shadow-lg border-blue-500 shadow-blue-500/20" 
              : "bg-slate-900/40 border-slate-800 hover:bg-slate-800/40 text-slate-300"
          }`}
        >
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            <span>Todos os Eventos</span>
          </div>
          <span className="bg-[#080D1A]/60 px-2 py-0.5 rounded-lg text-[9px] text-emerald-400 font-mono font-black animate-pulse">AO VIVO</span>
        </button>
      </div>

      {/* Categories */}
      {categories.map((cat, i) => (
        <div key={i} className="flex flex-col gap-2.5">
          <div className="flex items-center gap-2 text-xs font-black text-white font-display uppercase tracking-wider pl-1 font-mono">
            <cat.icon className={`h-4 w-4 ${cat.color}`} />
            {cat.name}
          </div>

          <div className="flex flex-col gap-1 pr-1">
            {leagues.map((lg) => {
              const isSelected = selectedLeague === lg.name;
              return (
                <button
                  key={lg.code}
                  onClick={() => onSelectLeague(lg.name)}
                  className={`group w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer transition text-left border ${
                    isSelected
                      ? "bg-gradient-to-r from-blue-900 to-blue-700 text-white font-black border-blue-500 shadow-lg shadow-blue-500/10 pl-3.5"
                      : "text-slate-200 bg-slate-900/15 border-transparent hover:bg-slate-800/40 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm select-none">{lg.flag}</span>
                    <div className="flex flex-col">
                      <span className="font-display font-bold leading-none mb-0.5 text-white">{lg.name}</span>
                      <span className="text-[9px] text-slate-400 font-mono leading-none">{lg.region}</span>
                    </div>
                  </div>
                  
                  {isSelected ? (
                    <span className="h-2 w-2 rounded-full bg-white shadow-sm animate-pulse" />
                  ) : (
                    <span className="h-1.5 w-1.5 rounded-full bg-slate-700 group-hover:bg-blue-400 transition" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {/* Sidebar Footer info */}
      <div className="mt-auto pt-6 border-t border-blue-900/25 text-center">
        <p className="text-[10px] text-[#A1B3CD] font-mono leading-relaxed">
          Suporte PH BET 24/7
        </p>
        <p className="text-[9px] text-emerald-400 font-mono mt-0.5 italic">
          Jogo Responsável (+18)
        </p>
      </div>
    </aside>
  );
};
