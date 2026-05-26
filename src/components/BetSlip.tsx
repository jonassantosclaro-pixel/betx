/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { BetSelection, UserProfile } from "../types";
import { 
  Trash2, 
  Ticket, 
  HelpCircle, 
  TrendingUp, 
  CheckCircle, 
  ShieldCheck,
  User,
  AlertTriangle
} from "lucide-react";

interface BetSlipProps {
  selections: BetSelection[];
  onRemoveSelection: (gameId: string, selectionName: string) => void;
  onClearSlip: () => void;
  userProfile: UserProfile | null;
  onPlaceBet: (stake: number, type: "simple" | "multiple" | "builder", customerName?: string) => Promise<string | null>;
}

export const BetSlip: React.FC<BetSlipProps> = ({
  selections,
  onRemoveSelection,
  onClearSlip,
  userProfile,
  onPlaceBet,
}) => {
  const [stake, setStake] = useState<number>(10);
  const [betType, setBetType] = useState<"simple" | "multiple">("multiple");
  const [customerName, setCustomerName] = useState<string>("");
  const [placing, setPlacing] = useState(false);
  const [slipResultCode, setSlipResultCode] = useState<string | null>(null);
  const [errorText, setErrorText] = useState<string | null>(null);

  // Auto toggle simple vs multiple based on quantity of selections or Bet Builder existence
  const isBuilderInSlip = selections.some(s => s.market === "Criar Aposta (Custom)");
  
  useEffect(() => {
    if (isBuilderInSlip) {
      setBetType("multiple"); // Forced combo
    } else if (selections.length === 1) {
      setBetType("simple");
    } else {
      setBetType("multiple");
    }
  }, [selections, isBuilderInSlip]);

  // Calculate accumulated odds for Combo Bets
  const accumulatedOdds = selections.reduce((acc, curr) => acc * curr.odds, 1.00);
  const finalOdds = Number(accumulatedOdds.toFixed(2));
  const rawPayout = Number((stake * finalOdds).toFixed(2));
  const potentialPayout = Math.min(rawPayout, 10000);
  const isPayoutCapped = rawPayout > 10000;

  const handlePlaceWager = async () => {
    setErrorText(null);
    setSlipResultCode(null);

    if (selections.length === 0) return;
    if (stake < 5) {
      setErrorText("O valor mínimo para realizar um palpite é de R$ 5,00!");
      return;
    }

    if (!userProfile) {
      if (!customerName.trim()) {
        setErrorText("Por favor, digite seu nome ou apelido para gerar o Token pré-aposta!");
        return;
      }
    } else {
      if (userProfile.balance < stake) {
        setErrorText(userProfile.role === "cambista" 
          ? `Limite de crédito insuficiente para registrar este bilhete! Limite restante: R$ ${userProfile.balance.toFixed(2)}`
          : "Saldo insuficiente na sua banca para realizar esta aposta!");
        return;
      }

      if (userProfile.role === "cambista" && !customerName.trim()) {
        setErrorText("O Cambista deve registrar o nome do cliente no bilhete!");
        return;
      }
    }

    setPlacing(true);
    try {
      const typeOfSlip = isBuilderInSlip ? "builder" : selections.length === 1 ? "simple" : "multiple";
      const ticketId = await onPlaceBet(stake, typeOfSlip, customerName);
      if (ticketId) {
        setSlipResultCode(ticketId);
        onClearSlip();
        setCustomerName("");
      } else {
        setErrorText("Erro ao registrar no sistema de cotas. Tente novamente.");
      }
    } catch (e: any) {
      setErrorText(e.message || "Erro desconhecido ao enviar bilhete.");
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div id="betslip-container" className="w-full lg:w-96 bg-[#0F172A] border-l-2 border-blue-900/35 p-4 md:p-5 flex flex-col gap-4 font-sans shrink-0">
      
      {/* Title block */}
      <div className="flex items-center justify-between border-b border-blue-900/40 pb-3">
        <div className="flex items-center gap-2">
          <Ticket className="h-5 w-5 text-blue-400 rotate-12" />
          <h2 className="font-display font-black text-sm text-white tracking-widest uppercase">CUPOM DE APOSTAS</h2>
        </div>
        {selections.length > 0 && (
          <button
            onClick={onClearSlip}
            className="text-[10px] text-blue-400 hover:text-red-400 font-mono font-bold transition cursor-pointer"
          >
            Limpar Tudo
          </button>
        )}
      </div>

      {/* Slip Messages Success / Error feedback */}
      {slipResultCode && (
        <div className="p-3.5 bg-blue-950/60 border border-blue-500/30 text-blue-200 rounded-xl text-left select-none relative overflow-hidden">
          <div className="absolute right-2 top-2 h-12 w-12 text-blue-500/10"><CheckCircle className="h-full w-full" /></div>
          <div className="flex items-center gap-1.5 font-black text-xs text-white uppercase"><CheckCircle className="h-4 w-4 text-emerald-400" /> Aposta Registrada!</div>
          <p className="text-[10px] text-slate-300 mt-1.5 leading-relaxed">Cód. Voucher do Bilhete:</p>
          <div className="font-mono font-bold text-center text-xs text-white bg-slate-900/95 border border-blue-800/40 px-3 py-1.5 rounded-lg mt-1 tracking-wider uppercase">
            {slipResultCode}
          </div>
          <p className="text-[9px] text-slate-400 mt-2">O cliente pode acompanhar o andamento utilizando esse código.</p>
        </div>
      )}

      {errorText && (
        <div className="p-3 bg-red-950/25 border border-red-500/30 text-red-400 rounded-xl text-xs flex items-start gap-1.5 text-left">
          <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{errorText}</span>
        </div>
      )}

      {/* No selection empty placeholder */}
      {selections.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-16 text-center select-none">
          <div className="p-3 bg-slate-900/60 border border-blue-900/30 rounded-xl mb-3 text-blue-405 text-blue-400">
            <Ticket className="h-6 w-6" />
          </div>
          <span className="text-xs font-bold text-slate-200">Seu cupom está vazio</span>
          <p className="text-[10px] text-slate-400 mt-1 max-w-[200px] leading-relaxed">Navegue pelos eventos esportivos ao lado e clique nas odds para montar seu palpite.</p>
        </div>
      ) : (
        <div className="flex-1 flex flex-col justify-between gap-5">
          
          {/* Selections details feeds */}
          <div className="space-y-2.5 max-h-[350px] overflow-y-auto pr-1">
            {selections.map((item, idx) => (
              <div 
                key={`${item.gameId}-${idx}`} 
                className="p-3 bg-slate-900/50 border border-blue-900/35 hover:border-blue-500/40 rounded-xl relative transition"
              >
                <button
                  onClick={() => onRemoveSelection(item.gameId, item.selection)}
                  className="absolute top-2.5 right-2 text-slate-400 hover:text-red-400 transition cursor-pointer"
                  title="remover seleção"
                >
                  <Trash2 className="h-4 w-4" />
                </button>

                {/* Game teams */}
                <div className="text-[10px] text-blue-400 font-mono font-bold tracking-wide">
                  {item.league}
                </div>
                <div className="font-display font-bold text-xs text-white mt-1 pr-6 leading-tight">
                  {item.homeTeam} vs {item.awayTeam}
                </div>

                {/* Market choices */}
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-blue-900/25">
                  <div className="flex flex-col text-left">
                    <span className="text-[9px] text-[#A5F3FC] font-mono">Mercado: {item.market}</span>
                    <span className="text-xs font-black text-white mt-0.5">{item.selection}</span>
                  </div>
                  <div className="text-xs font-mono font-black text-white bg-blue-600 border border-blue-500 px-2 py-0.5 rounded-lg shadow-sm">
                    {item.odds.toFixed(2)}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Betting Configuration Dashboard */}
          <div className="bg-slate-900 p-4 rounded-xl border border-blue-900/35 space-y-4">
            
            {/* If broker/cambista or guest, add Client/Apostador parameter */}
            {(!userProfile || userProfile?.role === "cambista") && (
              <div className="space-y-1 text-left">
                <label className="text-[10px] font-mono uppercase font-black text-white tracking-widest flex items-center gap-1">
                  <User className="h-3 w-3 text-blue-400" />
                  {userProfile ? "Nome do Cliente (Obrigatório)" : "Seu Nome / Identificador (Obrigatório)"}
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder={userProfile ? "Ex: João da Silva" : "Seu nome ou apelido"}
                  className="w-full text-xs bg-slate-950 border border-slate-700/60 focus:border-blue-500 hover:border-slate-600 px-3 py-2 rounded-xl text-white font-medium outline-none transition"
                />
              </div>
            )}

            {/* Odds accumulated summary indicator */}
            <div className="flex items-center justify-between text-xs font-sans border-b border-blue-900/30 pb-2.5">
              <span className="text-slate-300 font-bold">Cotação Total:</span>
              <span className="font-mono font-black text-white text-base bg-blue-600/30 px-2.5 py-0.5 rounded-lg border border-blue-500/25">
                @{finalOdds}
              </span>
            </div>

            {/* Stake Money input */}
            <div className="space-y-1.5 text-left">
              <div className="flex items-center justify-between text-[10px] font-mono font-bold">
                <span className="text-slate-350 text-slate-300">VALOR DO PALPITE:</span>
                <span className="text-blue-350 text-blue-400">Min. R$ 5,00</span>
              </div>
              
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-black text-white">
                  R$
                </span>
                <input
                  type="number"
                  value={stake || ""}
                  onChange={(e) => setStake(Math.max(0, Number(e.target.value)))}
                  className="w-full bg-slate-950 border border-slate-700/60 hover:border-slate-600 focus:border-blue-500 outline-none text-right font-mono font-bold text-sm text-white px-3.5 py-2 rounded-xl transition"
                />
              </div>

              {/* Quick stake modifiers */}
              <div className="grid grid-cols-4 gap-1.5 pt-1">
                {[10, 20, 50, 100].map((v) => (
                  <button
                    key={v}
                    onClick={() => setStake(v)}
                    className="bg-slate-950 hover:bg-blue-950/40 text-[10px] font-mono font-bold leading-none py-1.5 border border-slate-800 text-slate-300 hover:text-white rounded-lg transition cursor-pointer"
                  >
                    +R${v}
                  </button>
                ))}
              </div>
            </div>

            {/* Final computation metrics */}
            <div className="border-t border-blue-900/30 pt-3.5 flex items-center justify-between">
              <div className="text-left select-none">
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-slate-400 font-mono block">RETORNO POSSÍVEL:</span>
                  {isPayoutCapped && (
                    <span className="text-[8px] bg-amber-500/20 text-amber-400 px-1 py-0.5 rounded font-mono font-black uppercase animate-pulse">
                      Limite Máximo
                    </span>
                  )}
                </div>
                <span className="text-base font-mono font-black text-white leading-none">
                  R$ {potentialPayout.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </span>
                {isPayoutCapped && (
                  <span className="text-[9px] text-slate-400 block mt-1 leading-tight">
                    *Cotação real de R$ {rawPayout.toLocaleString("pt-BR")} limitada ao pagamento máximo de R$ 10.000,00.
                  </span>
                )}
              </div>

              {/* Submit button indicator */}
              <button
                onClick={handlePlaceWager}
                disabled={placing}
                className="flex items-center gap-1.5 px-4.5 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 text-white font-black font-display text-xs uppercase tracking-widest rounded-xl transition cursor-pointer shadow-lg hover:shadow-blue-500/20 active:translate-y-0.5 border border-blue-500"
              >
                <TrendingUp className="h-4 w-4" />
                {placing ? "Gravando..." : "Gravar Palpite"}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
