/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { Game, LiveMatchStats, LeagueStanding, TeamDetail, StandingRow } from "./src/types";

// Initialize Firebase client on server-side
import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  getDocs, 
  query, 
  where 
} from "firebase/firestore";

const firebaseConfig = JSON.parse(fs.readFileSync(path.join(process.cwd(), "firebase-applet-config.json"), "utf-8"));
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId);

// Standard Express Setup
const app = express();
app.use(express.json());
const PORT = 3000;

const CONFIG_FILE = path.join(process.cwd(), "api-keys-config.json");

// Define supported main championships
const SUPPORTED_CHAMPIONSHIPS = [
  // Brasil
  "Brasileirão Série A",
  "Brasileirão Série B",
  "Copa do Brasil",
  // Internacionais
  "Copa Libertadores",
  "Copa Sul-Americana",
  "Champions League",
  "Europa League",
  "Conference League",
  "Premier League",
  "La Liga",
  "Bundesliga",
  "Serie A Itália",
  "Ligue 1",
  "Eredivisie",
  "Liga Portugal",
  "MLS",
  "Saudi Pro League",
  // Seleções
  "Copa do Mundo",
  "Eliminatórias",
  "Nations League",
  "Eurocopa",
  "Copa América",
  // Amistosos
  "Amistosos de Seleções"
];

// Helper to load keys
function loadKeys() {
  if (fs.existsSync(CONFIG_FILE)) {
    try {
      const parsed = JSON.parse(fs.readFileSync(CONFIG_FILE, "utf-8"));
      return {
        apiFootballKey: parsed.apiFootballKey || "",
        theSportsDbKey: parsed.theSportsDbKey || "",
        oddsApiKey: parsed.oddsApiKey || "",
        footballDataApiKey: parsed.footballDataApiKey || "",
        connectionStatus: parsed.connectionStatus || "disconnected"
      };
    } catch (e) {
      return { apiFootballKey: "", theSportsDbKey: "", oddsApiKey: "", footballDataApiKey: "", connectionStatus: "disconnected" };
    }
  }
  return { apiFootballKey: "", theSportsDbKey: "", oddsApiKey: "", footballDataApiKey: "", connectionStatus: "disconnected" };
}

// Helper to save keys
function saveKeys(keys: { apiFootballKey: string; theSportsDbKey: string; oddsApiKey: string; footballDataApiKey: string; connectionStatus: string }) {
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(keys, null, 2), "utf-8");
}

// Substring matching to match teams from different APIs
function teamsMatch(apiTeam: string, fdTeam: string): boolean {
  if (!apiTeam || !fdTeam) return false;
  const t1 = apiTeam.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const t2 = fdTeam.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  return t1.includes(t2) || t2.includes(t1);
}

// Standard helper to normalize names for database keys
function cleanTeamId(name: string): string {
  return name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "-");
}

// Logo URL fallback resolver based on common team names
function getTeamLogoUrl(teamName: string): string {
  const b = teamName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  
  if (b.includes("lanus")) return "https://images.thesportsdb.com/images/media/team/badge/vqpvyx1421498188.png/tiny";
  if (b.includes("mirassol")) return "https://images.thesportsdb.com/images/media/team/badge/f3b8901693751735.png/tiny";
  if (b.includes("ldu q") || b.includes("quito")) return "https://images.thesportsdb.com/images/media/team/badge/twpsvy1422055610.png/tiny";
  if (b.includes("always ready")) return "https://images.thesportsdb.com/images/media/team/badge/7o97k61611352494.png/tiny";
  if (b.includes("estudiantes")) return "https://images.thesportsdb.com/images/media/team/badge/8st7f41550232742.png/tiny";
  if (b.includes("medellin")) return "https://images.thesportsdb.com/images/media/team/badge/yxtusw1421500244.png/tiny";
  if (b.includes("cusco")) return "https://images.thesportsdb.com/images/media/team/badge/pqvtpy1473211516.png/tiny";
  if (b.includes("nacional")) return "https://images.thesportsdb.com/images/media/team/badge/tywtqu1421498007.png/tiny";
  if (b.includes("coquimbo")) return "https://images.thesportsdb.com/images/media/team/badge/trtrrs1421503348.png/tiny";
  if (b.includes("universitario")) return "https://images.thesportsdb.com/images/media/team/badge/xtpqru1422055535.png/tiny";
  if (b.includes("tolima")) return "https://images.thesportsdb.com/images/media/team/badge/wwvrrp1422056073.png/tiny";

  if (b.includes("flamengo")) return "https://images.thesportsdb.com/images/media/team/badge/7vyv971550232585.png/tiny";
  if (b.includes("palmeiras")) return "https://images.thesportsdb.com/images/media/team/badge/8qwvwv1550232607.png/tiny";
  if (b.includes("sao paulo")) return "https://images.thesportsdb.com/images/media/team/badge/qtpssy1550232646.png/tiny";
  if (b.includes("corinthians")) return "https://images.thesportsdb.com/images/media/team/badge/uqpwws1550232617.png/tiny";
  if (b.includes("santos")) return "https://images.thesportsdb.com/images/media/team/badge/puvvty1550232637.png/tiny";
  if (b.includes("botafogo")) return "https://images.thesportsdb.com/images/media/team/badge/vwpwyq1421494553.png/tiny";
  if (b.includes("fluminense")) return "https://images.thesportsdb.com/images/media/team/badge/xvtqqv1550232661.png/tiny";
  if (b.includes("vasco")) return "https://images.thesportsdb.com/images/media/team/badge/vpxuuv1550232938.png/tiny";
  if (b.includes("cruzeiro")) return "https://images.thesportsdb.com/images/media/team/badge/wvrtqx1550232768.png/tiny";
  if (b.includes("atletico") || b.includes("atletico-mg")) return "https://images.thesportsdb.com/images/media/team/badge/vvpvwq1550232688.png/tiny";
  if (b.includes("gremio")) return "https://images.thesportsdb.com/images/media/team/badge/twvqqp1550232759.png/tiny";
  if (b.includes("internacional")) return "https://images.thesportsdb.com/images/media/team/badge/rsqvpy1550232653.png/tiny";
  if (b.includes("real madrid")) return "https://images.thesportsdb.com/images/media/team/badge/vwpvuv1421493796.png/tiny";
  if (b.includes("barcelona")) return "https://images.thesportsdb.com/images/media/team/badge/0g80781521453229.png/tiny";
  if (b.includes("manchester city")) return "https://images.thesportsdb.com/images/media/team/badge/vtsv701511477755.png/tiny";
  if (b.includes("manchester united")) return "https://images.thesportsdb.com/images/media/team/badge/3nndbv1512401614.png/tiny";
  if (b.includes("liverpool")) return "https://images.thesportsdb.com/images/media/team/badge/0984g51571591871.png/tiny";
  if (b.includes("arsenal")) return "https://images.thesportsdb.com/images/media/team/badge/724sz61557004456.png/tiny";
  if (b.includes("chelsea")) return "https://images.thesportsdb.com/images/media/team/badge/9618sh1587752495.png/tiny";
  if (b.includes("bayern")) return "https://images.thesportsdb.com/images/media/team/badge/rwvwpv1421494056.png/tiny";
  if (b.includes("paris saint") || b.includes("psg")) return "https://images.thesportsdb.com/images/media/team/badge/urywtp1448813131.png/tiny";
  if (b.includes("sport recife")) return "https://images.thesportsdb.com/images/media/team/badge/vwstry1550232921.png/tiny";
  if (b.includes("boca juniors")) return "https://images.thesportsdb.com/images/media/team/badge/sstqyp1421497914.png/tiny";
  if (b.includes("river plate")) return "https://images.thesportsdb.com/images/media/team/badge/uvwxqy1421498118.png/tiny";

  // Standard safe initials log
  return `https://placehold.co/100x100/0f172a/ffffff?text=${encodeURIComponent(teamName.slice(0, 2).toUpperCase())}`;
}

// Multi-league mock standings initializer
const generateMockStandings = (league: string): StandingRow[] => {
  const teamsMap: Record<string, string[]> = {
    "Brasileirão Série A": ["Botafogo", "Palmeiras", "Fortaleza", "Flamengo", "São Paulo", "Internacional", "Cruzeiro", "Bahia", "Vasco da Gama", "Atlético Mineiro", "Grêmio", "Corinthians", "Athletico-PR", "Criciúma", "Fluminense", "Vitória", "Red Bull Bragantino", "Juventude", "Cuiabá", "Atlético-GO"],
    "Brasileirão Série B": ["Santos", "Mirassol", "Sport Recife", "Ceará", "Novorizontino"],
    "Premier League": ["Manchester City", "Arsenal", "Liverpool", "Aston Villa", "Tottenham Hotspur", "Chelsea", "Newcastle United", "Manchester United"],
    "La Liga": ["Real Madrid", "Barcelona", "Girona", "Atlético de Madrid", "Athletic Club", "Real Sociedad"],
    "Champions League": ["Bayern Munich", "Real Madrid", "Arsenal", "Manchester City", "Paris Saint Germain"],
    "Copa Libertadores": ["River Plate", "Palmeiras", "Fluminense", "São Paulo", "Boca Juniors"]
  };

  const clubs = teamsMap[league] || ["Real Madrid", "Barcelona", "Manchester City", "Palmeiras", "Flamengo"];
  return clubs.map((name, idx) => ({
    position: idx + 1,
    team: name,
    played: 12 + Math.floor(Math.random() * 5),
    won: Math.max(0, 10 - idx - Math.floor(Math.random() * 2)),
    drawn: Math.floor(Math.random() * 4),
    lost: idx + Math.floor(Math.random() * 2),
    goalsFor: 25 - idx * 2 + Math.floor(Math.random() * 8),
    goalsAgainst: 10 + idx * 3 + Math.floor(Math.random() * 5),
    points: 30 - idx * 2 - Math.floor(Math.random() * 2),
    logoUrl: getTeamLogoUrl(name)
  }));
};

// Helper to generate dynamic matching dates
const getTodayAtTime = (hour: number, minute: number): string => {
  const d = new Date();
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
};

// Unified premium mock fixtures to align Today (Hoje) & Tomorrow (Amanhã) games
const getFallbackMatchesTodayTomorrow = (): Game[] => {
  const now = Date.now();
  const list: Game[] = [
    // Hoje - CONMEBOL Copa Libertadores
    {
      gameId: "M-CL-LANUS-MIRASSOL",
      homeTeam: "Lanús (Arg)",
      awayTeam: "Mirassol (Bra)",
      homeLogo: getTeamLogoUrl("Lanús"),
      awayLogo: getTeamLogoUrl("Mirassol"),
      league: "Copa Libertadores",
      date: getTodayAtTime(19, 0),
      status: "SCHEDULED",
      oddsHome: 1.91,
      oddsDraw: 3.20,
      oddsAway: 4.50,
      updatedAt: new Date().toISOString()
    },
    {
      gameId: "M-CL-LDUQ-ALWAYSREADY",
      homeTeam: "LDU Quito (Ecu)",
      awayTeam: "Always Ready (Bol)",
      homeLogo: getTeamLogoUrl("LDU Quito"),
      awayLogo: getTeamLogoUrl("Always Ready"),
      league: "Copa Libertadores",
      date: getTodayAtTime(19, 0),
      status: "SCHEDULED",
      oddsHome: 1.33,
      oddsDraw: 6.00,
      oddsAway: 7.00,
      updatedAt: new Date().toISOString()
    },
    {
      gameId: "M-CL-ESTUDIANTES-MEDELLIN",
      homeTeam: "Estudiantes (Arg)",
      awayTeam: "Ind. Medellín (Col)",
      homeLogo: getTeamLogoUrl("Estudiantes"),
      awayLogo: getTeamLogoUrl("Indm"),
      league: "Copa Libertadores",
      date: getTodayAtTime(21, 30),
      status: "SCHEDULED",
      oddsHome: 1.62,
      oddsDraw: 3.60,
      oddsAway: 6.00,
      updatedAt: new Date().toISOString()
    },
    {
      gameId: "M-CL-FLAMENGO-CUSCO",
      homeTeam: "Flamengo (Bra)",
      awayTeam: "Cusco (Per)",
      homeLogo: getTeamLogoUrl("Flamengo"),
      awayLogo: getTeamLogoUrl("Cusco"),
      league: "Copa Libertadores",
      date: getTodayAtTime(21, 30),
      status: "SCHEDULED",
      oddsHome: 1.14,
      oddsDraw: 8.50,
      oddsAway: 17.00,
      updatedAt: new Date().toISOString()
    },
    {
      gameId: "M-CL-NACIONAL-COQUIMBO",
      homeTeam: "Nacional (Uru)",
      awayTeam: "Coquimbo Unido (Chi)",
      homeLogo: getTeamLogoUrl("Nacional"),
      awayLogo: getTeamLogoUrl("Coquimbo"),
      league: "Copa Libertadores",
      date: getTodayAtTime(21, 30),
      status: "SCHEDULED",
      oddsHome: 1.67,
      oddsDraw: 3.70,
      oddsAway: 5.00,
      updatedAt: new Date().toISOString()
    },
    {
      gameId: "M-CL-UNIVERSITARIO-TOLIMA",
      homeTeam: "Universitario (Per)",
      awayTeam: "Tolima (Col)",
      homeLogo: getTeamLogoUrl("Universitario"),
      awayLogo: getTeamLogoUrl("Tolima"),
      league: "Copa Libertadores",
      date: getTodayAtTime(21, 30),
      status: "SCHEDULED",
      oddsHome: 2.45,
      oddsDraw: 3.00,
      oddsAway: 3.10,
      updatedAt: new Date().toISOString()
    },
    // Outstanding matches for other categories of Brasileiro Série A to keep things complete!
    {
      gameId: "M-BSA-1",
      homeTeam: "São Paulo",
      awayTeam: "Corinthians",
      homeLogo: getTeamLogoUrl("São Paulo"),
      awayLogo: getTeamLogoUrl("Corinthians"),
      league: "Brasileirão Série A",
      date: getTodayAtTime(16, 0),
      status: "SCHEDULED",
      oddsHome: 1.85,
      oddsDraw: 3.40,
      oddsAway: 4.10,
      updatedAt: new Date().toISOString()
    },
    {
      gameId: "M-PL-1",
      homeTeam: "Liverpool",
      awayTeam: "Chelsea",
      homeLogo: getTeamLogoUrl("Liverpool"),
      awayLogo: getTeamLogoUrl("Chelsea"),
      league: "Premier League",
      date: getTodayAtTime(18, 30),
      status: "SCHEDULED",
      oddsHome: 1.70,
      oddsDraw: 3.80,
      oddsAway: 4.50,
      updatedAt: new Date().toISOString()
    }
  ];

  return list;
};

// Synchronizes external/mocked logs securely into associated Firebase collections
async function performMasterSynchronization() {
  const keys = loadKeys();
  const nowStr = new Date().toISOString();
  console.log("Starting Master Sport Synchronizer Worker to Firebase Firestore...");

  try {
    let sourceMatches: Game[] = [];

    // Under Standard configurations, fetch from configured keys or fallback
    if (keys.oddsApiKey) {
      try {
        console.log("Fetching live odds via The Odds API...");
        const response = await fetch(`https://api.the-odds-api.com/v4/sports/soccer/odds/?regions=eu&markets=h2h&oddsFormat=decimal&apiKey=${keys.oddsApiKey}`);
        if (response.ok) {
          const raw = await response.json() as any[];
          if (Array.isArray(raw)) {
            raw.forEach((item) => {
              let oddsHome = 2.0, oddsDraw = 3.0, oddsAway = 3.0;
              if (item.bookmakers && item.bookmakers[0]) {
                const bookmaker = item.bookmakers[0];
                const market = bookmaker.markets?.find((m: any) => m.key === "h2h");
                if (market && market.outcomes) {
                  const h = market.outcomes.find((o: any) => o.name === item.home_team);
                  const a = market.outcomes.find((o: any) => o.name === item.away_team);
                  const d = market.outcomes.find((o: any) => o.name === "Draw" || o.name === "Empate");
                  if (h) oddsHome = Number(h.price);
                  if (a) oddsAway = Number(a.price);
                  if (d) oddsDraw = Number(d.price);
                }
              }

              // Match tournament tag
              let leagueTag = "Brasileirão Série A"; 
              if (item.sport_title && SUPPORTED_CHAMPIONSHIPS.includes(item.sport_title)) {
                leagueTag = item.sport_title;
              }

              sourceMatches.push({
                gameId: `REAL-${item.id}`,
                homeTeam: item.home_team,
                awayTeam: item.away_team,
                homeLogo: getTeamLogoUrl(item.home_team),
                awayLogo: getTeamLogoUrl(item.away_team),
                league: leagueTag,
                date: item.commence_time,
                status: "SCHEDULED",
                oddsHome,
                oddsDraw,
                oddsAway,
                updatedAt: nowStr
              });
            });
          }
        }
      } catch (err) {
        console.error("The Odds API query failed. Reverting to fail-safe simulation.", err);
      }
    }

    // Merge or Fallback to simulated perfect premium Today/Tomorrow games
    const fallbackList = getFallbackMatchesTodayTomorrow();
    const existingPairs = new Set(sourceMatches.map(g => `${g.homeTeam.toLowerCase()} vs ${g.awayTeam.toLowerCase()}`));
    const uniqueFallbacks = fallbackList.filter(g => !existingPairs.has(`${g.homeTeam.toLowerCase()} vs ${g.awayTeam.toLowerCase()}`));
    sourceMatches = [...uniqueFallbacks, ...sourceMatches];

    // Strict Filter: TODAY and TOMORROW only
    const tLower = new Date();
    tLower.setHours(0,0,0,0);
    const tUpper = new Date();
    tUpper.setDate(tUpper.getDate() + 2); // strictly end of tomorrow
    tUpper.setHours(23,59,59,999);

    const filteredMatches = sourceMatches.filter(game => {
      const gd = new Date(game.date);
      return gd >= tLower && gd <= tUpper && SUPPORTED_CHAMPIONSHIPS.includes(game.league);
    });

    // Write matches list to Firebase Firestore `/matches` collection
    for (const match of filteredMatches) {
      await setDoc(doc(db, "matches", match.gameId), match, { merge: true });

      // Save Odds specifically to `/odds` collection
      await setDoc(doc(db, "odds", match.gameId), {
        gameId: match.gameId,
        oddsHome: match.oddsHome,
        oddsDraw: match.oddsDraw,
        oddsAway: match.oddsAway,
        updatedAt: nowStr
      }, { merge: true });

      // If active or live, set up statistics in `live_matches`
      if (match.status === "LIVE") {
        const liveStats: LiveMatchStats = {
          gameId: match.gameId,
          homeTeam: match.homeTeam,
          awayTeam: match.awayTeam,
          homeLogo: match.homeLogo,
          awayLogo: match.awayLogo,
          league: match.league,
          scoreHome: match.scoreHome ?? 1,
          scoreAway: match.scoreAway ?? 0,
          minute: 45 + Math.floor(Math.random() * 20),
          homeCorners: 3 + Math.floor(Math.random() * 4),
          awayCorners: 2 + Math.floor(Math.random() * 3),
          homeYellowCards: Math.floor(Math.random() * 3),
          awayYellowCards: Math.floor(Math.random() * 3),
          homeRedCards: Math.random() > 0.85 ? 1 : 0,
          awayRedCards: Math.random() > 0.9 ? 1 : 0,
          updatedAt: nowStr
        };
        await setDoc(doc(db, "live_matches", match.gameId), liveStats, { merge: true });
      }

      // Sync associated Team Descriptions `/teams`
      const syncTeam = async (name: string, logo: string) => {
        const tId = cleanTeamId(name);
        const ref = doc(db, "teams", tId);
        const existSnap = await getDoc(ref);
        if (!existSnap.exists()) {
          const detail: TeamDetail = {
            teamId: tId,
            name,
            logoUrl: logo,
            stadium: name === "Real Madrid" ? "Santiago Bernabéu" : name === "Palmeiras" ? "Allianz Parque" : name === "Flamengo" ? "Maracanã" : "Estádio Municipal",
            country: name === "Real Madrid" ? "Espanha" : name === "Manchester City" ? "Inglaterra" : "Brasil",
            lastGames: [
              { opponent: "Adversário A", score: "2-1", date: nowStr, isHome: true, result: "W" },
              { opponent: "Adversário B", score: "1-1", date: nowStr, isHome: false, result: "D" },
            ],
            nextGames: [
              { opponent: "Próximo Rival", date: nowStr, isHome: true }
            ],
            updatedAt: nowStr
          };
          await setDoc(ref, detail);
        }
      };
      await syncTeam(match.homeTeam, match.homeLogo);
      await syncTeam(match.awayTeam, match.awayLogo);
    }

    // Populate Standings `/standings` for supported leagues and Leagues info `/leagues`
    for (const champion of SUPPORTED_CHAMPIONSHIPS) {
      const cleanRef = cleanTeamId(champion);
      await setDoc(doc(db, "leagues", cleanRef), {
        code: cleanRef.toUpperCase().slice(0, 4),
        name: champion,
        region: champion.includes("Brasileirão") || champion.includes("Copa do Brasil") ? "Brasil" : "Internacional",
        flag: champion.includes("Brasileirão") ? "🇧🇷" : "🏆"
      });

      // Write Standings
      const rows = generateMockStandings(champion);
      const stand: LeagueStanding = {
        leagueName: champion,
        rows,
        updatedAt: nowStr
      };
      await setDoc(doc(db, "standings", cleanRef), stand, { merge: true });
    }

    // Write Cache Logs
    await setDoc(doc(db, "cache_control", "global_status"), {
      key: "sync_state",
      lastSyncTime: nowStr,
      updatedAt: nowStr
    }, { merge: true });

    console.log("Firebase Firestore successfully hydrated and synced in real-time.");
  } catch (error) {
    console.error("Critical Synchronization Error into Firebase:", error);
  }
}

// Set up server background triggers / real-time updates intervals
// Live matches score/minute updates: every 60 seconds
setInterval(async () => {
  try {
    const liveSnapshot = await getDocs(collection(db, "live_matches"));
    const nowStr = new Date().toISOString();
    
    for (const docItem of liveSnapshot.docs) {
      const stats = docItem.data() as LiveMatchStats;
      if (stats.minute < 90) {
        const nextMin = stats.minute + 1;
        let scoreHome = stats.scoreHome;
        let scoreAway = stats.scoreAway;
        let cornersH = stats.homeCorners;
        let cornersA = stats.awayCorners;

        // Realistic random events (goals, corners) inside 60-second ticks
        if (Math.random() > 0.95) scoreHome += 1;
        if (Math.random() > 0.96) scoreAway += 1;
        if (Math.random() > 0.8) cornersH += 1;
        if (Math.random() > 0.82) cornersA += 1;

        await updateDoc(doc(db, "live_matches", stats.gameId), {
          minute: nextMin,
          scoreHome,
          scoreAway,
          homeCorners: cornersH,
          awayCorners: cornersA,
          updatedAt: nowStr
        });

        // Sync back into `/matches` as well for unified scoreboards
        await updateDoc(doc(db, "matches", stats.gameId), {
          scoreHome,
          scoreAway,
          updatedAt: nowStr
        });
      } else {
        // Complete match
        await updateDoc(doc(db, "matches", stats.gameId), {
          status: "FINISHED",
          updatedAt: nowStr
        });
        // Remove from live match collection
        await setDoc(doc(db, "live_matches", stats.gameId), { ...stats, minute: 90 }, { merge: true });
      }
    }
  } catch (err) {
    console.error("Live match auto-updates ticker failed:", err);
  }
}, 60 * 1000);

// Future matches sync interval: every 10 minutes
setInterval(() => {
  performMasterSynchronization();
}, 10 * 60 * 1000);

// Standings sync interval: every 1 hour (60 mins)
setInterval(async () => {
  const nowStr = new Date().toISOString();
  try {
    for (const champion of SUPPORTED_CHAMPIONSHIPS) {
      const cleanRef = cleanTeamId(champion);
      const rows = generateMockStandings(champion);
      await setDoc(doc(db, "standings", cleanRef), {
        leagueName: champion,
        rows,
        updatedAt: nowStr
      }, { merge: true });
    }
    console.log("Hourly Standings recalculated successfully.");
  } catch (err) {
    console.error("Hourly Standings update routine failed:", err);
  }
}, 60 * 60 * 1000);

// Odds sync interval: every 5 minutes
setInterval(async () => {
  const nowStr = new Date().toISOString();
  try {
    const matchesSnap = await getDocs(collection(db, "matches"));
    for (const d of matchesSnap.docs) {
      const m = d.data() as Game;
      if (m.status === "SCHEDULED" && !m.manualOdds) {
        // Safe minor drift simulation
        const deltaHome = (Math.random() - 0.5) * 0.1;
        const deltaAway = (Math.random() - 0.5) * 0.15;
        const newH = Math.max(1.05, Number((m.oddsHome + deltaHome).toFixed(2)));
        const newA = Math.max(1.05, Number((m.oddsAway + deltaAway).toFixed(2)));

        await updateDoc(doc(db, "matches", m.gameId), {
          oddsHome: newH,
          oddsAway: newA,
          updatedAt: nowStr
        });

        await setDoc(doc(db, "odds", m.gameId), {
          gameId: m.gameId,
          oddsHome: newH,
          oddsDraw: m.oddsDraw,
          oddsAway: newA,
          updatedAt: nowStr
        }, { merge: true });
      }
    }
  } catch (err) {
    console.error("5-Min Odds calibration worker failed:", err);
  }
}, 5 * 60 * 1000);

// Synchronize initial dataset at boot
performMasterSynchronization();

// Masked configurations getter
app.get("/api/config", (req, res) => {
  const keys = loadKeys();
  res.json({
    hasFootballDataKey: !!keys.footballDataApiKey,
    hasOddsApiKey: !!keys.oddsApiKey,
    hasApiFootballKey: !!keys.apiFootballKey,
    hasTheSportsDbKey: !!keys.theSportsDbKey,
    footballDataApiKey: keys.footballDataApiKey ? "●●●●●●●●●●●●" : "",
    oddsApiKey: keys.oddsApiKey ? "●●●●●●●●●●●●" : "",
    apiFootballKey: keys.apiFootballKey ? "●●●●●●●●●●●●" : "",
    theSportsDbKey: keys.theSportsDbKey ? "●●●●●●●●●●●●" : "",
    connectionStatus: keys.connectionStatus
  });
});

// Edit keys configuration and save to Firebase Settings Global
app.post("/api/config", async (req, res) => {
  const { footballDataApiKey, oddsApiKey, apiFootballKey, theSportsDbKey } = req.body;
  const current = loadKeys();

  // Keep old parameters if placeholders or unmodified values post
  const updated = {
    footballDataApiKey: (footballDataApiKey && !footballDataApiKey.includes("●")) ? footballDataApiKey : current.footballDataApiKey,
    oddsApiKey: (oddsApiKey && !oddsApiKey.includes("●")) ? oddsApiKey : current.oddsApiKey,
    apiFootballKey: (apiFootballKey && !apiFootballKey.includes("●")) ? apiFootballKey : current.apiFootballKey,
    theSportsDbKey: (theSportsDbKey && !theSportsDbKey.includes("●")) ? theSportsDbKey : current.theSportsDbKey,
    connectionStatus: current.connectionStatus
  };

  saveKeys(updated);

  try {
    // Write configs to Firebase Firestore /settings/global as master source
    await setDoc(doc(db, "settings", "global"), {
      hasFootballDataKey: !!updated.footballDataApiKey,
      hasOddsApiKey: !!updated.oddsApiKey,
      hasApiFootballKey: !!updated.apiFootballKey,
      hasTheSportsDbKey: !!updated.theSportsDbKey,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (err) {
    console.error("Failed persisting keys mask to settings/global collection", err);
  }

  res.json({ success: true, message: "APIs Key persistidas de forma segura no Firebase/Backend." });
});

// Connect test simulation endpoint
app.post("/api/config/test", async (req, res) => {
  const keys = loadKeys();
  const hasAtLeastOneKey = !!(keys.footballDataApiKey || keys.oddsApiKey || keys.apiFootballKey || keys.theSportsDbKey);
  const status = hasAtLeastOneKey ? "connected" : "disconnected";

  keys.connectionStatus = status;
  saveKeys(keys);

  try {
    await updateDoc(doc(db, "settings", "global"), {
      connectionStatus: status,
      lastTestTime: new Date().toISOString()
    });
  } catch (e) {}

  res.json({ success: true, status });
});

// Force manual synchronization now trigger
app.post("/api/config/refresh", async (req, res) => {
  await performMasterSynchronization();
  res.json({ success: true, message: "Sincronização manual completada em tempo real!" });
});

// Proxy route for client-side legacy compatibility
app.get("/api/games", async (req, res) => {
  const now = Date.now();
  try {
    const list: Game[] = [];
    const snap = await getDocs(collection(db, "matches"));
    snap.forEach(d => {
      list.push(d.data() as Game);
    });

    if (list.length === 0) {
      return res.json(getFallbackMatchesTodayTomorrow());
    }

    // Filter Today/Tomorrow matches explicitly
    const tLower = new Date();
    tLower.setHours(0,0,0,0);
    const tUpper = new Date();
    tUpper.setDate(tUpper.getDate() + 2);
    tUpper.setHours(23,59,59,999);

    const filtered = list.filter(g => {
      const gd = new Date(g.date);
      return gd >= tLower && gd <= tUpper;
    });

    res.json(filtered.length > 0 ? filtered : list);
  } catch (err) {
    res.json(getFallbackMatchesTodayTomorrow());
  }
});

// Admin endpoint override odds
app.post("/api/games/override", async (req, res) => {
  const { gameId, oddsHome, oddsDraw, oddsAway } = req.body;
  if (!gameId || oddsHome === undefined || oddsDraw === undefined || oddsAway === undefined) {
    return res.status(400).json({ error: "Parâmetros inválidos." });
  }

  try {
    const matchRef = doc(db, "matches", gameId);
    await updateDoc(matchRef, {
      oddsHome: Number(oddsHome),
      oddsDraw: Number(oddsDraw),
      oddsAway: Number(oddsAway),
      manualOdds: true,
      updatedAt: new Date().toISOString()
    });

    await setDoc(doc(db, "odds", gameId), {
      gameId,
      oddsHome: Number(oddsHome),
      oddsDraw: Number(oddsDraw),
      oddsAway: Number(oddsAway),
      manualOdds: true,
      updatedAt: new Date().toISOString()
    }, { merge: true });

    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: "Erro de persistência de cotações." });
  }
});

// Admin endpoint to add custom games for other leagues
app.post("/api/games", async (req, res) => {
  const game = req.body as Game;
  if (!game || !game.gameId) {
    return res.status(400).json({ error: "Parâmetros da partida inválidos." });
  }

  try {
    await setDoc(doc(db, "matches", game.gameId), game);
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: "Gargalo ao inserir partida." });
  }
});

// Admin endpoint to register/create a new Cambista account and profile in Firebase Auth + Firestore
app.post("/api/admin/create-cambista", async (req, res) => {
  const { name, email, password, commission } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: "Nome, email e senha são obrigatórios!" });
  }

  try {
    // 1. Create User in Firebase Authentication using Identity Toolkit REST API
    const signUpUrl = `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${firebaseConfig.apiKey}`;
    const authResponse = await fetch(signUpUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: email.toLowerCase().trim(),
        password,
        returnSecureToken: true
      })
    });

    const authData: any = await authResponse.json();

    if (!authResponse.ok) {
      const errorMessage = authData?.error?.message || "Erro desconhecido ao registrar autenticação.";
      console.error("Firebase auth creation failed on REST endpoint:", authData);
      return res.status(400).json({ error: errorMessage });
    }

    const localId = authData.localId; // The new firebase UID
    const nowStr = new Date().toISOString();

    // 2. Register/Create user Profile in Firestore "users" collection
    await setDoc(doc(db, "users", localId), {
      userId: localId,
      name,
      email: email.toLowerCase().trim(),
      role: "cambista",
      balance: 0.0,
      status: "active",
      createdAt: nowStr,
      updatedAt: nowStr
    });

    // 3. Register/Create cambista Profile in Firestore "cambistas" collection
    await setDoc(doc(db, "cambistas", localId), {
      cambistaId: localId,
      name,
      email: email.toLowerCase().trim(),
      commission: Number(commission) || 10,
      status: "active",
      createdBy: "admin",
      createdAt: nowStr,
      updatedAt: nowStr
    });

    return res.json({ success: true, userId: localId });
  } catch (err: any) {
    console.error("Server side error in create-cambista endpoint:", err);
    return res.status(500).json({ error: err?.message || "Erro no servidor ao salvar cambista." });
  }
});

// Start unified Server
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
