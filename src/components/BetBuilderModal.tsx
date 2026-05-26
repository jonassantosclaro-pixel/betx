/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Game, BetSelection } from "../types";
import { 
  X, 
  Check, 
  Sparkles, 
  Plus, 
  Minus, 
  BadgeAlert, 
  ArrowRight,
  TrendingUp,
  Target
} from "lucide-react";

interface BetBuilderModalProps {
  game: Game;
  isOpen: boolean;
  onClose: () => void;
  onAddToSlip: (customSelection: BetSelection) => void;
}

interface LocalSelection {
  market: string;
  selection: string;
  odds: number;
}

export const BetBuilderModal: React.FC<BetBuilderModalProps> = ({ 
  game, 
  isOpen, 
  onClose, 
  onAddToSlip 
}) => {
  const [selections, setSelections] = useState<LocalSelection[]>([]);
  const [combinedOdds, setCombinedOdds] = useState(1.00);

  // Markets available for construction
  const bBuilderMarkets = [
    {
      title: "Resultado Final (Vencedor)",
      id: "result",
      options: [
        { name: `Vitória do ${game.homeTeam}`, selection: "Casa", odds: game.oddsHome },
        { name: "Empate", selection: "Empate", odds: game.oddsDraw },
        { name: `Vitória do ${game.awayTeam}`, selection: "Fora", odds: game.oddsAway },
      ]
    },
    {
      title: "Ambas as Equipes Marcam",
      id: "btts",
      options: [
        { name: "Sim (Ambos Marcam)", selection: "Ambos Marcam: Sim", odds: 1.75 },
        { name: "Não (Ambos Marcam)", selection: "Ambos Marcam: Não", odds: 2.05 },
      ]
    },
    {
      title: "Total de Gols do Confronto",
      id: "goals",
      options: [
        { name: "Mais de 1.5 Gols", selection: "Total de Gols +1.5", odds: 1.25 },
        { name: "Mais de 2.5 Gols", selection: "Total de Gols +2.5", odds: 1.85 },
        { name: "Menos de 2.5 Gols", selection: "Total de Gols -2.5", odds: 1.95 },
        { name: "Mais de 3.5 Gols", selection: "Total de Gols +3.5", odds: 3.10 },
      ]
    },
    {
      title: "Dupla Chance Recreativa",
      id: "double_chance",
      options: [
        { name: "Casa ou Empate", selection: "Casa ou Empate", odds: 1.35 },
        { name: "Fora ou Empate", selection: "Fora ou Empate", odds: 1.65 },
        { name: "Casa ou Fora", selection: "Casa ou Fora", odds: 1.28 },
      ]
    },
    {
      title: "Resultado do Primeiro Tempo (1T)",
      id: "half_result",
      options: [
        { name: `${game.homeTeam} vence 1T`, selection: "1T: Casa", odds: Number((game.oddsHome * 1.15).toFixed(2)) },
        { name: "Empate no 1T", selection: "1T: Empate", odds: Number((game.oddsDraw * 0.85).toFixed(2)) },
        { name: `${game.awayTeam} vence 1T`, selection: "1T: Fora", odds: Number((game.oddsAway * 1.15).toFixed(2)) },
      ]
    },
    {
      title: "Total de Escanteios do Jogo",
      id: "corners",
      options: [
        { name: "Acima de 9.5 Escanteios (Over 9.5)", selection: "Escanteios: Acima de 9.5", odds: 1.85 },
        { name: "Abaixo de 9.5 Escanteios (Under 9.5)", selection: "Escanteios: Abaixo de 9.5", odds: 1.95 },
        { name: "Acima de 10.5 Escanteios (Over 10.5)", selection: "Escanteios: Acima de 10.5", odds: 2.25 },
        { name: "Abaixo de 10.5 Escanteios (Under 10.5)", selection: "Escanteios: Abaixo de 10.5", odds: 1.57 },
        { name: "Acima de 11.5 Escanteios (Over 11.5)", selection: "Escanteios: Acima de 11.5", odds: 2.85 },
        { name: "Abaixo de 11.5 Escanteios (Under 11.5)", selection: "Escanteios: Abaixo de 11.5", odds: 1.35 },
      ]
    },
    {
      title: "Número Total de Cartões",
      id: "cards",
      options: [
        { name: "Acima de 5.5 Cartões (Over 5.5)", selection: "Cartões: Acima de 5.5", odds: 2.15 },
        { name: "Abaixo de 5.5 Cartões (Under 5.5)", selection: "Cartões: Abaixo de 5.5", odds: 1.62 },
      ]
    }
  ];

  // Recalculate Combined Odds
  useEffect(() => {
    if (selections.length === 0) {
      setCombinedOdds(1.00);
      return;
    }
    // Multiply accumulated odds
    const oddsTotal = selections.reduce((acc, curr) => acc * curr.odds, 1.00);
    setCombinedOdds(Number(oddsTotal.toFixed(2)));
  }, [selections]);

  const toggleSelection = (marketTitle: string, optionName: string, odds: number) => {
    const existingIndex = selections.findIndex(
      s => s.market === marketTitle && s.selection === optionName
    );

    if (existingIndex !== -1) {
      setSelections(prev => prev.filter((_, idx) => idx !== existingIndex));
    } else {
      if (selections.length >= 8) {
        alert("O limite máximo do Construtor de Apostas é de 8 seleções!");
        return;
      }
      const sameMarketId = bBuilderMarkets.find(m => m.title === marketTitle)?.id;
      let cleaned = selections;
      
      if (sameMarketId) {
        // Enforce singular selection per market category in the builder to prevent mutual exclusivity conflicts
        cleaned = selections.filter(s => s.market !== marketTitle);
      }

      const newSel: LocalSelection = {
        market: marketTitle,
        selection: optionName,
        odds
      };

      setSelections([...cleaned, newSel]);
    }
  };

  const handleAddBetToSlip = () => {
    if (selections.length < 2) {
      alert("Selecione pelo menos 2 opções para construir sua aposta!");
      return;
    }

    const customSummaryPhrase = selections.map(s => s.selection).join(" + ");
    
    const builderSlipItem: BetSelection = {
      gameId: game.gameId,
      homeTeam: game.homeTeam,
      awayTeam: game.awayTeam,
      league: game.league,
      market: "Criar Aposta (Custom)",
      selection: customSummaryPhrase,
      odds: combinedOdds,
    };

    onAddToSlip(builderSlipItem);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div id="bet-builder-portal" className="fixed inset-0 bg-slate-950/80 backdrop-blur-lg flex items-center justify-center p-4 z-50 animate-fadeIn font-sans">
      <div className="w-full max-w-2xl bg-[#0F172A] border-2 border-blue-600/30 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header decoration */}
        <div className="bg-gradient-to-r from-blue-900 to-blue-700 p-4 border-b border-blue-900/40 flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-left">
            <div className="p-2 rounded-xl bg-blue-500/20 text-white">
              <Sparkles className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <h2 className="font-display font-black text-lg text-white">Criador de Aposta (Bet Builder)</h2>
              <p className="text-[10px] text-blue-200 font-mono tracking-wider">
                {game.homeTeam} vs {game.awayTeam} · {game.league}
              </p>
            </div>
          </div>
          <button 
            id="close-builder-btn"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body Scroll */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-5">
          <div className="flex items-center gap-2 bg-blue-950/30 border border-blue-800/40 px-4 py-3 rounded-xl text-xs text-blue-200 text-left">
            <Target className="h-4 w-4 text-blue-400 shrink-0" />
            <span>Monte cotações customizadas imbatíveis combinando múltiplos palpites de cards táticos do mesmo jogo!</span>
          </div>

          <div className="space-y-4">
            {bBuilderMarkets.map((market) => (
              <div key={market.id} className="p-3 bg-slate-900/60 border border-blue-900/25 rounded-2xl">
                <span className="text-[11px] font-mono tracking-wider text-slate-400 uppercase font-black pl-1 block text-left">
                  {market.title}
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 mt-2.5">
                  {market.options.map((option) => {
                    const isSelected = selections.some(
                      s => s.market === market.title && s.selection === option.name
                    );
                    return (
                      <button
                        key={option.name}
                        onClick={() => toggleSelection(market.title, option.name, option.odds)}
                        className={`flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold select-none cursor-pointer transition border duration-150 ${
                          isSelected
                            ? "bg-blue-600 border-blue-500 text-white shadow-lg"
                            : "bg-[#080D1A]/50 border-transparent hover:border-blue-900/40 text-slate-300 hover:text-white"
                        }`}
                      >
                        <span className="text-[11px] text-left leading-tight truncate mr-2 pr-1">
                          {option.name}
                        </span>
                        <span className={`text-xs ml-auto font-mono font-bold ${isSelected ? "text-white" : "text-blue-400"}`}>
                          {option.odds.toFixed(2)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom calc block */}
        <div className="bg-slate-900 border-t border-blue-900/45 p-4 font-sans text-left">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            
            <div className="text-left select-none">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-350 font-mono font-bold tracking-widest text-slate-400">SELEÇÕES ({selections.length}/8):</span>
                {selections.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {selections.map((val, idx) => (
                      <span key={idx} className="bg-slate-950 text-blue-400 text-[9px] px-1.5 py-0.5 rounded-lg font-mono font-bold border border-blue-900/35">
                        {val.odds.toFixed(2)}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="flex items-baseline gap-2 mt-1.5">
                <span className="text-[10px] text-slate-400 font-mono">Corte Acumulado:</span>
                <span className="text-2xl font-mono font-black text-white leading-none">
                  @{combinedOdds.toFixed(2)}
                </span>
                <span className="text-[10px] text-emerald-400 font-semibold font-mono">
                  {selections.length >= 2 ? "PRONTO!" : "Selecione min. 2"}
                </span>
              </div>
            </div>

            {/* Actions Panel */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelections([])}
                className="px-4 py-2.5 rounded-xl text-xs font-bold border border-slate-700 hover:border-slate-500 text-slate-350 hover:text-white transition cursor-pointer"
              >
                Limpar
              </button>
              
              <button
                onClick={handleAddBetToSlip}
                disabled={selections.length < 2}
                className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black font-display uppercase tracking-widest text-white shadow-lg transition border duration-150 ${
                  selections.length >= 2
                    ? "bg-blue-600 border-blue-500 hover:bg-blue-500 shadow-blue-500/20 cursor-pointer"
                    : "bg-slate-800 border-transparent text-slate-500 cursor-not-allowed opacity-30"
                }`}
              >
                <TrendingUp className="h-4 w-4" />
                Adicionar ao Bilhete
              </button>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
