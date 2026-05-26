/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = "admin" | "usuario" | "cambista";

export interface UserProfile {
  userId: string;
  name: string;
  email: string;
  role: UserRole;
  balance: number;
  status: "active" | "blocked";
  createdAt: string;
  updatedAt: string;
}

export interface BetSelection {
  gameId: string;
  homeTeam: string;
  awayTeam: string;
  league: string;
  market: string;      // e.g., "Result", "Double Chance", "Both Teams to Score"
  selection: string;   // e.g., "Home", "Draw", "Away", "Yes", "No", "Home or Draw"
  odds: number;
}

export interface Bet {
  betId: string;
  userId: string;
  customerName?: string;  // Filled when direct register by Cambista
  cambistaId?: string;    // ID of cambista who registered if any
  status: "pending" | "won" | "lost" | "cancelled";
  stake: number;
  odds: number;
  potentialPayout: number;
  type: "simple" | "multiple" | "builder";
  selections: BetSelection[];
  createdAt: string;
  updatedAt: string;
}

export interface Game {
  gameId: string;
  homeTeam: string;
  awayTeam: string;
  homeLogo: string;
  awayLogo: string;
  league: string;
  date: string;
  status: string; // e.g. "SCHEDULED", "LIVE", "FINISHED"
  scoreHome?: number;
  scoreAway?: number;
  oddsHome: number;
  oddsDraw: number;
  oddsAway: number;
  manualOdds?: boolean;
  updatedAt: string;
}

export interface CambistaProfile {
  cambistaId: string;
  name: string;
  email: string;
  commission: number; // percentage, e.g. 10 for 10%
  status: "active" | "blocked";
  createdBy: string;
  createdAt: string;
}

export interface LiveMatchStats {
  gameId: string;
  homeTeam: string;
  awayTeam: string;
  homeLogo: string;
  awayLogo: string;
  league: string;
  scoreHome: number;
  scoreAway: number;
  minute: number;
  homeCorners: number;
  awayCorners: number;
  homeYellowCards: number;
  awayYellowCards: number;
  homeRedCards: number;
  awayRedCards: number;
  updatedAt: string;
}

export interface StandingRow {
  position: number;
  team: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  points: number;
  logoUrl?: string;
}

export interface LeagueStanding {
  leagueName: string;
  rows: StandingRow[];
  updatedAt: string;
}

export interface TeamDetail {
  teamId: string;
  name: string;
  logoUrl: string;
  stadium: string;
  country: string;
  lastGames: { opponent: string; score: string; date: string; isHome: boolean; result: "W" | "D" | "L" }[];
  nextGames: { opponent: string; date: string; isHome: boolean }[];
  updatedAt: string;
}

export interface AppConfig {
  footballDataApiKey: string;
  oddsApiKey: string;
  apiFootballKey: string;
  theSportsDbKey: string;
  connectionStatus: "connected" | "disconnected";
  updatedAt: string;
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}
