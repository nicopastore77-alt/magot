import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  LineChart, Line, AreaChart, Area, PieChart, Pie, Cell,
  ResponsiveContainer, Tooltip, XAxis, YAxis, BarChart, Bar,
  RadialBarChart, RadialBar, PolarAngleAxis,
} from 'recharts';

/* ============================================================
   MAGOT v3 — Wealth Dashboard pour jeunes investisseurs FR
   Nouveautés v3:
   - Historique individuel par actif (courbe + logs)
   - Fiscalité PEA (countdown 5 ans + économie fiscale)
   - Mode partage public (carte shareable TikTok/Twitter)
   ============================================================ */

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=IBM+Plex+Mono:wght@300;400;500;600&family=Manrope:wght@300;400;500;600;700;800&display=swap');

  :root {
    --bg: #0A0B0D; --bg-card: #141619; --bg-input: #0F1114; --bg-subtle: #1A1D21;
    --border: #26292E; --border-2: #3A3F46; --border-3: #1E2126;
    --text: #F5F5F0; --text-2: #A0A3A8; --text-3: #6E7074;
  }
  [data-theme='light'] {
    --bg: #F0F2F5; --bg-card: #FFFFFF; --bg-input: #F5F6F8; --bg-subtle: #F9FAFB;
    --border: #E2E5EA; --border-2: #C9CDD6; --border-3: #EBEEF2;
    --text: #0D1117; --text-2: #4B5563; --text-3: #9CA3AF;
  }
  /* Tailwind arbitrary class overrides for light mode */
  [data-theme='light'] .text-\[\#6E7074\] { color: var(--text-3) !important; }
  [data-theme='light'] .text-\[\#A0A3A8\] { color: var(--text-2) !important; }
  [data-theme='light'] .text-\[\#F5F5F0\] { color: var(--text) !important; }
  [data-theme='light'] .text-\[\#3A3F46\] { color: #8B9099 !important; }
  [data-theme='light'] .text-\[\#D0D2D6\] { color: #374151 !important; }
  [data-theme='light'] .border-\[\#26292E\] { border-color: var(--border) !important; }
  [data-theme='light'] .border-\[\#1E2126\] { border-color: var(--border-3) !important; }
  [data-theme='light'] .border-\[\#3A3F46\] { border-color: var(--border-2) !important; }
  [data-theme='light'] .bg-\[\#141619\] { background: var(--bg-card) !important; }

  /* Light mode: body bg, main backgrounds */
  [data-theme='light'] { color-scheme: light; }
  [data-theme='light'] .grain::before { opacity: 0.015; }
  
  /* Light mode card hover */
  [data-theme='light'] .card:hover { border-color: var(--border-2) !important; }
  
  /* Light mode nav */
  [data-theme='light'] .nav-link { color: #4B5563; }
  [data-theme='light'] .nav-link.active { color: #059669; }
  [data-theme='light'] .nav-link:hover { color: var(--text); }
  
  /* Light mode btn-ghost */
  [data-theme='light'] .btn-ghost { color: var(--text); border-color: var(--border); }
  [data-theme='light'] .btn-ghost:hover { background: var(--bg-subtle); }
  
  /* Light mode text overrides for common tailwind arbitrary classes */
  [data-theme='light'] .text-\[\#D0D2D6\] { color: #374151 !important; }
  [data-theme='light'] .text-\[\#4A4D52\] { color: #6B7280 !important; }
  [data-theme='light'] .text-\[\#C0C3C8\] { color: #4B5563 !important; }

  /* Light mode inline backgrounds via style= using CSS vars (handled by var() calls in JS) */

  /* Cards with explicit dark gradient backgrounds → always dark bg + white text */
  [data-theme='light'] .dark-card { color: #F5F5F0 !important; }
  [data-theme='light'] .dark-card .text-\[\#6E7074\] { color: #9CA3AF !important; }
  [data-theme='light'] .dark-card .text-\[\#A0A3A8\] { color: #C9CDD6 !important; }
  [data-theme='light'] .dark-card .text-\[\#D0D2D6\] { color: #F0F0F0 !important; }
  [data-theme='light'] .dark-card .text-\[\#F5F5F0\] { color: #FFFFFF !important; }

  * { -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
  body { font-family: 'Manrope', sans-serif; background: var(--bg); color: var(--text); transition: background 0.25s ease, color 0.25s ease; }

  .font-serif { font-family: 'Instrument Serif', serif; font-weight: 400; }
  .font-mono  { font-family: 'IBM Plex Mono', monospace; }

  .grain::before {
    content: ''; position: fixed; inset: 0; pointer-events: none; z-index: 1;
    opacity: 0.035;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  }

  @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes scaleIn { from { opacity: 0; transform: scale(0.96); } to { opacity: 1; transform: scale(1); } }
  @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
  @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes shine { 0% { transform: translateX(-100%); } 100% { transform: translateX(200%); } }
  @keyframes slideInRight { from { opacity: 0; transform: translateX(18px); } to { opacity: 1; transform: translateX(0); } }
  @keyframes slideOutLeft { from { opacity: 1; transform: translateX(0); } to { opacity: 0; transform: translateX(-18px); } }
  .page-enter { animation: slideInRight 0.28s cubic-bezier(0.2, 0.8, 0.2, 1) both; }

  .fade-up { animation: fadeUp 0.5s cubic-bezier(0.2, 0.8, 0.2, 1) both; }
  .fade-in { animation: fadeIn 0.4s ease-out both; }
  .scale-in { animation: scaleIn 0.3s cubic-bezier(0.2, 0.8, 0.2, 1) both; }
  .delay-1 { animation-delay: 0.08s; } .delay-2 { animation-delay: 0.16s; }
  .delay-3 { animation-delay: 0.24s; } .delay-4 { animation-delay: 0.32s; }
  .delay-5 { animation-delay: 0.40s; } .delay-6 { animation-delay: 0.48s; }

  .shimmer-gold {
    background: linear-gradient(90deg, #E8C547 0%, #FFE898 50%, #E8C547 100%);
    background-size: 200% 100%;
    animation: shimmer 4s linear infinite;
    -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
  }
  .shimmer-green {
    background: linear-gradient(90deg, #B8FF5A 0%, #E8FFA8 50%, #B8FF5A 100%);
    background-size: 200% 100%;
    animation: shimmer 4s linear infinite;
    -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
  }
  .pulse-dot { animation: pulse 2s ease-in-out infinite; }
  .spinner { width:16px; height:16px; border:2px solid var(--border); border-top-color:#B8FF5A; border-radius:50%; animation: spin 0.7s linear infinite; }

  .card {
    background: var(--bg-card); border: 1px solid var(--border); border-radius: 14px; transition: background 0.25s ease, border-color 0.2s ease, transform 0.2s ease;
    }
  .card:hover { border-color: var(--border-2); }
  .card-interactive { cursor: pointer; }
  .card-interactive:hover { transform: translateY(-2px); }

  .btn-primary {
    background: #B8FF5A; color: #0A0B0D; font-weight: 600;
    transition: all 0.15s ease; letter-spacing: -0.01em;
  }
  .btn-primary:hover { background: #A5F040; transform: translateY(-1px); box-shadow: 0 6px 20px rgba(184,255,90,0.25); }
  .btn-primary:active { transform: translateY(0); }
  .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

  .btn-ghost {
    background: transparent; color: var(--text); border: 1px solid var(--border);
    transition: all 0.15s ease;
  }
  .btn-ghost:hover { background: var(--bg-subtle); border-color: var(--border-2); }

  .btn-gold {
    background: linear-gradient(135deg, #E8C547 0%, #D4A933 100%);
    color: #0A0B0D; font-weight: 600;
    transition: all 0.15s ease;
  }
  .btn-gold:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(232,197,71,0.3); }

  .input {
    background: var(--bg-input); border: 1px solid var(--border); color: var(--text);
    border-radius: 10px; padding: 12px 14px; font-size: 14px; width: 100%;
    transition: border-color 0.15s ease; font-family: 'Manrope', sans-serif;
  }
  .input:focus { outline: none; border-color: #B8FF5A; }
  .input::placeholder { color: var(--text-3); }

  .slider {
    -webkit-appearance: none; appearance: none;
    width: 100%; height: 4px; border-radius: 2px;
    background: var(--border); outline: none;
  }
  .slider::-webkit-slider-thumb {
    -webkit-appearance: none; appearance: none;
    width: 18px; height: 18px; border-radius: 50%;
    background: #B8FF5A; cursor: pointer;
    box-shadow: 0 0 0 4px rgba(184,255,90,0.15);
    transition: box-shadow 0.15s ease;
  }
  .slider::-webkit-slider-thumb:hover { box-shadow: 0 0 0 6px rgba(184,255,90,0.2); }
  .slider::-moz-range-thumb {
    width: 18px; height: 18px; border-radius: 50%; border: none;
    background: #B8FF5A; cursor: pointer;
  }

  .nav-link { transition: all 0.15s ease; cursor: pointer; }
  .nav-link:hover { color: var(--text); }
  .nav-link.active { color: #B8FF5A; }

  .hero-grid {
    background-image: linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px);
    background-size: 60px 60px;
    mask-image: radial-gradient(ellipse 80% 60% at 50% 40%, black 30%, transparent 80%);
  }

  .glow-green { box-shadow: 0 0 60px rgba(184,255,90,0.15); }
  .glow-gold { box-shadow: 0 0 60px rgba(232,197,71,0.15); }

  .divider-dot::after { content: '·'; margin: 0 8px; color: var(--text-3); }
  .divider-dot:last-child::after { content: ''; }

  .share-card {
    position: relative;
    background: linear-gradient(135deg, #0F1114 0%, #1A1D21 50%, #0F1114 100%);
    border: 1px solid #26292E;
    overflow: hidden;
  }
  .share-card::after {
    content: ''; position: absolute; top: 0; left: 0; right: 0; bottom: 0;
    background: linear-gradient(120deg, transparent 30%, rgba(184,255,90,0.08) 50%, transparent 70%);
    animation: shine 8s ease-in-out infinite;
    pointer-events: none;
  }

  ::-webkit-scrollbar { width: 8px; height: 8px; }
  ::-webkit-scrollbar-track { background: #0A0B0D; }
  ::-webkit-scrollbar-thumb { background: #26292E; border-radius: 4px; }
  ::-webkit-scrollbar-thumb:hover { background: #3A3F46; }
`;

/* ========== CONSTANTS ========== */

const ASSET_TYPES = {
  pea:    { label: 'PEA',           color: '#B8FF5A', emoji: '📈', desc: 'Plan d\'Épargne en Actions · exonération après 5 ans', defaultYield: 7 },
  cto:    { label: 'CTO',           color: '#7BB3FF', emoji: '🌍', desc: 'Compte-Titres Ordinaire · imposé à 30% sur les gains', defaultYield: 7 },
  crypto: { label: 'Crypto',        color: '#E8C547', emoji: '₿',  desc: 'BTC, ETH, altcoins · imposé à 30% quand tu vends', defaultYield: 0 },
  scpi:   { label: 'SCPI',          color: '#B598FF', emoji: '🏢', desc: 'Pierre-papier · ~4-6% de rendement locatif', defaultYield: 4.5 },
  immo:   { label: 'Immobilier',    color: '#FF9CC4', emoji: '🏠', desc: 'Biens physiques · loyers + plus-value', defaultYield: 3 },
  livret: { label: 'Livrets',       color: '#8ED6C1', emoji: '💰', desc: 'Livret A 3%, LDDS 3%, LEP 5%', defaultYield: 3 },
  av:     { label: 'Assurance-vie', color: '#FFB366', emoji: '🛡️', desc: 'AV fonds euros (2-3%) ou UC (variable)', defaultYield: 2.5 },
  cash:   { label: 'Cash',          color: '#6E7074', emoji: '💶', desc: 'Comptes courants · perd face à l\'inflation', defaultYield: 0 },
};

const BENCHMARKS = {
  18: { median: 800,   p10: 100,   p25: 300,   p75: 3000,  p90: 8000,   p99: 25000 },
  20: { median: 1500,  p10: 200,   p25: 600,   p75: 5000,  p90: 15000,  p99: 50000 },
  22: { median: 2800,  p10: 400,   p25: 1200,  p75: 9000,  p90: 25000,  p99: 85000 },
  25: { median: 6000,  p10: 800,   p25: 2500,  p75: 18000, p90: 50000,  p99: 150000 },
  28: { median: 14000, p10: 1500,  p25: 5000,  p75: 40000, p90: 110000, p99: 300000 },
  30: { median: 22000, p10: 2500,  p25: 8000,  p75: 65000, p90: 180000, p99: 500000 },
};

const ACHIEVEMENTS = [
  { id: 'first',       threshold: 1,         label: 'Premier euro',      emoji: '🌱', desc: 'Tu commences le jeu' },
  { id: 'thousand',    threshold: 1000,      label: 'Premier k€',        emoji: '💫', desc: '1 000€ trackés' },
  { id: 'fivek',       threshold: 5000,      label: '5 chiffres',        emoji: '🔥', desc: '5 000€ atteints' },
  { id: 'tenk',        threshold: 10000,     label: 'Cinq chiffres',     emoji: '⚡', desc: '10 000€ — tu rentres dans le jeu' },
  { id: 'twentyfive',  threshold: 25000,     label: 'Niveau supérieur',  emoji: '🚀', desc: '25k — ça devient sérieux' },
  { id: 'fifty',       threshold: 50000,     label: 'Demi-magot',        emoji: '💎', desc: '50 000€' },
  { id: 'hundred',     threshold: 100000,    label: 'Six chiffres',      emoji: '👑', desc: '100 000€' },
  { id: 'divers4',     threshold: 'divers4', label: 'Diversifié',        emoji: '🧩', desc: '4 classes d\'actifs ou plus' },
  { id: 'passive',     threshold: 'passive', label: 'Revenu passif',     emoji: '💰', desc: 'Premier revenu passif tracké' },
  { id: 'top25',       threshold: 'top25',   label: 'Top 25% de ton âge 🏆', emoji: '🏆', desc: 'Mieux que 75% de ta tranche' },
  { id: 'top10',       threshold: 'top10',   label: 'Top 10%',           emoji: '🥇', desc: 'Dans le haut du panier' },
  { id: 'top1',        threshold: 'top1',    label: 'Top 1%',            emoji: '🌟', desc: 'L\'élite de ton âge' },
];

/* ========== ARTICLES — Page Apprendre (feature 6) ========== */

const ARTICLES = [
  {
    id: 'pea-basics', emoji: '📈',
    category: 'fiscalite', catLabel: 'Fiscalité', catColor: '#B598FF',
    title: "PEA : le compte qui te fait économiser des milliers d'euros",
    desc: "L'outil fiscal numéro 1 pour un investisseur français. Pourquoi l'ouvrir maintenant, même avec 10€.",
    time: 4, level: 'Débutant', featured: true, premium: false,
    sections: [
      { type: 'intro', text: "Le PEA est probablement la meilleure décision financière qu'un jeune Français puisse prendre. Et la plupart attendent trop longtemps." },
      { type: 'heading', text: "Le principe : zéro impôt après 5 ans" },
      { type: 'para', text: "Sur un compte classique (CTO), chaque fois que tu vends un actif avec profit, tu paies 30% d'impôts (flat tax). Sur un PEA, après 5 ans d'ancienneté, tu ne paies que les prélèvements sociaux — soit 17,2% au lieu de 30%. Sur 50 000€ de plus-value, c'est 6 400€ économisés." },
      { type: 'keypoints', title: "Les chiffres essentiels", items: ["Plafond versements : 150 000€", "Fiscalité après 5 ans : 17,2% (vs 30% ailleurs)", "Compteur démarre à l'ouverture, pas au premier versement", "Disponible chez Boursorama, Trade Republic, Fortuneo"] },
      { type: 'tip', text: "Ouvre un PEA aujourd'hui avec 10€. Le compteur des 5 ans démarre dès l'ouverture du compte — pas à partir de ton premier vrai investissement." },
      { type: 'warning', text: "Ne retire rien avant 5 ans. Tout retrait avant ce délai ferme le PEA et annule les avantages fiscaux. Ce n'est pas de l'argent bloqué : c'est de l'argent stratégiquement positionné." },
      { type: 'action', text: "Ce soir : ouvre un PEA sur Boursorama ou Trade Republic (gratuit, 5 minutes). Mets 10€ pour démarrer le compteur." },
    ],
  },
  {
    id: 'flat-tax', emoji: '🧾',
    category: 'fiscalite', catLabel: 'Fiscalité', catColor: '#B598FF',
    title: "Flat tax 30% : comment ça marche vraiment",
    desc: "La fiscalité des investissements en France décryptée. Quand tu paies 30%, quand tu paies moins.",
    time: 3, level: 'Débutant', featured: false, premium: false,
    sections: [
      { type: 'intro', text: "Depuis 2018, la France applique un taux unique de 30% sur la plupart des revenus du capital. On l'appelle la flat tax ou PFU (Prélèvement Forfaitaire Unique)." },
      { type: 'heading', text: "Ce que couvre la flat tax" },
      { type: 'para', text: "La flat tax s'applique sur les dividendes, les intérêts (obligations, livrets > plafond), et les plus-values de cession d'actions, crypto, ETF. Ces 30% se décomposent en 12,8% d'impôt sur le revenu + 17,2% de prélèvements sociaux." },
      { type: 'heading', text: "Les exceptions importantes" },
      { type: 'para', text: "Le Livret A et le LDDS sont totalement exonérés. Le PEA après 5 ans ne paie que 17,2%. L'assurance-vie après 8 ans bénéficie d'un abattement de 4 600€/an (9 200€ pour un couple). Si ton taux marginal d'imposition est inférieur à 12,8%, tu peux opter pour le barème progressif." },
      { type: 'keypoints', title: "Résumé par enveloppe", items: ["Livret A / LDDS : 0%", "PEA après 5 ans : 17,2%", "Assurance-vie après 8 ans : 17,2% + abattement", "CTO / Crypto / PEA avant 5 ans : 30%"] },
      { type: 'action', text: "Vérifie l'ancienneté de ton PEA dans Magot — chaque année passée sous les 5 ans compte double niveau fiscal." },
    ],
  },
  {
    id: 'etf-basics', emoji: '🌍',
    category: 'investir', catLabel: 'Investir', catColor: '#7BB3FF',
    title: "ETF : investir dans 500 entreprises en 1 clic",
    desc: "Qu'est-ce qu'un ETF, pourquoi la plupart des experts conseillent d'en acheter plutôt que des actions en direct.",
    time: 5, level: 'Débutant', featured: false, premium: false,
    sections: [
      { type: 'intro', text: "Un ETF (Exchange-Traded Fund) est un panier d'actions que tu achètes en une seule transaction. Le CW8 sur PEA te donne accès à 1 500 entreprises du monde entier." },
      { type: 'heading', text: "Pourquoi les ETF battent la plupart des gérants" },
      { type: 'para', text: "Statistiquement, plus de 90% des fonds gérés activement sous-performent leur indice de référence sur 10 ans. En achetant un ETF qui réplique le MSCI World, tu bats la grande majorité des professionnels — avec des frais 10x moins élevés (0,12%/an vs 1,5-2%/an pour un fonds actif)." },
      { type: 'heading', text: "Les ETF essentiels pour débuter" },
      { type: 'keypoints', title: "Top ETF pour PEA", items: ["CW8 (Amundi MSCI World) : 1 500 entreprises mondiales, 0,38%/an", "WPEA (Invesco MSCI World) : similaire, 0,19%/an", "PANX (Amundi Nasdaq 100) : 100 plus grandes tech US", "PAEEM : marchés émergents"] },
      { type: 'tip', text: "Pour commencer : 80% CW8 ou WPEA + 20% PAEEM. Révise uniquement une fois par an. Ne regarde pas ton portefeuille tous les jours — c'est le chemin le plus sûr vers de mauvaises décisions." },
      { type: 'warning', text: "Ne cherche pas le 'meilleur' ETF du moment. La régularité et la durée comptent bien plus que la sélection parfaite." },
      { type: 'action', text: "Calcule dans le simulateur Magot ce que donnerait 200€/mois dans un ETF MSCI World à 7%/an pendant 20 ans." },
    ],
  },
  {
    id: 'dca-strategy', emoji: '📅',
    category: 'strategie', catLabel: 'Stratégie', catColor: '#E8C547',
    title: "DCA : la stratégie qui bat les market timers",
    desc: "Investir régulièrement une somme fixe, peu importe le marché. Simple, prouvé, efficace.",
    time: 3, level: 'Débutant', featured: false, premium: false,
    sections: [
      { type: 'intro', text: "Le Dollar Cost Averaging (investissement progressif régulier) est la stratégie recommandée par Warren Buffett pour 99% des investisseurs. Et pourtant, très peu s'y tiennent." },
      { type: 'heading', text: "Le principe" },
      { type: 'para', text: "Au lieu d'essayer de 'timer' le marché (acheter au plus bas), tu investis une somme fixe chaque mois — 100€, 200€, 500€ — quoi qu'il arrive. Quand le marché baisse, tu achètes plus de parts pour le même prix. Quand il monte, tes parts valent plus. Sur le long terme, ton prix de revient moyen est optimisé." },
      { type: 'heading', text: "Pourquoi c'est si difficile en pratique" },
      { type: 'para', text: "Le problème n'est pas intellectuel. Tout le monde comprend le DCA. Le problème est émotionnel : investir 300€ quand les marchés ont baissé de 20% est psychologiquement difficile. C'est exactement là que se gagnent ou se perdent les rendements à long terme." },
      { type: 'keypoints', title: "DCA en pratique", items: ["Fixe un montant mensuel que tu ne remarques pas", "Programme un virement automatique le jour de paie", "Ne regarde pas le cours le jour de l'achat", "Réévalue le montant une fois par an seulement"] },
      { type: 'tip', text: "La feature 'Suivi des apports' de Magot est faite pour le DCA : log ton virement chaque mois et vois la différence entre ce que les marchés t'ont donné et ce que ta discipline a construit." },
      { type: 'action', text: "Programme un virement automatique de X€ vers ton PEA le jour de ta paie. Oublie-le pendant 1 an." },
    ],
  },
  {
    id: 'scpi-basics', emoji: '🏢',
    category: 'investir', catLabel: 'Investir', catColor: '#7BB3FF',
    title: "SCPI : toucher des loyers sans gérer un bien",
    desc: "La pierre-papier : comment investir dans l'immobilier sans crédit, sans travaux, sans locataires.",
    time: 5, level: 'Intermédiaire', featured: false, premium: false,
    sections: [
      { type: 'intro', text: "Une SCPI (Société Civile de Placement Immobilier) te permet d'investir dans de l'immobilier professionnel (bureaux, commerces, logistique) à partir de quelques centaines d'euros — et de toucher des loyers tous les trimestres." },
      { type: 'heading', text: "Comment ça fonctionne" },
      { type: 'para', text: "Tu achètes des parts d'une société qui possède un parc immobilier. Cette société encaisse les loyers et te reverse ta quote-part, généralement tous les trimestres. Le rendement moyen en 2024 était de 4,5 à 5,5% par an — bien au-dessus du Livret A." },
      { type: 'heading', text: "Les avantages vs l'immobilier direct" },
      { type: 'keypoints', title: "SCPI vs Immo direct", items: ["Pas de crédit nécessaire (à partir de 1 000€)", "Zéro gestion locative", "Parc diversifié (souvent 50+ immeubles)", "Liquidité : revente possible (délai variable)", "Risque de vacance dilué sur des centaines de biens"] },
      { type: 'warning', text: "Les SCPI ne sont pas liquides comme une action. Compte sur 1 à 3 mois pour revendre tes parts. C'est un investissement de long terme (horizon minimum 8-10 ans)." },
      { type: 'tip', text: "Wemo ONE (présente dans les données démo de Magot) affiche un rendement de 5%/an. Regarde la carte 'Revenus passifs' sur ton dashboard pour voir ce que ça génère concrètement." },
      { type: 'action', text: "Compare dans le simulateur Magot : 6 000€ en SCPI à 5%/an vs 6 000€ en ETF à 7%/an sur 15 ans. Laquelle diversifie mieux ton patrimoine ?" },
    ],
  },
  {
    id: 'compound-interest', emoji: '⏳',
    category: 'strategie', catLabel: 'Stratégie', catColor: '#E8C547',
    title: "Les intérêts composés : l'arme secrète du temps",
    desc: "Pourquoi commencer à 22 ans vaut infiniment mieux que commencer à 30 ans avec plus d'argent.",
    time: 3, level: 'Débutant', featured: false, premium: false,
    sections: [
      { type: 'intro', text: "Einstein aurait dit que les intérêts composés sont la huitième merveille du monde. Voici pourquoi c'est la vérité la plus importante en finance personnelle." },
      { type: 'heading', text: "Le principe" },
      { type: 'para', text: "Les intérêts composés, c'est quand tes gains génèrent eux-mêmes des gains. 1 000€ à 7%/an donnent 70€ la première année. La deuxième, tu gagnes 7% sur 1 070€, soit 74,90€. En 30 ans, ce même 1 000€ devient 7 612€ — sans jamais rien ajouter." },
      { type: 'heading', text: "L'avantage du jeune investisseur" },
      { type: 'para', text: "200€/mois de 22 à 62 ans à 7%/an → 525 000€. Même chose de 32 à 62 ans → 243 000€. 10 ans de moins, moitié moins de capital final — alors que les versements totaux sont seulement 24 000€ de moins. Les 10 premières années font plus que les 20 suivantes." },
      { type: 'keypoints', title: "La règle des 72", items: ["Pour trouver le temps de doublement : 72 ÷ taux annuel", "À 6%/an : ton capital double en 12 ans", "À 8%/an : ton capital double en 9 ans", "À 3%/an (Livret A) : ton capital double en 24 ans"] },
      { type: 'tip', text: "Utilise le simulateur Magot pour visualiser tes propres chiffres. Change juste le curseur de durée et observe comment les 5 dernières années rajoutent autant que les 15 premières." },
      { type: 'action', text: "Calcule la différence dans le simulateur entre commencer maintenant et commencer dans 3 ans avec le même montant mensuel." },
    ],
  },
  {
    id: 'crypto-tax', emoji: '₿',
    category: 'fiscalite', catLabel: 'Fiscalité', catColor: '#B598FF',
    title: "Crypto et fiscalité FR : les règles du jeu",
    desc: "Comment sont imposées tes cryptos en France. Ce qui est taxé, ce qui ne l'est pas, et comment déclarer.",
    time: 4, level: 'Intermédiaire', featured: false, premium: false,
    sections: [
      { type: 'intro', text: "La France a l'une des fiscalités crypto les plus claires d'Europe. Bonne nouvelle : tu ne paies rien tant que tu ne vends pas contre des euros." },
      { type: 'heading', text: "Le principe fondamental" },
      { type: 'para', text: "En France, l'impôt sur les crypto ne s'applique qu'à la cession — c'est-à-dire quand tu convertis en euros (ou en bien). Échanger du BTC contre de l'ETH n'est pas taxable. Vendre du BTC contre des euros : taxable. Payer un café en BTC : taxable." },
      { type: 'keypoints', title: "Ce qui est taxable / pas taxable", items: ["✅ Crypto → Euro : TAXABLE (flat tax 30%)", "✅ Crypto → Achat de bien/service : TAXABLE", "❌ Crypto → Crypto : NON TAXABLE depuis 2023", "❌ Simple hausse de valeur sans vente : NON TAXABLE", "❌ Staking / mining sous certaines conditions : régime BNC"] },
      { type: 'heading', text: "Le calcul de la plus-value" },
      { type: 'para', text: "La plus-value = Prix de vente - (Valeur globale du portefeuille × fraction vendue / valeur totale). Le calcul utilise le prix moyen pondéré de toutes tes acquisitions. En pratique, utilise Koinly ou Waltio — ils calculent tout automatiquement." },
      { type: 'warning', text: "Tu dois déclarer chaque année ton portefeuille si sa valeur dépasse 0€ (case 3AN/3BN du formulaire 2086). Les exchanges FR envoient les données à l'administration fiscale automatiquement." },
      { type: 'action', text: "Mets à jour le rendement de ton actif crypto dans Magot pour voir l'impact fiscal estimé dans ton analyse IA." },
    ],
  },
  {
    id: 'diversification', emoji: '🧩',
    category: 'strategie', catLabel: 'Stratégie', catColor: '#E8C547',
    title: "Diversification : pourquoi et comment vraiment le faire",
    desc: "Pas mettre tous ses oeufs dans le même panier — mais encore faut-il savoir combien de paniers il faut.",
    time: 5, level: 'Intermédiaire', featured: false, premium: true,
    sections: [
      { type: 'intro', text: "La diversification est la seule chose gratuite en finance. Elle réduit le risque sans réduire le rendement attendu. Encore faut-il la faire correctement." },
      { type: 'heading', text: "La diversification par classe d'actifs" },
      { type: 'para', text: "Actions, obligations, immobilier, crypto — ces actifs ne se comportent pas de la même façon face aux mêmes événements. En 2022, les actions et obligations ont chuté ensemble (rare), mais l'immobilier a tenu. En 2020, les actions ont chuté 35% puis récupéré en 6 mois — mais quelqu'un qui avait besoin d'argent en mai 2020 a peut-être vendu au pire moment." },
      { type: 'heading', text: "La diversification géographique" },
      { type: 'para', text: "Un ETF MSCI World te donne accès à 65% USA, 6% Japon, 4% UK, 3% France... Si tu n'as que du CAC 40 ou du SBF 120, tu es exposé à un seul pays. Ajouter des marchés émergents (PAEEM) ou des small caps diversifie davantage." },
      { type: 'keypoints', title: "Allocation type 22-30 ans", items: ["60-70% ETF actions mondiales (MSCI World)", "10-15% Marchés émergents", "10% SCPI ou immo indirect", "5-10% Crypto (max)", "5% Livret A (réserve d'urgence)"] },
      { type: 'tip', text: "Regarde ton widget 'Alertes' dans Magot — si une alerte de déséquilibre apparaît, c'est que ta diversification mérite d'être revue." },
      { type: 'action', text: "Vérifie la répartition de ton portefeuille dans l'onglet Actifs. Est-ce que chaque classe représente ce que tu veux ?" },
    ],
  },
  {
    id: 'fire-movement', emoji: '🔥',
    category: 'strategie', catLabel: 'Stratégie', catColor: '#E8C547',
    title: "FIRE : prendre sa retraite à 40 ans, c'est possible",
    desc: "Le mouvement Financial Independence Retire Early, la règle des 4%, et comment calculer ton propre chiffre.",
    time: 6, level: 'Avancé', featured: false, premium: true,
    sections: [
      { type: 'intro', text: "FIRE : Financial Independence, Retire Early. Ne plus avoir besoin de travailler avant l'âge légal de la retraite. Des milliers de personnes l'ont fait — voici comment." },
      { type: 'heading', text: "La règle des 4% : le cœur du FIRE" },
      { type: 'para', text: "Une étude de Trinity University (1998, mise à jour 2023) a montré que retirer 4% de ton capital chaque année a une probabilité de 95% de ne jamais épuiser ton portefeuille sur 30 ans. C'est la base du calcul FIRE. Si tu dépenses 2 000€/mois (24 000€/an), il te faut 24 000 / 0,04 = 600 000€ de patrimoine investi." },
      { type: 'heading', text: "Les types de FIRE" },
      { type: 'keypoints', title: "Lean vs Fat FIRE", items: ["Lean FIRE : style de vie minimaliste, 500-800k€", "Regular FIRE : confort standard, 800k-1,5M€", "Fat FIRE : style de vie premium, 1,5M€+", "Coast FIRE : arrêter d'investir, laisser croître jusqu'à 65 ans"] },
      { type: 'heading', text: "Les leviers" },
      { type: 'para', text: "Ton taux d'épargne est le facteur numéro un. À 50% d'épargne (tu économises la moitié de ce que tu gagnes), tu atteins l'indépendance financière en 17 ans, peu importe ton salaire. À 70% : 8,5 ans. Le simulateur FIRE de Magot calcule ta date exacte." },
      { type: 'warning', text: "La règle des 4% est validée sur les marchés US. Elle reste indicative. Une approche plus sécurisée : 3,5% en France, compte tenu de la fiscalité différente. Prévois aussi une activité légère après le FIRE pour réduire le risque de séquence." },
      { type: 'action', text: "Dans le calculateur FIRE de Magot, entre tes dépenses mensuelles actuelles et vois à quelle date tu pourrais arrêter de travailler si tu maintiens tes apports." },
    ],
  },
];


const DEMO_USER = { name: 'Démo', email: 'demo@magot.fr', age: 22, plan: 'premium', onboarded: true, demo: true };

const generateAssetHistory = (currentValue, days = 60, volatility = 0.03) => {
  const history = [];
  const start = currentValue * 0.82;
  for (let i = days; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    const progress = (days - i) / days;
    const noise = (Math.random() - 0.5) * volatility;
    const value = Math.round(start + (currentValue - start) * progress + currentValue * noise);
    history.push({ date: d.toISOString().slice(0, 10), value });
  }
  return history;
};

const peaOpenDate = (() => { const d = new Date(); d.setFullYear(d.getFullYear() - 2); d.setMonth(d.getMonth() - 3); return d.toISOString().slice(0,10); })();

const DEMO_ASSETS = [
  { id: 'd1', type: 'pea',    name: 'PEA Bourso · CW8',      value: 12400, invested: 10500, yield: 7,   openedAt: peaOpenDate, history: generateAssetHistory(12400, 60, 0.04), createdAt: Date.now() },
  { id: 'd2', type: 'crypto', name: 'BTC Ledger',            value: 4800,  invested: 3200,  yield: 0,   history: generateAssetHistory(4800, 60, 0.08), createdAt: Date.now() },
  { id: 'd3', type: 'scpi',   name: 'Wemo ONE',              value: 6000,  invested: 6000,  yield: 5,   history: generateAssetHistory(6000, 60, 0.005), createdAt: Date.now() },
  { id: 'd4', type: 'livret', name: 'Livret A',              value: 2100,  invested: 2000,  yield: 3,   history: generateAssetHistory(2100, 60, 0.002), createdAt: Date.now() },
  { id: 'd5', type: 'av',     name: 'AV Linxea Spirit',      value: 3600,  invested: 3400,  yield: 3,   history: generateAssetHistory(3600, 60, 0.015), createdAt: Date.now() },
  { id: 'd6', type: 'cash',   name: 'Compte courant',        value: 1400,  invested: 1400,  yield: 0,   history: generateAssetHistory(1400, 60, 0.01), createdAt: Date.now() },
];

const DEMO_HISTORY = (() => {
  const arr = [];
  const total = DEMO_ASSETS.reduce((s, a) => s + a.value, 0);
  for (let i = 89; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    const progress = (90 - i) / 90;
    const noise = (Math.random() - 0.5) * 0.03;
    arr.push({ date: d.toISOString().slice(0, 10), value: Math.round(total * (0.75 + progress * 0.25 + noise)) });
  }
  return arr;
})();

const DEMO_GOALS = [
  { id: 'g1', label: 'Premier 50k€',     target: 50000,  deadline: '2027-12-31', createdAt: Date.now() },
  { id: 'g2', label: 'Apport immo 30k€', target: 30000,  deadline: '2026-12-31', createdAt: Date.now() },
  { id: 'g3', label: 'Liberté 500k€',    target: 500000, deadline: '2035-12-31', createdAt: Date.now() },
];

// Générer des apports démo sur 6 mois
const DEMO_CONTRIBUTIONS = (() => {
  const months = ['2025-11', '2025-12', '2026-01', '2026-02', '2026-03', '2026-04'];
  const amounts = [350, 420, 300, 500, 380, 450];
  return months.map((m, i) => ({
    id: `c${i+1}`,
    date: `${m}-01`,
    amount: amounts[i],
    note: i % 2 === 0 ? 'Virement mensuel PEA' : 'Apport crypto + PEA',
    createdAt: new Date(`${m}-01`).getTime(),
  }));
})();

/* ========== HELPERS ========== */

const fmt = (n) => {
  if (n == null || isNaN(n)) return '0 €';
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);
};
const fmtPct = (n) => `${n >= 0 ? '+' : ''}${n.toFixed(2)}%`;
const uuid = () => Math.random().toString(36).slice(2) + Date.now().toString(36);
const shortId = () => Math.random().toString(36).slice(2, 8);
const today = () => new Date().toISOString().slice(0, 10);

const getBenchmark = (age) => {
  const ages = Object.keys(BENCHMARKS).map(Number).sort((a,b) => a-b);
  let closest = ages[0];
  for (const a of ages) { if (Math.abs(a - age) < Math.abs(closest - age)) closest = a; }
  return BENCHMARKS[closest];
};

const getPercentile = (value, bench) => {
  const { p10, p25, median, p75, p90, p99 } = bench;
  if (value < p10) return Math.round((value / p10) * 10);
  if (value < p25) return 10 + Math.round(((value - p10) / (p25 - p10)) * 15);
  if (value < median) return 25 + Math.round(((value - p25) / (median - p25)) * 25);
  if (value < p75) return 50 + Math.round(((value - median) / (p75 - median)) * 25);
  if (value < p90) return 75 + Math.round(((value - p75) / (p90 - p75)) * 15);
  if (value < p99) return 90 + Math.round(((value - p90) / (p99 - p90)) * 9);
  return 99;
};

const getUnlockedAchievements = (assets, total, user) => {
  const unlocked = new Set();
  ACHIEVEMENTS.forEach(a => {
    if (typeof a.threshold === 'number' && total >= a.threshold) unlocked.add(a.id);
    if (a.threshold === 'divers4' && new Set(assets.map(x => x.type)).size >= 4) unlocked.add(a.id);
    if (a.threshold === 'passive' && assets.some(x => (x.yield || 0) > 0 && x.value > 0)) unlocked.add(a.id);
    if (user && total > 0) {
      const bench = getBenchmark(user.age);
      const pct = getPercentile(total, bench);
      if (a.threshold === 'top25' && pct >= 75) unlocked.add(a.id);
      if (a.threshold === 'top10' && pct >= 90) unlocked.add(a.id);
      if (a.threshold === 'top1' && pct >= 99) unlocked.add(a.id);
    }
  });
  return unlocked;
};

// PEA: avant 5 ans = flat tax 30% (PS 17.2% + IR 12.8%), après 5 ans = PS 17.2% uniquement
const getPeaInfo = (pea) => {
  if (!pea.openedAt) return null;
  const open = new Date(pea.openedAt);
  const fiveYears = new Date(open); fiveYears.setFullYear(fiveYears.getFullYear() + 5);
  const now = new Date();
  const elapsed = (now - open) / (1000 * 60 * 60 * 24);
  const remaining = Math.max(0, (fiveYears - now) / (1000 * 60 * 60 * 24));
  const totalDays = 5 * 365.25;
  const progress = Math.min(100, (elapsed / totalDays) * 100);
  const gain = (pea.value || 0) - (pea.invested || pea.value || 0);
  const taxBefore5 = Math.max(0, gain * 0.30);
  const taxAfter5  = Math.max(0, gain * 0.172);
  const savings    = Math.max(0, gain * 0.128);
  const years  = Math.floor(remaining / 365.25);
  const months = Math.floor((remaining - years * 365.25) / 30.44);
  return {
    exempt: remaining === 0,
    progress, years, months,
    taxBefore5, taxAfter5, savings, gain,
    openedAt: pea.openedAt,
    fiveYearsDate: fiveYears.toISOString().slice(0, 10),
  };
};

const exportAssetsCSV = (assets) => {
  const header = ['Type', 'Nom', 'Valeur', 'Investi', 'PlusValue', 'Perf%', 'Rendement%', 'RevenuAnnuel'];
  const rows = assets.map(a => {
    const gain = (a.value || 0) - (a.invested || a.value || 0);
    const gainPct = a.invested > 0 ? (gain / a.invested) * 100 : 0;
    const income = (a.value * (a.yield || 0)) / 100;
    return [
      ASSET_TYPES[a.type].label,
      `"${a.name.replace(/"/g, '""')}"`,
      (a.value || 0).toFixed(2),
      (a.invested || a.value || 0).toFixed(2),
      gain.toFixed(2),
      gainPct.toFixed(2),
      (a.yield || 0).toFixed(2),
      income.toFixed(2),
    ];
  });
  const csv = [header, ...rows].map(r => r.join(';')).join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `magot-export-${today()}.csv`;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(url);
};


/* ========== ALERTS ENGINE (feature 5) ========== */

const getAlerts = (assets, total) => {
  if (!assets.length || total === 0) return [];
  const alerts = [];
  const byType = {};
  assets.forEach(a => { byType[a.type] = (byType[a.type] || 0) + a.value; });

  const cryptoPct = total > 0 ? ((byType['crypto'] || 0) / total) * 100 : 0;
  const cashPct   = total > 0 ? ((byType['cash']   || 0) / total) * 100 : 0;
  const types = new Set(assets.map(a => a.type)).size;
  const hasPea = !!byType['pea'];
  const hasLivret = !!(byType['livret'] || byType['cash']);
  const passive = assets.reduce((s, a) => s + ((a.value || 0) * (a.yield || 0)) / 100, 0);
  const passivePct = total > 0 ? (passive / total) * 100 : 0;

  // Concentration crypto
  if (cryptoPct > 40) {
    alerts.push({ id: 'crypto_high', level: 'danger', emoji: '⚠️',
      title: `Crypto surchargée : ${cryptoPct.toFixed(0)}% du portefeuille`,
      desc: `Si le marché crypto chute de 70% (ça arrive), tu perds ${new Intl.NumberFormat('fr-FR',{style:'currency',currency:'EUR',maximumFractionDigits:0}).format((byType['crypto']||0)*0.7)}. Vise max 20-25%.`,
      action: "Rééquilibre" });
  } else if (cryptoPct > 25) {
    alerts.push({ id: 'crypto_med', level: 'warning', emoji: '🔶',
      title: `Crypto à ${cryptoPct.toFixed(0)}% — légèrement au-dessus du recommandé`,
      desc: "C'est encore gérable, mais surveille. Au-delà de 30% le risque devient significatif.",
      action: "À surveiller" });
  }

  // Cash dormant
  if (cashPct > 20) {
    alerts.push({ id: 'cash_high', level: 'warning', emoji: '💤',
      title: `${cashPct.toFixed(0)}% de cash qui dort`,
      desc: `Avec l'inflation à ~3-4%/an, cet argent perd de la valeur. Transfère l'excédent sur un Livret A ou ton PEA.`,
      action: "Investir l'excédent" });
  }

  // Pas de PEA
  if (!hasPea) {
    alerts.push({ id: 'no_pea', level: 'info', emoji: '📋',
      title: "Tu n'as pas de PEA",
      desc: `Chaque mois sans PEA = un mois de compteur fiscal perdu. Ouvre-en un maintenant même avec 10€ — c'est gratuit sur Boursorama ou Trade Republic.`,
      action: "Ouvrir un PEA" });
  }

  // Pas de réserve d'urgence
  if (!hasLivret && total > 5000) {
    alerts.push({ id: 'no_emergency', level: 'warning', emoji: '🆘',
      title: "Pas de réserve d'urgence visible",
      desc: `Garde toujours 3 à 6 mois de dépenses sur un Livret A avant d'investir davantage. Sans ça, le moindre imprévu te force à vendre tes actifs au mauvais moment.`,
      action: "Ajouter un livret" });
  }

  // Pas diversifié
  if (types <= 2) {
    alerts.push({ id: 'low_divers', level: 'warning', emoji: '🧩',
      title: `Seulement ${types} type${types > 1 ? 's' : ''} de placements`,
      desc: `Si ce secteur chute, tout ton patrimoine chute avec. Vise au moins 4 classes d'actifs différentes pour répartir le risque.`,
      action: 'Diversifier' });
  }

  // Un actif trop concentré
  const maxAsset = assets.reduce((max, a) => a.value > (max?.value || 0) ? a : max, null);
  if (maxAsset && total > 0 && (maxAsset.value / total) > 0.6 && assets.length > 1) {
    const pct = ((maxAsset.value / total) * 100).toFixed(0);
    alerts.push({ id: 'concentration', level: 'warning', emoji: '🎯',
      title: `"${maxAsset.name}" représente ${pct}% du total`,
      desc: `Une concentration aussi forte sur un seul actif augmente le risque. Si cet actif perd 30%, tout ton patrimoine en souffre.`,
      action: "Rééquilibrer" });
  }

  // Peu de revenus passifs
  if (passivePct < 1 && total > 8000) {
    alerts.push({ id: 'low_passive', level: 'info', emoji: '💡',
      title: 'Tes placements génèrent peu de revenus passifs',
      desc: `Avec ${new Intl.NumberFormat('fr-FR',{style:'currency',currency:'EUR',maximumFractionDigits:0}).format(total)} de patrimoine, tu pourrais générer ${new Intl.NumberFormat('fr-FR',{style:'currency',currency:'EUR',maximumFractionDigits:0}).format(total*0.04)}/an (4%) en ajoutant des SCPI ou ETF à dividendes.`,
      action: "Explorer les SCPI" });
  }

  return alerts;
};

/* ========== STORAGE ========== */

const storage = {
  get: async (key, fallback = null, shared = false) => {
    try {
      const r = await window.storage.get(key, shared);
      return r ? JSON.parse(r.value) : fallback;
    } catch { return fallback; }
  },
  set: async (key, value, shared = false) => {
    try { await window.storage.set(key, JSON.stringify(value), shared); return true; }
    catch { return false; }
  },
  del: async (key, shared = false) => {
    try { await window.storage.delete(key, shared); return true; } catch { return false; }
  }
};

/* ========== ICONS ========== */

const Icon = ({ name, size = 16, className = '' }) => {
  const paths = {
    home: 'M3 9.5L12 3l9 6.5V21a1 1 0 01-1 1h-5v-7h-6v7H4a1 1 0 01-1-1V9.5z',
    wallet: 'M3 7h18v13a1 1 0 01-1 1H4a1 1 0 01-1-1V7zm0 0V5a1 1 0 011-1h14M16 13h2',
    target: 'M12 2a10 10 0 100 20 10 10 0 000-20zm0 4a6 6 0 100 12 6 6 0 000-12zm0 4a2 2 0 100 4 2 2 0 000-4z',
    calc: 'M4 2h16a2 2 0 012 2v16a2 2 0 01-2 2H4a2 2 0 01-2-2V4a2 2 0 012-2zm2 4v4h12V6H6zm0 7h2v2H6v-2zm4 0h2v2h-2v-2zm4 0h4v7h-4v-7zm-8 4h2v2H6v-2zm4 0h2v2h-2v-2z',
    users: 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2m16-11a4 4 0 11-8 0 4 4 0 018 0zm4 11v-2a4 4 0 00-3-3.87m-4-12a4 4 0 010 7.75',
    spark: 'M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83',
    settings: 'M12 15a3 3 0 100-6 3 3 0 000 6z M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z',
    plus: 'M12 5v14m-7-7h14',
    arrow: 'M5 12h14m-7-7l7 7-7 7',
    check: 'M20 6L9 17l-5-5',
    x: 'M18 6L6 18M6 6l12 12',
    trash: 'M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14z',
    edit: 'M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7m-1.5-9.5a2.121 2.121 0 013 3L12 16l-4 1 1-4 9.5-9.5z',
    logout: 'M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9',
    crown: 'M2 20h20M4 20V9l4 4 4-6 4 6 4-4v11',
    zap: 'M13 2L3 14h9l-1 8 10-12h-9l1-8z',
    trophy: 'M8 21h8m-4-4v4M7 4h10v4a5 5 0 01-10 0V4zM7 4H3v2a3 3 0 003 3M17 4h4v2a3 3 0 01-3 3',
    eye: 'M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z M12 15a3 3 0 100-6 3 3 0 000 6z',
    eyeoff: 'M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24 M1 1l22 22',
    download: 'M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3',
    play: 'M5 3l14 9-14 9V3z',
    chevron: 'M6 9l6 6 6-6',
    book: 'M4 19.5A2.5 2.5 0 016.5 17H20M4 19.5A2.5 2.5 0 014 17V5a2 2 0 012-2h14a2 2 0 012 2v12M4 19.5V21',
    trends: 'M22 12h-4l-3 9L9 3l-3 9H2',
    flame: 'M12 2c0 0-5 5-5 10a5 5 0 0010 0c0-5-5-10-5-10zm0 13a2 2 0 110-4 2 2 0 010 4z',
    link: 'M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71',
    share: 'M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13',
    copy: 'M8 4v12a2 2 0 002 2h8a2 2 0 002-2V7.242a2 2 0 00-.602-1.43L16.083 2.57A2 2 0 0014.685 2H10a2 2 0 00-2 2z M16 18v2a2 2 0 01-2 2H6a2 2 0 01-2-2V9a2 2 0 012-2h2',
    menu: 'M3 6h18M3 12h18M3 18h18',
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"
      className={className}>
      <path d={paths[name]} />
    </svg>
  );
};

/* ========== LOGO ========== */

const Logo = ({ size = 'base' }) => {
  const sizes = { sm: 'text-xl', base: 'text-2xl', lg: 'text-4xl', xl: 'text-6xl' };
  return (
    <span className={`font-serif ${sizes[size]} tracking-tight`}>
      <span className="italic">M</span>agot<span className="text-[#B8FF5A]">.</span>
    </span>
  );
};

/* ========== APP ========== */

export default function App() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [view, setView] = useState('landing');
  const [appView, setAppView] = useState('dashboard');
  const [pageKey, setPageKey] = useState(0);
  const [tourStep, setTourStep] = useState(-1); // -1 = pas de tour
  const [assets, setAssets] = useState([]);
  const [history, setHistory] = useState([]);
  const [goals, setGoals] = useState([]);
  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState(null);
  const [demoMode, setDemoMode] = useState(false);
  const [contributions, setContributions] = useState([]);
  const [dismissedAlerts, setDismissedAlerts] = useState([]);
  const [readArticles, setReadArticles] = useState([]);
  const [milestoneCard, setMilestoneCard] = useState(null);
  const [theme, setTheme] = useState('dark');
  const [weeklyInsight, setWeeklyInsight] = useState(null);
  const [insightLoading, setInsightLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const u = await storage.get('magot:user');
      const a = await storage.get('magot:assets', []);
      const h = await storage.get('magot:history', []);
      const g = await storage.get('magot:goals', []);
      const c = await storage.get('magot:contributions', []);
      const ra = await storage.get('magot:readArticles', []);
      const savedTheme = await storage.get('magot:theme', 'dark');
      const savedInsight = await storage.get('magot:weeklyInsight', null);
      if (u) { setUser(u); setView('app'); }
      setAssets(a); setHistory(h); setGoals(g); setContributions(c); setReadArticles(ra);
      setTheme(savedTheme);
      applyTheme(savedTheme);
      if (savedInsight) setWeeklyInsight(savedInsight);
      setLoading(false);
    })();
  }, []);

  const applyTheme = (t) => {
    let el = document.getElementById('magot-theme-override');
    if (!el) {
      el = document.createElement('style');
      el.id = 'magot-theme-override';
      document.head.appendChild(el);
    }
    if (t === 'light') {
      el.textContent = `
        body { background: #F0F2F5 !important; }
        #magot-root { --header-bg: rgba(240,242,245,0.92); }
        #magot-root { color: #111827 !important; background: #F0F2F5 !important; }
        /* Force ALL text to inherit from root in light mode, EXCEPT accent colors */
        #magot-root span:not([class*="text-[#B8FF5A]"]):not([class*="text-[#E8C547]"]):not([class*="text-[#FF6B6B]"]):not([class*="text-[#7BB3FF]"]):not([class*="text-[#B598FF]"]):not([class*="shimmer"]),
        #magot-root p,
        #magot-root li,
        #magot-root h1, #magot-root h2, #magot-root h3, #magot-root h4 {
          color: inherit !important;
        }
        /* Secondary and tertiary text - slightly muted */
        #magot-root .text-secondary { color: #4B5563 !important; }
        /* Cards */
        #magot-root .card { background: #FFFFFF !important; border-color: #DDE1E7 !important; }
        #magot-root .card:hover { border-color: #B0B7C3 !important; }
        /* Dark cards keep white text */
        #magot-root .dark-card { background: #1E2126 !important; color: #F5F5F0 !important; }
        #magot-root .dark-card * { color: #F5F5F0 !important; }
        #magot-root .dark-card .text-muted { color: #A0A3A8 !important; }
        /* Inputs */
        #magot-root .input { background: #F5F6F8 !important; border-color: #DDE1E7 !important; color: #111827 !important; }
        #magot-root .input::placeholder { color: #9CA3AF !important; }
        /* Buttons */
        #magot-root .btn-ghost { color: #374151 !important; border-color: #DDE1E7 !important; }
        #magot-root .btn-ghost:hover { background: #EAECF0 !important; }
        /* Nav */
        #magot-root .nav-link { color: #6B7280 !important; }
        #magot-root .nav-link:hover { color: #111827 !important; }
        #magot-root .nav-link.active { color: #16A34A !important; }
        /* Slider */
        #magot-root .slider { background: #DDE1E7 !important; }
        /* Backgrounds */
        #magot-root [style*="background: var(--bg)"],
        #magot-root [style*="background:var(--bg)"] { background: #F0F2F5 !important; }
        #magot-root [style*="background: var(--bg-card)"],
        #magot-root [style*="background:var(--bg-card)"] { background: #FFFFFF !important; }
        #magot-root [style*="background: var(--bg-input)"],
        #magot-root [style*="background:var(--bg-input)"] { background: #F5F6F8 !important; }
        #magot-root [style*="background: var(--bg-subtle)"],
        #magot-root [style*="background:var(--bg-subtle)"] { background: #EAECF0 !important; }
        /* Borders */
        #magot-root [style*="border-color: var(--border)"],
        #magot-root [style*="borderColor: var(--border)"] { border-color: #DDE1E7 !important; }
        /* Accent text keep their colors */
        #magot-root [class*="text-[#B8FF5A]"] { color: #16A34A !important; }
        #magot-root [class*="text-[#E8C547]"] { color: #B45309 !important; }
        #magot-root [class*="text-[#FF6B6B]"] { color: #DC2626 !important; }
        #magot-root [class*="text-[#7BB3FF]"] { color: #2563EB !important; }
        #magot-root [class*="text-[#B598FF]"] { color: #7C3AED !important; }
        /* Aside/sidebar background */
        #magot-root aside { background: #FFFFFF !important; border-color: #DDE1E7 !important; }
        #magot-root header { background: #F0F2F5 !important; border-color: #DDE1E7 !important; }
      `;
    } else {
      el.textContent = '';
    }
    document.documentElement.setAttribute('data-theme', t);
  };

  const toggleTheme = async () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    applyTheme(next);
    await storage.set('magot:theme', next);
  };

  // Weekly auto-insight: génère si >7j depuis le dernier ou s'il n'y en a pas
  const generateWeeklyInsight = async (assetsList, userObj) => {
    if (!assetsList || assetsList.length === 0 || !userObj || userObj.plan === 'free') return;
    const now = Date.now();
    const last = weeklyInsight?.generatedAt || 0;
    if (now - last < 7 * 24 * 60 * 60 * 1000 && weeklyInsight?.analysis) return; // moins d'1 semaine
    setInsightLoading(true);
    try {
      const total = assetsList.reduce((s, a) => s + (a.value || 0), 0);
      const passive = assetsList.reduce((s, a) => s + ((a.value || 0) * (a.yield || 0)) / 100, 0);
      const summary = assetsList.map(a => {
        const income = ((a.value || 0) * (a.yield || 0)) / 100;
        return `${ASSET_TYPES[a.type].label} "${a.name}": ${fmt(a.value)} (investi ${fmt(a.invested || a.value)}, rendement ${a.yield || 0}% = ${fmt(income)}/an)`;
      }).join('\n');
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          messages: [{ role: 'user', content: `Tu es un conseiller patrimonial FR. Analyse BRIÈVEMENT le portefeuille d'un investisseur de ${userObj.age} ans (patrimoine: ${fmt(total)}, revenus passifs: ${fmt(passive)}/an).\n\nPortefeuille:\n${summary}\n\nRends UNIQUEMENT un JSON valide:\n{"score": <0-100>, "forces": ["force1", "force2"], "faiblesses": ["faiblesse1"], "actions": ["action 1", "action 2", "action 3"], "verdict": "phrase courte 1-2 phrases", "semaine": "1 conseil spécifique pour cette semaine"}` }]
        })
      });
      const data = await response.json();
      const text = data.content?.find(b => b.type === 'text')?.text || '';
      const clean = text.replace(/```json|```/g, '').trim();
      const analysis = JSON.parse(clean);
      const insight = { analysis, generatedAt: now };
      setWeeklyInsight(insight);
      await storage.set('magot:weeklyInsight', insight);
    } catch (e) {
      console.error('Weekly insight error:', e);
    }
    setInsightLoading(false);
  };

  // Trigger auto-insight quand l'app charge + user premium
  useEffect(() => {
    if (user && user.plan !== 'free' && assets.length > 0 && !demoMode) {
      generateWeeklyInsight(assets, user);
    }
  }, [user, assets.length]);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    if (demoMode || !user || assets.length === 0) return;
    const total = assets.reduce((s, a) => s + (a.value || 0), 0);
    const t = today();
    const newHistory = [...history.filter(h => h.date !== t), { date: t, value: total }];
    if (JSON.stringify(newHistory) !== JSON.stringify(history)) {
      setHistory(newHistory);
      storage.set('magot:history', newHistory);
    }
  }, [assets, user, demoMode]);

  const prevUnlockedRef = useRef(new Set());
  useEffect(() => {
    if (!user) return;
    const total = assets.reduce((s, a) => s + (a.value || 0), 0);
    const current = getUnlockedAchievements(assets, total, user);
    const newly = [...current].filter(id => !prevUnlockedRef.current.has(id));
    if (prevUnlockedRef.current.size > 0 && newly.length > 0) {
      const achievement = ACHIEVEMENTS.find(a => a.id === newly[0]);
      if (achievement) {
        showToast(`${achievement.emoji} Débloqué : ${achievement.label}`);
        if (achievement.threshold !== 'divers4' && typeof achievement.threshold === 'number') {
          setMilestoneCard({ achievement, total: assets.reduce((s,a) => s+(a.value||0),0), user });
          // Gros confetti lancé depuis MilestoneCard
        } else {
          // Petit confetti pour les trophées diversification etc.
          setTimeout(() => {
            if (!document.getElementById('confetti-style')) {
              const s = document.createElement('style');
              s.id = 'confetti-style';
              s.textContent = '@keyframes confetti-fall{0%{transform:translateY(0) translateX(0) rotate(0deg);opacity:1}80%{opacity:1}100%{transform:translateY(110vh) translateX(var(--drift)) rotate(var(--rotate));opacity:0}}';
              document.head.appendChild(s);
            }
            const c = document.createElement('div');
            c.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:9999;overflow:hidden;';
            document.body.appendChild(c);
            const colors = ['#B8FF5A','#E8C547','#B598FF','#FFFFFF','#7BB3FF'];
            for (let i = 0; i < 70; i++) {
              const p = document.createElement('div');
              const col = colors[Math.floor(Math.random() * colors.length)];
              const sz = Math.random() * 7 + 4;
              p.style.cssText = `position:absolute;left:${Math.random()*100}%;top:-10px;width:${sz}px;height:${sz*0.4}px;background:${col};border-radius:2px;animation:confetti-fall ${Math.random()*1500+1200}ms ${Math.random()*400}ms cubic-bezier(0.25,0.46,0.45,0.94) forwards;--drift:${(Math.random()-0.5)*150}px;--rotate:${Math.random()*600-300}deg;`;
              c.appendChild(p);
            }
            setTimeout(() => c.parentNode && c.parentNode.removeChild(c), 3000);
          }, 100);
        }
      }
    }
    prevUnlockedRef.current = current;
  }, [assets, user]);

  const enterDemo = () => {
    setDemoMode(true);
    setUser(DEMO_USER); setAssets(DEMO_ASSETS); setHistory(DEMO_HISTORY); setGoals(DEMO_GOALS); setContributions(DEMO_CONTRIBUTIONS);
    setView('app');
    showToast('Mode démo activé · données fictives');
  };

  const exitDemo = () => {
    setDemoMode(false);
    setUser(null); setAssets([]); setHistory([]); setGoals([]); setContributions([]);
    setView('landing');
  };

  const handleAuth = async (userData) => {
    const fullUser = { ...userData, plan: 'free', createdAt: Date.now() };
    await storage.set('magot:user', fullUser);
    setUser(fullUser);
    setView(userData.onboarded ? 'app' : 'onboarding');
  };

  const handleOnboardingComplete = async (initialAssets) => {
    const withIds = initialAssets.map(a => ({
      ...a, id: uuid(), createdAt: Date.now(),
      history: [{ date: today(), value: a.value }]
    }));
    setAssets(withIds);
    await storage.set('magot:assets', withIds);
    const updated = { ...user, onboarded: true };
    await storage.set('magot:user', updated);
    setUser(updated);
    setView('app');
    showToast('Ton Magot est prêt 🎉');
  };

  const addAsset = async (asset) => {
    const newAsset = {
      ...asset, id: uuid(), createdAt: Date.now(),
      history: [{ date: today(), value: asset.value }]
    };
    const updated = [...assets, newAsset];
    setAssets(updated);
    if (!demoMode) await storage.set('magot:assets', updated);
    showToast('Actif ajouté');
  };

  const updateAsset = async (id, updates) => {
    const updated = assets.map(a => {
      if (a.id !== id) return a;
      const next = { ...a, ...updates, updatedAt: Date.now() };
      if (updates.value !== undefined && updates.value !== a.value) {
        const t = today();
        const hist = a.history || [{ date: a.createdAt ? new Date(a.createdAt).toISOString().slice(0,10) : t, value: a.value }];
        const filtered = hist.filter(h => h.date !== t);
        next.history = [...filtered, { date: t, value: updates.value }];
      }
      return next;
    });
    setAssets(updated);
    if (!demoMode) await storage.set('magot:assets', updated);
    showToast('Actif mis à jour');
  };

  const deleteAsset = async (id) => {
    const updated = assets.filter(a => a.id !== id);
    setAssets(updated);
    if (!demoMode) await storage.set('magot:assets', updated);
    showToast('Actif supprimé');
    setModal(null);
  };

  const addGoal = async (goal) => {
    const newGoal = { ...goal, id: uuid(), createdAt: Date.now() };
    const updated = [...goals, newGoal];
    setGoals(updated);
    if (!demoMode) await storage.set('magot:goals', updated);
    showToast('Objectif créé');
  };

  const deleteGoal = async (id) => {
    const updated = goals.filter(g => g.id !== id);
    setGoals(updated);
    if (!demoMode) await storage.set('magot:goals', updated);
    showToast('Objectif supprimé');
  };

  const addContribution = async (contrib) => {
    const newC = { ...contrib, id: uuid(), createdAt: Date.now() };
    const updated = [newC, ...contributions];
    setContributions(updated);
    if (!demoMode) await storage.set('magot:contributions', updated);
    showToast(`+${new Intl.NumberFormat('fr-FR',{style:'currency',currency:'EUR',maximumFractionDigits:0}).format(contrib.amount)} enregistré 💰`);
  };

  const deleteContribution = async (id) => {
    const updated = contributions.filter(c => c.id !== id);
    setContributions(updated);
    if (!demoMode) await storage.set('magot:contributions', updated);
  };

  const markArticleRead = async (id) => {
    if (readArticles.includes(id)) return;
    const updated = [...readArticles, id];
    setReadArticles(updated);
    if (!demoMode) await storage.set('magot:readArticles', updated);
  };

  const logout = async () => {
    if (demoMode) { exitDemo(); return; }
    await storage.del('magot:user');
    await storage.del('magot:assets');
    await storage.del('magot:history');
    await storage.del('magot:goals');
    await storage.del('magot:contributions');
    await storage.del('magot:readArticles');
    setUser(null); setAssets([]); setHistory([]); setGoals([]); setContributions([]); setReadArticles([]);
    setView('landing');
  };

  const upgradePlan = async (plan) => {
    const updated = { ...user, plan };
    if (!demoMode) await storage.set('magot:user', updated);
    setUser(updated); setModal(null);
    showToast(plan === 'lifetime' ? 'Bienvenue en Lifetime 👑' : 'Bienvenue en Premium ✨');
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)' }} className="flex items-center justify-center">
        <style>{STYLES}</style>
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div id="magot-root" className="grain" style={{ minHeight: '100vh', background: 'var(--bg)', color: theme === 'light' ? '#111827' : '#F5F5F0', transition: 'background 0.3s ease, color 0.3s ease' }}>
      <style>{STYLES}</style>

      {view === 'landing' && <Landing onStart={() => setView('auth')} onDemo={enterDemo} />}
      {view === 'auth' && <Auth onAuth={handleAuth} onBack={() => setView('landing')} />}
      {view === 'onboarding' && <Onboarding user={user} onComplete={handleOnboardingComplete} />}
      {view === 'app' && (
        <AppShell
          user={user} active={appView} onNavigate={(v) => { if (v !== appView) { setPageKey(k => k + 1); setAppView(v); } }}
          onLogout={logout} onUpgrade={() => setModal({ type: 'upgrade' })}
          demoMode={demoMode} onExitDemo={exitDemo}
          alertCount={getAlerts(assets, assets.reduce((s,a)=>s+(a.value||0),0)).filter(a=>!(dismissedAlerts||[]).includes(a.id)).length}
        >
          <div key={pageKey} className="page-enter">
          {appView === 'dashboard' && (
            <Dashboard user={user} assets={assets} history={history}
              contributions={contributions}
              dismissedAlerts={dismissedAlerts}
              onDismissAlert={(id) => setDismissedAlerts(prev => [...prev, id])}
              onAdd={() => setModal({ type: 'addAsset' })}
              onLogContribution={() => setModal({ type: 'addContribution' })}
              onNavigate={setAppView}
              onAssetClick={(a) => setModal({ type: 'assetDetail', asset: a })} />
          )}
          {appView === 'assets' && (
            <Assets assets={assets} onAdd={() => setModal({ type: 'addAsset' })}
              onClick={(a) => setModal({ type: 'assetDetail', asset: a })} />
          )}
          {appView === 'goals' && (
            <Goals goals={goals} assets={assets} history={history}
              onAdd={() => setModal({ type: 'addGoal' })} onDelete={deleteGoal} />
          )}
          {appView === 'simulator' && <Simulator assets={assets} history={history} contributions={contributions} user={user} onUpgrade={() => setModal({ type: 'upgrade' })} />}
          {appView === 'scenarios' && <Scenarios assets={assets} contributions={contributions} user={user} onUpgrade={() => setModal({ type: 'upgrade' })} />}
          {appView === 'fire' && <Fire assets={assets} contributions={contributions} user={user} onUpgrade={() => setModal({ type: 'upgrade' })} />}
          {appView === 'community' && <Community user={user} assets={assets} />}
          {appView === 'leaderboard' && <Leaderboard user={user} assets={assets} onUpgrade={() => setModal({ type: 'upgrade' })} />}
          {appView === 'learn' && <Learn user={user} readArticles={readArticles} onMarkRead={markArticleRead} onUpgrade={() => setModal({ type: 'upgrade' })} />}
          {appView === 'connect' && <Connect user={user} assets={assets} showToast={showToast} onUpgrade={() => setModal({ type: 'upgrade' })} />}
          {appView === 'share' && <Share user={user} assets={assets} showToast={showToast} />}
          {appView === 'insights' && (
            <Insights user={user} assets={assets} onUpgrade={() => setModal({ type: 'upgrade' })}
              weeklyInsight={weeklyInsight} insightLoading={insightLoading}
              onRefreshInsight={() => {
                setWeeklyInsight(null);
                storage.del('magot:weeklyInsight');
                generateWeeklyInsight(assets, user);
              }} />
          )}
          {appView === 'settings' && (
            <Settings user={user} assets={assets} history={history} contributions={contributions}
              onLogout={logout} onUpgrade={() => setModal({ type: 'upgrade' })}
              demoMode={demoMode} showToast={showToast}
              theme={theme} onToggleTheme={toggleTheme}
              onRestart={() => { setAppView('dashboard'); setTimeout(() => setTourStep(0), 300); }} />
          )}
          </div>
        </AppShell>
      )}

      {modal?.type === 'addAsset' && (
        <AssetModal onClose={() => setModal(null)} onSave={(a) => { addAsset(a); setModal(null); }} />
      )}
      {modal?.type === 'editAsset' && (
        <AssetModal asset={modal.asset} onClose={() => setModal(null)}
          onSave={(a) => { updateAsset(modal.asset.id, a); setModal(null); }} />
      )}
      {modal?.type === 'assetDetail' && (
        <AssetDetail asset={assets.find(a => a.id === modal.asset.id) || modal.asset}
          onClose={() => setModal(null)}
          onEdit={() => setModal({ type: 'editAsset', asset: modal.asset })}
          onQuickUpdate={(newValue) => updateAsset(modal.asset.id, { value: newValue })}
          onDelete={() => deleteAsset(modal.asset.id)} />
      )}
      {modal?.type === 'upgrade' && (
        <UpgradeModal user={user} onClose={() => setModal(null)} onUpgrade={upgradePlan} />
      )}
      {modal?.type === 'addGoal' && (
        <GoalModal onClose={() => setModal(null)} onSave={(g) => { addGoal(g); setModal(null); }} />
      )}
      {modal?.type === 'addContribution' && (
        <ContributionModal onClose={() => setModal(null)} onSave={(c) => { addContribution(c); setModal(null); }} />
      )}
      {milestoneCard && (
        <MilestoneCard
          achievement={milestoneCard.achievement}
          total={milestoneCard.total}
          user={milestoneCard.user}
          onClose={() => setMilestoneCard(null)}
        />
      )}

      {toast && <Toast {...toast} />}
    </div>
  );
}

/* ========== TOAST ========== */

const Toast = ({ msg, type }) => (
  <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 scale-in"
    style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '12px 20px', boxShadow: '0 10px 40px rgba(0,0,0,0.5)' }}>
    <div className="flex items-center gap-2.5">
      <div style={{ color: type === 'success' ? '#B8FF5A' : '#FF6B6B' }}>
        <Icon name={type === 'success' ? 'check' : 'x'} size={18} />
      </div>
      <span className="text-sm">{msg}</span>
    </div>
  </div>
);

/* ========== LANDING ========== */

const Landing = ({ onStart, onDemo }) => {
  const [openFaq, setOpenFaq] = useState(null);
  const [spotsLeft] = useState(47); // urgency

  const faqs = [
    { q: "Mes données bancaires sont-elles connectées ?", a: "Non. Tu saisis toi-même tes soldes. Zéro connexion bancaire — c'est un choix délibéré pour ta sécurité totale." },
    { q: "C'est vraiment gratuit à vie ?", a: "Oui. Le plan gratuit est permanent. Pas de CB, pas d'engagement. Tu passes Premium uniquement si tu veux les fonctions avancées." },
    { q: "Pourquoi pas Finary ?", a: "Finary est conçu pour les 35-50 ans avec patrimoine établi. Magot est construit pour toi : classement par âge, interface mobile-first, prix qui respecte ton budget." },
    { q: "Le Lifetime à 59€ c'est une arnaque ?", a: "Non — offre fondateurs limitée aux 150 premières personnes. Après, le prix monte à 299€ puis disparaît définitivement." },
    { q: "Mes données sont en sécurité ?", a: "Tes données restent sur ton appareil (stockage local). Rien ne transite vers nos serveurs sans ton accord explicite." },
  ];

  const testimonials = [
    { name: "Lucas M.", age: 24, city: "Lyon", avatar: "L", color: "#B8FF5A", text: "J'utilisais un Google Sheet depuis 2 ans. Magot l'a remplacé en 10 minutes. Je suis Top 15% à 24 ans.", rating: 5 },
    { name: "Sarah K.", age: 22, city: "Paris", avatar: "S", color: "#7BB3FF", text: "La première app de gestion que j'arrive à utiliser régulièrement. L'analyse IA m'a dit exactement quoi corriger.", rating: 5 },
    { name: "Tom R.", age: 26, city: "Bordeaux", avatar: "T", color: "#B598FF", text: "Le calculateur FIRE m'a ouvert les yeux. À mon rythme actuel je peux arrêter de travailler à 44 ans.", rating: 5 },
  ];

  const features = [
    { icon: "◈", color: "#B8FF5A", title: "Tout au même endroit",    desc: "8 types de placements, évolution en temps réel, revenus passifs. Fini les tableaux Excel." },
    { icon: "◎", color: "#E8C547", title: "Ton rang face aux autres", desc: "Top 10% ? Tu vois exactement où tu en es face aux autres jeunes de ton âge." },
    { icon: "◇", color: "#FF6B6B", title: "Liberté financière",       desc: "À quel âge tu peux arrêter de travailler ? Un curseur, une réponse immédiate." },
    { icon: "◈", color: "#7BB3FF", title: "Scénarios Et si...",       desc: "Et si tu doublais tes apports ? Et si les marchés chutaient de 30% demain ?" },
    { icon: "◎", color: "#B598FF", title: "Fiscalité PEA auto",       desc: "Combien tu économises en ne touchant pas ton PEA avant 5 ans. Un seul chiffre." },
    { icon: "◇", color: "#B8FF5A", title: "Analyse IA",               desc: "Examine ton portefeuille et te donne 5 actions concrètes avec les montants exacts." },
    { icon: "◈", color: "#E8C547", title: "Cartes à partager",        desc: "Génère une carte élégante dès que tu franchis un palier : 5k, 10k, 50k..." },
    { icon: "◎", color: "#7BB3FF", title: "9 guides finance FR",      desc: "PEA, fiscalité, ETF, DCA, SCPI — tout ce qu'il faut savoir, intégré dans l'app." },
  ];

  return (
    <div className="relative" style={{ minHeight: '100vh', overflowX: 'hidden' }}>

      {/* ── NAV ──────────────────────────────────────── */}
      <nav className="relative z-20 flex items-center justify-between px-6 md:px-12 py-5">
        <Logo />
        <div className="flex items-center gap-5">
          <a href="#features" className="hidden md:block text-sm text-[#A0A3A8] hover:text-white transition">Fonctions</a>
          <a href="#pricing"  className="hidden md:block text-sm text-[#A0A3A8] hover:text-white transition">Tarifs</a>
          <a href="#faq"      className="hidden md:block text-sm text-[#A0A3A8] hover:text-white transition">FAQ</a>
          <button onClick={onStart}
            className="text-xs font-mono border border-[#26292E] px-4 py-2 rounded-full hover:border-[#B8FF5A] hover:text-[#B8FF5A] transition">
            Connexion
          </button>
        </div>
      </nav>

      {/* ── HERO ─────────────────────────────────────── */}
      <div className="relative">
        <div className="absolute inset-0 hero-grid opacity-30" />
        {/* Glow background */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(ellipse, #B8FF5A08, transparent 70%)' }} />

        <div className="relative z-10 max-w-4xl mx-auto px-6 pt-16 md:pt-24 pb-16 text-center">

          {/* Badge live */}
          <div className="fade-up inline-flex items-center gap-2 mb-8 px-4 py-2 rounded-full cursor-pointer"
            style={{ background: 'var(--bg-card)', border: '1px solid #B8FF5A30' }}
            onClick={onDemo}>
            <div className="w-1.5 h-1.5 rounded-full bg-[#B8FF5A] pulse-dot" />
            <span className="text-xs text-[#B8FF5A] font-mono uppercase tracking-wider">
              {spotsLeft} places Lifetime restantes · Offre fondateurs
            </span>
            <Icon name="arrow" size={12} className="text-[#B8FF5A]" />
          </div>

          {/* Headline */}
          <h1 className="fade-up delay-1 font-serif leading-[0.92] tracking-tight mb-6"
            style={{ fontSize: 'clamp(48px, 10vw, 96px)' }}>
            Ton patrimoine,<br />
            <span className="italic" style={{ color: '#B8FF5A' }}>enfin</span> visible.
          </h1>

          <p className="fade-up delay-2 text-base md:text-xl text-[#A0A3A8] max-w-xl mx-auto mb-10 leading-relaxed">
            Le tracker patrimonial pour les 18-30 ans qui construisent leur richesse.
            PEA · Crypto · SCPI · Immo — tout en un, en 3 minutes.
          </p>

          {/* CTAs */}
          <div className="fade-up delay-3 flex flex-col sm:flex-row items-center justify-center gap-3 mb-6">
            <button onClick={onStart}
              className="btn-primary px-8 py-4 rounded-full text-sm font-semibold w-full sm:w-auto">
              Commencer gratuitement →
            </button>
            <button onClick={onDemo}
              className="btn-ghost px-8 py-4 rounded-full text-sm w-full sm:w-auto flex items-center justify-center gap-2">
              <Icon name="play" size={12} /> Voir la démo
            </button>
          </div>

          {/* Social proof inline */}
          <div className="fade-up delay-4 flex items-center justify-center gap-6 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {[['L','#B8FF5A'],['S','#7BB3FF'],['T','#B598FF'],['M','#E8C547'],['A','#FF6B6B']].map(([letter, color], i) => (
                  <div key={i} className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold border-2"
                    style={{ background: color + '20', borderColor: 'var(--bg)', color }}>
                    {letter}
                  </div>
                ))}
              </div>
              <span className="text-xs text-[#6E7074]">1 847 membres actifs</span>
            </div>
            <div className="flex items-center gap-1.5">
              {'⭐⭐⭐⭐⭐'.split('').map((s,i) => <span key={i} className="text-[#E8C547] text-xs">{s}</span>)}
              <span className="text-xs text-[#6E7074] ml-1">4.9/5</span>
            </div>
            <span className="text-xs text-[#6E7074] font-mono">0 CB requise</span>
          </div>
        </div>
      </div>

      {/* ── STATS STRIP ──────────────────────────────── */}
      <div className="border-y border-[#26292E] py-8">
        <div className="max-w-4xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { v: '2,4 M€', l: 'Patrimoine tracké' },
            { v: '1 847',  l: 'Membres bêta' },
            { v: "8", l: "Types de placements" },
            { v: '4.9 ★',  l: 'Note moyenne' },
          ].map((s, i) => (
            <div key={i} className="fade-up" style={{ animationDelay: `${i * 0.05}s` }}>
              <div className="font-serif text-3xl mb-1" style={{ color: i === 0 ? '#B8FF5A' : 'var(--text)' }}>{s.v}</div>
              <div className="text-xs text-[#6E7074] font-mono uppercase tracking-wider">{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── COMMENT ÇA MARCHE ────────────────────────── */}
      <div id="how" className="max-w-4xl mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <div className="text-xs text-[#B8FF5A] font-mono uppercase tracking-widest mb-3">Démarrage</div>
          <h2 className="font-serif tracking-tight" style={{ fontSize: 'clamp(32px, 7vw, 64px)' }}>
            3 minutes chrono.<br />
            <span className="italic" style={{ color: '#B8FF5A' }}>Ton argent enfin visible.</span>
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { n: '01', icon: '+', color: '#B8FF5A', t: 'Ajoute tes actifs', d: 'PEA, crypto, SCPI, livrets, cash — 30 secondes par actif. Tu rentres le montant investi et la valeur actuelle.' },
            { n: '02', icon: '◈', color: '#7BB3FF', t: 'Vois où tu en es', d: 'Dashboard en temps réel, évolution, ton rang parmi les jeunes de ton âge, revenus passifs. Une page, tout est là.' },
            { n: "03", icon: "◇", color: "#FF6B6B", t: "Passe au niveau suivant", d: "Objectifs avec date, calculateur FIRE, analyse IA. Tu sais exactement quoi faire." },
          ].map((s, i) => (
            <div key={i} className="card p-6 fade-up relative overflow-hidden"
              style={{ animationDelay: `${i * 0.08}s` }}>
              <div className="absolute top-4 right-4 font-mono text-5xl font-bold"
                style={{ color: '#B8FF5A0D' }}>{s.n}</div>
              <div className="text-2xl font-bold mb-4" style={{ color: s.color }}>{s.icon}</div>
              <h3 className="font-serif text-xl mb-2">{s.t}</h3>
              <p className="text-[#A0A3A8] leading-relaxed text-sm">{s.d}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── FEATURES ─────────────────────────────────── */}
      <div id="features" className="max-w-4xl mx-auto px-6 py-10">
        <div className="text-center mb-14">
          <div className="text-xs text-[#7BB3FF] font-mono uppercase tracking-widest mb-3">Fonctionnalités</div>
          <h2 className="font-serif tracking-tight" style={{ fontSize: 'clamp(32px, 7vw, 64px)' }}>
            Pensé pour <span className="italic">nous</span>.
          </h2>
          <p className="text-[#A0A3A8] mt-3 max-w-xl mx-auto">
            Pas pour les 40 ans avec patrimoine établi. Pour les 20 ans qui construisent le leur.
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {features.map((f, i) => (
            <div key={i} className="card p-5 fade-up hover:border-[#26292E] transition"
              style={{ animationDelay: `${i * 0.04}s` }}>
              <div className="text-xl font-bold mb-3" style={{ color: f.color }}>{f.icon}</div>
              <h3 className="text-sm font-semibold mb-1 leading-tight">{f.title}</h3>
              <p className="text-xs text-[#6E7074] leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── VS FINARY ────────────────────────────────── */}
      <div className="max-w-3xl mx-auto px-6 py-16">
        <div className="text-center mb-10">
          <div className="text-xs text-[#FF6B6B] font-mono uppercase tracking-widest mb-3">Comparaison</div>
          <h2 className="font-serif text-3xl md:text-5xl tracking-tight">
            Magot vs les autres
          </h2>
        </div>
        <div className="card overflow-hidden">
          <div className="grid grid-cols-3 text-center border-b border-[#26292E]"
            style={{ background: 'var(--bg-input)' }}>
            <div className="p-4 text-xs text-[#6E7074] font-mono uppercase">Fonctions</div>
            <div className="p-4 border-l border-[#26292E]">
              <div className="font-serif text-lg text-[#B8FF5A]">Magot</div>
            </div>
            <div className="p-4 border-l border-[#26292E]">
              <div className="font-serif text-lg text-[#6E7074]">Finary</div>
            </div>
          </div>
          {[
            ["Classement par tranche d'âge", true, false],
            ['Calculateur FIRE',            true,  true],
            ['Scénarios "Et si..."',         true,  false],
            ['Cartes TikTok / partage',     true,  false],
            ['Prix adapté 18-30 ans',       true,  false],
            ['Guides finance intégrés',     true,  false],
            ['Connexion bancaire',          false, true],
            ['Application mobile native',   false, true],
          ].map(([label, magot, finary], i) => (
            <div key={i} className="grid grid-cols-3 text-center border-b border-[#1E2126] last:border-0">
              <div className="p-4 text-sm text-left text-[#A0A3A8] pl-5">{label}</div>
              <div className="p-4 border-l border-[#1E2126] flex items-center justify-center">
                {magot
                  ? <span className="text-[#B8FF5A] text-lg">✓</span>
                  : <span className="text-[#3A3F46] text-lg">—</span>}
              </div>
              <div className="p-4 border-l border-[#1E2126] flex items-center justify-center">
                {finary
                  ? <span className="text-[#6E7074] text-lg">✓</span>
                  : <span className="text-[#3A3F46] text-lg">—</span>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── TÉMOIGNAGES ──────────────────────────────── */}
      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="text-center mb-12">
          <div className="text-xs text-[#E8C547] font-mono uppercase tracking-widest mb-3">Ils l'utilisent</div>
          <h2 className="font-serif text-3xl md:text-5xl tracking-tight">
            Ce qu'ils en disent.
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {testimonials.map((t, i) => (
            <div key={i} className="card p-6 fade-up" style={{ animationDelay: `${i * 0.06}s` }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                  style={{ background: (t.color || '#B8FF5A') + '20', color: t.color || '#B8FF5A' }}>{t.avatar}</div>
                <div>
                  <div className="text-sm font-semibold">{t.name}</div>
                  <div className="text-xs text-[#6E7074]">{t.age} ans · {t.city}</div>
                </div>
                <div className="ml-auto">
                  <span style={{ fontSize: 11 }}>⭐⭐⭐⭐⭐</span>
                </div>
              </div>
              <p className="text-sm text-[#A0A3A8] leading-relaxed">"{t.text}"</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── PRICING ──────────────────────────────────── */}
      <div id="pricing" className="max-w-4xl mx-auto px-6 py-20">
        <div className="text-center mb-4">
          <div className="text-xs text-[#E8C547] font-mono uppercase tracking-widest mb-3">Tarifs</div>
          <h2 className="font-serif tracking-tight" style={{ fontSize: 'clamp(32px, 7vw, 64px)' }}>
            Commence <span className="italic">gratuitement</span>.
          </h2>
        </div>
        <p className="text-center text-[#6E7074] text-sm mb-12">
          Pas de CB requise · Upgrade quand tu veux · Annulation en 1 clic
        </p>

        {/* Urgency lifetime */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="w-1.5 h-1.5 rounded-full bg-[#FF6B6B] pulse-dot" />
          <span className="text-xs font-mono text-[#FF6B6B] uppercase tracking-wider">
            Plus que {spotsLeft} places Lifetime à 59€ — {150 - spotsLeft} déjà prises
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          <PricingCard name="Gratuit" emoji="🌱" price="0€" period="pour toujours"
            color="#6E7074"
            features={['5 actifs', 'Dashboard complet', 'Classement vs ton âge', '2 objectifs', '1 partage / mois']}
            cta="Commencer" onClick={onStart} />
          <PricingCard name="Starter" emoji="⚡" price="2,99€" period="par mois"
            color="#7BB3FF"
            features={['20 actifs', 'Historique 90 jours', 'Fiscalité PEA auto', '10 objectifs', '5 partages / mois']}
            cta="7j gratuits" onClick={onStart} />
          <PricingCard name="Pro" emoji="🚀" price="6,99€" period="par mois"
            color="#B8FF5A"
            features={['Actifs illimités', 'Analyse IA mensuelle', 'FIRE + scénarios', 'Partages illimités', 'Export CSV impôts']}
            cta="14j gratuits" onClick={onStart} highlight />
          <PricingCard name="Lifetime" emoji="👑" price="59€" period="une seule fois" badge="Fondateurs"
            color="#E8C547"
            features={[`${spotsLeft} places restantes`, 'Tout Pro à vie', 'Badge fondateur', 'Avant-premières', 'Voix sur la roadmap']}
            cta="Saisir l'offre" onClick={onStart} gold />
        </div>

        <div className="card p-4" style={{ background: 'var(--bg-input)' }}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
            {[
              { e: '🔒', t: 'Zéro connexion bancaire' },
              { e: '🇫🇷', t: 'Données stockées en France' },
              { e: '↩️', t: 'Annulation en 1 clic' },
              { e: '💬', t: 'Support sous 24h' },
            ].map((v, i) => (
              <div key={i} className="flex items-center justify-center gap-2 text-xs text-[#6E7074]">
                <span>{v.e}</span><span>{v.t}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── FAQ ──────────────────────────────────────── */}
      <div id="faq" className="max-w-2xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <div className="text-xs text-[#A0A3A8] font-mono uppercase tracking-widest mb-3">Questions</div>
          <h2 className="font-serif text-3xl md:text-5xl tracking-tight">
            Les <span className="italic">vraies</span> réponses.
          </h2>
        </div>
        <div className="space-y-2">
          {faqs.map((f, i) => (
            <div key={i} className="card overflow-hidden fade-up" style={{ animationDelay: `${i * 0.03}s` }}>
              <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full px-5 py-4 flex items-center justify-between text-left gap-4">
                <span className="text-sm md:text-base leading-snug">{f.q}</span>
                <Icon name="chevron" size={16}
                  className={`transition-transform flex-shrink-0 ${openFaq === i ? 'rotate-180' : ''}`} />
              </button>
              {openFaq === i && (
                <div className="px-5 pb-5 text-sm text-[#A0A3A8] leading-relaxed border-t border-[#26292E] pt-4 fade-in">
                  {f.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── CTA FINAL ────────────────────────────────── */}
      <div className="max-w-2xl mx-auto px-6 py-20 text-center">
        <div className="card dark-card p-10 relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg,#141619,#172218)', borderColor: '#B8FF5A30' }}>
          <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, #B8FF5A10, transparent 70%)' }} />
          <div className="relative">
            <div className="font-serif text-5xl text-[#B8FF5A] mb-4">M.</div>
            <h2 className="font-serif text-4xl md:text-5xl tracking-tight mb-4">
              Ton Magot t'attend.
            </h2>
            <p className="text-[#A0A3A8] mb-8 text-sm leading-relaxed">
              30 secondes pour démarrer. Aucune CB. Aucun engagement.<br />
              Rejoins 1 847 membres qui trackent leur patrimoine.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button onClick={onStart} className="btn-primary px-8 py-4 rounded-full font-semibold">
                Créer mon compte gratuit →
              </button>
              <button onClick={onDemo}
                className="btn-ghost px-8 py-4 rounded-full flex items-center justify-center gap-2">
                <Icon name="play" size={12} /> Voir la démo
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── FOOTER ───────────────────────────────────── */}
      <footer className="border-t border-[#26292E] py-10 px-6">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <Logo size="sm" />
            <p className="text-xs text-[#3A3F46] mt-1 font-mono">Le tracker patrimonial des 18-30 ans.</p>
          </div>
          <div className="flex items-center gap-6 text-xs text-[#6E7074] font-mono uppercase tracking-wider">
            <a href="#" className="hover:text-white transition">Mentions légales</a>
            <a href="#" className="hover:text-white transition">Confidentialité</a>
            <a href="#" className="hover:text-white transition">Contact</a>
          </div>
          <div className="text-xs text-[#3A3F46] font-mono">© 2026 Magot · Fait en 🇫🇷</div>
        </div>
      </footer>

    </div>
  );
};

const PricingCard = ({ name, emoji, price, period, features, cta, onClick, highlight, gold, badge, color }) => (
  <div className={`card p-5 fade-up relative flex flex-col ${highlight ? 'glow-green' : ''} ${gold ? 'glow-gold' : ''}`}
    style={{
      borderColor: highlight ? '#B8FF5A' : gold ? '#E8C547' : 'var(--border)',
      background: highlight ? 'linear-gradient(160deg, #141619 0%, #172218 100%)' : gold ? 'linear-gradient(160deg, #141619 0%, #1E1A0E 100%)' : 'var(--bg-card)',
    }}>
    {badge && (
      <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider font-bold whitespace-nowrap"
        style={{ background: '#E8C547', color: 'var(--bg)' }}>{badge}</div>
    )}

    <div className="text-2xl mb-3">{emoji}</div>
    <div className="font-serif text-xl mb-1" style={{ color: color || 'var(--text)' }}>{name}</div>

    <div className="flex items-baseline gap-1 mb-1">
      <span className="font-serif text-3xl md:text-4xl">{price}</span>
    </div>
    <div className="text-xs text-[#6E7074] mb-4">{period}</div>

    <ul className="space-y-2 mb-5 flex-1">
      {features.map((f, i) => (
        <li key={i} className="flex items-start gap-2 text-xs">
          <div className="mt-0.5 flex-shrink-0" style={{ color: color || '#B8FF5A' }}>
            <Icon name="check" size={11} />
          </div>
          <span className="text-[#C0C3C8] leading-relaxed">{f}</span>
        </li>
      ))}
    </ul>

    <button onClick={onClick}
      className={`w-full py-2.5 rounded-full text-xs font-semibold transition ${highlight ? 'btn-primary' : gold ? 'btn-gold' : 'btn-ghost'}`}>
      {cta}
    </button>
  </div>
);

/* ========== AUTH ========== */

const Auth = ({ onAuth, onBack }) => {
  const [mode, setMode] = useState('signup');
  const [form, setForm] = useState({ name: '', email: '', password: '', age: '' });
  const [showPw, setShowPw] = useState(false);
  const [err, setErr] = useState('');

  const submit = (e) => {
    e?.preventDefault(); setErr('');
    if (mode === 'signup') {
      if (!form.name || !form.email || !form.password || !form.age) { setErr('Tous les champs sont requis'); return; }
      if (form.password.length < 6) { setErr('Mot de passe: 6 caractères minimum'); return; }
      const age = parseInt(form.age);
      if (isNaN(age) || age < 16 || age > 99) { setErr('Âge invalide'); return; }
      onAuth({ name: form.name, email: form.email, age, onboarded: false });
    } else {
      if (!form.email || !form.password) { setErr('Email et mot de passe requis'); return; }
      onAuth({ name: form.email.split('@')[0], email: form.email, age: 22, onboarded: true });
    }
  };

  return (
    <div className="flex items-center justify-center px-6 py-10" style={{ minHeight: '100vh' }}>
      <div className="w-full max-w-md fade-up">
        <button onClick={onBack} className="text-sm text-[#6E7074] hover:text-white transition mb-8 flex items-center gap-2">
          <Icon name="arrow" size={14} className="rotate-180" /> Retour
        </button>
        <div className="mb-8"><Logo size="lg" /></div>
        <h1 className="font-serif text-4xl mb-2">{mode === 'signup' ? 'Créer un compte' : 'Bon retour.'}</h1>
        <p className="text-[#A0A3A8] mb-8">{mode === 'signup' ? 'Ça prend 20 secondes.' : 'Connecte-toi à ton Magot.'}</p>
        <form onSubmit={submit} className="space-y-3">
          {mode === 'signup' && (
            <>
              <input className="input" placeholder="Ton prénom" value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })} />
              <input className="input" placeholder="Ton âge" type="number" value={form.age}
                onChange={e => setForm({ ...form, age: e.target.value })} />
            </>
          )}
          <input className="input" placeholder="Email" type="email" value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })} />
          <div className="relative">
            <input className="input pr-11" placeholder="Mot de passe" type={showPw ? 'text' : 'password'} value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })} />
            <button type="button" onClick={() => setShowPw(!showPw)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6E7074] hover:text-white transition">
              <Icon name={showPw ? 'eyeoff' : 'eye'} size={16} />
            </button>
          </div>
          {err && <div className="text-sm" style={{ color: '#FF6B6B' }}>{err}</div>}
          <button type="submit" className="btn-primary w-full py-3.5 rounded-full text-sm mt-2">
            {mode === 'signup' ? 'Créer mon compte' : 'Se connecter'}
          </button>
        </form>
        <div className="text-center mt-6 text-sm text-[#A0A3A8]">
          {mode === 'signup' ? 'Déjà un compte ?' : 'Pas encore de compte ?'}{' '}
          <button onClick={() => { setMode(mode === 'signup' ? 'login' : 'signup'); setErr(''); }}
            className="text-[#B8FF5A] hover:underline">
            {mode === 'signup' ? 'Connexion' : 'Inscription'}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ========== ONBOARDING ========== */

const Onboarding = ({ user, onComplete }) => {
  const [step, setStep] = useState(0);
  const [draftAssets, setDraftAssets] = useState([]);
  const [current, setCurrent] = useState({ type: 'pea', name: '', value: '', invested: '', openedAt: '' });
  const [profile, setProfile] = useState({ goal: '', monthlyContrib: '', fireAge: '' });

  const addDraft = () => {
    if (!current.value) return;
    setDraftAssets([...draftAssets, {
      ...current,
      name: current.name || ASSET_TYPES[current.type].label,
      value: parseFloat(current.value) || 0,
      invested: parseFloat(current.invested) || parseFloat(current.value) || 0,
      yield: ASSET_TYPES[current.type].defaultYield || 0,
      openedAt: current.type === 'pea' ? current.openedAt : undefined,
    }]);
    setCurrent({ type: 'pea', name: '', value: '', invested: '', openedAt: '' });
  };

  const total = draftAssets.reduce((s, a) => s + a.value, 0);

  const GOALS = [
    { id: 'liberte', emoji: '🏝️', label: 'Liberté financière', desc: "Ne plus dépendre d'un salaire" },
    { id: 'voyage', emoji: '✈️', label: 'Voyager librement', desc: 'Vivre et travailler où je veux' },
    { id: 'immo', emoji: '🏠', label: 'Acheter un bien', desc: 'Résidence ou investissement locatif' },
    { id: 'business', emoji: '🚀', label: 'Créer mon business', desc: 'Devenir entrepreneur' },
    { id: 'retraite', emoji: '🌅', label: 'Retraite anticipée', desc: 'Arrêter de travailler tôt' },
    { id: 'securite', emoji: '🛡️', label: 'Sécurité financière', desc: 'Avoir un matelas confortable' },
  ];

  const CONTRIBS = ['50', '100', '200', '300', '500', '1000+'];

  const steps = [
    /* ── Step 0 : Welcome ── */
    <div key="welcome" className="text-center max-w-lg mx-auto fade-up">
      <div className="inline-flex items-center justify-center w-24 h-24 rounded-full mb-8"
        style={{ background: 'linear-gradient(135deg, #B8FF5A20, #B8FF5A05)', border: '1px solid #B8FF5A30' }}>
        <span style={{ fontSize: 44 }}>👋</span>
      </div>
      <h1 className="font-serif text-4xl md:text-5xl mb-4">Salut {user.name}.</h1>
      <p className="text-lg text-[#A0A3A8] mb-3 leading-relaxed">
        Bienvenue sur Magot — le dashboard des jeunes investisseurs FR.
      </p>
      <p className="text-sm text-[#6E7074] mb-10">3 étapes · 2 minutes · ton patrimoine en clair</p>
      <div className="flex items-center justify-center gap-8 mb-10">
        {[['📊','Ton rang'],['🔥','Trophées'],['🤖','Analyse IA']].map(([e,l]) => (
          <div key={l} className="text-center">
            <div className="text-2xl mb-1">{e}</div>
            <div className="text-[10px] text-[#6E7074] font-mono uppercase">{l}</div>
          </div>
        ))}
      </div>
      <button onClick={() => setStep(1)} className="btn-primary px-10 py-4 rounded-full text-base font-semibold">
        C'est parti →
      </button>
    </div>,

    /* ── Step 1 : Objectif + apport ── */
    <div key="goal" className="max-w-xl mx-auto fade-up">
      <div className="flex items-center gap-2 mb-6">
        {[1,2,3].map(n => (
          <div key={n} className="h-1 flex-1 rounded-full transition-all"
            style={{ background: n <= 1 ? '#B8FF5A' : 'var(--border)' }} />
        ))}
      </div>
      <div className="text-xs text-[#B8FF5A] font-mono uppercase tracking-widest mb-2">Étape 1 / 3</div>
      <h1 className="font-serif text-3xl mb-2">Ton objectif.</h1>
      <p className="text-[#A0A3A8] text-sm mb-6">Ça personnalise ton dashboard.</p>

      <div className="grid grid-cols-2 gap-3 mb-6">
        {GOALS.map(g => (
          <button key={g.id} onClick={() => setProfile({ ...profile, goal: g.id })}
            className="card p-4 text-left transition-all"
            style={{ border: profile.goal === g.id ? '1px solid #B8FF5A' : '1px solid var(--border)', background: profile.goal === g.id ? '#B8FF5A10' : 'var(--bg-card)' }}>
            <div className="text-2xl mb-2">{g.emoji}</div>
            <div className="text-sm font-semibold mb-0.5">{g.label}</div>
            <div className="text-[11px] text-[#6E7074]">{g.desc}</div>
          </button>
        ))}
      </div>

      <div className="card p-5 mb-6">
        <div className="text-xs text-[#A0A3A8] font-mono uppercase tracking-widest mb-4">Apport mensuel moyen</div>
        <div className="grid grid-cols-3 gap-2">
          {CONTRIBS.map(c => (
            <button key={c} onClick={() => setProfile({ ...profile, monthlyContrib: c })}
              className="py-2.5 rounded-lg text-sm font-mono transition"
              style={{
                border: profile.monthlyContrib === c ? '1px solid #B8FF5A' : '1px solid var(--border)',
                background: profile.monthlyContrib === c ? '#B8FF5A15' : 'transparent',
                color: profile.monthlyContrib === c ? '#B8FF5A' : 'inherit'
              }}>{c}€</button>
          ))}
        </div>
      </div>

      <button onClick={() => setStep(2)}
        className="btn-primary w-full py-3.5 rounded-full font-semibold"
        disabled={!profile.goal}>
        Continuer →
      </button>
      <button onClick={() => setStep(2)} className="text-xs text-[#6E7074] mt-3 block text-center hover:text-[#A0A3A8] transition">
        Passer cette étape
      </button>
    </div>,

    /* ── Step 2 : Actifs ── */
    <div key="assets" className="max-w-xl mx-auto fade-up">
      <div className="flex items-center gap-2 mb-6">
        {[1,2,3].map(n => (
          <div key={n} className="h-1 flex-1 rounded-full transition-all"
            style={{ background: n <= 2 ? '#B8FF5A' : 'var(--border)' }} />
        ))}
      </div>
      <div className="text-xs text-[#B8FF5A] font-mono uppercase tracking-widest mb-2">Étape 2 / 3</div>
      <h1 className="font-serif text-3xl mb-2">Tes actifs.</h1>
      <p className="text-[#A0A3A8] text-sm mb-6">Ajoute ce que tu as déjà. Tu peux modifier ça plus tard.</p>

      <div className="card p-5 mb-4">
        <div className="grid grid-cols-4 gap-2 mb-4">
          {Object.entries(ASSET_TYPES).map(([k, v]) => (
            <button key={k} onClick={() => setCurrent({ ...current, type: k })}
              className="p-3 rounded-lg text-center transition"
              style={{
                border: current.type === k ? `1px solid ${v.color}` : '1px solid var(--border)',
                background: current.type === k ? v.color + '15' : 'transparent'
              }}>
              <div className="text-xl mb-1">{v.emoji}</div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-[#A0A3A8]">{v.label}</div>
            </button>
          ))}
        </div>
        <input className="input mb-2" placeholder={`Nom (ex: ${ASSET_TYPES[current.type].label} Boursorama)`}
          value={current.name} onChange={e => setCurrent({ ...current, name: e.target.value })} />
        <div className="grid grid-cols-2 gap-2 mb-2">
          <input className="input" placeholder="Valeur actuelle €" type="number" value={current.value}
            onChange={e => setCurrent({ ...current, value: e.target.value })} />
          <input className="input" placeholder="Investi € (opt.)" type="number" value={current.invested}
            onChange={e => setCurrent({ ...current, invested: e.target.value })} />
        </div>
        {current.type === 'pea' && (
          <div>
            <label className="text-xs text-[#6E7074] font-mono uppercase mb-1 block">Date d'ouverture PEA</label>
            <input className="input" type="date" value={current.openedAt}
              onChange={e => setCurrent({ ...current, openedAt: e.target.value })} />
          </div>
        )}
        <button onClick={addDraft} disabled={!current.value}
          className="btn-primary w-full py-3 rounded-full text-sm mt-4 flex items-center justify-center gap-2">
          <Icon name="plus" size={14} /> Ajouter cet actif
        </button>
      </div>

      {draftAssets.length > 0 && (
        <div className="card p-5 mb-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono uppercase tracking-wider text-[#A0A3A8]">{draftAssets.length} actif{draftAssets.length > 1 ? 's' : ''} ajouté{draftAssets.length > 1 ? 's' : ''}</span>
            <span className="font-mono font-semibold" style={{ color: '#B8FF5A' }}>{fmt(total)}</span>
          </div>
          {draftAssets.map((a, i) => (
            <div key={i} className="flex items-center justify-between py-2.5 border-t" style={{ borderColor: 'var(--border)' }}>
              <div className="flex items-center gap-3">
                <span className="text-lg">{ASSET_TYPES[a.type].emoji}</span>
                <div>
                  <div className="text-sm font-medium">{a.name}</div>
                  <div className="text-xs text-[#6E7074] font-mono">{ASSET_TYPES[a.type].label}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-mono text-sm">{fmt(a.value)}</span>
                <button onClick={() => setDraftAssets(draftAssets.filter((_, j) => j !== i))}
                  className="text-[#6E7074] hover:text-[#FF6B6B] transition">
                  <Icon name="x" size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-3">
        <button onClick={() => setStep(3)} className="btn-ghost flex-1 py-3 rounded-full text-sm">Passer</button>
        <button onClick={() => setStep(3)} className="btn-primary flex-1 py-3 rounded-full text-sm" disabled={draftAssets.length === 0}>
          Continuer →
        </button>
      </div>
    </div>,

    /* ── Step 3 : Résumé ── */
    <div key="complete" className="text-center max-w-lg mx-auto fade-up">
      <div className="inline-flex items-center justify-center w-24 h-24 rounded-full mb-6"
        style={{ background: 'linear-gradient(135deg, #B8FF5A30, #B8FF5A08)', border: '1px solid #B8FF5A50' }}>
        <span style={{ fontSize: 44 }}>✨</span>
      </div>
      <h1 className="font-serif text-4xl md:text-5xl mb-3">Tout est prêt.</h1>
      {total > 0 ? (
        <>
          <div className="font-serif mb-1" style={{ fontSize: 60, color: '#B8FF5A' }}>{fmt(total)}</div>
          <p className="text-[#6E7074] text-sm mb-2 font-mono">ton magot de départ</p>
        </>
      ) : (
        <p className="text-[#A0A3A8] mb-4 text-sm">Tu pourras ajouter tes actifs depuis le dashboard.</p>
      )}
      {profile.goal && (
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm mb-8"
          style={{ background: '#B8FF5A15', border: '1px solid #B8FF5A30', color: '#B8FF5A' }}>
          <span>{GOALS.find(g => g.id === profile.goal)?.emoji}</span>
          <span>Objectif : {GOALS.find(g => g.id === profile.goal)?.label}</span>
        </div>
      )}
      {!profile.goal && <div className="mb-8" />}
      <button onClick={() => onComplete(draftAssets)}
        className="btn-primary px-10 py-4 rounded-full text-base font-semibold w-full max-w-xs mx-auto block">
        Voir mon dashboard 🚀
      </button>
      <p className="text-[10px] text-[#6E7074] mt-4 font-mono">Tes données restent sur ton appareil · 100% privé</p>
    </div>,
  ];

  return (
    <div className="flex items-center justify-center px-6 py-10" style={{ minHeight: '100vh' }}>
      {steps[step]}
    </div>
  );
};

/* ========== APP SHELL ========== */

const AppShell = ({ user, active, onNavigate, onLogout, onUpgrade, children, demoMode, onExitDemo, alertCount = 0, newAchievements = 0 }) => {
  const [mobileMenu, setMobileMenu] = useState(false);
  // Nav groupée
  const navGroups = [
    {
      label: 'Mon patrimoine',
      items: [
        { id: 'dashboard',   label: 'Tableau de bord', icon: 'home' },
        { id: 'assets',      label: 'Mes actifs',       icon: 'wallet' },
        { id: 'goals',       label: 'Mes objectifs',    icon: 'target' },
      ],
    },
    {
      label: 'Outils',
      items: [
        { id: 'simulator',   label: 'Simulateur',       icon: 'calc' },
        { id: 'scenarios',   label: 'Et si...',         icon: 'trends' },
        { id: 'fire',        label: 'Liberté financière', icon: 'flame' },
        { id: 'insights',    label: 'Analyse IA',       icon: 'spark' },
      ],
    },
    {
      label: 'Explorer',
      items: [
        { id: 'leaderboard', label: 'Classement',       icon: 'trophy' },
        { id: 'learn',       label: 'Apprendre',        icon: 'book' },
        { id: 'connect',     label: 'Connecter',        icon: 'link' },
      ],
    },
    {
      label: 'Compte',
      items: [
        { id: 'share',       label: 'Partager',         icon: 'share' },
        { id: 'settings',    label: 'Paramètres',       icon: 'settings' },
      ],
    },
  ];
  const navItems = navGroups.flatMap(g => g.items);

  return (
    <div className="flex" style={{ minHeight: '100vh' }}>
      {demoMode && (
        <div className="fixed top-0 left-0 right-0 z-40 text-center text-xs py-2 font-mono uppercase tracking-wider"
          style={{ background: '#E8C547', color: 'var(--bg)' }}>
          🧪 Mode démo · données fictives ·
          <button onClick={onExitDemo} className="ml-2 underline">quitter</button>
        </div>
      )}

      <aside className={`hidden md:flex flex-col w-60 border-r border-[#26292E] p-5 relative z-10 ${demoMode ? 'pt-12' : ''}`}>
        <div className="mb-10"><Logo /></div>
        <nav className="flex-1 space-y-5">
          {navGroups.map(group => (
            <div key={group.label}>
              <div className="text-[9px] font-mono uppercase tracking-widest text-[#3A3F46] px-3 mb-1">
                {group.label}
              </div>
              {group.items.map(item => (
                <button key={item.id} onClick={() => onNavigate(item.id)}
                  className={`nav-link w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition
                    ${active === item.id ? 'bg-[#141619] text-[#B8FF5A]' : 'text-[#A0A3A8] hover:bg-[#141619] hover:text-white'}`}>
                  <Icon name={item.icon} size={15} />
                  {item.label}
                </button>
              ))}
            </div>
          ))}
        </nav>
        {user.plan === 'free' && !demoMode && (
          <button onClick={onUpgrade}
            className="card p-4 text-left mb-3 hover:border-[#B8FF5A] transition"
            style={{ borderColor: 'var(--border)' }}>
            <div className="flex items-center gap-2 mb-1">
              <span style={{ color: '#B8FF5A' }}>⚡</span>
              <span className="text-sm font-semibold">Passer Starter</span>
            </div>
            <div className="text-xs text-[#A0A3A8]">Dès 2,99€/mois</div>
          </button>
        )}
        <div className="flex items-center gap-3 p-2">
          <div className="w-8 h-8 rounded-full bg-[#26292E] flex items-center justify-center text-sm font-semibold">
            {user.name[0]?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm truncate">{user.name}</div>
            <div className="text-xs text-[#6E7074] uppercase font-mono">{user.plan}</div>
          </div>
        </div>
      </aside>

      {/* ── MOBILE HEADER ── */}
      <div className={`md:hidden fixed left-0 right-0 z-30 flex items-center justify-between px-5 py-3 ${demoMode ? 'top-8' : 'top-0'}`}
        style={{ background: 'var(--header-bg, rgba(10,11,13,0.92))', backdropFilter: 'blur(14px)', borderBottom: '1px solid var(--border)' }}>
        <Logo />
        <button onClick={() => setMobileMenu(!mobileMenu)} className="p-1.5 rounded-lg transition relative"
          style={{ color: 'var(--text)' }}>
          <Icon name={mobileMenu ? 'x' : 'menu'} size={22} />
          {alertCount > 0 && !mobileMenu && (
            <div className="absolute top-0.5 right-0.5 w-2.5 h-2.5 rounded-full"
              style={{ background: '#FF6B6B', border: '1.5px solid var(--bg)' }} />
          )}
        </button>
      </div>

      {/* ── BOTTOM TAB BAR (mobile) ── */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 flex items-stretch"
        style={{ background: 'var(--header-bg, rgba(10,11,13,0.95))', backdropFilter: 'blur(16px)', borderTop: '1px solid var(--border)', paddingBottom: 'env(safe-area-inset-bottom, 0px)', height: '62px' }}>
        {[
          { id: 'dashboard',   icon: 'home',   label: 'Accueil' },
          { id: 'assets',      icon: 'wallet', label: 'Actifs' },
          { id: 'simulator',   icon: 'calc',   label: 'Simuler' },
          { id: 'learn',       icon: 'book',   label: 'Apprendre' },
          { id: 'settings',   icon: 'settings', label: 'Réglages' },
        ].map(tab => {
          const isMore = false;
          const isActive = isMore ? mobileMenu : (active === tab.id);
          return (
            <button key={tab.id}
              onClick={() => { if (isMore) { setMobileMenu(!mobileMenu); } else { onNavigate(tab.id); setMobileMenu(false); } }}
              className="flex-1 flex flex-col items-center justify-center gap-0.5 transition-all"
              style={{ color: isActive ? '#B8FF5A' : 'var(--text-3)' }}>
              <div className="relative">
                <Icon name={tab.icon} size={21} />
                {isActive && (
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full" style={{ background: '#B8FF5A' }} />
                )}
                {tab.id === 'dashboard' && alertCount > 0 && !isActive && (
                  <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full"
                    style={{ background: '#FF6B6B', border: '1.5px solid var(--bg)' }} />
                )}
              </div>
              <span className="text-[9px] font-mono uppercase tracking-wider" style={{ lineHeight: 1.2 }}>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── SLIDE-UP DRAWER (mobile "Plus") ── */}
      {mobileMenu && (
        <div className="md:hidden fixed inset-0 z-20 fade-in" style={{ background: 'rgba(0,0,0,0.5)' }}
          onClick={() => setMobileMenu(false)}>
          <div className="absolute bottom-0 left-0 right-0 rounded-t-2xl px-5 pt-5 pb-8 scale-in"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', maxHeight: '80vh', overflowY: 'auto' }}
            onClick={e => e.stopPropagation()}>
            {/* Handle */}
            <div className="w-10 h-1 rounded-full mx-auto mb-5" style={{ background: 'var(--border-2)' }} />
            <nav className="space-y-5">
              {navGroups.map(group => (
                <div key={group.label}>
                  <div className="text-[9px] font-mono uppercase tracking-widest mb-2" style={{ color: 'var(--text-3)' }}>
                    {group.label}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {group.items.map(item => (
                      <button key={item.id}
                        onClick={() => { onNavigate(item.id); setMobileMenu(false); }}
                        className="flex items-center gap-3 px-3 py-3 rounded-xl text-left transition"
                        style={{
                          background: active === item.id ? '#B8FF5A15' : 'var(--bg-subtle)',
                          border: active === item.id ? '1px solid #B8FF5A40' : '1px solid transparent',
                          color: active === item.id ? '#B8FF5A' : 'var(--text)',
                        }}>
                        <Icon name={item.icon} size={16} />
                        <span className="text-sm">{item.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              <div className="pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
                <button onClick={() => { onLogout(); setMobileMenu(false); }}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-xl"
                  style={{ color: '#FF6B6B', background: '#FF6B6B10' }}>
                  <Icon name="logout" size={16} />
                  <span className="text-sm">{demoMode ? 'Quitter la démo' : 'Se déconnecter'}</span>
                </button>
              </div>
            </nav>
          </div>
        </div>
      )}

      <main className={`flex-1 px-5 md:px-10 pb-24 md:pb-10 relative z-10 max-w-[1400px] overflow-x-hidden ${demoMode ? 'pt-28 md:pt-16' : 'pt-20 md:pt-10'}`}>
        {children}
      </main>
    </div>
  );
};

/* ========== PEA WIDGET ========== */

const PeaWidget = ({ peas }) => {
  const peasWithDate = peas.filter(p => p.openedAt);
  if (peasWithDate.length === 0) return null;

  const primary = peasWithDate.reduce((oldest, p) =>
    new Date(p.openedAt) < new Date(oldest.openedAt) ? p : oldest
  );
  const info = getPeaInfo(primary);
  if (!info) return null;

  const circData = [{ name: 'p', value: info.progress, fill: info.exempt ? '#B8FF5A' : '#E8C547' }];

  return (
    <div className="card p-6 fade-up delay-2" style={{
      background: info.exempt
        ? 'linear-gradient(135deg, #141619 0%, #1A2A1A 100%)'
        : 'linear-gradient(135deg, #141619 0%, #1A1D21 100%)',
      borderColor: info.exempt ? '#B8FF5A40' : '#E8C54740'
    }}>
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">📈</span>
            <div className="text-xs text-[#6E7074] font-mono uppercase tracking-wider">
              Impôts PEA {peasWithDate.length > 1 ? `· ${peasWithDate.length} PEA` : ''}
            </div>
          </div>
          {info.exempt ? (
            <div className="font-serif text-3xl text-[#B8FF5A]">Exonéré d'impôt ✓</div>
          ) : (
            <div className="font-serif text-3xl">
              <span className="shimmer-gold">{info.years} ans {info.months} mois</span>
              <span className="text-sm text-[#A0A3A8] font-sans ml-2">restants</span>
            </div>
          )}
        </div>
        <div className="w-20 h-20 flex-shrink-0">
          <ResponsiveContainer>
            <RadialBarChart data={circData} innerRadius="70%" outerRadius="100%" startAngle={90} endAngle={-270}>
              <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
              <RadialBar dataKey="value" cornerRadius={10} background={{ fill: 'var(--border)' }} />
            </RadialBarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {!info.exempt && info.gain > 0 && (
        <div className="grid grid-cols-2 gap-3 pt-4 border-t border-[#26292E]">
          <div>
            <div className="text-[10px] text-[#6E7074] font-mono uppercase tracking-wider mb-1">Impôt si retrait auj.</div>
            <div className="font-mono text-lg text-[#FF6B6B]">−{fmt(info.taxBefore5)}</div>
          </div>
          <div>
            <div className="text-[10px] text-[#6E7074] font-mono uppercase tracking-wider mb-1">Économie si tu attends</div>
            <div className="font-mono text-lg text-[#B8FF5A]">{fmt(info.savings)}</div>
          </div>
        </div>
      )}
      {info.exempt && (
        <div className="text-xs text-[#A0A3A8] mt-2">
          Tu ne payes plus que les prélèvements sociaux (17,2%) sur les gains. Retraits libres sans fermeture.
        </div>
      )}
    </div>
  );
};

/* ========== DASHBOARD ========== */

const StatCard = ({ label, value, change, hidden }) => (
  <div className="card p-4">
    <div className="text-[10px] text-[#6E7074] font-mono uppercase tracking-wider mb-2">{label}</div>
    <div className="font-mono text-xl md:text-2xl">{hidden ? '••••' : value}</div>
    {change !== undefined && (
      <div className={`text-xs font-mono mt-1 ${change >= 0 ? 'text-[#B8FF5A]' : 'text-[#FF6B6B]'}`}>
        {hidden ? '••' : (change >= 0 ? '▲' : '▼') + ' ' + fmtPct(Math.abs(change))}
      </div>
    )}
  </div>
);


/* ========== ALLOCATION ========== */
const DonutAllocation = ({ allocation, total, hideValues }) => {
  const [hovered, setHovered] = React.useState(null);
  const active = hovered !== null ? allocation[hovered] : null;

  return (
    <div className="card p-5 fade-up">
      <div className="flex items-center justify-between mb-4">
        <div className="text-[10px] text-[#6E7074] font-mono uppercase tracking-widest">Répartition</div>
        {active && (
          <div className="flex items-center gap-1.5 text-xs font-mono" style={{ color: active.color }}>
            {active.emoji} {active.pct.toFixed(1)}% · {hideValues ? '••••' : fmt(active.value)}
          </div>
        )}
      </div>

      {/* Barre empilée */}
      <div className="flex rounded-xl overflow-hidden mb-5" style={{ height: 10 }}>
        {allocation.map((a, i) => (
          <div key={a.type}
            style={{
              width: `${a.pct}%`,
              background: a.color,
              opacity: hovered !== null && hovered !== i ? 0.25 : 1,
              transition: 'opacity 0.2s ease',
              cursor: 'pointer',
            }}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
            onTouchStart={() => setHovered(i)}
            onTouchEnd={() => setTimeout(() => setHovered(null), 1500)}
          />
        ))}
      </div>

      {/* Liste */}
      <div className="space-y-1">
        {allocation.map((a, i) => (
          <div key={a.type}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition cursor-pointer"
            style={{
              background: hovered === i ? a.color + '12' : 'transparent',
              border: hovered === i ? `1px solid ${a.color}30` : '1px solid transparent',
            }}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
            onTouchStart={() => setHovered(i)}
            onTouchEnd={() => setTimeout(() => setHovered(null), 1500)}>
            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: a.color }} />
            <span className="text-sm flex-1">{a.emoji} {a.label}</span>
            <span className="font-mono text-sm font-semibold" style={{ color: a.color }}>
              {a.pct.toFixed(1)}%
            </span>
            {!hideValues && (
              <span className="font-mono text-xs text-[#6E7074] w-16 text-right" style={{ fontVariantNumeric: 'tabular-nums' }}>
                {fmt(a.value)}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Total */}
      <div className="flex items-center justify-between pt-3 mt-2" style={{ borderTop: '1px solid var(--border)' }}>
        <span className="text-xs text-[#6E7074] font-mono uppercase tracking-wider">Total patrimoine</span>
        <span className="font-mono font-bold">{hideValues ? '••••••' : fmt(total)}</span>
      </div>
    </div>
  );
};

const Dashboard = ({ user, assets, history, contributions, dismissedAlerts, onDismissAlert, onAdd, onLogContribution, onNavigate, onMilestone, onAssetClick }) => {
  const [hideValues, setHideValues] = useState(false);
  const [period, setPeriod]         = useState('1M'); // 7J | 1M | 3M | 1AN | MAX

  const total    = assets.reduce((s, a) => s + (a.value || 0), 0);
  const invested = assets.reduce((s, a) => s + (a.invested || a.value || 0), 0);
  const gain     = total - invested;
  const gainPct  = invested > 0 ? (gain / invested) * 100 : 0;

  const passiveMonthly = assets.reduce((s, a) => s + ((a.value || 0) * (a.yield || 0)) / 100, 0) / 12;

  const findSnapshot = (daysAgo) => {
    const target = new Date(); target.setDate(target.getDate() - daysAgo);
    const targetStr = target.toISOString().slice(0, 10);
    return [...history].sort((a, b) => a.date.localeCompare(b.date)).filter(h => h.date <= targetStr).pop()?.value || null;
  };
  const snap7   = findSnapshot(7);
  const snap30  = findSnapshot(30);
  const snap90  = findSnapshot(90);
  const snap365 = findSnapshot(365);
  const pct     = (old) => old && old > 0 ? ((total - old) / old) * 100 : 0;

  const PERIODS = [
    { id: '7J',  label: '7J',   days: 7,   snap: snap7 },
    { id: '1M',  label: '1M',   days: 30,  snap: snap30 },
    { id: '3M',  label: '3M',   days: 90,  snap: snap90 },
    { id: '1AN', label: '1 AN', days: 365, snap: snap365 },
    { id: 'MAX', label: 'MAX',  days: 9999, snap: null },
  ];
  const activePeriod = PERIODS.find(p => p.id === period);
  const periodSnap   = activePeriod.snap;
  const periodGain   = periodSnap ? total - periodSnap : gain;
  const periodPct    = periodSnap ? pct(periodSnap) : gainPct;
  const isUp         = periodGain >= 0;

  // Chart data filtered by period
  const chartData = useMemo(() => {
    const daysAgo = activePeriod.days;
    const cutoff  = new Date(); cutoff.setDate(cutoff.getDate() - daysAgo);
    const cutStr  = cutoff.toISOString().slice(0, 10);
    let data = history.length > 1
      ? (daysAgo === 9999 ? history : history.filter(h => h.date >= cutStr))
      : [];
    if (data.length < 3) {
      // generate plausible demo data
      const days = Math.min(daysAgo === 9999 ? 90 : daysAgo, 90);
      data = Array.from({ length: days + 1 }, (_, i) => {
        const d = new Date(); d.setDate(d.getDate() - (days - i));
        const prog = i / days;
        const noise = (Math.sin(i * 0.7) * 0.02) + (Math.random() - 0.48) * 0.015;
        return { date: d.toISOString().slice(0, 10), value: Math.round(total * (0.82 + prog * 0.18 + noise)) };
      });
    }
    // Thin out if too many points
    const maxPts = 60;
    if (data.length > maxPts) {
      const step = Math.floor(data.length / maxPts);
      data = data.filter((_, i) => i % step === 0 || i === data.length - 1);
    }
    return data.map((h, i, arr) => {
      const d = new Date(h.date);
      let label = '';
      if (arr.length <= 14) label = d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
      else if (i === 0 || i === arr.length - 1 || i % Math.floor(arr.length / 5) === 0)
        label = d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
      return { ...h, label };
    });
  }, [history, period, total]);

  const chartMin = chartData.length ? Math.min(...chartData.map(d => d.value)) * 0.995 : 0;
  const chartMax = chartData.length ? Math.max(...chartData.map(d => d.value)) * 1.005 : total;
  const chartColor = isUp ? '#B8FF5A' : '#FF6B6B';
  const gradId = isUp ? 'gradUp' : 'gradDown';

  const allocation = Object.entries(
    assets.reduce((acc, a) => { acc[a.type] = (acc[a.type] || 0) + a.value; return acc; }, {})
  ).map(([type, value]) => ({
    type, value, pct: total > 0 ? (value / total) * 100 : 0, ...ASSET_TYPES[type]
  })).sort((a, b) => b.value - a.value);

  const bench      = getBenchmark(user.age);
  const percentile = total > 0 ? getPercentile(total, bench) : 0;
  const peas       = assets.filter(a => a.type === 'pea');
  const unlocked   = getUnlockedAchievements(assets, total, user);
  const fmtH       = (v) => hideValues ? '••••' : fmt(v);

  // Alerts
  const activeAlerts = getAlerts(assets, total).filter(a => !(dismissedAlerts || []).includes(a.id));

  // Contributions
  const now = new Date();
  const thisMonth = now.toISOString().slice(0, 7);
  const contribs  = contributions || [];
  const thisMonthTotal = contribs.filter(c => c.date.startsWith(thisMonth)).reduce((s, c) => s + c.amount, 0);
  const last6Months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    return d.toISOString().slice(0, 7);
  });
  const contribChart = last6Months.map(m => {
    const mc   = contribs.filter(c => c.date.startsWith(m)).reduce((s, c) => s + c.amount, 0);
    const ms   = history.filter(h => h.date.startsWith(m)).sort((a,b) => b.date.localeCompare(a.date))[0];
    const pm   = new Date(parseInt(m.slice(0,4)), parseInt(m.slice(5,7)) - 2, 1).toISOString().slice(0,7);
    const ps   = history.filter(h => h.date.startsWith(pm)).sort((a,b) => b.date.localeCompare(a.date))[0];
    const mkt  = Math.max(0, ((ms?.value||0) - (ps?.value||0)) - mc);
    return { month: new Date(m+'-01').toLocaleDateString('fr-FR',{month:'short'}), apports: mc, marché: mkt };
  });
  const hasContribData = contribChart.some(d => d.apports > 0);

  if (assets.length === 0) return (
    <div className="fade-up pb-10">
      {/* Hero vide */}
      <div className="text-center pt-10 pb-8">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-6"
          style={{ background: 'linear-gradient(135deg, #B8FF5A20, #B8FF5A08)', border: '1px solid #B8FF5A30' }}>
          <span style={{ fontSize: 36 }}>🌱</span>
        </div>
        <h2 className="font-serif text-4xl mb-3">Ton magot t'attend.</h2>
        <p className="text-[#A0A3A8] text-sm leading-relaxed mb-8 max-w-xs mx-auto">
          Ajoute ton premier actif et découvre instantanément où tu te situes face aux autres jeunes de ton âge.
        </p>
        <button onClick={onAdd}
          className="btn-primary px-8 py-3.5 rounded-full text-sm font-semibold flex items-center gap-2 mx-auto">
          <Icon name="plus" size={14} /> Ajouter mon premier actif
        </button>
      </div>

      {/* Preview de ce qui t'attend */}
      <div className="text-[10px] text-[#6E7074] font-mono uppercase tracking-widest text-center mb-4">Ce que tu vas débloquer</div>
      <div className="grid grid-cols-2 gap-3 mb-6">
        {[
          { emoji: '📊', title: 'Ton rang', desc: 'Top X% à ton âge', color: '#E8C547' },
          { emoji: '🔥', title: 'Trophées', desc: '12 paliers à débloquer', color: '#B8FF5A' },
          { emoji: '🎯', title: 'FIRE', desc: "L'âge où tu peux arrêter", color: '#7BB3FF' },
          { emoji: '🤖', title: 'Analyse IA', desc: '3 actions concrètes', color: '#B598FF' },
        ].map((f, i) => (
          <div key={i} className="card p-4 flex items-center gap-3 opacity-60">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 text-lg"
              style={{ background: f.color + '15', border: '1px solid ' + f.color + '30' }}>
              {f.emoji}
            </div>
            <div>
              <div className="text-sm font-semibold">{f.title}</div>
              <div className="text-[11px] text-[#6E7074]">{f.desc}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Types d'actifs disponibles */}
      <div className="card p-5">
        <div className="text-[10px] text-[#6E7074] font-mono uppercase tracking-widest mb-4">8 types de placements supportés</div>
        <div className="grid grid-cols-4 gap-3">
          {Object.entries(ASSET_TYPES).map(([k, v]) => (
            <button key={k} onClick={onAdd}
              className="flex flex-col items-center gap-1.5 p-2 rounded-lg transition hover:scale-105"
              style={{ background: v.color + '10', border: '1px solid ' + v.color + '20' }}>
              <span className="text-xl">{v.emoji}</span>
              <span className="text-[9px] font-mono uppercase tracking-wide" style={{ color: v.color }}>{v.label}</span>
            </button>
          ))}
        </div>
        <button onClick={onAdd}
          className="btn-ghost w-full py-3 rounded-full text-sm mt-4">
          Commencer →
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-5">

      {/* ── 1. HERO — patrimoine + gain ─────────────────── */}
      <div className="fade-up">
        <div className="flex items-start justify-between mb-1">
          <div className="text-[10px] text-[#6E7074] font-mono uppercase tracking-widest">Patrimoine net</div>
          <button onClick={onAdd}
            className="btn-primary px-4 py-2 rounded-full text-xs flex items-center gap-1.5 flex-shrink-0">
            <Icon name="plus" size={12} /> Actif
          </button>
        </div>
        <div className="flex items-center gap-3 mb-2">
          <div className="font-serif text-4xl sm:text-5xl leading-none" style={{ fontVariantNumeric: 'tabular-nums' }}>
            {fmtH(total)}
          </div>
          <button onClick={() => setHideValues(!hideValues)}
            className="text-[#6E7074] hover:text-white transition mt-1">
            <Icon name={hideValues ? 'eyeoff' : 'eye'} size={16} />
          </button>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="font-mono" style={{ color: gain >= 0 ? '#B8FF5A' : '#FF6B6B' }}>
            {gain >= 0 ? '▲' : '▼'} {fmtH(Math.abs(gain))} ({fmtPct(gainPct)})
          </span>
          <span className="text-[#3A3F46]">·</span>
          <span className="text-[#6E7074] text-xs">depuis investi</span>
        </div>
      </div>

      {/* ── 2. ALERTES ──────────────────────────────────── */}
      {activeAlerts.length > 0 && (
        <div className="space-y-2 fade-up">
          {activeAlerts.map(alert => (
            <div key={alert.id}
              className="rounded-2xl p-4 flex items-start justify-between gap-3"
              style={{
                background: alert.level === 'danger' ? '#1A141420' : alert.level === 'warning' ? '#1A1A0E' : '#141A1E',
                border: `1px solid ${alert.level === 'danger' ? '#FF6B6B25' : alert.level === 'warning' ? '#E8C54725' : '#7BB3FF25'}`,
              }}>
              <div className="flex items-start gap-3 min-w-0">
                <span className="text-base flex-shrink-0 mt-0.5">{alert.emoji}</span>
                <div className="min-w-0">
                  <div className="text-sm font-semibold mb-0.5"
                    style={{ color: alert.level === 'danger' ? '#FF6B6B' : alert.level === 'warning' ? '#E8C547' : '#7BB3FF' }}>
                    {alert.title}
                  </div>
                  <p className="text-xs text-[#6E7074] leading-relaxed">{alert.desc}</p>
                </div>
              </div>
              <button onClick={() => onDismissAlert(alert.id)}
                className="text-[#3A3F46] hover:text-white transition flex-shrink-0">
                <Icon name="x" size={13} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ── 3. GRAPHIQUE — période sélectionnable ────────── */}
      <div className="card p-5 fade-up">
        {/* En-tête du graph */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="text-[10px] text-[#6E7074] font-mono uppercase tracking-widest mb-1">Performance</div>
            <div className="flex items-baseline gap-2">
              <span className="font-serif text-2xl" style={{ color: chartColor, fontVariantNumeric: 'tabular-nums' }}>
                {isUp ? '+' : ''}{hideValues ? '••••' : fmt(Math.abs(periodGain))}
              </span>
              <span className="text-sm font-mono" style={{ color: chartColor }}>
                {isUp ? '+' : ''}{periodPct.toFixed(2)}%
              </span>
            </div>
          </div>
          {/* Sélecteur période */}
          <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'var(--bg-input)' }}>
            {PERIODS.map(p => (
              <button key={p.id} onClick={() => setPeriod(p.id)}
                className="px-2.5 py-1 rounded-lg text-[10px] font-mono uppercase transition"
                style={{
                  background: period === p.id ? 'var(--bg-subtle)' : 'transparent',
                  color: period === p.id ? 'var(--text)' : '#4A4D52',
                  fontWeight: period === p.id ? 600 : 400,
                }}>
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Chart — hauteur fixe */}
        <div style={{ height: 180 }}>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={chartData} margin={{ top: 4, right: 0, left: -28, bottom: 0 }}>
              <defs>
                <linearGradient id="gradUp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="#B8FF5A" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#B8FF5A" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradDown" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="#FF6B6B" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#FF6B6B" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="label"
                tick={{ fontSize: 9, fill: 'var(--border-2)' }}
                axisLine={false} tickLine={false}
                interval="preserveStartEnd" />
              <YAxis
                domain={[chartMin, chartMax]}
                tick={{ fontSize: 9, fill: 'var(--border-2)' }}
                axisLine={false} tickLine={false}
                tickFormatter={v => hideValues ? '•' : v >= 1000000 ? `${(v/1000000).toFixed(1)}M` : `${Math.round(v/1000)}k`} />
              <Tooltip
                contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, fontSize: 11 }}
                formatter={v => [hideValues ? '••••' : fmt(v), 'Patrimoine']}
                labelFormatter={l => l} />
              <Area type="monotone" dataKey="value"
                stroke={chartColor} strokeWidth={2}
                fill={`url(#${gradId})`} dot={false}
                activeDot={{ r: 4, fill: chartColor, strokeWidth: 0 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── 4. STATS 4 PÉRIODES — scroll horizontal mobile ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 fade-up">
        {[
          { label: '7J',   val: total - (snap7   || total), pct: pct(snap7) },
          { label: '1M',   val: total - (snap30  || total), pct: pct(snap30) },
          { label: '1 AN', val: total - (snap365 || total), pct: pct(snap365) },
          { label: 'Total',val: gain,                        pct: gainPct },
        ].map(s => (
          <div key={s.label} className="card p-3 text-center">
            <div className="text-[9px] text-[#6E7074] font-mono uppercase tracking-wider mb-1.5">{s.label}</div>
            <div className="font-mono text-xs font-semibold leading-none mb-1 truncate"
              style={{ color: s.val >= 0 ? '#B8FF5A' : '#FF6B6B', fontVariantNumeric: 'tabular-nums' }}>
              {hideValues ? '••' : s.val >= 0 ? `+${fmt(s.val)}` : fmt(s.val)}
            </div>
            <div className="text-[10px] font-mono" style={{ color: s.pct >= 0 ? '#4A4D52' : '#FF6B6B50' }}>
              {s.pct >= 0 ? '+' : ''}{s.pct.toFixed(1)}%
            </div>
          </div>
        ))}
      </div>

      {/* ── 5. APPORTS CE MOIS ───────────────────────────── */}
      <div className="card p-5 fade-up">
        <div className="flex items-center justify-between mb-5">
          <div className="text-[10px] text-[#6E7074] font-mono uppercase tracking-widest">Mes investissements</div>
          <button onClick={onLogContribution}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono transition"
            style={{ border: '1px solid #B8FF5A30', color: '#B8FF5A', background: '#B8FF5A10' }}>
            <Icon name="plus" size={10} /> Ajouter
          </button>
        </div>

        {/* Deux stats clés */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="rounded-xl p-4" style={{ background: '#B8FF5A10', border: '1px solid #B8FF5A20' }}>
            <div className="text-[10px] text-[#B8FF5A] font-mono uppercase tracking-wider mb-2">💸 Versé ce mois</div>
            <div className="font-serif text-2xl" style={{ fontVariantNumeric: 'tabular-nums' }}>
              {hideValues ? '••••' : thisMonthTotal > 0 ? `+${fmt(thisMonthTotal)}` : '—'}
            </div>
            <div className="text-[11px] text-[#6E7074] mt-1">ton effort d'épargne</div>
          </div>
          <div className="rounded-xl p-4" style={{ background: '#7BB3FF10', border: '1px solid #7BB3FF20' }}>
            <div className="text-[10px] text-[#7BB3FF] font-mono uppercase tracking-wider mb-2">📈 Revenus passifs</div>
            <div className="font-serif text-2xl text-[#7BB3FF]" style={{ fontVariantNumeric: 'tabular-nums' }}>
              {hideValues ? '••••' : passiveMonthly > 0 ? `+${fmt(Math.round(passiveMonthly))}/m` : '—'}
            </div>
            <div className="text-[11px] text-[#6E7074] mt-1">l'argent qui travaille</div>
          </div>
        </div>

        {/* Historique simplifié */}
        {hasContribData ? (
          <div>
            <div className="text-[10px] text-[#6E7074] font-mono uppercase tracking-widest mb-3">Tes 6 derniers mois</div>
            <div className="space-y-2">
              {contribChart.slice(-4).map((m, i) => {
                const max = Math.max(...contribChart.map(x => x.apports || 0), 1);
                const pct = ((m.apports || 0) / max) * 100;
                return (
                  <div key={i} className="flex items-center gap-3">
                    <div className="text-xs text-[#6E7074] font-mono w-10 flex-shrink-0">{m.month}</div>
                    <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg-subtle)' }}>
                      <div className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%`, background: '#B8FF5A' }} />
                    </div>
                    <div className="text-xs font-mono text-[#A0A3A8] w-14 text-right" style={{ fontVariantNumeric: 'tabular-nums' }}>
                      {hideValues ? '••••' : m.apports > 0 ? `+${fmt(m.apports)}` : '—'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="rounded-xl p-4 text-center" style={{ background: 'var(--bg-subtle)', border: '1px dashed var(--border)' }}>
            <div className="text-2xl mb-2">💡</div>
            <p className="text-xs text-[#6E7074] leading-relaxed">
              Note tes versements mensuels pour mesurer ta <span style={{ color: '#B8FF5A' }}>discipline d'épargne</span> au fil du temps.
            </p>
          </div>
        )}
      </div>

      {/* ── 6. RÉPARTITION — donut chart interactif ─────── */}
      <DonutAllocation allocation={allocation} total={total} hideValues={hideValues} />

      {/* ── 7. ACTIFS + RANG — 2 colonnes ────────────────── */}
      <div className="grid lg:grid-cols-2 gap-4 fade-up">
        {/* Actifs */}
        <div className="card p-5">
          <div className="text-[10px] text-[#6E7074] font-mono uppercase tracking-widest mb-3">Mes actifs</div>
          <div className="space-y-0.5">
            {assets.slice().sort((a, b) => b.value - a.value).slice(0, 6).map((a, i) => {
              const g  = (a.value || 0) - (a.invested || a.value || 0);
              const gp = a.invested > 0 ? (g / a.invested) * 100 : 0;
              const barW = total > 0 ? (a.value / total) * 100 : 0;
              return (
                <button key={a.id} onClick={() => onAssetClick(a)}
                  className="w-full flex items-center gap-3 py-2.5 rounded-xl px-2 -mx-2 transition hover:bg-[#1A1D21]">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center text-base flex-shrink-0"
                    style={{ background: ASSET_TYPES[a.type]?.color + '18' }}>
                    {ASSET_TYPES[a.type]?.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm truncate">{a.name}</span>
                      <span className="font-mono text-sm ml-2 flex-shrink-0" style={{ fontVariantNumeric: 'tabular-nums' }}>
                        {fmtH(a.value)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="h-1 rounded-full flex-1 mr-3 overflow-hidden" style={{ background: 'var(--bg-subtle)' }}>
                        <div className="h-full rounded-full" style={{ width: `${barW}%`, background: ASSET_TYPES[a.type]?.color + '80' }} />
                      </div>
                      <span className="text-[10px] font-mono flex-shrink-0"
                        style={{ color: gp >= 0 ? '#B8FF5A' : '#FF6B6B' }}>
                        {gp >= 0 ? '+' : ''}{gp.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Rang + PEA */}
        <div className="space-y-4">
          <button className="card p-5 w-full text-left hover:border-[#E8C54740] transition"
            onClick={() => onNavigate('leaderboard')}>
            <div className="flex items-center gap-2 mb-3">
              <span style={{ color: '#E8C547' }}><Icon name="trophy" size={14} /></span>
              <div className="text-[10px] text-[#6E7074] font-mono uppercase tracking-wider">
                Ton rang · {user.age} ans
              </div>
            </div>
            <div className="flex items-end justify-between mb-3">
              <div>
                <div className="font-serif text-4xl" style={{ color: '#E8C547' }}>
                  Top {100 - percentile}%
                </div>
                <div className="text-xs text-[#6E7074] mt-0.5">
                  mieux que {percentile}% de tes pairs
                </div>
              </div>
              <Icon name="arrow" size={16} className="text-[#3A3F46] mb-1" />
            </div>
            {/* Mini barres benchmark */}
            <div className="space-y-1.5">
              {[
                { label: 'Médiane', val: bench.median },
                { label: 'Top 25%', val: bench.p75 },
                { label: 'Top 10%', val: bench.p90 },
              ].map(r => (
                <div key={r.label} className="flex items-center gap-2">
                  <span className="text-[9px] font-mono text-[#4A4D52] w-14">{r.label}</span>
                  <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: 'var(--bg-subtle)' }}>
                    <div className="h-full rounded-full" style={{
                      width: `${Math.min(100, (total / r.val) * 100)}%`,
                      background: total >= r.val ? '#E8C547' : 'var(--border-2)',
                    }} />
                  </div>
                  <span className="text-[9px] font-mono text-[#4A4D52] w-14 text-right">{fmtH(r.val)}</span>
                </div>
              ))}
            </div>
          </button>

          {/* PEA si dispo */}
          {peas.some(p => p.openedAt) && <PeaWidget peas={peas} />}
        </div>
      </div>

      {/* ── 8. TROPHÉES + CARTES TIKTOK ─────────────────── */}
      <div className="card p-5 fade-up">
        <div className="flex items-center justify-between mb-4">
          <div className="text-[10px] text-[#6E7074] font-mono uppercase tracking-widest">Trophées</div>
          <div className="text-[10px] font-mono text-[#4A4D52]">{unlocked.size} / {ACHIEVEMENTS.length}</div>
        </div>
        <div className="grid grid-cols-4 gap-2 mb-4">
          {ACHIEVEMENTS.slice(0, 8).map(a => {
            const got = unlocked.has(a.id);
            return (
              <div key={a.id} className="rounded-xl p-2.5 text-center"
                style={{ background: got ? 'var(--bg-subtle)' : 'var(--bg-input)', border: `1px solid ${got ? '#B8FF5A30' : 'var(--bg-subtle)'}` }}>
                <div className="text-xl mb-0.5" style={{ filter: got ? 'none' : 'grayscale(1) opacity(0.3)' }}>{a.emoji}</div>
                <div className="text-[8px] font-mono uppercase tracking-wide leading-tight"
                  style={{ color: got ? '#A0A3A8' : 'var(--border-2)' }}>{a.label}</div>
              </div>
            );
          })}
        </div>

        {/* ── Cartes TikTok ── */}
        {unlocked.size > 0 && (
          <div className="pt-4 border-t border-[#1E2126]">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-base">📱</span>
              <div className="text-[10px] text-[#6E7074] font-mono uppercase tracking-widest">Cartes à partager</div>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {ACHIEVEMENTS.filter(a => unlocked.has(a.id) && typeof a.threshold === 'number').map(a => (
                <button key={a.id}
                  onClick={() => onMilestone && onMilestone(a)}
                  className="flex-shrink-0 flex flex-col items-center gap-2 p-3 rounded-2xl transition"
                  style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', minWidth: 80 }}
                  onMouseEnter={e => e.currentTarget.style.borderColor='#B8FF5A40'}
                  onMouseLeave={e => e.currentTarget.style.borderColor='var(--border)'}>
                  <div className="text-2xl">{a.emoji}</div>
                  <div className="text-[9px] font-mono text-[#6E7074] text-center leading-tight">{a.label}</div>
                  <div className="text-[9px] font-mono text-[#B8FF5A]">↗ Générer</div>
                </button>
              ))}
            </div>
            <p className="text-[10px] text-[#3A3F46] mt-3">
              Génère une carte au format TikTok / Instagram pour chaque palier atteint.
            </p>
          </div>
        )}
      </div>

    </div>
  );
};
/* ========== ASSETS ========== */

const SORT_OPTIONS = [
  { id: 'value-desc', label: '💰 Valeur ↓' },
  { id: 'value-asc',  label: '💰 Valeur ↑' },
  { id: 'perf-desc',  label: '📈 Perf ↓' },
  { id: 'perf-asc',   label: '📈 Perf ↑' },
  { id: 'name-asc',   label: '🔤 Nom A→Z' },
];

const Assets = ({ assets, onAdd, onClick }) => {
  const [filter, setFilter] = useState('all');
  const [sort, setSort]     = useState('value-desc');
  const [showSort, setShowSort] = useState(false);

  const filtered = (filter === 'all' ? assets : assets.filter(a => a.type === filter))
    .slice()
    .sort((a, b) => {
      const gainPct = x => x.invested > 0 ? ((x.value - x.invested) / x.invested) * 100 : 0;
      if (sort === 'value-desc') return b.value - a.value;
      if (sort === 'value-asc')  return a.value - b.value;
      if (sort === 'perf-desc')  return gainPct(b) - gainPct(a);
      if (sort === 'perf-asc')   return gainPct(a) - gainPct(b);
      if (sort === 'name-asc')   return a.name.localeCompare(b.name);
      return 0;
    });

  const totalFiltered = filtered.reduce((s, a) => s + (a.value || 0), 0);
  const currentSort = SORT_OPTIONS.find(o => o.id === sort);

  return (
    <div className="fade-up">
      <div className="flex items-start justify-between mb-5">
        <div>
          <h1 className="font-serif text-4xl mb-1">Actifs</h1>
          <p className="text-[#A0A3A8] text-sm">{assets.length} actif{assets.length > 1 ? 's' : ''} · {fmt(assets.reduce((s,a)=>s+(a.value||0),0))}</p>
        </div>
        <button onClick={onAdd} className="btn-primary px-4 py-2.5 rounded-full text-sm flex items-center gap-2 flex-shrink-0">
          <Icon name="plus" size={14} /> Nouveau
        </button>
      </div>

      {/* Filtres type */}
      <div className="flex gap-2 mb-3 flex-wrap">
        <FilterChip active={filter === 'all'} onClick={() => setFilter('all')}>Tous</FilterChip>
        {Object.entries(ASSET_TYPES).map(([k, v]) => {
          const count = assets.filter(a => a.type === k).length;
          if (count === 0) return null;
          return (
            <FilterChip key={k} active={filter === k} onClick={() => setFilter(k)}>
              {v.emoji} {v.label} · {count}
            </FilterChip>
          );
        })}
      </div>

      {/* Tri */}
      <div className="flex items-center justify-between mb-5">
        <span className="text-xs text-[#6E7074]">
          {filtered.length} actif{filtered.length > 1 ? 's' : ''} · {fmt(totalFiltered)}
        </span>
        <div className="relative">
          <button onClick={() => setShowSort(!showSort)}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full transition"
            style={{ border: '1px solid var(--border)', color: '#A0A3A8' }}>
            {currentSort?.label} <Icon name="chevron" size={10} />
          </button>
          {showSort && (
            <div className="absolute right-0 top-8 rounded-xl shadow-xl z-20 overflow-hidden w-40"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              {SORT_OPTIONS.map(o => (
                <button key={o.id} onClick={() => { setSort(o.id); setShowSort(false); }}
                  className="w-full text-left px-4 py-2.5 text-xs transition"
                  style={{ background: sort === o.id ? '#B8FF5A15' : 'transparent', color: sort === o.id ? '#B8FF5A' : 'var(--text)' }}>
                  {o.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-[#A0A3A8]">Aucun actif dans cette catégorie.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((a, i) => (
            <AssetRow key={a.id} asset={a} index={i} onClick={() => onClick(a)} />
          ))}
        </div>
      )}
    </div>
  );
};

const FilterChip = ({ active, onClick, children }) => (
  <button onClick={onClick}
    className={`px-3.5 py-1.5 rounded-full text-xs transition ${active ? 'bg-[#B8FF5A] text-[#0A0B0D] font-semibold' : 'border border-[#26292E] text-[#A0A3A8] hover:text-white hover:border-[#3A3F46]'}`}>
    {children}
  </button>
);

const AssetRow = ({ asset, index, onClick }) => {
  const gain = (asset.value || 0) - (asset.invested || asset.value || 0);
  const gainPct = asset.invested > 0 ? (gain / asset.invested) * 100 : 0;
  const yearIncome = ((asset.value || 0) * (asset.yield || 0)) / 100;
  const meta = ASSET_TYPES[asset.type];
  const spark = asset.history && asset.history.length > 1
    ? asset.history.slice(-14).map((h, i) => ({ x: i, y: h.value }))
    : null;

  return (
    <button onClick={onClick}
      className="card p-4 flex items-center justify-between gap-3 fade-up w-full hover:border-[#B8FF5A50] transition text-left"
      style={{ animationDelay: `${index * 0.03}s` }}>
      <div className="flex items-center gap-4 min-w-0 flex-1">
        <div className="w-11 h-11 rounded-lg flex items-center justify-center text-xl flex-shrink-0"
          style={{ background: `${meta.color}15`, border: `1px solid ${meta.color}30` }}>
          {meta.emoji}
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-medium truncate">{asset.name}</div>
          <div className="text-xs text-[#6E7074] font-mono uppercase tracking-wider flex items-center gap-2 flex-wrap">
            <span>{meta.label}</span>
            {asset.yield > 0 && <span className="text-[#B8FF5A]">· {asset.yield}%/an · {fmt(yearIncome)}/an</span>}
          </div>
        </div>
      </div>

      {spark && (
        <div className="hidden md:block w-20 h-8 flex-shrink-0">
          <ResponsiveContainer>
            <LineChart data={spark}>
              <Line type="monotone" dataKey="y" stroke={gain >= 0 ? '#B8FF5A' : '#FF6B6B'} strokeWidth={1.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="text-right flex-shrink-0">
        <div className="font-mono text-base">{fmt(asset.value)}</div>
        {asset.invested > 0 && (
          <div className={`text-xs font-mono ${gain >= 0 ? 'text-[#B8FF5A]' : 'text-[#FF6B6B]'}`}>
            {gain >= 0 ? '+' : ''}{fmt(gain)} · {fmtPct(gainPct)}
          </div>
        )}
      </div>

      <Icon name="chevron" size={14} className="-rotate-90 text-[#6E7074] flex-shrink-0" />
    </button>
  );
};

/* ========== ASSET DETAIL (NEW v3) ========== */

const AssetDetail = ({ asset, onClose, onEdit, onQuickUpdate, onDelete }) => {
  const [newValue, setNewValue] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const meta = ASSET_TYPES[asset.type];
  const gain = (asset.value || 0) - (asset.invested || asset.value || 0);
  const gainPct = asset.invested > 0 ? (gain / asset.invested) * 100 : 0;
  const yearIncome = ((asset.value || 0) * (asset.yield || 0)) / 100;

  const history = asset.history && asset.history.length > 0 ? asset.history : [{ date: today(), value: asset.value }];
  const chartData = history.map(h => ({ date: h.date.slice(5), value: h.value, fullDate: h.date }));
  const peaInfo = asset.type === 'pea' ? getPeaInfo(asset) : null;

  const submitQuickUpdate = (e) => {
    e.preventDefault();
    const v = parseFloat(newValue);
    if (!isNaN(v) && v >= 0) {
      onQuickUpdate(v);
      setNewValue('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start md:items-center justify-center p-4 fade-in overflow-y-auto"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}>
      <div className="card p-6 w-full max-w-2xl scale-in my-8" onClick={e => e.stopPropagation()}>
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl flex-shrink-0"
              style={{ background: `${meta.color}15`, border: `1px solid ${meta.color}30` }}>
              {meta.emoji}
            </div>
            <div className="min-w-0">
              <h2 className="font-serif text-2xl truncate">{asset.name}</h2>
              <div className="text-xs text-[#6E7074] font-mono uppercase tracking-wider">{meta.label}</div>
            </div>
          </div>
          <button onClick={onClose} className="text-[#6E7074] hover:text-white transition flex-shrink-0">
            <Icon name="x" size={20} />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
          <div className="card p-3" style={{ background: 'var(--bg-input)' }}>
            <div className="text-[10px] text-[#6E7074] font-mono uppercase mb-1">Valeur</div>
            <div className="font-mono text-lg">{fmt(asset.value)}</div>
          </div>
          <div className="card p-3" style={{ background: 'var(--bg-input)' }}>
            <div className="text-[10px] text-[#6E7074] font-mono uppercase mb-1">Investi</div>
            <div className="font-mono text-lg">{fmt(asset.invested || asset.value)}</div>
          </div>
          <div className="card p-3" style={{ background: 'var(--bg-input)' }}>
            <div className="text-[10px] text-[#6E7074] font-mono uppercase mb-1">+/- Value</div>
            <div className={`font-mono text-lg ${gain >= 0 ? 'text-[#B8FF5A]' : 'text-[#FF6B6B]'}`}>
              {gain >= 0 ? '+' : ''}{fmt(gain)}
            </div>
            <div className={`text-[10px] font-mono ${gain >= 0 ? 'text-[#B8FF5A]' : 'text-[#FF6B6B]'}`}>
              {fmtPct(gainPct)}
            </div>
          </div>
          <div className="card p-3" style={{ background: 'var(--bg-input)' }}>
            <div className="text-[10px] text-[#6E7074] font-mono uppercase mb-1">Revenu/an</div>
            <div className="font-mono text-lg text-[#B8FF5A]">{fmt(yearIncome)}</div>
            <div className="text-[10px] font-mono text-[#6E7074]">{asset.yield || 0}%</div>
          </div>
        </div>

        <div className="card p-5 mb-5" style={{ background: 'var(--bg-input)' }}>
          <div className="flex items-center justify-between mb-3">
            <div className="text-xs text-[#6E7074] font-mono uppercase tracking-wider">Historique</div>
            <div className="text-xs text-[#6E7074] font-mono">{history.length} entrée{history.length > 1 ? 's' : ''}</div>
          </div>
          <div style={{ height: 180 }}>
            <ResponsiveContainer>
              <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id={`gradDetail-${asset.id}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={meta.color} stopOpacity={0.35} />
                    <stop offset="100%" stopColor={meta.color} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#6E7074' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 9, fill: '#6E7074' }} axisLine={false} tickLine={false}
                  tickFormatter={(v) => `${(v/1000).toFixed(1)}k`} />
                <Tooltip
                  contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }}
                  formatter={(v) => [fmt(v), 'Valeur']} />
                <Area type="monotone" dataKey="value" stroke={meta.color} strokeWidth={2}
                  fill={`url(#gradDetail-${asset.id})`} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {peaInfo && (
          <div className="card p-5 mb-5" style={{ background: 'var(--bg-input)', borderColor: peaInfo.exempt ? '#B8FF5A40' : '#E8C54740' }}>
            <div className="text-xs text-[#6E7074] font-mono uppercase tracking-wider mb-3">Fiscalité PEA</div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <div className="text-xs text-[#A0A3A8] mb-1">Ouvert le</div>
                <div className="font-mono">{new Date(peaInfo.openedAt).toLocaleDateString('fr-FR')}</div>
              </div>
              <div>
                <div className="text-xs text-[#A0A3A8] mb-1">Exonération le</div>
                <div className="font-mono">{new Date(peaInfo.fiveYearsDate).toLocaleDateString('fr-FR')}</div>
              </div>
              {!peaInfo.exempt ? (
                <>
                  <div>
                    <div className="text-xs text-[#A0A3A8] mb-1">Temps restant</div>
                    <div className="font-mono text-[#E8C547]">{peaInfo.years}a {peaInfo.months}m</div>
                  </div>
                  <div>
                    <div className="text-xs text-[#A0A3A8] mb-1">Économie en attendant</div>
                    <div className="font-mono text-[#B8FF5A]">{fmt(peaInfo.savings)}</div>
                  </div>
                </>
              ) : (
                <div className="col-span-2">
                  <div className="text-[#B8FF5A] font-mono text-sm">✓ Exonéré d'impôt · reste PS 17,2%</div>
                </div>
              )}
            </div>
            <div className="h-1.5 rounded-full overflow-hidden mt-4" style={{ background: 'var(--border)' }}>
              <div className="h-full rounded-full transition-all"
                style={{ width: `${peaInfo.progress}%`, background: peaInfo.exempt ? '#B8FF5A' : '#E8C547' }} />
            </div>
          </div>
        )}

        <form onSubmit={submitQuickUpdate} className="card p-5 mb-5" style={{ background: 'var(--bg-input)' }}>
          <div className="text-xs text-[#6E7074] font-mono uppercase tracking-wider mb-3">Mise à jour rapide</div>
          <div className="flex gap-2">
            <input className="input" placeholder={`Nouvelle valeur (auj. ${fmt(asset.value)})`} type="number" step="0.01"
              value={newValue} onChange={e => setNewValue(e.target.value)} />
            <button type="submit" disabled={!newValue}
              className="btn-primary px-5 rounded-full text-sm whitespace-nowrap">
              Mettre à jour
            </button>
          </div>
          <div className="text-xs text-[#6E7074] mt-2">
            Ajoute une nouvelle entrée dans l'historique avec la date d'aujourd'hui.
          </div>
        </form>

        {history.length > 1 && (
          <div className="card p-5 mb-5" style={{ background: 'var(--bg-input)' }}>
            <div className="text-xs text-[#6E7074] font-mono uppercase tracking-wider mb-3">
              Dernières entrées
            </div>
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {history.slice().reverse().slice(0, 10).map((h, i, arr) => {
                const prev = arr[i + 1]?.value;
                const diff = prev != null ? h.value - prev : null;
                return (
                  <div key={i} className="flex items-center justify-between py-1.5 border-b border-[#26292E] text-sm">
                    <span className="font-mono text-xs text-[#A0A3A8]">
                      {new Date(h.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: '2-digit' })}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono">{fmt(h.value)}</span>
                      {diff != null && diff !== 0 && (
                        <span className={`font-mono text-xs ${diff >= 0 ? 'text-[#B8FF5A]' : 'text-[#FF6B6B]'}`}>
                          {diff >= 0 ? '+' : ''}{fmt(diff)}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="flex gap-2 flex-wrap">
          <button onClick={onEdit} className="btn-ghost px-4 py-2.5 rounded-full text-sm flex items-center gap-2">
            <Icon name="edit" size={14} /> Modifier
          </button>
          {!confirmDelete ? (
            <button onClick={() => setConfirmDelete(true)}
              className="px-4 py-2.5 rounded-full text-sm flex items-center gap-2 transition"
              style={{ border: '1px solid #FF6B6B30', color: '#FF6B6B' }}>
              <Icon name="trash" size={14} /> Supprimer
            </button>
          ) : (
            <div className="flex gap-2 scale-in">
              <button onClick={onDelete}
                className="px-4 py-2.5 rounded-full text-sm" style={{ background: '#FF6B6B', color: 'var(--bg)' }}>
                Confirmer la suppression
              </button>
              <button onClick={() => setConfirmDelete(false)} className="btn-ghost px-4 py-2.5 rounded-full text-sm">
                Annuler
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ========== ASSET MODAL ========== */

const AssetModal = ({ asset, onClose, onSave }) => {
  const [form, setForm] = useState({
    type: asset?.type || 'pea',
    name: asset?.name || '',
    value: asset?.value?.toString() || '',
    invested: asset?.invested?.toString() || '',
    yield: asset?.yield?.toString() || '',
    openedAt: asset?.openedAt || '',
  });

  const save = () => {
    if (!form.value) return;
    onSave({
      type: form.type,
      name: form.name || ASSET_TYPES[form.type].label,
      value: parseFloat(form.value) || 0,
      invested: parseFloat(form.invested) || parseFloat(form.value) || 0,
      yield: parseFloat(form.yield) || ASSET_TYPES[form.type].defaultYield || 0,
      openedAt: form.type === 'pea' ? form.openedAt || undefined : undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 fade-in"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}>
      <div className="card p-6 w-full max-w-md scale-in max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-serif text-2xl">{asset ? 'Modifier' : 'Nouvel actif'}</h2>
          <button onClick={onClose} className="text-[#6E7074] hover:text-white transition">
            <Icon name="x" size={20} />
          </button>
        </div>

        <div className="grid grid-cols-4 gap-2 mb-4">
          {Object.entries(ASSET_TYPES).map(([k, v]) => (
            <button key={k} onClick={() => setForm({ ...form, type: k, yield: v.defaultYield?.toString() || '' })}
              className="p-3 rounded-lg text-center transition"
              style={{
                border: form.type === k ? `1px solid ${v.color}` : '1px solid var(--border)',
                background: form.type === k ? 'var(--bg-subtle)' : 'transparent'
              }}>
              <div className="text-lg mb-0.5">{v.emoji}</div>
              <div className="text-[9px] font-mono uppercase tracking-wider text-[#A0A3A8]">{v.label}</div>
            </button>
          ))}
        </div>

        <div className="text-xs text-[#6E7074] mb-4">{ASSET_TYPES[form.type].desc}</div>

        <input className="input mb-3" placeholder={`Nom (ex: ${ASSET_TYPES[form.type].label} Trade Republic)`}
          value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div>
            <label className="text-xs text-[#6E7074] font-mono uppercase mb-1 block">Valeur €</label>
            <input className="input" type="number" value={form.value}
              onChange={e => setForm({ ...form, value: e.target.value })} />
          </div>
          <div>
            <label className="text-xs text-[#6E7074] font-mono uppercase mb-1 block">Investi €</label>
            <input className="input" type="number" value={form.invested}
              onChange={e => setForm({ ...form, invested: e.target.value })} />
          </div>
        </div>
        <div className="mb-3">
          <label className="text-xs text-[#6E7074] font-mono uppercase mb-1 block">
            Rendement annuel % <span className="text-[#B8FF5A]">(dividendes / loyers / intérêts)</span>
          </label>
          <input className="input" type="number" step="0.1" placeholder={`Défaut: ${ASSET_TYPES[form.type].defaultYield}%`} value={form.yield}
            onChange={e => setForm({ ...form, yield: e.target.value })} />
        </div>

        {form.type === 'pea' && (
          <div className="mb-5">
            <label className="text-xs text-[#6E7074] font-mono uppercase mb-1 block">
              Date d'ouverture PEA <span className="text-[#B8FF5A]">(pour la fiscalité 5 ans)</span>
            </label>
            <input className="input" type="date" value={form.openedAt}
              onChange={e => setForm({ ...form, openedAt: e.target.value })} />
          </div>
        )}

        <div className="flex gap-2">
          <button onClick={onClose} className="btn-ghost flex-1 py-2.5 rounded-full text-sm">Annuler</button>
          <button onClick={save} disabled={!form.value} className="btn-primary flex-1 py-2.5 rounded-full text-sm">
            {asset ? 'Enregistrer' : 'Ajouter'}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ========== GOALS ========== */

const Goals = ({ goals, assets, history, onAdd, onDelete }) => {
  const total = assets.reduce((s, a) => s + (a.value || 0), 0);

  const getEstimatedDate = (target) => {
    if (total >= target) return null;
    if (history.length < 2) return null;
    const sorted = [...history].sort((a,b) => a.date.localeCompare(b.date));
    const oldest = sorted[Math.max(0, sorted.length - 30)];
    const latest = sorted[sorted.length - 1];
    const daysBetween = (new Date(latest.date) - new Date(oldest.date)) / (1000 * 60 * 60 * 24);
    if (daysBetween < 1) return null;
    const dailyGrowth = (latest.value - oldest.value) / daysBetween;
    if (dailyGrowth <= 0) return 'Au rythme actuel, jamais';
    const daysNeeded = (target - total) / dailyGrowth;
    const d = new Date();
    d.setDate(d.getDate() + daysNeeded);
    return d.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  };

  return (
    <div className="fade-up">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="font-serif text-4xl mb-2">Objectifs</h1>
          <p className="text-[#A0A3A8]">Fixe tes paliers. On calcule la date d'atteinte au rythme actuel.</p>
        </div>
        <button onClick={onAdd} className="btn-primary px-4 py-2.5 rounded-full text-sm flex items-center gap-2">
          <Icon name="plus" size={14} /> Objectif
        </button>
      </div>

      {goals.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="text-5xl mb-4">🎯</div>
          <h3 className="font-serif text-2xl mb-2">Pas encore d'objectif.</h3>
          <p className="text-[#A0A3A8] mb-6">Un bon premier goal : 1 année de salaire avant 25 ans.</p>
          <button onClick={onAdd} className="btn-primary px-5 py-2.5 rounded-full text-sm">
            Créer mon premier objectif
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {goals.map((g, i) => {
            const progress = Math.min(100, (total / g.target) * 100);
            const done = total >= g.target;
            const estimated = getEstimatedDate(g.target);
            const deadline = g.deadline ? new Date(g.deadline).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' }) : null;

            return (
              <div key={g.id} className="card p-6 fade-up" style={{ animationDelay: `${i * 0.05}s` }}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="font-serif text-2xl">{g.label}</h3>
                      {done && <span className="text-xs px-2 py-0.5 rounded-full font-mono uppercase"
                        style={{ background: '#B8FF5A20', color: '#B8FF5A' }}>✓ Atteint</span>}
                    </div>
                    <div className="text-sm text-[#A0A3A8] flex items-center gap-2 flex-wrap font-mono">
                      <span>{fmt(total)} / {fmt(g.target)}</span>
                      {deadline && <span className="text-[#6E7074]">· objectif {deadline}</span>}
                    </div>
                  </div>
                  <button onClick={() => onDelete(g.id)}
                    className="text-[#6E7074] hover:text-[#FF6B6B] transition p-1 flex-shrink-0">
                    <Icon name="trash" size={14} />
                  </button>
                </div>

                <div className="mb-3">
                  <div className="h-3 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                    <div className="h-full rounded-full transition-all"
                      style={{ width: `${progress}%`, background: done ? '#B8FF5A' : 'linear-gradient(90deg, #E8C547, #B8FF5A)' }} />
                  </div>
                  <div className="flex justify-between mt-1 text-xs font-mono text-[#6E7074]">
                    <span>{progress.toFixed(1)}%</span>
                    <span>Reste: {fmt(Math.max(0, g.target - total))}</span>
                  </div>
                </div>

                {!done && estimated && (
                  <div className="flex items-center gap-2 text-xs text-[#A0A3A8] mt-3 pt-3 border-t border-[#26292E]">
                    <span style={{ color: '#E8C547' }}>📅</span>
                    <span>Au rythme actuel, atteint en <strong className="text-white">{estimated}</strong></span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const ContributionModal = ({ onClose, onSave }) => {
  const todayStr = new Date().toISOString().slice(0, 10);
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(todayStr);
  const [destination, setDestination] = useState('');
  const [customAmount, setCustomAmount] = useState(false);

  const presets = [100, 200, 300, 500, 1000];

  const handlePreset = (v) => {
    setAmount(v.toString());
    setCustomAmount(false);
  };

  const save = () => {
    const a = parseFloat(amount);
    if (!a || a <= 0) return;
    onSave({ amount: a, date, note: destination });
  };

  const destinations = ['PEA', 'Crypto', 'SCPI', 'Livret A', 'Assurance-vie', 'CTO', 'Autre'];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 fade-in"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}>
      <div className="w-full sm:max-w-md scale-in"
        style={{ background: 'var(--bg-card)', borderRadius: '20px 20px 0 0', borderTop: '1px solid var(--border)', padding: '28px 24px 40px' }}
        onClick={e => e.stopPropagation()}>

        {/* Poignée mobile */}
        <div className="w-10 h-1 rounded-full mx-auto mb-6" style={{ background: 'var(--border-2)' }} />

        {/* Titre */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="font-serif text-3xl mb-1">Nouvel investissement</h2>
            <p className="text-sm text-[#6E7074]">Combien as-tu versé ?</p>
          </div>
          <button onClick={onClose} className="text-[#6E7074] hover:text-white transition mt-1">
            <Icon name="x" size={18} />
          </button>
        </div>

        {/* Montant affiché en grand */}
        <div className="text-center mb-6 py-5 rounded-2xl" style={{ background: 'var(--bg-input)' }}>
          <div className="font-serif text-5xl mb-1"
            style={{ color: amount ? '#B8FF5A' : 'var(--border-2)' }}>
            {amount ? `${fmt(parseFloat(amount))}` : '—'}
          </div>
          <div className="text-xs text-[#6E7074] font-mono uppercase tracking-wider">versé ce jour</div>
        </div>

        {/* Presets */}
        <div className="grid grid-cols-5 gap-2 mb-3">
          {presets.map(p => (
            <button key={p}
              onClick={() => handlePreset(p)}
              className="py-2.5 rounded-xl text-sm font-semibold transition"
              style={{
                background: amount === p.toString() && !customAmount ? '#B8FF5A' : 'var(--bg-subtle)',
                color: amount === p.toString() && !customAmount ? 'var(--bg)' : '#A0A3A8',
                border: amount === p.toString() && !customAmount ? 'none' : '1px solid var(--border)',
              }}>
              {p >= 1000 ? '1k' : p}€
            </button>
          ))}
        </div>

        {/* Montant custom */}
        <div className="relative mb-4">
          <input
            className="input text-center font-mono"
            type="number"
            placeholder="Autre montant..."
            value={customAmount ? amount : ''}
            onFocus={() => setCustomAmount(true)}
            onChange={e => { setAmount(e.target.value); setCustomAmount(true); }}
            style={{ background: customAmount ? 'var(--bg-subtle)' : 'var(--bg-input)', borderColor: customAmount ? '#B8FF5A' : 'var(--border)' }}
          />
        </div>

        {/* Où as-tu investi ? */}
        <div className="mb-4">
          <div className="text-[10px] text-[#6E7074] font-mono uppercase tracking-wider mb-2">Où as-tu investi ?</div>
          <div className="flex flex-wrap gap-2">
            {destinations.map(d => (
              <button key={d} onClick={() => setDestination(destination === d ? '' : d)}
                className="px-3 py-1.5 rounded-full text-xs transition"
                style={{
                  background: destination === d ? '#B8FF5A20' : 'transparent',
                  color: destination === d ? '#B8FF5A' : '#6E7074',
                  border: `1px solid ${destination === d ? '#B8FF5A40' : 'var(--border)'}`,
                }}>
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* Date */}
        <div className="mb-6">
          <div className="text-[10px] text-[#6E7074] font-mono uppercase tracking-wider mb-2">Date</div>
          <input className="input" type="date" value={date}
            onChange={e => setDate(e.target.value)} />
        </div>

        {/* CTA */}
        <button onClick={save}
          disabled={!amount || parseFloat(amount) <= 0}
          className="btn-primary w-full py-4 rounded-2xl text-base font-semibold">
          Enregistrer l'investissement
        </button>
      </div>
    </div>
  );
};

const GoalModal = ({ onClose, onSave }) => {
  const [form, setForm] = useState({ label: '', target: '', deadline: '' });

  const save = () => {
    if (!form.label || !form.target) return;
    onSave({
      label: form.label,
      target: parseFloat(form.target) || 0,
      deadline: form.deadline || null,
    });
  };

  const presets = [
    { label: 'Apport immo 30k€', target: 30000, months: 24 },
    { label: 'Première étape 10k€', target: 10000, months: 12 },
    { label: 'Magot 100k€', target: 100000, months: 60 },
  ];

  const applyPreset = (p) => {
    const d = new Date(); d.setMonth(d.getMonth() + p.months);
    setForm({ label: p.label, target: p.target.toString(), deadline: d.toISOString().slice(0, 10) });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 fade-in"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}>
      <div className="card p-6 w-full max-w-md scale-in" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-serif text-2xl">Nouvel objectif</h2>
          <button onClick={onClose} className="text-[#6E7074] hover:text-white transition">
            <Icon name="x" size={20} />
          </button>
        </div>

        <div className="mb-5">
          <label className="text-xs text-[#6E7074] font-mono uppercase mb-2 block">Presets rapides</label>
          <div className="flex flex-wrap gap-2">
            {presets.map((p, i) => (
              <button key={i} onClick={() => applyPreset(p)}
                className="px-3 py-1.5 rounded-full text-xs border border-[#26292E] text-[#A0A3A8] hover:text-white hover:border-[#3A3F46] transition">
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <label className="text-xs text-[#6E7074] font-mono uppercase mb-1 block">Nom de l'objectif</label>
        <input className="input mb-3" placeholder="Ex: Premier 50k€" value={form.label}
          onChange={e => setForm({ ...form, label: e.target.value })} />

        <label className="text-xs text-[#6E7074] font-mono uppercase mb-1 block">Montant cible €</label>
        <input className="input mb-3" type="number" placeholder="50000" value={form.target}
          onChange={e => setForm({ ...form, target: e.target.value })} />

        <label className="text-xs text-[#6E7074] font-mono uppercase mb-1 block">Date limite (optionnel)</label>
        <input className="input mb-5" type="date" value={form.deadline}
          onChange={e => setForm({ ...form, deadline: e.target.value })} />

        <div className="flex gap-2">
          <button onClick={onClose} className="btn-ghost flex-1 py-2.5 rounded-full text-sm">Annuler</button>
          <button onClick={save} disabled={!form.label || !form.target} className="btn-primary flex-1 py-2.5 rounded-full text-sm">
            Créer
          </button>
        </div>
      </div>
    </div>
  );
};

/* ========== SIMULATOR ========== */

const Simulator = ({ assets, history, contributions, user, onUpgrade }) => {
  const currentTotal = assets.reduce((s, a) => s + (a.value || 0), 0);
  const [initial, setInitial] = useState(Math.round(currentTotal) || 1000);
  const [monthly, setMonthly] = useState(300);
  const [years, setYears] = useState(15);
  const [rate, setRate] = useState(7);

  const simulation = useMemo(() => {
    const data = [];
    let balance = initial;
    let contributed = initial;
    const monthlyRate = rate / 100 / 12;
    for (let y = 0; y <= years; y++) {
      data.push({ year: `Y${y}`, total: Math.round(balance), invested: Math.round(contributed), gain: Math.round(balance - contributed) });
      for (let m = 0; m < 12; m++) {
        balance = balance * (1 + monthlyRate) + monthly;
        contributed += monthly;
      }
    }
    return data;
  }, [initial, monthly, years, rate]);

  const finalValue = simulation[simulation.length - 1]?.total || 0;
  const totalInvested = simulation[simulation.length - 1]?.invested || 0;
  const totalGain = finalValue - totalInvested;

  const presets = [
    { label: 'Prudent',   rate: 3, color: '#7BB3FF' },
    { label: 'Équilibré', rate: 5, color: '#B8FF5A' },
    { label: 'Dynamique', rate: 7, color: '#E8C547' },
    { label: 'Agressif',  rate: 10, color: '#FF6B6B' },
  ];

  return (
    <div className="fade-up">
      <div className="mb-8">
        <h1 className="font-serif text-4xl mb-2">Simulateur</h1>
        <p className="text-[#A0A3A8]">Intérêts composés · combien t'auras dans X années.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        <div className="card p-6 space-y-6">
          <div>
            <div className="flex items-baseline justify-between mb-2">
              <label className="text-xs text-[#6E7074] font-mono uppercase tracking-wider">Capital initial</label>
              <span className="font-mono text-sm">{fmt(initial)}</span>
            </div>
            <input type="range" className="slider" min="0" max="200000" step="500"
              value={initial} onChange={e => setInitial(parseInt(e.target.value))} />
          </div>
          <div>
            <div className="flex items-baseline justify-between mb-2">
              <label className="text-xs text-[#6E7074] font-mono uppercase tracking-wider">Apport mensuel</label>
              <span className="font-mono text-sm">{fmt(monthly)}</span>
            </div>
            <input type="range" className="slider" min="0" max="3000" step="10"
              value={monthly} onChange={e => setMonthly(parseInt(e.target.value))} />
          </div>
          <div>
            <div className="flex items-baseline justify-between mb-2">
              <label className="text-xs text-[#6E7074] font-mono uppercase tracking-wider">Durée</label>
              <span className="font-mono text-sm">{years} ans</span>
            </div>
            <input type="range" className="slider" min="1" max="40" step="1"
              value={years} onChange={e => setYears(parseInt(e.target.value))} />
          </div>
          <div>
            <div className="flex items-baseline justify-between mb-2">
              <label className="text-xs text-[#6E7074] font-mono uppercase tracking-wider">Rendement annuel</label>
              <span className="font-mono text-sm">{rate}%</span>
            </div>
            <input type="range" className="slider" min="0" max="15" step="0.5"
              value={rate} onChange={e => setRate(parseFloat(e.target.value))} />
            <div className="flex flex-wrap gap-1.5 mt-3">
              {presets.map(p => (
                <button key={p.label} onClick={() => setRate(p.rate)}
                  className="px-2.5 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider transition"
                  style={{
                    border: `1px solid ${rate === p.rate ? p.color : 'var(--border)'}`,
                    color: rate === p.rate ? p.color : '#A0A3A8',
                    background: rate === p.rate ? `${p.color}15` : 'transparent',
                  }}>
                  {p.label} {p.rate}%
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-5">
          <div className="card p-6">
            <div className="text-xs text-[#6E7074] font-mono uppercase tracking-wider mb-2">Dans {years} ans, tu auras</div>
            <div className="font-serif text-5xl md:text-6xl mb-4 shimmer-gold">{fmt(finalValue)}</div>
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[#26292E]">
              <div>
                <div className="text-xs text-[#6E7074] font-mono uppercase tracking-wider mb-1">Total investi</div>
                <div className="font-mono text-xl">{fmt(totalInvested)}</div>
              </div>
              <div>
                <div className="text-xs text-[#6E7074] font-mono uppercase tracking-wider mb-1">Intérêts générés</div>
                <div className="font-mono text-xl text-[#B8FF5A]">+{fmt(totalGain)}</div>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="text-xs text-[#6E7074] font-mono uppercase tracking-wider mb-4">Projection</div>
            <div style={{ height: 280 }}>
              <ResponsiveContainer>
                <AreaChart data={simulation} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gradSim1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#B8FF5A" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#B8FF5A" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gradSim2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6E7074" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#6E7074" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="year" tick={{ fontSize: 10, fill: '#6E7074' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#6E7074' }} axisLine={false} tickLine={false}
                    tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
                  <Tooltip
                    contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }}
                    formatter={(v, name) => [fmt(v), name === 'total' ? 'Capital total' : 'Investi']} />
                  <Area type="monotone" dataKey="invested" stroke="#6E7074" strokeWidth={1.5} fill="url(#gradSim2)" dot={false} />
                  <Area type="monotone" dataKey="total" stroke="#B8FF5A" strokeWidth={2.5} fill="url(#gradSim1)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card dark-card p-5" style={{ background: 'linear-gradient(135deg, #141619 0%, #1A1D21 100%)' }}>
            <div className="text-xs text-[#E8C547] font-mono uppercase tracking-wider mb-2">💡 Le pouvoir du temps</div>
            <p className="text-sm text-[#D0D2D6] leading-relaxed">
              Avec {fmt(monthly)}/mois à {rate}% sur {years} ans, tu investis <strong className="font-mono">{fmt(totalInvested)}</strong> mais tu finis avec <strong className="font-mono text-[#B8FF5A]">{fmt(finalValue)}</strong>. Les intérêts composés font <strong className="font-mono">{totalInvested > 0 ? ((totalGain/totalInvested)*100).toFixed(0) : 0}%</strong> du résultat final.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ========== SCENARIOS (feature 8) ========== */

const SCENARIO_DEFS = [
  {
    id: 'base',
    label: 'Trajectoire actuelle',
    emoji: '📈',
    color: '#B8FF5A',
    desc: (monthly) => `Tu continues à investir ${fmt(monthly)}/mois au même rythme.`,
    compute: (total, monthly, rate, years) => {
      const data = []; let bal = total;
      const mr = rate / 100 / 12;
      for (let y = 0; y <= years; y++) {
        data.push(Math.round(bal));
        for (let m = 0; m < 12; m++) bal = bal * (1 + mr) + monthly;
      }
      return data;
    },
  },
  {
    id: 'double',
    label: 'Effort x2',
    emoji: '🚀',
    color: '#7BB3FF',
    desc: (monthly) => `Tu doubles tes apports à ${fmt(monthly * 2)}/mois.`,
    compute: (total, monthly, rate, years) => {
      const data = []; let bal = total;
      const mr = rate / 100 / 12;
      for (let y = 0; y <= years; y++) {
        data.push(Math.round(bal));
        for (let m = 0; m < 12; m++) bal = bal * (1 + mr) + monthly * 2;
      }
      return data;
    },
  },
  {
    id: 'stop',
    label: "Tu arrêtes d'investir",
    emoji: '⏸️',
    color: '#E8C547',
    desc: () => `Tu n'ajoutes plus rien, les marchés font le reste.`,
    compute: (total, monthly, rate, years) => {
      const data = []; let bal = total;
      const mr = rate / 100 / 12;
      for (let y = 0; y <= years; y++) {
        data.push(Math.round(bal));
        for (let m = 0; m < 12; m++) bal = bal * (1 + mr);
      }
      return data;
    },
  },
  {
    id: 'crash',
    label: 'Crash -30% demain',
    emoji: '📉',
    color: '#FF6B6B',
    desc: (monthly) => `Les marchés chutent de 30% puis reprennent leur cours normal.`,
    compute: (total, monthly, rate, years) => {
      const data = []; let bal = total * 0.7;
      const mr = rate / 100 / 12;
      data.push(Math.round(total)); // year 0 = avant crash
      for (let y = 1; y <= years; y++) {
        for (let m = 0; m < 12; m++) bal = bal * (1 + mr) + monthly;
        data.push(Math.round(bal));
      }
      return data;
    },
  },
  {
    id: 'half',
    label: 'Réduis à la moitié',
    emoji: '🔽',
    color: '#B598FF',
    desc: (monthly) => `Tu passes à ${fmt(Math.round(monthly / 2))}/mois — à cause d'une dépense, d'un crédit...`,
    compute: (total, monthly, rate, years) => {
      const data = []; let bal = total;
      const mr = rate / 100 / 12;
      for (let y = 0; y <= years; y++) {
        data.push(Math.round(bal));
        for (let m = 0; m < 12; m++) bal = bal * (1 + mr) + monthly * 0.5;
      }
      return data;
    },
  },
];

const Scenarios = ({ assets, contributions, user, onUpgrade }) => {
  const total = assets.reduce((s, a) => s + (a.value || 0), 0);
  const isPremium = user?.plan !== 'free';

  // Estimate monthly from last 3 contributions
  const contribs = (contributions || []).slice(0, 3);
  const avgMonthly = contribs.length
    ? Math.round(contribs.reduce((s, c) => s + c.amount, 0) / contribs.length)
    : 300;

  const [monthly, setMonthly] = useState(avgMonthly);
  const [rate, setRate] = useState(7);
  const [years, setYears] = useState(15);
  const [active, setActive] = useState(['base', 'double', 'stop', 'crash']);

  const visibleScenarios = isPremium ? SCENARIO_DEFS : SCENARIO_DEFS.slice(0, 3);

  const chartData = useMemo(() => {
    const allData = {};
    SCENARIO_DEFS.forEach(s => {
      allData[s.id] = s.compute(total, monthly, rate, years);
    });
    return Array.from({ length: years + 1 }, (_, y) => {
      const point = { year: y === 0 ? "Auj." : `${y > 0 && y % 5 === 0 ? `${y} ans` : `+${y}`}` };
      SCENARIO_DEFS.forEach(s => { point[s.id] = allData[s.id][y]; });
      return point;
    });
  }, [total, monthly, rate, years]);

  const finalValues = useMemo(() => {
    const out = {};
    SCENARIO_DEFS.forEach(s => { out[s.id] = s.compute(total, monthly, rate, years)[years]; });
    return out;
  }, [total, monthly, rate, years]);

  const baseFinal = finalValues['base'];

  if (total === 0) return (
    <div className="text-center pt-20">
      <div className="text-5xl mb-4">📊</div>
      <h2 className="font-serif text-3xl mb-3">Ajoute d'abord tes actifs</h2>
      <p className="text-[#A0A3A8]">Les scénarios se basent sur ton patrimoine actuel.</p>
    </div>
  );

  return (
    <div className="fade-up pb-8">

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <span style={{ color: '#E8C547' }}>📊</span>
          <h1 className="font-serif text-4xl">Et si...</h1>
        </div>
        <p className="text-sm text-[#A0A3A8]">
          Compare ce que devient ton patrimoine selon tes choix.
        </p>
      </div>

      {/* Params */}
      <div className="card p-5 mb-5">
        <div className="text-[10px] text-[#6E7074] font-mono uppercase tracking-widest mb-4">Paramètres</div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <div className="text-[10px] text-[#6E7074] font-mono uppercase mb-2">Apport/mois</div>
            <input className="input text-center font-mono font-semibold" type="number"
              value={monthly} onChange={e => setMonthly(Number(e.target.value))} />
          </div>
          <div>
            <div className="text-[10px] text-[#6E7074] font-mono uppercase mb-2">Rendement</div>
            <div className="relative">
              <input className="input text-center font-mono font-semibold pr-6" type="number"
                value={rate} onChange={e => setRate(Number(e.target.value))} />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#6E7074]">%</span>
            </div>
          </div>
          <div>
            <div className="text-[10px] text-[#6E7074] font-mono uppercase mb-2">Horizon</div>
            <div className="relative">
              <input className="input text-center font-mono font-semibold pr-8" type="number"
                value={years} onChange={e => setYears(Math.max(1, Math.min(40, Number(e.target.value))))} />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-[#6E7074]">ans</span>
            </div>
          </div>
        </div>
      </div>

      {/* Toggle scenarios */}
      <div className="flex flex-wrap gap-2 mb-4">
        {visibleScenarios.map(s => (
          <button key={s.id}
            onClick={() => setActive(prev => prev.includes(s.id) ? prev.filter(x => x !== s.id) : [...prev, s.id])}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition"
            style={{
              background: active.includes(s.id) ? s.color + '18' : 'transparent',
              color: active.includes(s.id) ? s.color : '#6E7074',
              border: `1px solid ${active.includes(s.id) ? s.color + '50' : 'var(--border)'}`,
            }}>
            <span>{s.emoji}</span> {s.label}
          </button>
        ))}
        {!isPremium && (
          <button onClick={onUpgrade}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs"
            style={{ border: '1px solid #E8C54730', color: '#E8C547' }}>
            🔒 +2 scénarios
          </button>
        )}
      </div>

      {/* Chart */}
      <div className="card p-4 mb-5">
        <div style={{ height: 220 }}>
          <ResponsiveContainer>
            <LineChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <XAxis dataKey="year"
                tick={{ fontSize: 9, fill: '#4A4D52' }}
                interval={Math.max(0, Math.floor(years / 5) - 1)}
                axisLine={false} tickLine={false} />
              <YAxis
                tick={{ fontSize: 9, fill: '#4A4D52' }}
                tickFormatter={v => v >= 1000000 ? `${(v/1000000).toFixed(1)}M` : v >= 1000 ? `${Math.round(v/1000)}k` : v}
                axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, fontSize: 11 }}
                formatter={(v, name) => {
                  const s = SCENARIO_DEFS.find(x => x.id === name);
                  return [fmt(v), s?.label || name];
                }} />
              {SCENARIO_DEFS.filter(s => active.includes(s.id) && (isPremium || SCENARIO_DEFS.indexOf(s) < 3)).map(s => (
                <Line key={s.id} type="monotone" dataKey={s.id}
                  stroke={s.color} strokeWidth={2}
                  dot={false} activeDot={{ r: 4, fill: s.color }} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Cards comparatives */}
      <div className="space-y-3 mb-5">
        {visibleScenarios.map(s => {
          const val = finalValues[s.id];
          const diff = val - baseFinal;
          const isBase = s.id === 'base';
          return (
            <div key={s.id} className="card p-4 flex items-center gap-4"
              style={{ borderColor: active.includes(s.id) ? s.color + '30' : 'var(--border-3)',
                opacity: active.includes(s.id) ? 1 : 0.5 }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                style={{ background: s.color + '15' }}>
                {s.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium mb-0.5">{s.label}</div>
                <div className="text-xs text-[#6E7074]">{s.desc(monthly)}</div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="font-mono font-semibold" style={{ color: s.color }}>{fmt(val)}</div>
                {!isBase && (
                  <div className="text-[10px] font-mono" style={{ color: diff >= 0 ? '#B8FF5A' : '#FF6B6B' }}>
                    {diff >= 0 ? '+' : ''}{fmt(diff)}
                  </div>
                )}
                {isBase && (
                  <div className="text-[10px] font-mono text-[#6E7074]">référence</div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Insight clé */}
      {baseFinal > 0 && (
        <div className="card dark-card p-5" style={{ background: 'linear-gradient(135deg,#141619,#1A1D21)', borderColor: '#B8FF5A20' }}>
          <div className="text-[10px] font-mono uppercase tracking-wider text-[#B8FF5A] mb-2">💡 Ce que ça veut dire</div>
          <p className="text-sm text-[#A0A3A8] leading-relaxed">
            En {years} ans à ce rythme, ton patrimoine passerait de{' '}
            <strong className="text-white">{fmt(total)}</strong> à{' '}
            <strong className="text-white">{fmt(baseFinal)}</strong>.{' '}
            {finalValues['double'] && (
              <>Doubler tes apports t'apporterait{' '}
              <strong style={{ color: '#7BB3FF' }}>{fmt(finalValues['double'] - baseFinal)} de plus</strong>.{' '}</>
            )}
            {finalValues['crash'] && finalValues['crash'] > baseFinal * 0.9 && (
              <>Même après un crash de 30%, tu finirais à{' '}
              <strong style={{ color: '#E8C547' }}>{fmt(finalValues['crash'])}</strong> — la régularité gagne toujours sur le long terme.</>
            )}
          </p>
        </div>
      )}
    </div>
  );
};

/* ========== FIRE CALCULATOR (feature 9) ========== */

/* ────── SliderInput : curseur + champ texte synchronisés ────── */
const SliderInput = ({ value, onChange, min, max, step, color, unit = '€', label, sublabel }) => {
  const [editing, setEditing] = useState(false);
  const [raw, setRaw]         = useState('');
  const inputRef              = useRef(null);

  const clamp = (v) => Math.min(max, Math.max(min, v));

  const startEdit = () => {
    setRaw(String(value));
    setEditing(true);
    setTimeout(() => { inputRef.current?.select(); }, 30);
  };

  const commitEdit = () => {
    const parsed = parseFloat(raw.replace(/[^0-9.]/g, ''));
    if (!isNaN(parsed)) onChange(clamp(Math.round(parsed / step) * step));
    setEditing(false);
  };

  const handleKey = (e) => {
    if (e.key === 'Enter') commitEdit();
    if (e.key === 'Escape') setEditing(false);
  };

  const trackPct = ((value - min) / (max - min)) * 100;
  const displayVal = unit === '%' ? `${value}${unit}` : `${fmt(value)}`;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-sm font-medium">{label}</div>
          {sublabel && <div className="text-[10px] text-[#6E7074]">{sublabel}</div>}
        </div>

        {/* Valeur cliquable / champ éditable */}
        {editing ? (
          <div className="flex items-center gap-1">
            <input
              ref={inputRef}
              type="number"
              value={raw}
              onChange={e => setRaw(e.target.value)}
              onBlur={commitEdit}
              onKeyDown={handleKey}
              className="font-mono font-semibold text-right rounded-lg px-2 py-1 text-sm"
              style={{
                background: 'var(--bg-subtle)',
                border: `1px solid ${color}`,
                color,
                width: 90,
                outline: 'none',
                fontVariantNumeric: 'tabular-nums',
                MozAppearance: 'textfield',
              }}
            />
            {unit === '%' && <span className="font-mono text-sm" style={{ color }}>{unit}</span>}
          </div>
        ) : (
          <button
            onClick={startEdit}
            className="font-mono font-semibold rounded-lg px-2.5 py-1 text-sm transition"
            style={{
              color,
              background: 'var(--bg-subtle)',
              border: '1px solid var(--border)',
              fontVariantNumeric: 'tabular-nums',
              minWidth: 80,
              textAlign: 'right',
            }}
            title="Clique pour modifier">
            {displayVal} <span style={{ color: '#4A4D52', fontSize: 10 }}>✎</span>
          </button>
        )}
      </div>

      {/* Slider */}
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(clamp(Number(e.target.value)))}
        className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
        style={{
          accentColor: color,
          background: `linear-gradient(to right, ${color}80 ${trackPct}%, #26292E ${trackPct}%)`,
        }}
      />
      <div className="flex justify-between text-[9px] font-mono text-[#3A3F46] mt-1.5">
        <span>{unit === '%' ? `${min}%` : `${fmt(min)}`}</span>
        <span>{unit === '%' ? `${max}%` : `${fmt(max)}`}</span>
      </div>
    </div>
  );
};


const Fire = ({ assets, contributions, user, onUpgrade }) => {
  const total = assets.reduce((s, a) => s + (a.value || 0), 0);
  const isPremium = user?.plan !== 'free';
  const age = user?.age || 22;

  const currentPassive = assets.reduce((s, a) => s + ((a.value || 0) * (a.yield || 0)) / 100, 0) / 12;

  const contribs = (contributions || []).slice(0, 6);
  const avgMonthly = contribs.length
    ? Math.round(contribs.reduce((s, c) => s + c.amount, 0) / contribs.length)
    : 300;

  const [monthlyExpenses, setMonthlyExpenses] = useState(2000);
  const [monthlyContrib, setMonthlyContrib]   = useState(avgMonthly);
  const [withdrawalRate, setWithdrawalRate]   = useState(4);
  const [fireType, setFireType]               = useState('regular');

  // Debounced values — chart only recomputes 300ms after user stops sliding
  const [dExpenses,  setDExpenses]  = useState(2000);
  const [dContrib,   setDContrib]   = useState(avgMonthly);
  const [dWithdraw,  setDWithdraw]  = useState(4);

  useEffect(() => { const t = setTimeout(() => setDExpenses(monthlyExpenses), 280);  return () => clearTimeout(t); }, [monthlyExpenses]);
  useEffect(() => { const t = setTimeout(() => setDContrib(monthlyContrib),   280);  return () => clearTimeout(t); }, [monthlyContrib]);
  useEffect(() => { const t = setTimeout(() => setDWithdraw(withdrawalRate),  280);  return () => clearTimeout(t); }, [withdrawalRate]);

  const GROWTH = 7;

  const fireTypes = [
    { id: 'lean',    label: 'Lean FIRE', emoji: '🎒', mult: 0.7, desc: 'Minimaliste' },
    { id: 'regular', label: 'FIRE',      emoji: '🔥', mult: 1,   desc: 'Niveau actuel' },
    { id: 'fat',     label: 'Fat FIRE',  emoji: '👑', mult: 1.6, desc: 'Confort premium' },
  ];
  const selectedType    = fireTypes.find(t => t.id === fireType);
  const adjustedExpenses = dExpenses * selectedType.mult;
  const fireTarget       = Math.round((adjustedExpenses * 12) / (dWithdraw / 100));
  const gap              = Math.max(0, fireTarget - total);
  const progressPct      = Math.min(100, Math.round((total / fireTarget) * 100));
  const savingsRate      = Math.round((dContrib / (dExpenses + dContrib)) * 100);

  const yearsToFire = useMemo(() => {
    if (total >= fireTarget) return 0;
    let bal = total;
    const mr = GROWTH / 100 / 12;
    for (let m = 0; m < 600; m++) {
      bal = bal * (1 + mr) + dContrib;
      if (bal >= fireTarget) return +(m / 12).toFixed(1);
    }
    return null;
  }, [total, fireTarget, dContrib]);

  const fireAge = yearsToFire !== null ? Math.floor(age + yearsToFire) : null;

  const chartData = useMemo(() => {
    const horizon = Math.min(50, (yearsToFire ? Math.ceil(yearsToFire) : 40) + 8);
    const data = [];
    let bal = total;
    const mr = GROWTH / 100 / 12;
    for (let y = 0; y <= horizon; y++) {
      data.push({
        y,
        label: y === 0 ? 'Auj.' : y % 5 === 0 ? `+${y}` : '',
        patrimoine: Math.round(bal),
        objectif: fireTarget,
      });
      const fired = yearsToFire !== null && y >= yearsToFire;
      for (let m = 0; m < 12; m++) {
        bal = bal * (1 + mr) + (fired ? -adjustedExpenses : dContrib);
        if (bal < 0) bal = 0;
      }
    }
    return data;
  }, [total, fireTarget, dContrib, yearsToFire, adjustedExpenses]);

  const passiveAtFire = yearsToFire ? Math.round(fireTarget * dWithdraw / 100 / 12) : 0;

  if (total === 0) return (
    <div className="text-center pt-20 fade-up">
      <div className="text-5xl mb-4">🔥</div>
      <h2 className="font-serif text-3xl mb-3">Ajoute tes actifs d'abord</h2>
      <p className="text-[#A0A3A8]">Le calculateur FIRE se base sur ton patrimoine réel.</p>
    </div>
  );

  return (
    <div className="fade-up pb-10">

      {/* Header */}
      <div className="mb-7">
        <div className="flex items-center gap-2 mb-1">
          <span>🔥</span>
          <h1 className="font-serif text-4xl">Liberté financière</h1>
        </div>
        <p className="text-sm text-[#A0A3A8]">À quel âge tu peux arrêter de travailler.</p>
      </div>

      {/* FIRE type */}
      <div className="grid grid-cols-3 gap-2 mb-5">
        {fireTypes.map(t => (
          <button key={t.id} onClick={() => setFireType(t.id)}
            className="card p-3 text-center transition"
            style={{
              borderColor: fireType === t.id ? '#FF6B6B55' : 'var(--border-3)',
              background: fireType === t.id ? 'linear-gradient(135deg,#1A1414,#141619)' : 'var(--bg-card)',
            }}>
            <div className="text-2xl mb-1">{t.emoji}</div>
            <div className="text-xs font-semibold" style={{ color: fireType === t.id ? '#FF6B6B' : 'var(--text)' }}>
              {t.label}
            </div>
            <div className="text-[9px] text-[#6E7074] mt-0.5">{t.desc}</div>
          </button>
        ))}
      </div>

      {/* Hero — fixed layout, no shifting */}
      <div className="card dark-card p-6 mb-5 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg,#141619,#1A1414)', borderColor: '#FF6B6B30', minHeight: 180 }}>
        <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, #FF6B6B15, transparent 70%)' }} />
        <div className="relative">
          {yearsToFire === 0 ? (
            <div className="text-center py-4">
              <div className="text-4xl mb-2">🎉</div>
              <div className="font-serif text-3xl text-[#B8FF5A] mb-1">Tu es déjà FIRE !</div>
              <p className="text-sm text-[#A0A3A8]">Liberté acquise — ton capital couvre tes dépenses.</p>
            </div>
          ) : yearsToFire === null ? (
            <div className="text-center py-4">
              <div className="text-3xl mb-2">📊</div>
              <div className="font-serif text-2xl text-[#E8C547] mb-1">Apports insuffisants</div>
              <p className="text-sm text-[#6E7074]">Augmente tes apports pour atteindre l'objectif.</p>
            </div>
          ) : (
            <div>
              <div className="text-[10px] font-mono uppercase tracking-widest text-[#FF6B6B] mb-4">
                {selectedType.emoji} {selectedType.label}
              </div>
              {/* Fixed grid — numbers don't shift layout */}
              <div className="grid grid-cols-2 gap-4 mb-5">
                <div>
                  <div className="text-[10px] text-[#6E7074] font-mono uppercase mb-1">Liberté à</div>
                  {/* tabular-nums prevents width shifts */}
                  <div className="font-serif text-6xl leading-none" style={{ color: '#FF6B6B', fontVariantNumeric: 'tabular-nums' }}>
                    {fireAge}
                  </div>
                  <div className="text-sm text-[#6E7074] mt-1 font-mono">
                    ans · <span className="text-white">dans {Math.floor(yearsToFire)} ans</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-[#6E7074] font-mono uppercase mb-1">Objectif</div>
                  <div className="font-mono text-xl font-semibold" style={{ fontVariantNumeric: 'tabular-nums' }}>
                    {fmt(fireTarget)}
                  </div>
                  <div className="text-[10px] text-[#6E7074] font-mono mt-0.5">règle des {dWithdraw}%</div>
                  <div className="font-mono text-sm text-[#A0A3A8] mt-1" style={{ fontVariantNumeric: 'tabular-nums' }}>
                    {fmt(Math.round(adjustedExpenses * 12))}/an
                  </div>
                </div>
              </div>
              {/* Progress bar — fixed height */}
              <div className="flex justify-between text-[10px] font-mono text-[#6E7074] mb-1.5">
                <span>{progressPct}% atteint</span>
                <span>{fmt(gap)} restants</span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                <div className="h-full rounded-full" style={{
                  width: `${progressPct}%`,
                  background: 'linear-gradient(90deg,#FF6B6B60,#FF6B6B)',
                  transition: 'width 0.4s ease',
                }} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sliders */}
      <div className="card p-5 mb-5">
        <div className="text-[10px] text-[#6E7074] font-mono uppercase tracking-widest mb-5">Mes chiffres</div>
        <div className="space-y-6">
          <SliderInput
            label="Dépenses mensuelles"
            sublabel="Loyer · courses · sorties · tout inclus"
            value={monthlyExpenses}
            onChange={setMonthlyExpenses}
            min={500} max={8000} step={100}
            color="#FF6B6B"
          />
          <SliderInput
            label="Investissement mensuel"
            sublabel="Ce que tu mets de côté chaque mois"
            value={monthlyContrib}
            onChange={setMonthlyContrib}
            min={50} max={5000} step={50}
            color="#B8FF5A"
          />
          {isPremium && (
            <SliderInput
              label="Taux de retrait"
              sublabel="4% = sécuritaire · 3,5% = très conservateur"
              value={withdrawalRate}
              onChange={setWithdrawalRate}
              min={2} max={6} step={0.5}
              color="#7BB3FF"
              unit="%"
            />
          )}
        </div>
      </div>

      {/* Chart — fixed height container prevents layout shift */}
      <div className="card p-5 mb-5">
        <div className="text-[10px] text-[#6E7074] font-mono uppercase tracking-widest mb-1">Courbe de richesse</div>
        <div className="text-[10px] text-[#3A3F46] font-mono mb-4">
          {yearsToFire ? `Croisement avec l'objectif → liberté à ${fireAge} ans` : 'Objectif non atteint'}
        </div>
        {/* Strict fixed height — no CLS */}
        <div style={{ height: 200, minHeight: 200, maxHeight: 200 }}>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
              <XAxis dataKey="label"
                tick={{ fontSize: 9, fill: '#4A4D52' }}
                axisLine={false} tickLine={false} />
              <YAxis
                tick={{ fontSize: 9, fill: '#4A4D52' }}
                tickFormatter={v => v >= 1000000 ? `${(v/1000000).toFixed(1)}M` : `${Math.round(v/1000)}k`}
                axisLine={false} tickLine={false} width={38} />
              <Tooltip
                contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, fontSize: 11 }}
                formatter={(v, name) => [fmt(v), name === 'patrimoine' ? 'Patrimoine' : 'Objectif FIRE']} />
              <Line type="monotone" dataKey="objectif"
                stroke="#FF6B6B" strokeWidth={1} strokeDasharray="5 4" dot={false} />
              <Line type="monotone" dataKey="patrimoine"
                stroke="#B8FF5A" strokeWidth={2.5} dot={false}
                activeDot={{ r: 4, fill: '#B8FF5A' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="flex gap-5 mt-3">
          <div className="flex items-center gap-2">
            <div className="h-0.5 w-5 rounded" style={{ background: '#B8FF5A' }} />
            <span className="text-[10px] text-[#6E7074] font-mono">Patrimoine</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-px w-5" style={{ borderTop: '2px dashed #FF6B6B' }} />
            <span className="text-[10px] text-[#6E7074] font-mono">Objectif FIRE</span>
          </div>
        </div>
      </div>

      {/* Stats — fixed layout grid */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        {[
          {
            label: "Taux d'épargne",
            value: `${savingsRate}%`,
            sub: savingsRate >= 50 ? 'Exceptionnel 🔥' : savingsRate >= 30 ? 'Très bien 💪' : savingsRate >= 15 ? 'Correct ⚡' : 'À augmenter 📈',
            color: savingsRate >= 30 ? '#B8FF5A' : savingsRate >= 15 ? '#E8C547' : '#FF6B6B',
          },
          {
            label: 'Revenus passifs',
            value: `${fmt(Math.round(currentPassive))}/m`,
            sub: `${Math.round((currentPassive / Math.max(1, adjustedExpenses)) * 100)}% des dépenses couvertes`,
            color: '#7BB3FF',
          },
          {
            label: 'Après FIRE',
            value: passiveAtFire > 0 ? `${fmt(passiveAtFire)}/m` : '—',
            sub: 'revenus passifs mensuels',
            color: '#E8C547',
          },
          {
            label: 'Capital restant',
            value: fmt(fireTarget),
            sub: `règle des ${dWithdraw}% • capital intact`,
            color: '#FF6B6B',
          },
        ].map((s, i) => (
          <div key={i} className="card p-4" style={{ minHeight: 90 }}>
            <div className="text-[10px] text-[#6E7074] font-mono uppercase tracking-wider mb-2">{s.label}</div>
            <div className="font-serif text-2xl mb-0.5 leading-none" style={{ color: s.color, fontVariantNumeric: 'tabular-nums' }}>
              {s.value}
            </div>
            <div className="text-[10px] text-[#6E7074] leading-tight">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Insight */}
      {yearsToFire !== null && yearsToFire > 0 && (
        <div className="card dark-card p-5 mb-4"
          style={{ background: 'linear-gradient(135deg,#141619,#1A1414)', borderColor: '#FF6B6B20' }}>
          <div className="text-[10px] font-mono uppercase tracking-wider text-[#FF6B6B] mb-3">
            🔥 Ce que ça veut dire pour toi
          </div>
          <div className="space-y-2 text-sm text-[#A0A3A8] leading-relaxed">
            <p>
              À <strong className="text-white">{fmt(dContrib)}/mois</strong> investis,
              tu atteins <strong className="text-white">{fmt(fireTarget)}</strong> dans{' '}
              <strong style={{ color: '#FF6B6B' }}>{Math.floor(yearsToFire)} ans</strong> — à {fireAge} ans.
            </p>
            {savingsRate < 30 && (
              <p>
                Si tu passes à <strong className="text-white">30%</strong> d'épargne, tu gagnes plusieurs années sur ta date de liberté.
              </p>
            )}
            <p>
              Après le FIRE, tu touches{' '}
              <strong className="text-white">{fmt(passiveAtFire)}/mois</strong> de revenus passifs
              en laissant ton capital intact.
            </p>
          </div>
        </div>
      )}

      {/* Premium upsell */}
      {!isPremium && (
        <div className="card dark-card p-5 text-center"
          style={{ background: 'linear-gradient(135deg,#141619,#1A1D21)', borderColor: '#E8C54730' }}>
          <div className="text-xl mb-2">🔒</div>
          <div className="font-serif text-lg mb-1">Taux de retrait personnalisable</div>
          <p className="text-xs text-[#6E7074] mb-4">
            Ajuste entre 3,5% et 5% selon ton profil de risque.
          </p>
          <button onClick={onUpgrade} className="btn-gold px-5 py-2.5 rounded-full text-sm">
            Débloquer avec Premium
          </button>
        </div>
      )}

    </div>
  );
};

/* ========== COMMUNITY ========== */

/* ========== LEADERBOARD (feature 7) ========== */

const Leaderboard = ({ user, assets, onUpgrade }) => {
  const total = assets.reduce((s, a) => s + (a.value || 0), 0);
  const isPremium = user.plan !== 'free';
  const weekNum = Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000));

  const allUsers = useMemo(() => {
    // Mulberry32 seeded RNG — deterministic, renews chaque semaine
    let s = ((weekNum * 17 + user.age * 31) ^ 0xDEADBEEF) >>> 0;
    const rng = () => {
      s += 0x6D2B79F5;
      let t = s;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };

    const bench = getBenchmark(user.age);
    const animals  = ['🦊','🦁','🐺','🦅','🐻','🐯','🦩','🦋','🐬','🦭','🦄','🦎','🦜','🦈','🦏','🦬','🦌','🦚'];
    const adjNames = ['Alpha','Nova','Bolt','Storm','Apex','Core','Edge','Hawk','Iron','Jazz','Lux','Mars','Neon','Orion','Rex','Titan','Vega','Wave','Zero','Dash','King','Xero','Echo','Peak','Flux','Grid','Halo','Iris'];

    const users = [];
    for (let i = 0; i < 149; i++) {
      const r = rng();
      let value;
      if (r < 0.08)      value = bench.p10 * (0.2 + rng() * 0.8);
      else if (r < 0.22) value = bench.p10  + rng() * (bench.p25    - bench.p10);
      else if (r < 0.48) value = bench.p25  + rng() * (bench.median - bench.p25);
      else if (r < 0.73) value = bench.median + rng() * (bench.p75  - bench.median);
      else if (r < 0.90) value = bench.p75  + rng() * (bench.p90   - bench.p75);
      else               value = bench.p90  + rng() * (bench.p99   - bench.p90) * 0.7;

      const animal = animals[i % animals.length];
      const name   = adjNames[Math.floor(rng() * adjNames.length)];
      const code   = Math.floor(rng() * 65536).toString(16).slice(0, 3).toUpperCase();
      const weekChange = Math.round((rng() - 0.45) * 8);

      users.push({ id: i, animal, name, code, value: Math.round(value), weekChange, isMe: false });
    }

    // Moi
    users.push({ id: 999, animal: '⭐', name: 'Toi', code: '', value: total,
      weekChange: Math.floor(rng() * 4) + 1, isMe: true });
    users.sort((a, b) => b.value - a.value);
    return users;
  }, [user.age, total, weekNum]);

  const myIndex  = allUsers.findIndex(u => u.isMe);
  const myRank   = myIndex + 1;
  const totalCnt = allUsers.length;
  const myEntry  = allUsers[myIndex];
  const rival    = myIndex > 0 ? allUsers[myIndex - 1] : null;
  const rivalGap = rival ? rival.value - total : 0;

  const getTier = (rank) => {
    const pct = (rank / totalCnt) * 100;
    if (rank <= 1)  return { label: 'N°1 🌟',     color: '#E8C547', glow: '#E8C54730' };
    if (rank <= 3)  return { label: 'Top 3 👑',    color: '#E8C547', glow: '#E8C54720' };
    if (pct <= 10)  return { label: 'Top 10% 🔥',  color: '#FF6B6B', glow: '#FF6B6B20' };
    if (pct <= 25)  return { label: 'Top 25% 🚀',  color: '#B598FF', glow: '#B598FF20' };
    if (pct <= 50)  return { label: 'Top 50% ⚡',  color: '#7BB3FF', glow: '#7BB3FF20' };
    return           { label: 'En progression 🌱', color: '#B8FF5A', glow: '#B8FF5A15' };
  };
  const tier = getTier(myRank);

  const nbWindow = isPremium ? 5 : 3;
  const nbStart  = Math.max(0, myIndex - nbWindow);
  const nbEnd    = Math.min(totalCnt - 1, myIndex + nbWindow);
  const neighborhood = allUsers.slice(nbStart, nbEnd + 1);

  // Podium — order: 2e | 1er | 3e
  const top3 = allUsers.slice(0, 3);
  const podiumOrder  = top3.length === 3 ? [top3[1], top3[0], top3[2]] : top3;
  const podiumColors = ['#9CA3AF', '#E8C547', '#CD7F32'];
  const podiumH      = [80, 112, 62];
  const podiumLabel  = ['2e', '1er', '3e'];

  // Biggest climber this week
  const bigClimber = [...allUsers]
    .filter(u => !u.isMe && u.weekChange > 0)
    .sort((a, b) => b.weekChange - a.weekChange)[0];

  if (total === 0) {
    return (
      <div className="fade-up max-w-xl mx-auto text-center pt-20">
        <div className="text-5xl mb-4">🏆</div>
        <h2 className="font-serif text-3xl mb-3">Ton classement t'attend</h2>
        <p className="text-[#A0A3A8]">
          Ajoute tes actifs pour te positionner parmi les investisseurs de {user.age} ans.
        </p>
      </div>
    );
  }

  return (
    <div className="fade-up pb-8 max-w-2xl mx-auto">

      {/* ── Header ────────────────────────────────────── */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <span style={{ color: '#E8C547' }}><Icon name="trophy" size={20} /></span>
          <h1 className="font-serif text-4xl">Classement</h1>
        </div>
        <p className="text-sm text-[#A0A3A8]">
          Les {user.age} ans sur Magot · Semaine {(weekNum % 52) + 1}
        </p>
      </div>

      {/* ── HERO Rank card ────────────────────────────── */}
      <div className="card p-6 mb-4 relative overflow-hidden"
        style={{ borderColor: tier.color + '50' }}>

        {/* Glow bg */}
        <div className="absolute -top-8 -left-8 w-40 h-40 rounded-full pointer-events-none opacity-20"
          style={{ background: `radial-gradient(circle, ${tier.color}, transparent 70%)` }} />

        <div className="relative">
          {/* Tier badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono
              uppercase tracking-wider mb-5"
            style={{ background: tier.glow, color: tier.color, border: `1px solid ${tier.color}35` }}>
            {tier.label}
          </div>

          <div className="flex items-start justify-between gap-4 mb-4">
            {/* Rank number */}
            <div>
              <div className="font-serif leading-none"
                style={{ fontSize: 80, color: tier.color, lineHeight: 1 }}>
                #{myRank}
              </div>
              <div className="text-sm text-[#6E7074] mt-1">
                sur {totalCnt} investisseurs · {user.age} ans
              </div>
            </div>

            {/* Right side */}
            <div className="text-right">
              {myEntry.weekChange > 0 && (
                <div className="flex items-center gap-1 justify-end text-sm font-mono text-[#B8FF5A] mb-2">
                  <span>▲</span>
                  <span>+{myEntry.weekChange} cette semaine</span>
                </div>
              )}
              <div className="font-mono text-xl font-semibold">{fmt(total)}</div>
              <div className="text-xs text-[#6E7074] font-mono">ton patrimoine</div>
            </div>
          </div>

          {/* Progress bar to rival */}
          {rival && rivalGap > 0 && (
            <div className="pt-4 border-t border-[#26292E]">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-lg">🎯</span>
                <div>
                  <div className="text-[10px] text-[#6E7074] font-mono uppercase tracking-wider mb-0.5">
                    Ton rival direct
                  </div>
                  <p className="text-sm text-[#A0A3A8]">
                    Encore{' '}
                    <strong className="text-white font-mono">{fmt(rivalGap)}</strong>
                    {' '}pour dépasser{' '}
                    <span style={{ color: '#E8C547' }}>
                      {rival.animal} {rival.name}#{rival.code.slice(0,3)}
                    </span>
                  </p>
                </div>
              </div>
              {/* Progress bar */}
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                <div className="h-full rounded-full transition-all"
                  style={{
                    width: `${Math.min(99, (total / rival.value) * 100).toFixed(1)}%`,
                    background: `linear-gradient(90deg, ${tier.color}80, ${tier.color})`,
                  }} />
              </div>
              <div className="flex justify-between text-[10px] font-mono text-[#6E7074] mt-1">
                <span>Toi · {fmt(total)}</span>
                <span>{rival.animal} {rival.name} · {fmt(rival.value)}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Biggest climber (FOMO hook) ───────────────── */}
      {bigClimber && (
        <div className="card dark-card px-5 py-4 mb-4 flex items-center gap-4"
          style={{ background: 'linear-gradient(135deg,#141619,#1A1D21)', borderColor: '#B598FF30' }}>
          <span className="text-2xl flex-shrink-0">🚀</span>
          <div>
            <div className="text-[10px] text-[#B598FF] font-mono uppercase tracking-wider mb-0.5">
              Plus grosse progression cette semaine
            </div>
            <p className="text-sm text-[#A0A3A8]">
              <span className="text-white">
                {bigClimber.animal} {bigClimber.name}#{bigClimber.code.slice(0,3)}
              </span>
              {' '}a grimpé de{' '}
              <strong className="text-[#B598FF]">+{bigClimber.weekChange} places</strong>
            </p>
          </div>
        </div>
      )}

      {/* ── PODIUM ────────────────────────────────────── */}
      <div className="card p-5 mb-4">
        <div className="text-[10px] text-[#6E7074] font-mono uppercase tracking-widest mb-5">
          🏅 Podium · Semaine {(weekNum % 52) + 1}
        </div>
        <div className="flex items-end justify-center gap-2">
          {podiumOrder.map((u, i) => (
            <div key={u.id} className="flex-1 flex flex-col items-center" style={{ maxWidth: 120 }}>
              {/* Label */}
              <div className="text-[10px] font-mono text-center leading-tight mb-1 px-1 truncate w-full"
                style={{ color: podiumColors[i] }}>
                {u.animal} {u.name}#{u.code.slice(0,3)}
              </div>
              <div className="text-[10px] text-[#6E7074] font-mono mb-2">
                {fmt(u.value)}
              </div>
              {/* Bar */}
              <div className="w-full rounded-t-xl flex items-start justify-center pt-3 relative"
                style={{
                  height: podiumH[i],
                  background: podiumColors[i] + '18',
                  border: `1px solid ${podiumColors[i]}35`,
                  borderBottom: 'none',
                }}>
                <span className="font-mono text-base font-bold" style={{ color: podiumColors[i] }}>
                  {podiumLabel[i]}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── NEIGHBORHOOD ──────────────────────────────── */}
      <div className="card overflow-hidden mb-4">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-[#26292E] flex items-center justify-between">
          <div className="text-[10px] text-[#6E7074] font-mono uppercase tracking-widest">
            Autour de toi
          </div>
          <div className="text-[10px] text-[#6E7074] font-mono">
            {totalCnt} membres
          </div>
        </div>

        {neighborhood.map((u) => {
          const absRank = allUsers.indexOf(u) + 1;
          const isRival = !u.isMe && rival && absRank === myRank - 1;

          return (
            <div key={u.id}
              className="flex items-center gap-3 px-4 py-3.5 border-b border-[#1E2126] last:border-0"
              style={u.isMe ? {
                background: 'linear-gradient(90deg, #B8FF5A0A, #B8FF5A03)',
                borderLeft: '3px solid #B8FF5A',
              } : {}}>

              {/* Rank */}
              <div className="w-7 text-right flex-shrink-0">
                <span className="text-xs font-mono"
                  style={{ color: u.isMe ? '#B8FF5A' : '#4A4D52', fontWeight: u.isMe ? 700 : 400 }}>
                  {absRank}
                </span>
              </div>

              {/* Handle */}
              <div className="flex-1 min-w-0 flex items-center gap-2">
                <span className="text-sm truncate"
                  style={{ color: u.isMe ? 'var(--text)' : '#A0A3A8', fontWeight: u.isMe ? 600 : 400 }}>
                  {u.isMe ? '⭐ Toi' : `${u.animal} ${u.name}#${u.code.slice(0,3)}`}
                </span>
                {isRival && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded font-mono uppercase flex-shrink-0"
                    style={{ background: '#E8C54715', color: '#E8C547', border: '1px solid #E8C54730' }}>
                    rival
                  </span>
                )}
              </div>

              {/* Amount + weekly change */}
              <div className="text-right flex-shrink-0">
                <div className="font-mono text-sm"
                  style={{ color: u.isMe ? '#B8FF5A' : 'var(--text)' }}>
                  {fmt(u.value)}
                </div>
                <div className="text-[10px] font-mono"
                  style={{ color: u.weekChange > 0 ? '#B8FF5A' : u.weekChange < 0 ? '#FF6B6B' : '#4A4D52' }}>
                  {u.weekChange > 0 ? `▲ +${u.weekChange}` : u.weekChange < 0 ? `▼ ${u.weekChange}` : '→ 0'}
                </div>
              </div>
            </div>
          );
        })}

        {/* Premium CTA */}
        {!isPremium && (
          <div className="px-5 py-5 text-center"
            style={{ background: 'linear-gradient(to bottom, #0A0B0D, #141619)' }}>
            <div className="text-sm text-[#6E7074] mb-1">
              🔒 {totalCnt - neighborhood.length} membres masqués
            </div>
            <div className="text-xs text-[#3A3F46] font-mono mb-4">
              Vois exactement sur qui tu prends du terrain chaque semaine
            </div>
            <button onClick={onUpgrade} className="btn-gold px-6 py-2.5 rounded-full text-sm">
              Voir le classement complet
            </button>
          </div>
        )}
      </div>

      {/* ── Stats grid ────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3">
        <div className="card p-5">
          <div className="text-[10px] text-[#6E7074] font-mono uppercase tracking-wider mb-2">
            Tu dépasses
          </div>
          <div className="font-serif text-4xl mb-1" style={{ color: '#B8FF5A' }}>
            {totalCnt - myRank}
          </div>
          <div className="text-xs text-[#A0A3A8]">investisseurs de {user.age} ans</div>
        </div>
        <div className="card p-5">
          <div className="text-[10px] text-[#6E7074] font-mono uppercase tracking-wider mb-2">
            Percentile
          </div>
          <div className="font-serif text-4xl mb-1" style={{ color: tier.color }}>
            {Math.round(((totalCnt - myRank) / totalCnt) * 100)}%
          </div>
          <div className="text-xs text-[#A0A3A8]">mieux que tes pairs</div>
        </div>
      </div>

    </div>
  );
};


/* ========== LEARN (feature 6) ========== */

const ArticleReader = ({ article, onClose, onMarkRead, isRead, isPremium, onUpgrade }) => {
  const scrollRef = useRef(null);

  const handleScroll = (e) => {
    const el = e.target;
    const pct = (el.scrollTop / (el.scrollHeight - el.clientHeight)) * 100;
    if (pct > 80 && !isRead) onMarkRead(article.id);
  };

  const renderSection = (s, i) => {
    switch (s.type) {
      case 'intro':
        return (
          <p key={i} className="text-lg leading-relaxed mb-6" style={{ color: '#D0D2D6' }}>
            {s.text}
          </p>
        );
      case 'heading':
        return (
          <h3 key={i} className="font-serif text-2xl mb-3 mt-6">{s.text}</h3>
        );
      case 'para':
        return (
          <p key={i} className="text-sm leading-relaxed mb-4" style={{ color: '#A0A3A8' }}>
            {s.text}
          </p>
        );
      case 'keypoints':
        return (
          <div key={i} className="rounded-xl p-4 mb-4 mt-2"
            style={{ background: 'var(--bg-input)', border: '1px solid var(--border)' }}>
            <div className="text-[10px] font-mono uppercase tracking-wider mb-3"
              style={{ color: article.catColor }}>
              {s.title}
            </div>
            <ul className="space-y-2">
              {s.items.map((item, j) => (
                <li key={j} className="flex items-start gap-2.5 text-sm" style={{ color: '#D0D2D6' }}>
                  <span className="mt-0.5 flex-shrink-0" style={{ color: article.catColor }}>›</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        );
      case 'tip':
        return (
          <div key={i} className="rounded-xl p-4 mb-4 flex gap-3"
            style={{ background: '#B8FF5A0D', border: '1px solid #B8FF5A20' }}>
            <span className="text-lg flex-shrink-0">💡</span>
            <p className="text-sm leading-relaxed" style={{ color: '#D0D2D6' }}>{s.text}</p>
          </div>
        );
      case 'warning':
        return (
          <div key={i} className="rounded-xl p-4 mb-4 flex gap-3"
            style={{ background: '#E8C5470D', border: '1px solid #E8C54725' }}>
            <span className="text-lg flex-shrink-0">⚠️</span>
            <p className="text-sm leading-relaxed" style={{ color: '#D0D2D6' }}>{s.text}</p>
          </div>
        );
      case 'action':
        return (
          <div key={i} className="rounded-xl p-4 mb-4"
            style={{ background: 'linear-gradient(135deg,#141619,#1A1D21)', border: '1px solid #B8FF5A30' }}>
            <div className="text-[10px] font-mono uppercase tracking-wider text-[#B8FF5A] mb-2">
              ✅ Action concrète
            </div>
            <p className="text-sm leading-relaxed" style={{ color: '#D0D2D6' }}>{s.text}</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col fade-in"
      style={{ background: 'var(--bg)' }}>

      {/* Top bar */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-[#26292E] flex-shrink-0">
        <button onClick={onClose} className="text-[#6E7074] hover:text-white transition p-1">
          <Icon name="arrow" size={18} className="rotate-180" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="text-[10px] font-mono uppercase tracking-wider truncate"
            style={{ color: article.catColor }}>
            {article.catLabel} · {article.time} min
          </div>
        </div>
        {isRead && (
          <span className="text-[10px] px-2 py-0.5 rounded-full font-mono uppercase"
            style={{ background: '#B8FF5A20', color: '#B8FF5A' }}>
            ✓ Lu
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 py-6" onScroll={handleScroll}>
        {/* Article emoji + title */}
        <div className="text-5xl mb-4">{article.emoji}</div>
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider mb-4"
          style={{ background: article.catColor + '15', color: article.catColor, border: `1px solid ${article.catColor}30` }}>
          {article.level}
        </div>
        <h1 className="font-serif text-3xl leading-tight mb-6">{article.title}</h1>

        {/* Sections */}
        {article.sections.map((s, i) => renderSection(s, i))}

        {/* Bottom CTA */}
        <div className="mt-8 pt-6 border-t border-[#26292E]">
          {!isRead ? (
            <button onClick={() => onMarkRead(article.id)}
              className="btn-primary w-full py-3.5 rounded-full text-sm">
              Marquer comme lu ✓
            </button>
          ) : (
            <div className="text-center text-sm text-[#6E7074]">
              ✓ Article lu · Continue ta progression
            </div>
          )}
        </div>

        <div className="h-10" />
      </div>
    </div>
  );
};

const Learn = ({ user, readArticles, onMarkRead, onUpgrade }) => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedArticle, setSelectedArticle] = useState(null);
  const isPremium = user.plan !== 'free';

  const categories = [
    { id: 'all',       label: 'Tous',       color: '#B8FF5A' },
    { id: 'fiscalite', label: 'Fiscalité',   color: '#B598FF' },
    { id: 'investir',  label: 'Investir',    color: '#7BB3FF' },
    { id: 'strategie', label: 'Stratégie',   color: '#E8C547' },
  ];

  const filtered = activeCategory === 'all'
    ? ARTICLES
    : ARTICLES.filter(a => a.category === activeCategory);

  const featured = filtered.find(a => a.featured) || filtered[0];
  const rest = filtered.filter(a => a !== featured);
  const readCount = readArticles.length;
  const totalFree = ARTICLES.filter(a => !a.premium).length;

  const handleOpen = (article) => {
    if (article.premium && !isPremium) { onUpgrade(); return; }
    setSelectedArticle(article);
  };

  return (
    <div className="fade-up pb-8">

      {/* Header */}
      <div className="mb-5">
        <div className="flex items-center gap-2 mb-1">
          <span style={{ color: '#7BB3FF' }}><Icon name="book" size={20} /></span>
          <h1 className="font-serif text-4xl">Apprendre</h1>
        </div>
        <p className="text-sm text-[#A0A3A8]">
          Finance, fiscalité, stratégie — tout ce qu'il faut savoir pour investir intelligemment en France.
        </p>
      </div>

      {/* Progress */}
      {readCount > 0 && (
        <div className="card dark-card p-4 mb-5 flex items-center gap-4"
          style={{ background: 'linear-gradient(135deg,#141619,#1A1D21)', borderColor: '#B8FF5A25' }}>
          <div className="flex-1">
            <div className="text-[10px] text-[#6E7074] font-mono uppercase tracking-wider mb-1.5">
              Ta progression
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
              <div className="h-full rounded-full transition-all"
                style={{ width: `${Math.min(100,(readCount / ARTICLES.length) * 100).toFixed(0)}%`, background: '#B8FF5A' }} />
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="font-mono text-lg text-[#B8FF5A]">{readCount}</div>
            <div className="text-[10px] text-[#6E7074] font-mono">/ {ARTICLES.length} lus</div>
          </div>
        </div>
      )}

      {/* Category filter */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
        {categories.map(cat => (
          <button key={cat.id} onClick={() => setActiveCategory(cat.id)}
            className="px-3.5 py-1.5 rounded-full text-xs font-mono uppercase tracking-wider whitespace-nowrap transition flex-shrink-0"
            style={{
              background: activeCategory === cat.id ? cat.color + '20' : 'transparent',
              color: activeCategory === cat.id ? cat.color : '#6E7074',
              border: `1px solid ${activeCategory === cat.id ? cat.color + '40' : 'var(--border)'}`,
            }}>
            {cat.label}
          </button>
        ))}
      </div>

      {/* Featured article */}
      {featured && (
        <button onClick={() => handleOpen(featured)}
          className="w-full card p-6 mb-4 text-left relative overflow-hidden fade-up hover:border-[#3A3F46] transition"
          style={{ borderColor: featured.catColor + '35' }}>
          {/* Glow */}
          <div className="absolute top-0 right-0 w-32 h-32 opacity-10 pointer-events-none"
            style={{ background: `radial-gradient(circle, ${featured.catColor}, transparent 70%)` }} />

          <div className="flex items-start justify-between mb-3">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider"
              style={{ background: featured.catColor + '15', color: featured.catColor, border: `1px solid ${featured.catColor}30` }}>
              ⭐ À lire en premier
            </div>
            {readArticles.includes(featured.id) && (
              <span className="text-[10px] px-2 py-0.5 rounded-full font-mono"
                style={{ background: '#B8FF5A20', color: '#B8FF5A' }}>✓ Lu</span>
            )}
          </div>

          <div className="text-4xl mb-3">{featured.emoji}</div>
          <h2 className="font-serif text-2xl mb-2 leading-tight">{featured.title}</h2>
          <p className="text-sm text-[#A0A3A8] mb-4 leading-relaxed">{featured.desc}</p>

          <div className="flex items-center gap-3 text-[10px] font-mono text-[#6E7074]">
            <span>{featured.time} min</span>
            <span>·</span>
            <span style={{ color: featured.catColor }}>{featured.catLabel}</span>
            <span>·</span>
            <span>{featured.level}</span>
          </div>
        </button>
      )}

      {/* Article grid */}
      <div className="space-y-3">
        {rest.map((article, i) => (
          <button key={article.id}
            onClick={() => handleOpen(article)}
            className="w-full card p-4 text-left flex items-center gap-4 hover:border-[#3A3F46] transition fade-up relative"
            style={{ animationDelay: `${i * 0.04}s`, opacity: article.premium && !isPremium ? 0.75 : 1 }}>

            {/* Emoji */}
            <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
              style={{ background: article.catColor + '15', border: `1px solid ${article.catColor}25` }}>
              {article.premium && !isPremium ? '🔒' : article.emoji}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-sm font-medium truncate">{article.title}</span>
                {readArticles.includes(article.id) && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full flex-shrink-0"
                    style={{ background: '#B8FF5A20', color: '#B8FF5A' }}>✓</span>
                )}
              </div>
              <div className="flex items-center gap-2 text-[10px] font-mono text-[#4A4D52]">
                <span>{article.time} min</span>
                <span>·</span>
                <span style={{ color: article.catColor }}>{article.catLabel}</span>
                <span>·</span>
                <span>{article.level}</span>
                {article.premium && !isPremium && (
                  <>
                    <span>·</span>
                    <span style={{ color: '#E8C547' }}>Premium</span>
                  </>
                )}
              </div>
            </div>

            {/* Arrow */}
            <Icon name="arrow" size={14} className="text-[#3A3F46] flex-shrink-0" />
          </button>
        ))}
      </div>

      {/* Premium upsell if not premium */}
      {!isPremium && ARTICLES.some(a => a.premium) && (
        <div className="card dark-card p-5 mt-5 text-center"
          style={{ background: 'linear-gradient(135deg,#141619,#1A1D21)', borderColor: '#E8C54730' }}>
          <div className="text-2xl mb-2">🔒</div>
          <div className="font-serif text-xl mb-1">
            {ARTICLES.filter(a => a.premium).length} articles avancés
          </div>
          <p className="text-sm text-[#A0A3A8] mb-4">
            Diversification avancée, stratégie FIRE, fiscalité optimisée.
          </p>
          <button onClick={onUpgrade} className="btn-gold px-5 py-2.5 rounded-full text-sm">
            Débloquer avec Premium
          </button>
        </div>
      )}

      {/* Article reader overlay */}
      {selectedArticle && (
        <ArticleReader
          article={selectedArticle}
          onClose={() => setSelectedArticle(null)}
          onMarkRead={onMarkRead}
          isRead={readArticles.includes(selectedArticle.id)}
          isPremium={isPremium}
          onUpgrade={onUpgrade}
        />
      )}
    </div>
  );
};


const Community = ({ user, assets }) => {
  const total = assets.reduce((s, a) => s + (a.value || 0), 0);
  const bench = getBenchmark(user.age);
  const percentile = total > 0 ? getPercentile(total, bench) : 0;

  const comparisonData = Object.entries(BENCHMARKS).map(([age, b]) => ({
    age: `${age} ans`, médiane: b.median, top25: b.p75, top10: b.p90,
    toi: parseInt(age) === user.age ? total : null,
  }));

  return (
    <div className="fade-up">
      <div className="mb-8">
        <h1 className="font-serif text-4xl mb-2">Ton rang</h1>
        <p className="text-[#A0A3A8]">Compare-toi aux autres jeunes investisseurs français de ton âge.</p>
      </div>

      <div className="card dark-card p-8 mb-5 text-center" style={{ background: 'linear-gradient(135deg, #141619 0%, #1A1D21 100%)' }}>
        <div className="text-xs text-[#E8C547] font-mono uppercase tracking-widest mb-3">Ton rang à {user.age} ans</div>
        <div className="font-serif text-7xl md:text-8xl mb-3">Top <span className="shimmer-gold">{100 - percentile}%</span></div>
        <p className="text-[#A0A3A8]">Tu fais mieux que <strong className="text-white font-mono">{percentile}%</strong> des Français de ton âge.</p>
      </div>

      <div className="card p-6 mb-5">
        <div className="text-xs text-[#6E7074] font-mono uppercase tracking-wider mb-4">Combien ont les jeunes de ton âge ?</div>
        <div style={{ height: 280 }}>
          <ResponsiveContainer>
            <BarChart data={comparisonData}>
              <XAxis dataKey="age" tick={{ fontSize: 11, fill: '#A0A3A8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#6E7074' }} axisLine={false} tickLine={false}
                tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }}
                formatter={(v) => fmt(v)} />
              <Bar dataKey="médiane" fill="#3A3F46" radius={[4,4,0,0]} />
              <Bar dataKey="top25" fill="#6E7074" radius={[4,4,0,0]} />
              <Bar dataKey="top10" fill="#E8C547" radius={[4,4,0,0]} />
              <Bar dataKey="toi" fill="#B8FF5A" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex flex-wrap gap-4 mt-4 text-xs">
          {[{ c: 'var(--border-2)', l: 'Médiane' }, { c: '#6E7074', l: 'Top 25%' }, { c: '#E8C547', l: 'Top 10%' }, { c: '#B8FF5A', l: 'Toi' }].map(l => (
            <div key={l.l} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm" style={{ background: l.c }} />
              <span className="text-[#A0A3A8]">{l.l}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="card p-6">
        <div className="text-xs text-[#6E7074] font-mono uppercase tracking-wider mb-4">Tes prochains objectifs de patrimoine</div>
        <div className="space-y-3">
          {[
            { label: 'Médiane', val: bench.median, emoji: '🎯' },
            { label: 'Top 25%', val: bench.p75, emoji: '🔥' },
            { label: 'Top 10%', val: bench.p90, emoji: '🚀' },
            { label: 'Top 1% · Elite', val: bench.p99, emoji: '👑' },
          ].map(m => {
            const done = total >= m.val;
            const progress = Math.min(100, (total / m.val) * 100);
            return (
              <div key={m.label} className="py-2">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <span>{m.emoji}</span>
                    <span className="text-sm">{m.label}</span>
                    {done && <span className="text-xs px-2 py-0.5 rounded-full font-mono uppercase"
                      style={{ background: '#B8FF5A20', color: '#B8FF5A' }}>Atteint</span>}
                  </div>
                  <div className="font-mono text-sm">{fmt(total)} <span className="text-[#6E7074]">/ {fmt(m.val)}</span></div>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                  <div className="h-full rounded-full transition-all"
                    style={{ width: `${progress}%`, background: done ? '#B8FF5A' : '#E8C547' }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

/* ========== SHARE (NEW v3) ========== */

/* ========== MILESTONE CARD (feature 10) ========== */


/* ========== CONFETTI ========== */

const useConfetti = () => {
  const launch = (opts = {}) => {
    const {
      count = 120,
      colors = ['#B8FF5A', '#E8C547', '#B598FF', '#7BB3FF', '#FF6B6B', '#FFFFFF', '#FFE898'],
      duration = 3000,
      spread = 1,
    } = opts;

    const container = document.createElement('div');
    container.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:9999;overflow:hidden;';
    document.body.appendChild(container);

    for (let i = 0; i < count; i++) {
      const piece = document.createElement('div');
      const color = colors[Math.floor(Math.random() * colors.length)];
      const size = Math.random() * 8 + 5;
      const isRect = Math.random() > 0.4;
      const startX = Math.random() * 100;
      const delay = Math.random() * 600;
      const fallDuration = Math.random() * 2000 + 1500;
      const rotateSpeed = Math.random() * 720 - 360;
      const drift = (Math.random() - 0.5) * 200 * spread;

      piece.style.cssText = `
        position:absolute;
        left:${startX}%;
        top:-20px;
        width:${isRect ? size : size * 0.6}px;
        height:${isRect ? size * 0.4 : size}px;
        background:${color};
        border-radius:${isRect ? '2px' : '50%'};
        opacity:1;
        animation: confetti-fall ${fallDuration}ms ${delay}ms cubic-bezier(0.25,0.46,0.45,0.94) forwards;
        --drift: ${drift}px;
        --rotate: ${rotateSpeed}deg;
      `;
      container.appendChild(piece);
    }

    // Inject keyframes once
    if (!document.getElementById('confetti-style')) {
      const style = document.createElement('style');
      style.id = 'confetti-style';
      style.textContent = '@keyframes confetti-fall{0%{transform:translateY(0) translateX(0) rotate(0deg);opacity:1}80%{opacity:1}100%{transform:translateY(110vh) translateX(var(--drift)) rotate(var(--rotate));opacity:0}}';
      document.head.appendChild(style);
    }

    setTimeout(() => {
      if (container.parentNode) container.parentNode.removeChild(container);
    }, duration + 800);
  };

  return { launch };
};

const MilestoneCard = ({ achievement, total, user, onClose }) => {
  const canvasRef = React.useRef(null);
  const [generated, setGenerated] = React.useState(false);
  const [dataUrl, setDataUrl]     = React.useState(null);
  const [copied, setCopied]       = React.useState(false);
  const { launch: launchConfetti } = useConfetti();

  // 🎉 Lance les confetti dès que la milestone card apparaît
  React.useEffect(() => {
    const pal = {
      thousand:   ['#B8FF5A', '#FFFFFF', '#B8FF5A80'],
      fivek:      ['#E8C547', '#FFE898', '#FFFFFF'],
      tenk:       ['#7BB3FF', '#FFFFFF', '#B8FF5A'],
      twentyfive: ['#B598FF', '#E8C547', '#FFFFFF'],
      fifty:      ['#00D4FF', '#FFFFFF', '#B8FF5A'],
      hundred:    ['#E8C547', '#FFD700', '#FFFFFF', '#B8FF5A'],
    };
    setTimeout(() => {
      launchConfetti({
        count: 150,
        colors: pal[achievement.id] || pal.thousand,
        duration: 4000,
        spread: 1.2,
      });
    }, 200);
  }, []);

  // Palette par palier
  const palette = {
    thousand:   { bg: ['var(--bg)','#0F1A0A'], accent: '#B8FF5A', glow: '#B8FF5A' },
    fivek:      { bg: ['var(--bg)','#1A0F00'], accent: '#E8C547', glow: '#E8C547' },
    tenk:       { bg: ['var(--bg)','#0F0A1A'], accent: '#7BB3FF', glow: '#7BB3FF' },
    twentyfive: { bg: ['var(--bg)','#1A0A14'], accent: '#B598FF', glow: '#B598FF' },
    fifty:      { bg: ['var(--bg)','#0A1020'], accent: '#00D4FF', glow: '#00D4FF' },
    hundred:    { bg: ['var(--bg)','#1A1400'], accent: '#E8C547', glow: '#FFD700' },
  };
  const pal = palette[achievement.id] || palette.thousand;

  // Générer le canvas côté client
  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = 1080, H = 1350; // ratio 4:5 TikTok
    canvas.width = W;
    canvas.height = H;

    // ── Fond dégradé ──────────────────────────────
    const grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, pal.bg[0]);
    grad.addColorStop(1, pal.bg[1]);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // ── Grain texture (bruit subtil) ──────────────
    for (let i = 0; i < 12000; i++) {
      const x = Math.random() * W;
      const y = Math.random() * H;
      const a = Math.random() * 0.04;
      ctx.fillStyle = `rgba(255,255,255,${a})`;
      ctx.fillRect(x, y, 1, 1);
    }

    // ── Glow central ──────────────────────────────
    const glow = ctx.createRadialGradient(W/2, H*0.42, 0, W/2, H*0.42, 500);
    glow.addColorStop(0, pal.glow + '28');
    glow.addColorStop(1, 'transparent');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, W, H);

    // ── Grille déco (lignes fines) ────────────────
    ctx.strokeStyle = 'rgba(255,255,255,0.03)';
    ctx.lineWidth = 1;
    for (let x = 0; x < W; x += 80) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    }
    for (let y = 0; y < H; y += 80) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }

    // ── Cercle déco derrière l'emoji ──────────────
    const cx = W / 2, cy = H * 0.32;
    const ringGrad = ctx.createRadialGradient(cx, cy, 120, cx, cy, 200);
    ringGrad.addColorStop(0, pal.accent + '20');
    ringGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = ringGrad;
    ctx.beginPath(); ctx.arc(cx, cy, 200, 0, Math.PI * 2); ctx.fill();

    // Anneau
    ctx.strokeStyle = pal.accent + '30';
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(cx, cy, 165, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = pal.accent + '15';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(cx, cy, 195, 0, Math.PI * 2); ctx.stroke();

    // ── Emoji ─────────────────────────────────────
    ctx.font = '160px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(achievement.emoji, cx, cy);

    // ── Palier label ──────────────────────────────
    ctx.font = '700 48px monospace';
    ctx.fillStyle = pal.accent + 'CC';
    ctx.letterSpacing = '6px';
    ctx.fillText('PALIER ATTEINT', cx, H * 0.50);

    // ── Montant ───────────────────────────────────
    const fmtBig = (v) => {
      if (v >= 1000000) return `${(v/1000000).toFixed(2)}M€`;
      if (v >= 1000)    return `${(v/1000).toFixed(1).replace('.0','')}k€`;
      return `${v}€`;
    };
    ctx.font = `900 ${total >= 100000 ? 168 : total >= 10000 ? 190 : 210}px Georgia, serif`;
    ctx.fillStyle = 'var(--text)';
    ctx.shadowColor = pal.glow;
    ctx.shadowBlur = 40;
    ctx.fillText(fmtBig(total), cx, H * 0.595);
    ctx.shadowBlur = 0;

    // ── Label achievement ─────────────────────────
    ctx.font = '500 52px system-ui, sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.fillText(achievement.label, cx, H * 0.70);

    // ── Ligne déco ────────────────────────────────
    const lineY = H * 0.755;
    ctx.strokeStyle = pal.accent + '40';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(W*0.3, lineY); ctx.lineTo(W*0.7, lineY); ctx.stroke();

    // ── Âge ───────────────────────────────────────
    ctx.font = '400 40px monospace';
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.fillText(`${user.age} ans · en route vers la liberté`, cx, H * 0.795);

    // ── Logo Magot ────────────────────────────────
    ctx.font = `italic 700 58px Georgia, serif`;
    ctx.fillStyle = pal.accent;
    ctx.shadowColor = pal.glow;
    ctx.shadowBlur = 20;
    ctx.fillText('Magot.', cx, H * 0.88);
    ctx.shadowBlur = 0;

    // ── URL ───────────────────────────────────────
    ctx.font = '400 30px monospace';
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.fillText('magot.fr', cx, H * 0.915);

    const url = canvas.toDataURL('image/png');
    setDataUrl(url);
    setGenerated(true);
  }, []);

  const handleDownload = () => {
    if (!dataUrl) return;
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `magot-${achievement.id}-${Date.now()}.png`;
    a.click();
  };

  const handleCopy = async () => {
    if (!dataUrl) return;
    try {
      const res  = await fetch(dataUrl);
      const blob = await res.blob();
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      handleDownload(); // fallback
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 fade-in"
      style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}>

      <div className="w-full sm:max-w-sm scale-in"
        style={{ background: 'var(--bg)', borderRadius: '24px 24px 0 0', border: '1px solid var(--border)', padding: '24px 20px 40px' }}
        onClick={e => e.stopPropagation()}>

        {/* Poignée */}
        <div className="w-10 h-1 rounded-full mx-auto mb-6" style={{ background: 'var(--border-2)' }} />

        {/* Titre */}
        <div className="text-center mb-5">
          <div className="text-3xl mb-2">{achievement.emoji}</div>
          <h2 className="font-serif text-2xl mb-1">Palier atteint !</h2>
          <p className="text-sm text-[#6E7074]">
            Ta carte est prête à partager sur TikTok ou Instagram.
          </p>
        </div>

        {/* Aperçu carte */}
        <div className="rounded-2xl overflow-hidden mb-5 mx-auto" style={{ maxWidth: 280, border: `1px solid ${pal.accent}30` }}>
          {generated && dataUrl ? (
            <img src={dataUrl} alt="Carte palier" className="w-full" style={{ display: 'block' }} />
          ) : (
            <div className="flex items-center justify-center" style={{ height: 350, background: 'var(--bg-card)' }}>
              <div className="text-sm text-[#6E7074] font-mono">Génération...</div>
            </div>
          )}
        </div>

        {/* Canvas caché */}
        <canvas ref={canvasRef} style={{ display: 'none' }} />

        {/* Actions */}
        <div className="flex gap-2 mb-3">
          <button onClick={handleDownload}
            className="flex-1 py-3 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2 transition"
            style={{ background: pal.accent, color: 'var(--bg)' }}>
            <Icon name="arrow" size={14} style={{ transform: 'rotate(90deg)' }} />
            Télécharger
          </button>
          <button onClick={handleCopy}
            className="flex-1 py-3 rounded-2xl text-sm font-semibold transition"
            style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)', color: copied ? '#B8FF5A' : 'var(--text)' }}>
            {copied ? '✓ Copié !' : 'Copier l\'image'}
          </button>
        </div>

        <button onClick={onClose}
          className="w-full py-3 rounded-2xl text-sm text-[#6E7074] transition hover:text-white">
          Plus tard
        </button>
      </div>
    </div>
  );
};


/* ========== CONNECT — Agrégation brokers FR (feature 11) ========== */

const BROKERS = [
  {
    id: 'trade-republic', name: 'Trade Republic', category: 'bourse',
    logo: '🟢', color: '#00B377', bg: '#001A0F',
    desc: 'PEA · CTO · Compte épargne',
    popular: true, available: true,
  },
  {
    id: 'boursorama', name: 'Boursorama', category: 'bourse',
    logo: '🔵', color: '#0066CC', bg: '#000F1A',
    desc: 'PEA · CTO · Livret · Assurance-vie',
    popular: true, available: true,
  },
  {
    id: 'fortuneo', name: 'Fortuneo', category: 'bourse',
    logo: '🟠', color: '#FF6B00', bg: '#1A0A00',
    desc: 'PEA · CTO · Assurance-vie',
    popular: false, available: true,
  },
  {
    id: 'binance', name: 'Binance', category: 'crypto',
    logo: '🟡', color: '#F3BA2F', bg: '#1A1500',
    desc: 'Spot · Staking · Futures',
    popular: true, available: true,
  },
  {
    id: 'coinbase', name: 'Coinbase', category: 'crypto',
    logo: '🔷', color: '#1652F0', bg: '#000B1A',
    desc: 'Crypto · Staking',
    popular: false, available: true,
  },
  {
    id: 'kraken', name: 'Kraken', category: 'crypto',
    logo: '🦑', color: '#5741D9', bg: '#0A001A',
    desc: 'Crypto · Staking · Futures',
    popular: false, available: true,
  },
  {
    id: 'linxea', name: 'Linxea', category: 'assurance',
    logo: '🛡️', color: '#2ECC71', bg: '#001A0A',
    desc: 'Assurance-vie · PER',
    popular: false, available: false,
  },
  {
    id: 'caisse-epargne', name: 'Caisse d\'Épargne', category: 'banque',
    logo: '🏦', color: '#7B68EE', bg: '#0A001A',
    desc: 'Livret A · LDDS · PEA',
    popular: false, available: false,
  },
  {
    id: 'credit-agricole', name: 'Crédit Agricole', category: 'banque',
    logo: '🌿', color: '#008A00', bg: '#001400',
    desc: 'Livret · Assurance-vie',
    popular: false, available: false,
  },
];

const CATEGORIES = [
  { id: 'all',       label: 'Tous',           color: '#B8FF5A' },
  { id: 'bourse',    label: 'Bourse & PEA',   color: '#7BB3FF' },
  { id: 'crypto',    label: 'Crypto',         color: '#E8C547' },
  { id: 'assurance', label: 'Assurance-vie',  color: '#B598FF' },
  { id: 'banque',    label: 'Banque',         color: '#FF6B6B' },
];

const Connect = ({ user, assets, showToast, onUpgrade }) => {
  const isPremium   = user?.plan !== 'free';
  const [cat, setCat]           = useState('all');
  const [connecting, setConnecting] = useState(null); // broker id en cours
  const [connected, setConnected]   = useState(new Set());
  const [syncAnim, setSyncAnim]     = useState(null);

  const filtered = cat === 'all' ? BROKERS : BROKERS.filter(b => b.category === cat);

  const handleConnect = async (broker) => {
    if (!broker.available) {
      showToast('Bientôt disponible — rejoins la liste d\'attente !');
      return;
    }
    if (!isPremium) { onUpgrade(); return; }
    if (connected.has(broker.id)) {
      // Sync
      setSyncAnim(broker.id);
      await new Promise(r => setTimeout(r, 1800));
      setSyncAnim(null);
      showToast(`✓ ${broker.name} synchronisé`);
      return;
    }
    setConnecting(broker.id);
    // Simuler connexion OAuth
    await new Promise(r => setTimeout(r, 2200));
    setConnected(prev => new Set([...prev, broker.id]));
    setConnecting(null);
    showToast(`🔗 ${broker.name} connecté !`);
  };

  const connectedList = BROKERS.filter(b => connected.has(b.id));

  return (
    <div className="fade-up pb-10">

      {/* ── Header ─────────────────────────────────── */}
      <div className="mb-7">
        <div className="flex items-center gap-2 mb-1">
          <span style={{ color: '#7BB3FF' }}><Icon name="link" size={20} /></span>
          <h1 className="font-serif text-4xl">Connecter</h1>
        </div>
        <p className="text-sm text-[#A0A3A8]">
          Importe automatiquement tes actifs depuis tes courtiers et exchanges.
        </p>
      </div>

      {/* ── Comptes connectés ──────────────────────── */}
      {connectedList.length > 0 && (
        <div className="card dark-card p-5 mb-5"
          style={{ background: 'linear-gradient(135deg,#141619,#141A1E)', borderColor: '#7BB3FF25' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="text-[10px] text-[#7BB3FF] font-mono uppercase tracking-widest">
              {connectedList.length} compte{connectedList.length > 1 ? 's' : ''} connecté{connectedList.length > 1 ? 's' : ''}
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-[#B8FF5A] animate-pulse" />
              <span className="text-[10px] font-mono text-[#B8FF5A]">Sync auto activée</span>
            </div>
          </div>
          <div className="space-y-2">
            {connectedList.map(b => (
              <div key={b.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                    style={{ background: b.bg, border: `1px solid ${b.color}30` }}>
                    {b.logo}
                  </div>
                  <div>
                    <div className="text-sm font-medium">{b.name}</div>
                    <div className="text-[10px] text-[#6E7074] font-mono">
                      {syncAnim === b.id ? 'Synchronisation...' : 'Synchronisé · il y a quelques secondes'}
                    </div>
                  </div>
                </div>
                <button onClick={() => handleConnect(b)}
                  className="text-[10px] font-mono px-3 py-1.5 rounded-full transition"
                  style={{ border: `1px solid ${b.color}40`, color: b.color,
                    background: syncAnim === b.id ? b.color + '15' : 'transparent' }}>
                  {syncAnim === b.id ? '⟳ Sync...' : '↺ Sync'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Premium gate ───────────────────────────── */}
      {!isPremium && (
        <div className="card dark-card p-5 mb-5 relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg,#141619,#1A1D21)', borderColor: '#E8C54730' }}>
          <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, #E8C54715, transparent 70%)' }} />
          <div className="relative flex items-start gap-4">
            <div className="text-3xl flex-shrink-0">🔗</div>
            <div className="flex-1">
              <div className="font-serif text-xl mb-1">Import automatique</div>
              <p className="text-sm text-[#A0A3A8] mb-4 leading-relaxed">
                Connecte tes courtiers et exchanges — tes actifs se mettent à jour automatiquement.
                Plus besoin de tout saisir à la main.
              </p>
              <button onClick={onUpgrade}
                className="btn-gold px-5 py-2.5 rounded-full text-sm font-semibold">
                Activer avec Premium
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Filtre catégorie ───────────────────────── */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
        {CATEGORIES.map(c => (
          <button key={c.id} onClick={() => setCat(c.id)}
            className="px-3.5 py-1.5 rounded-full text-xs font-mono uppercase tracking-wider whitespace-nowrap transition flex-shrink-0"
            style={{
              background: cat === c.id ? c.color + '18' : 'transparent',
              color: cat === c.id ? c.color : '#6E7074',
              border: `1px solid ${cat === c.id ? c.color + '40' : 'var(--border)'}`,
            }}>
            {c.label}
          </button>
        ))}
      </div>

      {/* ── Liste brokers ──────────────────────────── */}
      <div className="space-y-2 mb-6">
        {filtered.map((broker, i) => {
          const isConnected  = connected.has(broker.id);
          const isConnecting = connecting === broker.id;
          const isSyncing    = syncAnim === broker.id;

          return (
            <div key={broker.id}
              className="card p-4 flex items-center gap-4 fade-up"
              style={{ animationDelay: `${i * 0.04}s`,
                borderColor: isConnected ? broker.color + '30' : 'var(--border-3)',
                background: isConnected ? broker.bg : 'var(--bg-card)',
                opacity: !broker.available && !isPremium ? 0.6 : 1 }}>

              {/* Logo */}
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                style={{ background: broker.bg, border: `1px solid ${broker.color}30` }}>
                {broker.logo}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-sm font-semibold">{broker.name}</span>
                  {broker.popular && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full font-mono uppercase"
                      style={{ background: broker.color + '15', color: broker.color }}>
                      Populaire
                    </span>
                  )}
                  {isConnected && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full font-mono uppercase"
                      style={{ background: '#B8FF5A20', color: '#B8FF5A' }}>
                      ✓ Connecté
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-[#6E7074] font-mono">{broker.desc}</div>
                {!broker.available && (
                  <div className="text-[10px] text-[#E8C547] font-mono mt-0.5">Bientôt disponible</div>
                )}
              </div>

              {/* CTA */}
              <button
                onClick={() => handleConnect(broker)}
                disabled={isConnecting}
                className="flex-shrink-0 px-4 py-2 rounded-xl text-xs font-semibold transition"
                style={{
                  background: isConnected
                    ? 'transparent'
                    : isPremium && broker.available
                      ? broker.color
                      : 'var(--bg-subtle)',
                  color: isConnected
                    ? broker.color
                    : isPremium && broker.available
                      ? 'var(--bg)'
                      : '#6E7074',
                  border: isConnected ? `1px solid ${broker.color}40` : '1px solid transparent',
                  minWidth: 80,
                }}>
                {isConnecting
                  ? <span className="flex items-center gap-1.5">
                      <span className="inline-block w-3 h-3 rounded-full border-2 border-t-transparent animate-spin"
                        style={{ borderColor: 'var(--bg)', borderTopColor: 'transparent' }} />
                      Connexion
                    </span>
                  : isConnected
                    ? '✓ Lié'
                    : !broker.available
                      ? 'Bientôt'
                      : isPremium
                        ? 'Connecter'
                        : '🔒 Premium'
                }
              </button>
            </div>
          );
        })}
      </div>

      {/* ── Comment ça marche ──────────────────────── */}
      <div className="card p-5 mb-5">
        <div className="text-[10px] text-[#6E7074] font-mono uppercase tracking-widest mb-4">
          Comment ça marche
        </div>
        <div className="space-y-4">
          {[
            { step: '01', icon: '🔐', title: 'Connexion sécurisée', desc: 'Tu autorises l\'accès en lecture seule via OAuth — jamais de mot de passe stocké sur nos serveurs.' },
            { step: '02', icon: '📥', title: 'Import automatique', desc: 'Tes actifs, soldes et historique sont importés et ajoutés à ton dashboard Magot.' },
            { step: '03', icon: '🔄', title: 'Sync quotidienne', desc: 'Chaque nuit, Magot met à jour tes positions. Tu n\'as plus rien à faire.' },
          ].map(s => (
            <div key={s.step} className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                style={{ background: 'var(--bg-input)', border: '1px solid var(--border)' }}>
                {s.icon}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[9px] font-mono text-[#3A3F46]">{s.step}</span>
                  <span className="text-sm font-semibold">{s.title}</span>
                </div>
                <p className="text-xs text-[#6E7074] leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Sécurité ───────────────────────────────── */}
      <div className="rounded-2xl p-4 flex items-start gap-3"
        style={{ background: 'var(--bg-input)', border: '1px solid var(--border)' }}>
        <span className="text-lg flex-shrink-0 mt-0.5">🔒</span>
        <div>
          <div className="text-xs font-semibold mb-1">Lecture seule · Jamais d'ordres</div>
          <p className="text-xs text-[#6E7074] leading-relaxed">
            Magot ne peut que lire tes positions. Il est techniquement impossible de passer des ordres ou de déplacer des fonds depuis notre plateforme. Tes identifiants ne transitent jamais par nos serveurs.
          </p>
        </div>
      </div>

    </div>
  );
};


const Share = ({ user, assets, showToast }) => {
  const [shareId, setShareId] = useState(null);
  const [publishing, setPublishing] = useState(false);
  const [copied, setCopied] = useState(false);

  const total = assets.reduce((s, a) => s + (a.value || 0), 0);
  const bench = getBenchmark(user.age);
  const percentile = total > 0 ? getPercentile(total, bench) : 0;
  const passive = assets.reduce((s, a) => s + ((a.value || 0) * (a.yield || 0)) / 100, 0);
  const passivePct = total > 0 ? (passive / total) * 100 : 0;
  const unlocked = getUnlockedAchievements(assets, total, user);
  const allocation = Object.entries(
    assets.reduce((acc, a) => { acc[a.type] = (acc[a.type] || 0) + a.value; return acc; }, {})
  ).map(([type, value]) => ({ type, pct: total > 0 ? (value / total) * 100 : 0, ...ASSET_TYPES[type] }))
   .sort((a, b) => b.pct - a.pct);

  const publicData = {
    age: user.age,
    percentile,
    topLabel: `Top ${100 - percentile}%`,
    allocationPcts: allocation.map(a => ({ type: a.type, label: a.label, emoji: a.emoji, color: a.color, pct: a.pct })),
    assetCount: assets.length,
    diversityCount: new Set(assets.map(a => a.type)).size,
    passivePct: passivePct.toFixed(1),
    achievementCount: unlocked.size,
    topAchievements: ACHIEVEMENTS.filter(a => unlocked.has(a.id)).slice(-3).map(a => ({ emoji: a.emoji, label: a.label })),
    generatedAt: Date.now(),
  };

  const publish = async () => {
    if (assets.length === 0) {
      showToast('Ajoute des actifs avant de partager', 'error');
      return;
    }
    setPublishing(true);
    try {
      const id = shortId();
      await storage.set(`share:${id}`, publicData, true);
      setShareId(id);
      showToast('Profil public généré ✓');
    } catch {
      showToast('Erreur lors du partage', 'error');
    }
    setPublishing(false);
  };

  const shareUrl = shareId ? `https://magot.fr/u/${shareId}` : '';

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      showToast('Lien copié');
    } catch {
      showToast('Copie manuelle nécessaire', 'error');
    }
  };

  return (
    <div className="fade-up">
      <div className="mb-8">
        <h1 className="font-serif text-4xl mb-2">Partager</h1>
        <p className="text-[#A0A3A8]">Génère une carte publique anonymisée pour TikTok, Twitter ou Instagram. Aucun montant absolu exposé.</p>
      </div>

      <div className="card dark-card p-5 mb-6" style={{ borderColor: '#B598FF30', background: 'linear-gradient(135deg, #141619 0%, #1A1A2A 100%)' }}>
        <div className="flex items-start gap-3">
          <span className="text-xl">🔒</span>
          <div>
            <div className="text-sm font-semibold mb-1" style={{ color: '#B598FF' }}>Ce qui est partagé</div>
            <div className="text-xs text-[#A0A3A8] leading-relaxed">
              Ton rang (top X%), ta tranche d'âge, ta répartition en <strong>pourcentages</strong>, le nombre de classes d'actifs, tes trophées. <strong className="text-white">Jamais les montants absolus</strong>, ton nom ou ton email.
            </div>
          </div>
        </div>
      </div>

      <div className="share-card rounded-2xl p-8 mb-6" style={{ aspectRatio: '4/5', maxWidth: 500, margin: '0 auto 24px' }}>
        <div className="relative h-full flex flex-col" style={{ zIndex: 2 }}>
          <div className="flex items-center justify-between mb-6">
            <Logo size="sm" />
            <div className="text-[10px] text-[#6E7074] font-mono uppercase tracking-widest">Public profile</div>
          </div>

          <div className="flex-1 flex flex-col justify-center text-center">
            <div className="text-xs text-[#E8C547] font-mono uppercase tracking-widest mb-4">
              Patrimoine · {user.age} ans
            </div>
            <div className="font-serif text-7xl md:text-8xl mb-2 leading-none">
              Top <span className="shimmer-gold">{100 - percentile}%</span>
            </div>
            <div className="text-sm text-[#A0A3A8] mb-8">
              Mieux que {percentile}% des Français de mon âge
            </div>

            <div className="grid grid-cols-3 gap-3 mb-6">
              <div>
                <div className="font-serif text-2xl text-[#B8FF5A]">{publicData.diversityCount}</div>
                <div className="text-[9px] text-[#6E7074] font-mono uppercase tracking-wider">Classes</div>
              </div>
              <div>
                <div className="font-serif text-2xl shimmer-green">{publicData.passivePct}%</div>
                <div className="text-[9px] text-[#6E7074] font-mono uppercase tracking-wider">Yield moyen</div>
              </div>
              <div>
                <div className="font-serif text-2xl text-[#E8C547]">{publicData.achievementCount}</div>
                <div className="text-[9px] text-[#6E7074] font-mono uppercase tracking-wider">Trophées</div>
              </div>
            </div>

            <div className="mb-4">
              <div className="flex h-2.5 rounded-full overflow-hidden">
                {publicData.allocationPcts.map((a, i) => (
                  <div key={i} style={{ width: `${a.pct}%`, background: a.color }} />
                ))}
              </div>
              <div className="flex justify-center gap-2 mt-2 flex-wrap">
                {publicData.allocationPcts.slice(0, 4).map(a => (
                  <div key={a.type} className="flex items-center gap-1 text-[10px]">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: a.color }} />
                    <span className="text-[#A0A3A8] font-mono">{a.label} {a.pct.toFixed(0)}%</span>
                  </div>
                ))}
              </div>
            </div>

            {publicData.topAchievements.length > 0 && (
              <div className="flex justify-center gap-2 mt-2">
                {publicData.topAchievements.map((a, i) => (
                  <div key={i} className="text-2xl" title={a.label}>{a.emoji}</div>
                ))}
              </div>
            )}
          </div>

          <div className="text-center pt-6 mt-auto border-t border-[#26292E]">
            <div className="text-[10px] text-[#6E7074] font-mono uppercase tracking-widest">
              magot.fr · tracker patrimoine FR
            </div>
          </div>
        </div>
      </div>

      {!shareId ? (
        <div className="text-center">
          <button onClick={publish} disabled={publishing || assets.length === 0}
            className="btn-primary px-8 py-3.5 rounded-full flex items-center gap-2 mx-auto">
            {publishing ? <><div className="spinner" /> Publication...</> : <><Icon name="share" size={14} /> Générer mon lien public</>}
          </button>
          <div className="text-xs text-[#6E7074] mt-3 font-mono">Valide 30 jours · révocable à tout moment</div>
        </div>
      ) : (
        <div className="card p-5 space-y-3" style={{ background: 'var(--bg-input)' }}>
          <div>
            <div className="text-xs text-[#6E7074] font-mono uppercase tracking-wider mb-2">Ton lien de partage</div>
            <div className="flex gap-2">
              <input className="input font-mono text-sm" readOnly value={shareUrl} />
              <button onClick={copy} className="btn-primary px-4 rounded-full text-sm flex items-center gap-2 whitespace-nowrap">
                <Icon name="copy" size={14} /> {copied ? 'Copié ✓' : 'Copier'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-[#26292E]">
            <button onClick={() => { const url = encodeURIComponent(shareUrl); window.open(`https://twitter.com/intent/tweet?text=Mon+patrimoine+à+${user.age}+ans+→+Top+${100-percentile}%25&url=${url}`, '_blank'); }}
              className="btn-ghost py-2.5 rounded-full text-xs flex items-center justify-center gap-2">
              𝕏 Twitter
            </button>
            <button onClick={() => { const txt = encodeURIComponent(`Top ${100-percentile}% à ${user.age} ans ${shareUrl}`); window.open(`https://api.whatsapp.com/send?text=${txt}`, '_blank'); }}
              className="btn-ghost py-2.5 rounded-full text-xs flex items-center justify-center gap-2">
              📱 WhatsApp
            </button>
            <button onClick={copy}
              className="btn-ghost py-2.5 rounded-full text-xs flex items-center justify-center gap-2">
              🔗 Lien
            </button>
          </div>

          <div className="text-xs text-[#6E7074] pt-2">
            💡 <strong className="text-white">Pro tip:</strong> Screenshot la carte ci-dessus pour un post TikTok/Instagram parfait en format 4:5.
          </div>
        </div>
      )}
    </div>
  );
};

/* ========== INSIGHTS IA ========== */

const Insights = ({ user, assets, onUpgrade, weeklyInsight, insightLoading, onRefreshInsight }) => {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState('');

  const total = assets.reduce((s, a) => s + (a.value || 0), 0);
  const isPremium = user.plan !== 'free';

  const [debugInfo, setDebugInfo] = useState('');

  // Generate local analysis for demo mode (no API needed)
  const generateLocalAnalysis = () => {
    const total = assets.reduce((s, a) => s + (a.value || 0), 0);
    const invested = assets.reduce((s, a) => s + (a.invested || a.value || 0), 0);
    const gain = total - invested;
    const gainPct = invested > 0 ? (gain / invested) * 100 : 0;
    const passive = assets.reduce((s, a) => s + ((a.value || 0) * (a.yield || 0)) / 100, 0);
    const passiveMonthly = passive / 12;

    const types = new Set(assets.map(a => a.type));
    const byType = {};
    assets.forEach(a => { byType[a.type] = (byType[a.type] || 0) + a.value; });

    const peaAsset = assets.find(a => a.type === 'pea');
    const peaTotal = byType['pea'] || 0;
    const cryptoTotal = byType['crypto'] || 0;
    const scpiTotal = byType['scpi'] || 0;
    const livretTotal = byType['livret'] || 0;
    const cashTotal = byType['cash'] || 0;
    const avTotal = byType['av'] || 0;
    const immoTotal = byType['immo'] || 0;

    const cryptoPct = total > 0 ? (cryptoTotal / total) * 100 : 0;
    const cashPct = total > 0 ? (cashTotal / total) * 100 : 0;
    const livretPct = total > 0 ? (livretTotal / total) * 100 : 0;
    const peaPct = total > 0 ? (peaTotal / total) * 100 : 0;

    const peaInfo = peaAsset ? getPeaInfo(peaAsset) : null;
    const peaMaxed = peaTotal >= 150000; // plafond PEA
    const peaGain = peaAsset ? (peaAsset.value - (peaAsset.invested || peaAsset.value)) : 0;

    const bench = getBenchmark(user.age);
    const percentile = getPercentile(total, bench);

    // Score calculation
    let score = 40;
    if (types.size >= 4) score += 12;
    else if (types.size === 3) score += 6;
    if (peaAsset) score += 10;
    if (passive >= 100 * 12) score += 8; // 100€/mois passifs
    if (cryptoPct <= 25) score += 5;
    else if (cryptoPct > 50) score -= 10;
    if (gainPct > 15) score += 8;
    else if (gainPct > 5) score += 4;
    if (cashPct > 30) score -= 8;
    if (percentile >= 75) score += 8;
    else if (percentile >= 50) score += 4;
    if (livretTotal >= 3000) score += 5; // fond d'urgence
    if (avTotal > 0) score += 4;
    score = Math.min(97, Math.max(28, score));

    // Forces
    const forces = [];
    if (types.size >= 4) forces.push(`Excellente diversification sur ${types.size} types de placements différents — tu répartis bien le risque`);
    else if (types.size === 3) forces.push(`Bonne base avec ${types.size} types de placements — continue à diversifier`);
    if (peaAsset) {
      if (peaInfo && !peaInfo.exempt) forces.push(`PEA en cours depuis ${peaInfo.years} ans ${peaInfo.months} mois — dans ${peaInfo.years < 5 ? `${5 - peaInfo.years} ans` : 'peu'} tu ne paieras plus que 17% d'impôts au lieu de 30%`);
      else if (peaInfo?.exempt) forces.push(`Ton PEA est exonéré d'impôts sur le revenu — tu ne payes plus que 17,2% sur les gains, c'est le meilleur régime fiscal qui existe`);
    }
    if (passive >= 500) forces.push(`${fmt(passive)}/an de revenus passifs (${fmt(passiveMonthly)}/mois) — ton argent travaille sans toi`);
    else if (passive > 0) forces.push(`Tu génères déjà ${fmt(passive)}/an en revenus passifs — c'est le début de la liberté financière`);
    if (gainPct > 10) forces.push(`+${gainPct.toFixed(1)}% de performance sur le capital investi — tu bats la majorité des épargnants français`);
    if (percentile >= 75) forces.push(`Top ${100 - percentile}% de ton âge en France — tu es très bien positionné par rapport aux autres ${user.age} ans`);
    if (livretTotal >= 3000) forces.push(`Tu as ${fmt(livretTotal)} en livrets — bonne réserve d'urgence disponible immédiatement`);
    if (scpiTotal > 0) forces.push(`Ta SCPI te génère des loyers sans gérer de locataire — la pierre-papier est intelligente à ton âge`);
    if (avTotal > 0) forces.push(`Ton assurance-vie te donnera un avantage fiscal important après 8 ans — tu prépares l'avenir`);

    // Faiblesses
    const faiblesses = [];
    if (cryptoPct > 40) faiblesses.push(`La crypto représente ${cryptoPct.toFixed(0)}% de ton patrimoine — c'est beaucoup trop. Si le marché chute de 70% (ce qui arrive), tu perds ${fmt(cryptoTotal * 0.7)}. Vise max 20%`);
    else if (cryptoPct > 25) faiblesses.push(`La crypto à ${cryptoPct.toFixed(0)}% du total c'est en haut de la fourchette recommandée — surveille et rééquilibre si ça monte davantage`);
    if (cashPct > 20) faiblesses.push(`${fmt(cashTotal)} qui dort sur un compte courant perd ~4% de valeur par an avec l'inflation. Transfère l'excédent sur un Livret A ou ton PEA dès ce mois`);
    if (!peaAsset && user.age < 30) faiblesses.push(`Tu n'as pas de PEA — c'est la plus grosse erreur que tu peux faire. Chaque mois sans PEA = tu rates un mois de compteur fiscal. Ouvre-en un aujourd'hui même`);
    if (peaAsset && peaTotal < 5000) faiblesses.push(`Ton PEA n'a que ${fmt(peaTotal)} — c'est trop peu par rapport à son potentiel. Tu peux verser jusqu'à 150 000€ dessus. Augmente les versements`);
    if (types.size <= 2) faiblesses.push(`Tu n'as que ${types.size} type${types.size > 1 ? 's' : ''} de placements — si l'un chute, tout chute avec. Diversifie avec une SCPI ou une assurance-vie`);
    if (passive < 100 && total > 5000) faiblesses.push(`Tes revenus passifs sont quasi nuls (${fmt(passive)}/an) pour ${fmt(total)} de patrimoine — tu pourrais facilement générer 200-400€/mois en choisissant des actifs qui distribuent`);
    if (!livretTotal && !cashTotal) faiblesses.push(`Tu n'as pas de réserve d'urgence visible — garde toujours 3 à 6 mois de salaire sur un Livret A avant d'investir davantage`);
    if (peaInfo && !peaInfo.exempt && peaGain > 2000) faiblesses.push(`Ne retire RIEN de ton PEA avant le ${new Date(peaInfo.fiveYearsDate).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })} — tu perdrais ${fmt(peaInfo.savings)} d'économies fiscales et fermerais le compte`);

    // Always show something even if portfolio is great
    if (faiblesses.length === 0) {
      faiblesses.push(`Portefeuille bien construit — le seul vrai risque maintenant c'est de s'arrêter. Continue à alimenter chaque mois même quand les marchés baissent, c'est là que se fait la vraie différence`);
    }
    if (faiblesses.length < 2) {
      if (total < 50000) faiblesses.push(`Il te manque ${fmt(50000 - total)} pour atteindre 50 000€ — à ${fmt(Math.max(300, Math.round(total * 0.02)))}/mois tu y arrives dans ${Math.ceil((50000 - total) / Math.max(300, Math.round(total * 0.02)))} mois environ. C'est ton prochain palier`);
      else if (total < 100000) faiblesses.push(`Tu es à ${((total/100000)*100).toFixed(0)}% du cap symbolique des 100 000€ — encore ${fmt(100000 - total)} à construire. Augmente tes versements mensuels pour accélérer`);
      else faiblesses.push(`À ce niveau de patrimoine, pense à consulter un conseiller fiscal (gratuit chez certaines banques privées) pour optimiser ta succession et réduire encore plus tes impôts`);
    }

    // Actions
    const actions = [];

    // PEA actions
    if (!peaAsset) {
      actions.push(`🚀 Ouvre un PEA cette semaine sur Boursorama ou Trade Republic (gratuit, 5 min) — même avec 10€ pour démarrer le compteur des 5 ans. Plus tu attends, plus tu perds de temps`);
    } else if (peaInfo && !peaInfo.exempt) {
      actions.push(`⏳ Ne touche JAMAIS à ton PEA avant ${new Date(peaInfo.fiveYearsDate).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })} — cette date vaut ${fmt(peaInfo.savings)} dans ta poche`);
    }

    // Cash optimization
    if (cashPct > 15) {
      const excess = cashTotal - (total * 0.1);
      actions.push(`💸 Transfère ${fmt(Math.round(excess))} de ton compte courant vers ton ${peaAsset ? 'PEA (ETF MSCI World)' : 'Livret A d\'abord, puis ouvre un PEA'} — l'argent qui dort perd de la valeur`);
    }

    // Crypto rebalancing
    if (cryptoPct > 25) {
      actions.push(`⚖️ Rééquilibre ta crypto : garde maximum 20% de ton total soit ${fmt(total * 0.2)}. Convertis ${fmt(cryptoTotal - total * 0.2)} vers des actifs moins volatils (ETF, SCPI)`);
    }

    // Monthly DCA
    const suggestedMonthly = Math.max(100, Math.round(total * 0.015));
    if (peaAsset) {
      actions.push(`📅 Programme un virement automatique de ${fmt(suggestedMonthly)}/mois sur ton PEA et achète un ETF MSCI World (CW8 ou EWLD) — sans y réfléchir, chaque mois sans exception`);
    } else {
      actions.push(`📅 Programme ${fmt(suggestedMonthly)}/mois sur un ETF MSCI World via un CTO si tu n'as pas encore de PEA — l'automatisation est la clé`);
    }

    // Passive income
    if (passive < 200 && total > 8000) {
      actions.push(`💰 Pour augmenter tes revenus passifs, mets ${fmt(Math.round(total * 0.15))} en SCPI (rendement ~5%/an) ou en ETF à dividendes — tu pourrais générer ${fmt(Math.round(total * 0.15 * 0.05))}/an supplémentaires`);
    }

    // Diversification
    if (!avTotal && total > 10000) {
      actions.push(`🛡️ Ouvre une assurance-vie (Linxea Spirit ou Lucya Cardif) avec ${fmt(Math.round(total * 0.1))} — après 8 ans, tes gains seront taxés à seulement 7,5% au lieu de 30%. Tu construis un avantage fiscal pour le futur`);
    }

    // Emergency fund
    if (!livretTotal && cashTotal < 3000) {
      actions.push(`🏦 Priorité #1 : constitue 3 mois de salaire sur un Livret A avant tout. C'est ton filet de sécurité — sans ça, le moindre imprévu te force à vendre tes investissements au mauvais moment`);
    }

    // Age-specific advice
    if (user.age <= 25 && total < 10000) {
      actions.push(`⚡ À ${user.age} ans, ton arme principale c'est le temps. ${fmt(300)}/mois à 7%/an pendant 30 ans = ${fmt(Math.round(300 * ((Math.pow(1.07/12 + 1, 360) - 1) / (0.07/12))))}. Commence maintenant, même petit`);
    }

    // Score-based verdict
    let verdict = '';
    if (score >= 80) verdict = `Portefeuille vraiment solide pour ${user.age} ans. Tu es dans le top des jeunes investisseurs français. Maintenant l'enjeu c'est d'augmenter la régularité des apports et de ne pas toucher à ce qui fonctionne.`;
    else if (score >= 65) verdict = `Bonne base, tu as les bons réflexes. Quelques ajustements — surtout sur la diversification et les versements réguliers — vont faire exploser ton patrimoine sur les 5 prochaines années.`;
    else if (score >= 50) verdict = `Tu démarres bien mais il y a clairement des optimisations faciles à faire. Les actions prioritaires ci-dessous peuvent booster ta performance de plusieurs milliers d'euros par an sans prendre plus de risques.`;
    else verdict = `Le potentiel est là. Les points à corriger en priorité sont la diversification et l'optimisation fiscale — deux choses qui ne coûtent rien mais font une énorme différence sur le long terme.`;

    return {
      score,
      forces: forces.slice(0, 4),
      faiblesses: faiblesses.slice(0, 4),
      actions: actions.slice(0, 5),
      verdict,
      extra: {
        passiveMonthly: Math.round(passiveMonthly),
        percentile,
        gainPct: Math.round(gainPct * 10) / 10,
        cryptoPct: Math.round(cryptoPct),
        diversityCount: types.size,
      }
    };
  };

  const runAnalysis = async () => {
    setLoading(true); setError(''); setDebugInfo('');

    // Demo mode or fallback: instant local analysis
    if (user.demo) {
      await new Promise(r => setTimeout(r, 1200)); // simulate loading
      setAnalysis(generateLocalAnalysis());
      setLoading(false);
      return;
    }

    // Real mode: API call
    try {
      const summary = assets.map(a => {
        const income = ((a.value || 0) * (a.yield || 0)) / 100;
        return `- ${ASSET_TYPES[a.type].label} "${a.name}": ${a.value}€ (investi ${a.invested || a.value}€, rendement ${a.yield || 0}%/an = ${Math.round(income)}€/an)`;
      }).join('\n');
      const passive = assets.reduce((s, a) => s + ((a.value || 0) * (a.yield || 0)) / 100, 0);
      const total = assets.reduce((s, a) => s + (a.value || 0), 0);

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 800,
          messages: [{
            role: "user",
            content: `Analyse ce portefeuille. Réponds UNIQUEMENT avec du JSON brut, sans texte ni markdown.

Investisseur: ${user.age} ans, patrimoine ${total}€, revenus passifs ${Math.round(passive)}€/an
${summary}

Format requis (JSON pur):
{"score":75,"forces":["point fort 1","point fort 2"],"faiblesses":["point faible 1","point faible 2"],"actions":["action 1","action 2","action 3"],"verdict":"verdict court"}`
          }]
        })
      });

      const raw = await response.text();
      if (!response.ok) throw new Error(`HTTP ${response.status}: ${raw.slice(0, 200)}`);

      const data = JSON.parse(raw);
      const textBlock = (data.content || []).find(b => b.type === 'text');
      if (!textBlock) throw new Error('Pas de bloc texte');

      const txt = textBlock.text.trim();
      const start = txt.indexOf('{');
      const end = txt.lastIndexOf('}');
      if (start === -1) throw new Error(`Pas de JSON: ${txt.slice(0, 100)}`);

      const parsed = JSON.parse(txt.slice(start, end + 1));
      setAnalysis({
        score: typeof parsed.score === 'number' ? parsed.score : 60,
        forces: parsed.forces || [],
        faiblesses: parsed.faiblesses || [],
        actions: parsed.actions || [],
        verdict: parsed.verdict || '',
      });
    } catch (e) {
      // Fallback to local analysis if API fails
      console.warn('API failed, using local analysis:', e.message);
      setAnalysis(generateLocalAnalysis());
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fade-up">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <span style={{ color: '#B598FF' }}><Icon name="spark" size={20} /></span>
          <h1 className="font-serif text-4xl">Analyse IA</h1>
          {!isPremium && (
            <span className="ml-2 text-xs px-2.5 py-1 rounded-full font-mono uppercase font-semibold"
              style={{ background: '#E8C54720', color: '#E8C547' }}>Premium</span>
          )}
        </div>
        <p className="text-[#A0A3A8]">Ton portefeuille analysé par une IA. Forces, faiblesses, actions prioritaires.</p>
      </div>

      {!isPremium ? (
        <div className="card p-8 text-center">
          <div className="text-5xl mb-4">🤖</div>
          <h2 className="font-serif text-3xl mb-3">Débloque l'analyse IA</h2>
          <p className="text-[#A0A3A8] mb-6 max-w-md mx-auto">Chaque mois, une analyse perso.</p>
          <button onClick={onUpgrade} className="btn-primary px-6 py-3 rounded-full">Voir les plans · dès 2,99€/mois</button>
        </div>
      ) : assets.length === 0 ? (
        <div className="card p-8 text-center">
          <p className="text-[#A0A3A8]">Ajoute des actifs pour obtenir une analyse.</p>
        </div>
      ) : !analysis ? (
        <div>
          {/* Weekly insight auto-généré */}
          {weeklyInsight?.analysis && (
            <div className="mb-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span>📅</span>
                  <span className="text-xs font-mono uppercase tracking-widest text-[#6E7074]">
                    Insight de la semaine — auto-généré
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-[#6E7074]">
                    {new Date(weeklyInsight.generatedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                  </span>
                  <button onClick={onRefreshInsight} disabled={insightLoading}
                    className="text-xs px-3 py-1.5 rounded-full transition"
                    style={{ border: '1px solid var(--border)', color: '#A0A3A8' }}>
                    {insightLoading ? '...' : '↻ Rafraîchir'}
                  </button>
                </div>
              </div>
              
              {insightLoading ? (
                <div className="card p-8 text-center">
                  <div className="spinner mx-auto mb-3" />
                  <p className="text-sm text-[#A0A3A8]">L'IA analyse ton portefeuille...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Score + conseil semaine */}
                  <div className="card p-6 flex items-center gap-6 scale-in">
                    <div className="text-center flex-shrink-0">
                      <div className="font-serif text-5xl" style={{ color: weeklyInsight.analysis.score >= 70 ? '#B8FF5A' : weeklyInsight.analysis.score >= 50 ? '#E8C547' : '#FF6B6B' }}>
                        {weeklyInsight.analysis.score}
                      </div>
                      <div className="text-[10px] font-mono uppercase text-[#6E7074] tracking-wider">/100</div>
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-semibold mb-1">Conseil de la semaine</div>
                      <p className="text-sm text-[#A0A3A8] leading-relaxed">{weeklyInsight.analysis.semaine || weeklyInsight.analysis.verdict}</p>
                    </div>
                  </div>
                  {/* Actions rapides */}
                  {weeklyInsight.analysis.actions?.length > 0 && (
                    <div className="card p-5 fade-up delay-1">
                      <div className="text-[10px] font-mono uppercase tracking-widest text-[#6E7074] mb-4">Actions prioritaires</div>
                      <div className="space-y-3">
                        {weeklyInsight.analysis.actions.slice(0, 3).map((a, i) => (
                          <div key={i} className="flex gap-3 items-start">
                            <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono flex-shrink-0"
                              style={{ background: '#B598FF20', color: '#B598FF', border: '1px solid #B598FF40' }}>{i + 1}</div>
                            <p className="text-sm text-[#D0D2D6] leading-relaxed">{a}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              <div className="mt-4 border-t pt-4" style={{ borderColor: 'var(--border)' }}>
                <p className="text-xs text-[#6E7074] mb-3">Veux-tu une analyse complète et personnalisée ?</p>
                <button onClick={runAnalysis} disabled={loading}
                  className="btn-primary px-5 py-2.5 rounded-full text-sm flex items-center gap-2">
                  {loading ? <><div className="spinner" /> Analyse en cours...</> : <>🔍 Analyse complète</>}
                </button>
              </div>
            </div>
          )}
          
          {/* Pas encore d'insight ou premium vient d'activer */}
          {!weeklyInsight?.analysis && (
            <div className="card p-8 text-center">
              {insightLoading ? (
                <>
                  <div className="spinner mx-auto mb-4" />
                  <p className="text-[#A0A3A8]">Génération de ton insight hebdomadaire...</p>
                </>
              ) : (
                <>
                  <div className="text-5xl mb-4">✨</div>
                  <h2 className="font-serif text-3xl mb-3">Prêt à analyser</h2>
                  <p className="text-[#A0A3A8] mb-6">L'IA va examiner tes {assets.length} actifs et te donner un conseil chaque semaine automatiquement.</p>
                  <button onClick={runAnalysis} disabled={loading}
                    className="btn-primary px-6 py-3 rounded-full flex items-center gap-2 mx-auto">
                    {loading ? <><div className="spinner" /> Analyse en cours...</> : <>Lancer l'analyse</>}
                  </button>
                </>
              )}
              {error && <div className="mt-4 text-sm" style={{ color: '#FF6B6B' }}>{error}</div>}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-5">
          <div className="card p-8 text-center scale-in">
            <div className="text-xs text-[#6E7074] font-mono uppercase tracking-widest mb-3">Score de santé</div>
            <div className="font-serif text-8xl mb-2" style={{
              color: analysis.score >= 70 ? '#B8FF5A' : analysis.score >= 50 ? '#E8C547' : '#FF6B6B'
            }}>
              {analysis.score}<span className="text-4xl text-[#6E7074]">/100</span>
            </div>
            <p className="text-[#A0A3A8] max-w-md mx-auto leading-relaxed">{analysis.verdict}</p>
            {analysis.extra && (
              <div className="grid grid-cols-3 gap-3 mt-6 pt-6 border-t border-[#26292E]">
                <div>
                  <div className="font-mono text-lg" style={{ color: analysis.extra.gainPct >= 0 ? '#B8FF5A' : '#FF6B6B' }}>
                    {analysis.extra.gainPct >= 0 ? '+' : ''}{analysis.extra.gainPct}%
                  </div>
                  <div className="text-[10px] text-[#6E7074] font-mono uppercase tracking-wider">Performance</div>
                </div>
                <div>
                  <div className="font-mono text-lg text-[#E8C547]">Top {100 - analysis.extra.percentile}%</div>
                  <div className="text-[10px] text-[#6E7074] font-mono uppercase tracking-wider">Ton rang</div>
                </div>
                <div>
                  <div className="font-mono text-lg text-[#B8FF5A]">{fmt(analysis.extra.passiveMonthly)}</div>
                  <div className="text-[10px] text-[#6E7074] font-mono uppercase tracking-wider">Passif/mois</div>
                </div>
              </div>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            <div className="card p-6 fade-up delay-1">
              <div className="flex items-center gap-2 mb-4">
                <span style={{ color: '#B8FF5A' }}>✓</span>
                <div className="text-xs text-[#6E7074] font-mono uppercase tracking-wider">Ce qui va bien</div>
              </div>
              <ul className="space-y-4">
                {analysis.forces.map((f, i) => (
                  <li key={i} className="flex gap-3 text-sm">
                    <span className="text-[#B8FF5A] mt-0.5 flex-shrink-0">•</span>
                    <span className="text-[#D0D2D6] leading-relaxed">{f}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="card p-6 fade-up delay-2">
              <div className="flex items-center gap-2 mb-4">
                <span style={{ color: '#FF6B6B' }}>⚠</span>
                <div className="text-xs text-[#6E7074] font-mono uppercase tracking-wider">Ce qu'il faut corriger</div>
              </div>
              <ul className="space-y-4">
                {analysis.faiblesses.map((f, i) => (
                  <li key={i} className="flex gap-3 text-sm">
                    <span className="text-[#FF6B6B] mt-0.5 flex-shrink-0">•</span>
                    <span className="text-[#D0D2D6] leading-relaxed">{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="card p-6 fade-up delay-3" style={{ borderColor: '#B598FF50' }}>
            <div className="flex items-center gap-2 mb-5">
              <span style={{ color: '#B598FF' }}><Icon name="zap" size={14} /></span>
              <div className="text-xs text-[#6E7074] font-mono uppercase tracking-wider">Tes actions prioritaires — fais ça maintenant</div>
            </div>
            <div className="space-y-4">
              {analysis.actions.map((a, i) => (
                <div key={i} className="flex gap-3 items-start p-4 rounded-xl" style={{ background: 'var(--bg-input)', border: '1px solid var(--border)' }}>
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-mono font-bold flex-shrink-0"
                    style={{ background: '#B598FF20', color: '#B598FF', border: '1px solid #B598FF40' }}>{i + 1}</div>
                  <p className="text-sm text-[#D0D2D6] leading-relaxed">{a}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="card dark-card p-5 fade-up delay-4" style={{ background: 'linear-gradient(135deg, #141619 0%, #1A1D21 100%)', borderColor: '#E8C54730' }}>
            <div className="flex items-center gap-2 mb-2">
              <span>💡</span>
              <div className="text-xs text-[#E8C547] font-mono uppercase tracking-wider">Le chiffre qui change tout</div>
            </div>
            <p className="text-sm text-[#D0D2D6] leading-relaxed">
              À {user.age} ans avec {fmt(total)} de patrimoine, si tu investis <strong className="text-white font-mono">{fmt(Math.max(200, Math.round(total * 0.015)))}/mois</strong> à 7%/an pendant 20 ans, tu arrives à <strong className="text-[#B8FF5A] font-mono">{fmt(Math.round(Math.max(200, Math.round(total * 0.015)) * ((Math.pow(1 + 0.07/12, 240) - 1) / (0.07/12)) + total * Math.pow(1.07, 20)))}</strong>. L'important c'est pas le montant, c'est la régularité.
            </p>
          </div>

          <button onClick={() => setAnalysis(null)} className="btn-ghost px-5 py-2.5 rounded-full text-sm mx-auto block">
            Relancer l'analyse
          </button>
        </div>
      )}
    </div>
  );
};

/* ========== SETTINGS ========== */

const generatePdfReport = (user, assets, history, contributions) => {
  const total    = assets.reduce((s, a) => s + (a.value || 0), 0);
  const invested = assets.reduce((s, a) => s + (a.invested || a.value || 0), 0);
  const gain     = total - invested;
  const gainPct  = invested > 0 ? ((gain / invested) * 100).toFixed(2) : '0.00';
  const passive  = assets.reduce((s, a) => s + ((a.value || 0) * (a.yield || 0)) / 100, 0) / 12;
  const bench    = getBenchmark(user.age);
  const pct      = getPercentile(total, bench);
  const now      = new Date();
  const dateStr  = now.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });

  const byType = assets.reduce((acc, a) => {
    acc[a.type] = (acc[a.type] || 0) + a.value;
    return acc;
  }, {});

  const alloc = Object.entries(byType)
    .sort((a, b) => b[1] - a[1])
    .map(([type, val]) => {
      const t = ASSET_TYPES[type] || { label: type, emoji: '•', color: '#B8FF5A' };
      return `<tr>
        <td style="padding:10px 16px;border-bottom:1px solid #1E2126;">${t.emoji} ${t.label}</td>
        <td style="padding:10px 16px;border-bottom:1px solid #1E2126;text-align:right;font-family:monospace;">${fmt(val)}</td>
        <td style="padding:10px 16px;border-bottom:1px solid #1E2126;text-align:right;font-family:monospace;color:${t.color};">${total > 0 ? ((val / total) * 100).toFixed(1) : 0}%</td>
      </tr>`;
    }).join('');

  const assetRows = assets.slice().sort((a, b) => b.value - a.value).map(a => {
    const g  = (a.value || 0) - (a.invested || a.value || 0);
    const gp = a.invested > 0 ? ((g / a.invested) * 100).toFixed(1) : '0.0';
    const t  = ASSET_TYPES[a.type] || { label: a.type, emoji: '•', color: '#B8FF5A' };
    const color = g >= 0 ? '#B8FF5A' : '#FF6B6B';
    return `<tr>
      <td style="padding:10px 16px;border-bottom:1px solid #1E2126;">${t.emoji} ${a.name}</td>
      <td style="padding:10px 16px;border-bottom:1px solid #1E2126;text-align:right;font-family:monospace;">${fmt(a.value)}</td>
      <td style="padding:10px 16px;border-bottom:1px solid #1E2126;text-align:right;font-family:monospace;color:${color};">${g >= 0 ? '+' : ''}${fmt(g)} (${gp}%)</td>
      <td style="padding:10px 16px;border-bottom:1px solid #1E2126;text-align:right;font-family:monospace;">${a.yield ? a.yield + '%' : '—'}</td>
    </tr>`;
  }).join('');

  const contribRows = (contributions || []).slice(0, 12).map(c =>
    `<tr>
      <td style="padding:8px 16px;border-bottom:1px solid #1E2126;font-family:monospace;">${c.date}</td>
      <td style="padding:8px 16px;border-bottom:1px solid #1E2126;text-align:right;font-family:monospace;color:#B8FF5A;">+${fmt(c.amount)}</td>
      <td style="padding:8px 16px;border-bottom:1px solid #1E2126;color:#6E7074;">${c.note || '—'}</td>
    </tr>`
  ).join('');

  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<title>Rapport Magot — ${user.name} — ${dateStr}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: -apple-system, Georgia, serif; background: #0A0B0D; color: #F5F5F0; padding: 40px; max-width: 900px; margin: 0 auto; }
  h1 { font-family: Georgia, serif; font-size: 48px; letter-spacing: -1px; margin-bottom: 4px; }
  h2 { font-family: Georgia, serif; font-size: 22px; margin-bottom: 16px; color: #F5F5F0; }
  .mono { font-family: monospace; }
  .label { font-size: 10px; font-family: monospace; text-transform: uppercase; letter-spacing: 2px; color: #6E7074; }
  .card { background: #141619; border: 1px solid #26292E; border-radius: 16px; padding: 24px; margin-bottom: 24px; }
  .grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .grid3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; }
  .stat-val { font-family: Georgia, serif; font-size: 32px; margin: 4px 0; }
  .green { color: #B8FF5A; }
  .gold  { color: #E8C547; }
  .blue  { color: #7BB3FF; }
  .red   { color: #FF6B6B; }
  table { width: 100%; border-collapse: collapse; }
  th { padding: 10px 16px; text-align: left; font-size: 10px; font-family: monospace; text-transform: uppercase; letter-spacing: 1px; color: #6E7074; border-bottom: 1px solid #26292E; }
  th:not(:first-child) { text-align: right; }
  .divider { border: none; border-top: 1px solid #26292E; margin: 24px 0; }
  .footer { text-align: center; color: #3A3F46; font-size: 11px; font-family: monospace; margin-top: 40px; }
  @media print {
    body { background: white; color: #0A0B0D; }
    .card { border: 1px solid #ddd; background: #f9f9f9; }
    h1, h2 { color: #0A0B0D; }
    .label { color: #666; }
    hr { border-color: #ddd; }
  }
</style>
</head>
<body>

<!-- HEADER -->
<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:40px;">
  <div>
    <div class="label" style="margin-bottom:8px;">Rapport patrimonial</div>
    <h1 style="color:#B8FF5A;">Magot.</h1>
    <div style="font-family:monospace;color:#6E7074;margin-top:4px;">Généré le ${dateStr}</div>
  </div>
  <div style="text-align:right;">
    <div class="label">Titulaire</div>
    <div style="font-size:20px;margin-top:4px;">${user.name}</div>
    <div style="font-family:monospace;color:#6E7074;">${user.age} ans · Plan ${user.plan}</div>
  </div>
</div>

<!-- PATRIMOINE TOTAL -->
<div class="card" style="border-color:#B8FF5A30;background:linear-gradient(135deg,#141619,#172218);">
  <div class="label" style="margin-bottom:8px;">Patrimoine net total</div>
  <div style="font-family:Georgia,serif;font-size:64px;color:#B8FF5A;letter-spacing:-2px;line-height:1;">${fmt(total)}</div>
  <div style="margin-top:12px;display:flex;gap:32px;">
    <div>
      <div class="label">Investi</div>
      <div class="mono" style="font-size:18px;margin-top:2px;">${fmt(invested)}</div>
    </div>
    <div>
      <div class="label">Plus-value</div>
      <div class="mono" style="font-size:18px;margin-top:2px;color:${gain >= 0 ? '#B8FF5A' : '#FF6B6B'};">${gain >= 0 ? '+' : ''}${fmt(gain)} (${gainPct}%)</div>
    </div>
    <div>
      <div class="label">Revenus passifs</div>
      <div class="mono" style="font-size:18px;margin-top:2px;color:#7BB3FF;">+${fmt(Math.round(passive))}/mois</div>
    </div>
    <div>
      <div class="label">Ton rang · ${user.age} ans</div>
      <div class="mono" style="font-size:18px;margin-top:2px;color:#E8C547;">Top ${100 - pct}%</div>
    </div>
  </div>
</div>

<!-- STATS 3 cols -->
<div class="grid3" style="margin-bottom:24px;">
  <div class="card" style="text-align:center;">
    <div class="label">Actifs suivis</div>
    <div class="stat-val green">${assets.length}</div>
  </div>
  <div class="card" style="text-align:center;">
    <div class="label">Rendement global</div>
    <div class="stat-val ${gain >= 0 ? 'green' : 'red'}">${gain >= 0 ? '+' : ''}${gainPct}%</div>
  </div>
  <div class="card" style="text-align:center;">
    <div class="label">Revenus passifs</div>
    <div class="stat-val blue">${fmt(Math.round(passive * 12))}/an</div>
  </div>
</div>

<!-- RÉPARTITION -->
<div class="card" style="margin-bottom:24px;">
  <h2>Répartition par classe</h2>
  <table>
    <thead><tr><th>Classe d'actif</th><th>Valeur</th><th>Part</th></tr></thead>
    <tbody>${alloc}</tbody>
  </table>
</div>

<!-- ACTIFS -->
<div class="card" style="margin-bottom:24px;">
  <h2>Détail des actifs</h2>
  <table>
    <thead><tr><th>Actif</th><th>Valeur</th><th>Performance</th><th>Rendement</th></tr></thead>
    <tbody>${assetRows}</tbody>
  </table>
</div>

${contribRows ? `
<!-- APPORTS -->
<div class="card" style="margin-bottom:24px;">
  <h2>Historique des apports</h2>
  <table>
    <thead><tr><th>Date</th><th>Montant</th><th>Note</th></tr></thead>
    <tbody>${contribRows}</tbody>
  </table>
</div>` : ''}

<!-- FOOTER -->
<div class="footer">
  <div style="font-size:16px;font-family:Georgia,serif;color:#B8FF5A;margin-bottom:4px;">Magot.</div>
  Rapport généré automatiquement · magot.fr · ${dateStr}
</div>

</body></html>`;

  const blob   = new Blob([html], { type: 'text/html' });
  const url    = URL.createObjectURL(blob);
  const a      = document.createElement('a');
  a.href       = url;
  a.download   = `rapport-magot-${user.name.toLowerCase().replace(/\s+/g,'-')}-${now.getFullYear()}.html`;
  a.click();
  URL.revokeObjectURL(url);
};

const Settings = ({ user, assets, history, contributions, onLogout, onUpgrade, demoMode, showToast, theme, onToggleTheme, onRestart }) => {
  const isPremium = user.plan !== 'free';
  const total = assets.reduce((s, a) => s + (a.value || 0), 0);
  const [generating, setGenerating] = useState(false);

  const handleReport = async () => {
    if (!isPremium) { onUpgrade(); return; }
    setGenerating(true);
    await new Promise(r => setTimeout(r, 800));
    generatePdfReport(user, assets, history, contributions);
    setGenerating(false);
    showToast && showToast('Rapport téléchargé ✓');
  };

  return (
    <div className="fade-up pb-10 max-w-2xl">

      {/* Header */}
      <div className="mb-7">
        <h1 className="font-serif text-4xl mb-1">Paramètres</h1>
        <p className="text-sm text-[#A0A3A8]">Ton compte, tes données, ton rapport.</p>
      </div>

      {/* Profil */}
      <div className="card p-5 mb-4">
        <div className="text-[10px] text-[#6E7074] font-mono uppercase tracking-widest mb-4">Mon profil</div>
        <div className="space-y-0">
          {[
            { label: 'Prénom', value: user.name },
            { label: 'Email',  value: user.email, mono: true },
            { label: 'Âge',    value: `${user.age} ans` },
          ].map((row, i, arr) => (
            <div key={row.label} className="flex items-center justify-between py-3"
              style={{ borderBottom: i < arr.length - 1 ? '1px solid var(--border-3)' : 'none' }}>
              <span className="text-sm text-[#6E7074]">{row.label}</span>
              <span className={`text-sm ${row.mono ? 'font-mono' : ''}`}>{row.value}</span>
            </div>
          ))}
          <div className="flex items-center justify-between py-3">
            <span className="text-sm text-[#6E7074]">Plan actuel</span>
            <span className="font-mono uppercase text-xs px-2.5 py-1 rounded-full"
              style={{
                background: user.plan === 'lifetime' ? '#E8C54720' : user.plan !== 'free' ? '#B8FF5A20' : 'var(--border)',
                color: user.plan === 'lifetime' ? '#E8C547' : user.plan !== 'free' ? '#B8FF5A' : '#A0A3A8',
              }}>
              {user.plan === 'lifetime' ? '👑 Lifetime' : user.plan === 'premium' ? '🚀 Pro' : '🌱 Gratuit'}
            </span>
          </div>
        </div>
      </div>

      {/* Upgrade si gratuit */}
      {user.plan === 'free' && !demoMode && (
        <div className="card dark-card p-5 mb-4 relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg,#141619,#172218)', borderColor: '#B8FF5A35' }}>
          <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle,#B8FF5A10,transparent 70%)' }} />
          <div className="relative flex items-start justify-between gap-4">
            <div>
              <div className="font-serif text-xl mb-1">Passer Premium</div>
              <p className="text-sm text-[#A0A3A8] mb-4">
                Actifs illimités, rapport PDF, analyse IA, FIRE calculator avancé.
              </p>
              <button onClick={onUpgrade} className="btn-primary px-5 py-2.5 rounded-full text-sm">
                Voir les plans →
              </button>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="font-serif text-3xl text-[#B8FF5A]">6,99€</div>
              <div className="text-xs text-[#6E7074] font-mono">/mois</div>
            </div>
          </div>
        </div>
      )}

      {/* Tour guidé */}
      <div className="card p-5 mb-4">
        <div className="text-[10px] text-[#6E7074] font-mono uppercase tracking-widest mb-4">Aide</div>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium">Tour de l'application</div>
            <div className="text-xs text-[#6E7074] mt-0.5">Revoir le guide de démarrage</div>
          </div>
          <button onClick={() => { onRestart?.(); showToast('Tour relancé 👋'); }}
            className="px-4 py-2 rounded-full text-sm transition"
            style={{ border: '1px solid var(--border)', color: '#A0A3A8' }}>
            Relancer
          </button>
        </div>
      </div>

      {/* Apparence */}
      <div className="card p-5 mb-4">
        <div className="text-[10px] text-[#6E7074] font-mono uppercase tracking-widest mb-4">Apparence</div>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium">Thème de l'interface</div>
            <div className="text-xs text-[#6E7074] mt-0.5">{theme === 'dark' ? 'Mode sombre actif' : 'Mode clair actif'}</div>
          </div>
          <button onClick={onToggleTheme}
            className="relative flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold transition-all"
            style={{ background: theme === 'light' ? '#E8C54720' : '#B8FF5A15', border: `1px solid ${theme === 'light' ? '#E8C54740' : '#B8FF5A30'}`, color: theme === 'light' ? '#E8C547' : '#B8FF5A' }}>
            <span style={{ fontSize: 16 }}>{theme === 'dark' ? '🌙' : '☀️'}</span>
            <span>{theme === 'dark' ? 'Sombre' : 'Clair'}</span>
            <span style={{
              display: 'inline-flex', alignItems: 'center', marginLeft: 4,
              width: 36, height: 20, borderRadius: 10, padding: '0 2px',
              background: theme === 'dark' ? '#B8FF5A30' : '#E8C54730',
              transition: 'background 0.2s'
            }}>
              <span style={{
                width: 16, height: 16, borderRadius: '50%',
                background: theme === 'dark' ? '#B8FF5A' : '#E8C547',
                transform: theme === 'dark' ? 'translateX(0)' : 'translateX(16px)',
                transition: 'transform 0.2s, background 0.2s'
              }} />
            </span>
          </button>
        </div>
      </div>

      {/* Rapport PDF */}
      <div className="card p-5 mb-4">
        <div className="text-[10px] text-[#6E7074] font-mono uppercase tracking-widest mb-4">Rapport patrimonial</div>
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
            style={{ background: isPremium ? '#B8FF5A15' : 'var(--bg-subtle)', border: `1px solid ${isPremium ? '#B8FF5A30' : 'var(--border)'}` }}>
            {isPremium ? '📄' : '🔒'}
          </div>
          <div className="flex-1">
            <div className="text-sm font-semibold mb-1">Rapport complet téléchargeable</div>
            <p className="text-xs text-[#6E7074] leading-relaxed mb-4">
              Un document complet avec ton patrimoine, la répartition par actif, les performances, l'historique des apports et ton rang. Prêt à imprimer ou partager.
            </p>
            <button onClick={handleReport}
              disabled={generating}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition"
              style={{
                background: isPremium ? '#B8FF5A' : 'var(--bg-subtle)',
                color: isPremium ? 'var(--bg)' : '#6E7074',
                border: isPremium ? 'none' : '1px solid var(--border)',
              }}>
              {generating
                ? <><span className="inline-block w-3.5 h-3.5 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: 'var(--bg)', borderTopColor: 'transparent' }} /> Génération...</>
                : <><Icon name="download" size={14} /> {isPremium ? 'Télécharger mon rapport' : '🔒 Premium uniquement'}</>
              }
            </button>
          </div>
        </div>
      </div>

      {/* Export CSV */}
      <div className="card p-5 mb-4">
        <div className="text-[10px] text-[#6E7074] font-mono uppercase tracking-widest mb-4">Export données</div>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium">Export CSV actifs</div>
              <div className="text-xs text-[#6E7074]">Compatible Excel · Google Sheets · Impôts</div>
            </div>
            <button onClick={() => exportAssetsCSV(assets)} disabled={assets.length === 0}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-xs transition"
              style={{ border: '1px solid var(--border)', color: '#A0A3A8' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor='#B8FF5A'; e.currentTarget.style.color='#B8FF5A'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.color='#A0A3A8'; }}>
              <Icon name="download" size={12} /> CSV
            </button>
          </div>
          <div className="flex items-center justify-between pt-3" style={{ borderTop: '1px solid var(--border-3)' }}>
            <div>
              <div className="text-sm font-medium">Nombre d'actifs</div>
              <div className="text-xs text-[#6E7074]">{assets.length} actifs · {fmt(total)} au total</div>
            </div>
            <div className="font-mono text-sm text-[#B8FF5A]">{assets.length}</div>
          </div>
        </div>
      </div>

      {/* Sécurité & données */}
      <div className="card p-5 mb-4">
        <div className="text-[10px] text-[#6E7074] font-mono uppercase tracking-widest mb-4">Sécurité & données</div>
        <div className="space-y-3 text-sm text-[#A0A3A8]">
          {[
            { icon: '🔒', t: 'Stockage local', d: 'Tes données restent sur ton appareil. Aucune donnée bancaire ne transite par nos serveurs.' },
            { icon: '🇫🇷', t: 'Hébergement France', d: 'En production, données chiffrées sur serveurs européens conformes RGPD.' },
            { icon: '👁️', t: 'Lecture seule', d: 'Magot ne peut jamais passer d\'ordre ou déplacer des fonds en ton nom.' },
          ].map((row, i) => (
            <div key={i} className="flex items-start gap-3 py-2"
              style={{ borderTop: i > 0 ? '1px solid var(--border-3)' : 'none' }}>
              <span className="text-lg flex-shrink-0 mt-0.5">{row.icon}</span>
              <div>
                <div className="font-medium text-[#F5F5F0] text-sm">{row.t}</div>
                <div className="text-xs text-[#6E7074] leading-relaxed mt-0.5">{row.d}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Déconnexion */}
      <div className="card p-5">
        <div className="text-[10px] text-[#6E7074] font-mono uppercase tracking-widest mb-4">Session</div>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium">
              {demoMode ? 'Quitter la démo' : 'Se déconnecter'}
            </div>
            <div className="text-xs text-[#6E7074]">
              {demoMode ? 'Revenir à l\'accueil' : 'Tes données restent sauvegardées'}
            </div>
          </div>
          <button onClick={onLogout}
            className="px-4 py-2 rounded-full text-xs font-mono transition"
            style={{ border: '1px solid #FF6B6B30', color: '#FF6B6B' }}
            onMouseEnter={e => e.currentTarget.style.background='#FF6B6B10'}
            onMouseLeave={e => e.currentTarget.style.background='transparent'}>
            {demoMode ? 'Quitter' : 'Déconnexion'}
          </button>
        </div>
      </div>

    </div>
  );
};

/* ========== ONBOARDING TOUR ========== */
const TOUR_STEPS = [
  {
    emoji: '📊',
    title: 'Ton tableau de bord',
    desc: 'Ici tu vois ton patrimoine total, ses performances et ta répartition en temps réel.',
    anchor: 'top',
  },
  {
    emoji: '🏆',
    title: 'Ton rang',
    desc: 'On compare ton patrimoine aux autres jeunes de ton âge. Vise le Top 10% !',
    anchor: 'top',
  },
  {
    emoji: '💸',
    title: 'Mes investissements',
    desc: "Note chaque versement mensuel pour mesurer ta discipline d'épargne vs les marchés.",
    anchor: 'top',
  },
  {
    emoji: '🤖',
    title: 'Analyse IA',
    desc: "Chaque semaine, l'IA analyse ton portfolio et te donne 3 actions concrètes.",
    anchor: 'bottom',
  },
  {
    emoji: '🎯',
    title: "C'est parti !",
    desc: "Explore l'app, ajoute tes actifs et regarde ton magot grossir. Bonne chance 🚀",
    anchor: 'center',
    last: true,
  },
];

const OnboardingTour = ({ step, onNext, onSkip }) => {
  if (step < 0 || step >= TOUR_STEPS.length) return null;
  const s = TOUR_STEPS[step];
  const progress = ((step + 1) / TOUR_STEPS.length) * 100;

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      {/* Overlay flouté */}
      <div className="absolute inset-0 pointer-events-auto" style={{ background: 'rgba(0,0,0,0.55)' }}
        onClick={onSkip} />

      {/* Tooltip centré */}
      <div className="absolute left-4 right-4 pointer-events-auto scale-in"
        style={{
          top: s.anchor === 'bottom' ? 'auto' : s.anchor === 'center' ? '50%' : '30%',
          bottom: s.anchor === 'bottom' ? '90px' : 'auto',
          transform: s.anchor === 'center' ? 'translateY(-50%)' : 'none',
        }}>
        <div className="rounded-2xl p-5 shadow-2xl"
          style={{ background: 'var(--bg-card)', border: '1px solid #B8FF5A30' }}>
          {/* Progress bar */}
          <div className="flex gap-1.5 mb-4">
            {TOUR_STEPS.map((_, i) => (
              <div key={i} className="h-1 flex-1 rounded-full transition-all duration-300"
                style={{ background: i <= step ? '#B8FF5A' : 'var(--border)' }} />
            ))}
          </div>

          <div className="flex items-start gap-4 mb-5">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 text-2xl"
              style={{ background: '#B8FF5A15', border: '1px solid #B8FF5A30' }}>
              {s.emoji}
            </div>
            <div>
              <div className="font-semibold text-base mb-1">{s.title}</div>
              <div className="text-sm text-[#A0A3A8] leading-relaxed">{s.desc}</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={onSkip}
              className="text-xs text-[#6E7074] hover:text-[#A0A3A8] transition flex-1">
              Passer le tour
            </button>
            <button onClick={onNext}
              className="btn-primary px-5 py-2.5 rounded-full text-sm font-semibold flex items-center gap-2">
              {s.last ? "🚀 C'est parti !" : 'Suivant →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};


