/**
 * Everything the site says lives here. Edit freely — components only render it.
 * Numbers in SIGNAL come from git (scripts/collect-stats.mjs → signal.json).
 */
import signal from './signal.json'

export const PROFILE = {
  name: 'Manisha Rai',
  first: 'Manisha',
  last: 'Rai',
  role: 'Full-stack engineer',
  title: 'Flutter & Full-Stack Developer',
  company: 'Sheeraj Codeworks',
  email: 'manisharai.dev@gmail.com',
  github: 'https://github.com/manisharai01',
  githubHandle: 'manisharai01',
  linkedin: 'https://www.linkedin.com/in/manisha-rai-dev/',
  linkedinHandle: 'manisha-rai-dev',
  location: 'Gurugram, India',
  status: 'Open to new roles',
  tagline: 'From the socket to the screen.',
  lede: 'Full-stack engineer building real-time systems, mobile apps and the backends underneath them.',
}

const fmt = (n) => n.toLocaleString('en-IN')
export const SIGNAL = {
  ...signal,
  repos: signal.reposWork + signal.reposPersonal,
  peakHour: signal.hours.indexOf(Math.max(...signal.hours)),
}

export const TICKER = [
  { k: 'Commits', v: fmt(SIGNAL.commits), d: 'up' },
  { k: 'PRs merged', v: '230+', d: 'up' },
  { k: 'Repositories', v: String(SIGNAL.repos) },
  { k: 'Endpoints in one API', v: '222' },
  { k: 'Automated tests', v: '1,300+', d: 'up' },
  { k: 'Live store apps', v: '2' },
  { k: 'Active days', v: String(SIGNAL.activeDays) },
  { k: 'Peak hour', v: `${String(SIGNAL.peakHour).padStart(2, '0')}:00 IST` },
  { k: 'Best streak', v: `${SIGNAL.bestStreak} days` },
  { k: 'Status', v: 'Open to work', live: true },
]

/* ------------------------------------------------------------------ */
/*  Manifesto — `chip` tokens render tiny live visuals inside the text  */
/* ------------------------------------------------------------------ */
export const MANIFESTO = [
  "I'm Manisha — a full-stack engineer drawn to the hard,",
  { chip: 'live', say: 'live' }, // `say` = what screen readers hear in place of the chip
  'parts of software: five judges’ marks landing on one leaderboard',
  { chip: 'score' },
  'a bill paid in two taps',
  { chip: 'pay' },
  'a ferry ticket that can’t be scanned twice.',
  { chip: 'qr' },
  'I start projects from an empty repo and stay until they’re',
  { em: 'boringly reliable.' },
]

export const FACTS = [
  { k: 'Now', v: 'Flutter & full-stack developer at Sheeraj Codeworks — fintech, sports-tech and travel products, from the database to the app store.' },
  { k: 'Based', v: 'Gurugram, India · IST (UTC+5:30) · open to remote' },
  { k: 'Studied', v: 'B.Tech, Computer Science (Data Science) — MDU Rohtak, 2022–26 · CGPA 8.3' },
  { k: 'Obsessed with', v: 'Real-time systems, race conditions, offline-first apps and running AI on a laptop GPU.' },
  { k: 'Off the clock', v: 'Writing poetry, scripting psychology explainers, and building tools I wish existed.' },
]

/* ------------------------------------------------------------------ */
/*  Work                                                               */
/* ------------------------------------------------------------------ */
export const WORK = [
  {
    id: 'islands',
    index: '01',
    name: 'Andaman Tourism Platform',
    kicker: 'Ticketing, ferries & gates for an island chain',
    years: '2026',
    status: 'Tender build — not awarded',
    role: 'Backend lead — wrote 146 of 154 commits on the API, founded the production backend',
    headline: 'Tickets, ferries and gate scans for 19 islands — on one backbone.',
    summary:
      'Built for a government tourism tender: a traveller app, an operator portal and gate scanners for museums, water sports, ferries and boat rides across the Andaman & Nicobar Islands. I wrote nearly the entire NestJS API and founded the production backend. We didn’t win the tender, so it never launched — but it was complete, tested and demo-ready.',
    highlights: [
      'Marine-operations engine: 19 islands, 34 crossings, per-jetty daily boat rosters with auto-generation, turnaround checks and all-or-nothing Excel import.',
      'Race-safe ticketing — HMAC-signed QR passes, single-statement gate admission so two scanners can never admit one ticket, Postgres advisory locks against touting.',
      'Google & Apple Wallet passes with hand-rolled RS256 signing, plus native Kotlin and Swift modules in the app.',
      'Production identity: passkeys, TOTP step-up, KMS-signed JWKS, field-level encryption for India’s DPDP Act and a broker-less outbox on LISTEN/NOTIFY.',
    ],
    metrics: [
      { v: '222', k: 'API endpoints' },
      { v: '43', k: 'data models' },
      { v: '839', k: 'test cases' },
      { v: '53/55', k: 'migrations by me' },
    ],
    stack: ['NestJS', 'Prisma', 'PostgreSQL', 'React Native', 'React', 'Fastify', 'GCP KMS', 'Docker', 'GitHub Actions'],
    accent: '#5ee0d0',
    tint: '#0a1615',
    visual: 'departures',
  },
  {
    id: 'equiebook',
    index: '02',
    name: 'EquiEbook',
    kicker: 'Equestrian competitions, scored live',
    years: '2025 — 26',
    status: 'Live on both stores',
    role: 'Started the backend & admin from an empty repo; built live scoring across all three tiers',
    headline: 'Five judges. One leaderboard. No lag.',
    summary:
      'Clubs publish competitions, riders enter with their horses, officials score from a web console and results stream to every phone in real time. I bootstrapped the NestJS backend and the React admin, then built multi-judge FEI dressage scoring end to end in about four weeks.',
    highlights: [
      'Socket.IO scoring gateway backed by Redis: late joiners get cached standings, per-judge score history, 90-second judge session locks.',
      'FEI dressage catalogue — 12 tests from Training Level to Grand Prix with coefficients, collective marks, error deductions and tie-breaks — plus Freestyle, Para and Young Horse.',
      'Judge console with SPLIT and presiding-judge modes, plus the app’s live dressage scoring screen, which I created.',
      'Club side of the app: onboarding, competition → class → course builder, Razorpay Route payouts with KYC, OTP / MPIN / biometric login.',
    ],
    metrics: [
      { v: '12', k: 'FEI tests encoded' },
      { v: '1–7', k: 'judges per class' },
      { v: '60', k: 'scoring & perf tests' },
      { v: '~4 wks', k: 'idea → live scoring' },
    ],
    stack: ['React Native', 'NestJS', 'Prisma', 'PostgreSQL', 'Redis', 'Socket.IO', 'React', 'Ant Design', 'Razorpay'],
    links: [
      { label: 'App Store', href: 'https://apps.apple.com/us/app/equiebook/id6759237974' },
      { label: 'Google Play', href: 'https://play.google.com/store/apps/details?id=com.equiebook' },
      { label: 'Website', href: 'https://www.equiebook.com/' },
    ],
    accent: '#d4ff3f',
    tint: '#10140a',
    visual: 'scoring',
  },
  {
    id: 'tfm',
    index: '03',
    name: 'The Fat Money',
    kicker: 'AI-assisted personal finance for India',
    years: '2025 — 26',
    status: 'Live on both stores',
    role: 'Module owner in the Flutter app — bill payments, trading, loans, help desk',
    headline: 'Feature modules for a fintech app that’s live on both stores.',
    summary:
      'TFM builds your financial picture from bank SMS, email alerts and statements. In its Flutter app I built the utility-payments module end to end — finished, but held back from launch by BBPS licensing — and the trading, loan-application and support modules: 471 commits across ~120 feature branches.',
    highlights: [
      'Utility payments, built end to end (71% of the module): BBPS bills in 7 categories, prepaid & postpaid recharge with operator detection, credit-card bills, server-driven biller forms. Launch is pending a BBPS licence.',
      'Two-step Razorpay flow — record, pay, then fulfil — so money never moves without a transaction on file.',
      'Trading: watchlists, stock analysis, buy/sell, and a performance widget with day and 52-week ranges.',
      'App-wide light/dark theming on a ThemeExtension across 138 files; staging/production flavours with per-env Firebase and a release guard.',
    ],
    metrics: [
      { v: '471', k: 'commits' },
      { v: '71%', k: 'of the bill-pay module' },
      { v: '7', k: 'bill categories' },
      { v: '138', k: 'files re-themed' },
    ],
    stack: ['Flutter', 'Dart', 'GetX', 'Dio', 'Socket.IO', 'Firebase', 'Razorpay', 'Syncfusion'],
    links: [
      { label: 'App Store', href: 'https://apps.apple.com/in/app/the-fat-money/id6741164147' },
      { label: 'Google Play', href: 'https://play.google.com/store/apps/details?id=com.thefatmoney' },
      { label: 'Website', href: 'https://www.thefatmoney.com' },
    ],
    accent: '#ffb547',
    tint: '#16110a',
    visual: 'phone',
  },
  {
    id: 'gamification',
    index: '04',
    name: 'Gamification Engine',
    kicker: 'Points, streaks & levels for The Fat Money',
    years: '2026',
    status: 'Sole author',
    role: 'Wrote the entire backend, wired it into the app, built the admin controls',
    headline: 'Turning good money habits into a game people keep playing.',
    summary:
      'A ~3,300-line engine that rewards daily check-ins, categorising transactions and sticking to budgets — with streaks, freeze cards, six levels and leaderboards. Every slab, multiplier and level is tunable from an admin console I also built.',
    highlights: [
      '~27 documented endpoints: points, streaks with freeze cards, badges at 10 / 30 / 90 / 180 / 365 days, celebration queues.',
      'Six levels from “Ledger Rookie” to “Capital Imperium”, each with its own profile frame.',
      'Weekly, monthly and all-time leaderboards with tie-breaks and “my rank”; scheduled period resets.',
      'Budget-compliance rewards deduplicated per category per month, so nobody can farm points.',
    ],
    metrics: [
      { v: '~27', k: 'endpoints' },
      { v: '6', k: 'levels' },
      { v: '5', k: 'streak badges' },
      { v: '3', k: 'leaderboards' },
    ],
    stack: ['Node.js', 'TypeScript', 'Express', 'MongoDB', 'Zod', 'OpenAPI', 'Flutter', 'React'],
    links: [
      { label: 'In the app — Google Play', href: 'https://play.google.com/store/apps/details?id=com.thefatmoney' },
      { label: 'App Store', href: 'https://apps.apple.com/in/app/the-fat-money/id6741164147' },
    ],
    accent: '#ff7ab6',
    tint: '#170b11',
    visual: 'levels',
  },
  {
    id: 'health',
    index: '05',
    name: 'Fleet Health Monitor',
    kicker: 'Observability for a microservice fleet',
    years: '2026',
    status: 'Sole author',
    role: 'Designed, built and deployed solo — plus the live dashboard and the release pipelines',
    headline: 'A heartbeat for every microservice.',
    summary:
      'A new service that polls the TFM fleet every 30 seconds, scores each service 0–100 and pushes status changes over WebSockets to a live admin dashboard — with a drop-in middleware that gives any service p50 / p95 / p99 latency.',
    highlights: [
      'Weighted health score — availability 35%, error rate 25%, p95 latency 20%, CPU & memory 10%, dependencies 10% — mapped to UP / DEGRADED / DOWN.',
      'Live dashboard over WebSocket with a polling fallback, alerts and per-service history.',
      'Cold-start-aware timeouts and session affinity, tuned for Cloud Run.',
      'Wrote the staging → production Cloud Run pipelines for five services.',
    ],
    metrics: [
      { v: '30 s', k: 'poll interval' },
      { v: '5', k: 'weighted signals' },
      { v: 'p99', k: 'latency tracked' },
      { v: '5', k: 'pipelines shipped' },
    ],
    stack: ['Node.js', 'TypeScript', 'WebSocket', 'node-cron', 'Docker', 'Cloud Run', 'GitHub Actions', 'React'],
    accent: '#8ecfff',
    tint: '#0a1018',
    visual: 'health',
  },
]

/** status: 'live' | 'internal' | 'shelved'  ·  href: where the live thing can be seen */
export const ALSO = [
  {
    name: 'Elyfin — TFM’s AI',
    what: 'Guardrails for The Fat Money’s multilingual LangGraph + Gemini assistant: off-topic routing, prompt hardening, auth and health checks.',
    stack: 'LangGraph · Gemini · Node',
    year: '2026',
    status: 'live',
    href: 'https://www.thefatmoney.com',
    linkLabel: 'thefatmoney.com',
  },
  {
    name: 'The Fat Money website',
    what: 'Landing sections with GSAP scroll effects, a reCAPTCHA-v3 contact form, privacy & terms pages and blog-editor upgrades.',
    stack: 'Tailwind v4 · GSAP · Express',
    year: '2025 — 26',
    status: 'live',
    href: 'https://www.thefatmoney.com',
    linkLabel: 'thefatmoney.com',
  },
  {
    name: 'Sheeraj Codeworks site',
    what: 'Company website — unified layout, reCAPTCHA-v3 forms, a newsletter on every page.',
    stack: 'Tailwind v4 · Vanilla JS',
    year: '2025 — 26',
    status: 'live',
    href: 'https://www.sheerajcodeworks.com/',
    linkLabel: 'sheerajcodeworks.com',
  },
  {
    name: 'Jira lead pipeline',
    what: 'The company site’s contact and careers forms become Jira issues in the active sprint — attachments and labels included.',
    stack: 'Jira REST v3 · Agile API · Express',
    year: '2026',
    status: 'live',
    href: 'https://www.sheerajcodeworks.com/careers.html',
    linkLabel: 'careers form',
  },
  {
    name: 'Astra Designs site',
    what: 'Process and commercial pages for an interior-design studio’s website.',
    stack: 'HTML · CSS · JS',
    year: '2025',
    status: 'live',
    href: 'https://astradesignsofficial.com/',
    linkLabel: 'astradesignsofficial.com',
  },
  {
    name: 'LilByte app',
    what: 'An 11-screen Expo Router companion app for a SaaS studio, wired to its website’s API.',
    stack: 'Expo Router · TypeScript',
    year: '2026',
    status: 'live',
    href: 'https://lilbyte.vercel.app',
    linkLabel: 'lilbyte.vercel.app',
  },
  {
    name: 'IT asset portal',
    what: 'Internal inventory with an approvals queue and admin-vs-user permissions.',
    stack: 'Express · Prisma · PostgreSQL',
    year: '2025',
    status: 'internal',
  },
  {
    name: 'DEEP — Move',
    what: 'Ferries, flights, eco-bikes, heli tours & cargo in one travel super-module — ~28K lines in five weeks before the product was shelved.',
    stack: 'Expo · Reanimated · Google Maps',
    year: '2026',
    status: 'shelved',
  },
]

/* ------------------------------------------------------------------ */
/*  Journey — every role shipped as a release, oldest first.           */
/*  v: [major, minor] · at: 'YYYY-MM' start month on the commit track  */
/*  notes: [symbol, text] — '+' added · '~' improved · '→' next · '✓'  */
/* ------------------------------------------------------------------ */
export const RELEASES = [
  {
    v: [0, 0],
    code: 'init',
    at: null,
    when: '2022 — 2026',
    role: 'B.Tech, Computer Science',
    org: 'Maharshi Dayanand University · Rohtak',
    cmd: 'git init',
    notes: [
      ['+', 'Computer Science with a Data Science specialisation'],
      ['+', 'Capstone: Health Peek — a multilingual mental-health chat analyzer'],
      ['✓', 'Class of 2026 · CGPA 8.3'],
    ],
    tags: ['CGPA 8.3', 'Data Science'],
  },
  {
    v: [0, 1],
    code: 'tensor',
    at: '2024-06',
    when: 'Jun — Jul 2024',
    role: 'Data Science & ML Intern',
    org: 'YBI Foundation · Remote',
    cmd: 'git commit -m "first model"',
    notes: [
      ['+', 'Trained classification models with TensorFlow and Keras'],
      ['+', 'Prototyped and preprocessed data in Google Colab'],
    ],
    tags: ['Python', 'TensorFlow', 'Keras'],
  },
  {
    v: [0, 2],
    code: 'static',
    at: '2024-07',
    when: 'Jul — Aug 2024',
    role: 'Web Developer Intern',
    org: 'Webs Jyoti · Gurugram',
    cmd: 'git push origin gh-pages',
    notes: [
      ['+', 'Built and deployed three responsive websites'],
      ['~', 'Tuned front-end performance with lightweight design practices'],
    ],
    tags: ['HTML', 'CSS', 'JavaScript', 'Bootstrap'],
  },
  {
    v: [0, 5],
    code: 'ops',
    at: '2025-01',
    when: 'Jan — Jun 2025',
    role: 'IT Intern',
    org: 'Sheeraj Projects · Gurugram',
    cmd: 'git checkout -b flutter',
    notes: [
      ['+', 'Ran Microsoft 365 and AWS EC2 for 100+ staff'],
      ['+', 'Rolled out biometric attendance; helped ship the Astra Designs site'],
      ['→', 'First commit to The Fat Money’s Flutter app — February 2025'],
    ],
    tags: ['AWS EC2', 'Microsoft 365', 'Flutter'],
  },
  {
    v: [1, 0],
    code: 'realtime',
    at: '2025-07',
    when: 'Jul 2025 — Now',
    head: true,
    role: 'Flutter & Full-Stack Developer',
    org: 'Sheeraj Codeworks · Gurugram',
    cmd: 'git push origin main',
    notes: [
      ['+', 'Owned The Fat Money’s bill payments, trading, loans and help desk in Flutter'],
      ['+', 'Bootstrapped EquiEbook’s backend and admin; built live multi-judge scoring'],
      ['+', 'Sole author of TFM’s gamification engine and fleet health monitor'],
      ['+', 'Wrote 146 of 154 commits on a 222-endpoint island-tourism API'],
    ],
    tags: ['Flutter', 'NestJS', 'PostgreSQL', 'Socket.IO', 'Cloud Run'],
  },
]

export const CERTS = ['TCS — Cybersecurity', 'Vodafone Idea — AI Design', 'YBI — Data Science & ML', 'Webs Jyoti — Web Development']

/* ------------------------------------------------------------------ */
/*  Toolbelt — `where` powers the hover cross-reference                */
/* ------------------------------------------------------------------ */
export const TOOLBELT = [
  {
    group: 'Mobile',
    items: [
      { n: 'Flutter', where: 'The Fat Money' },
      { n: 'React Native', where: 'EquiEbook · Andaman app · Health Peek' },
      { n: 'Expo', where: 'DEEP · LilByte' },
      { n: 'GetX', where: 'The Fat Money' },
      { n: 'Reanimated', where: 'DEEP · Andaman app' },
      { n: 'Kotlin', where: 'Wallet module · ScrollLess' },
      { n: 'Swift', where: 'Apple Wallet module' },
    ],
  },
  {
    group: 'Backend',
    items: [
      { n: 'NestJS', where: 'Andaman API · EquiEbook' },
      { n: 'Node.js', where: 'TFM microservices' },
      { n: 'Express', where: 'Gamification · Health monitor' },
      { n: 'Fastify', where: 'Andaman production platform' },
      { n: 'FastAPI', where: 'Health Peek · Video & Voice Studio' },
      { n: 'Zod', where: 'TFM services · contracts' },
    ],
  },
  {
    group: 'Real-time',
    items: [
      { n: 'Socket.IO', where: 'EquiEbook live scoring · TFM prices' },
      { n: 'WebSockets', where: 'Health monitor' },
      { n: 'Redis', where: 'Scoring history & standings' },
      { n: 'LISTEN/NOTIFY', where: 'Transactional outbox' },
    ],
  },
  {
    group: 'Data',
    items: [
      { n: 'PostgreSQL', where: 'Andaman · EquiEbook' },
      { n: 'Prisma', where: '55 migrations on one API' },
      { n: 'MongoDB', where: 'TFM fleet · Health Peek' },
      { n: 'SQLite', where: 'MenderBit · Video Studio' },
    ],
  },
  {
    group: 'Web',
    items: [
      { n: 'TypeScript', where: '76% of the code I commit' },
      { n: 'React', where: 'Admin consoles · dashboards' },
      { n: 'Redux', where: 'TFM console' },
      { n: 'Ant Design', where: 'EquiEbook admin' },
      { n: 'Tailwind', where: 'Company sites · admin' },
      { n: 'GSAP', where: 'TFM website' },
    ],
  },
  {
    group: 'Cloud & Ops',
    items: [
      { n: 'Cloud Run', where: '5 pipelines · EquiEbook' },
      { n: 'Docker', where: 'Every service I ship' },
      { n: 'GitHub Actions', where: 'Staging → prod' },
      { n: 'Firebase', where: 'Push · flavours · hosting' },
      { n: 'GCP KMS', where: 'Signed JWKS' },
    ],
  },
  {
    group: 'Security',
    items: [
      { n: 'Passkeys', where: 'Andaman identity' },
      { n: 'TOTP', where: 'Step-up auth' },
      { n: 'JWT rotation', where: 'Hashed refresh tokens' },
      { n: 'HMAC', where: 'Signed QR tickets' },
      { n: 'Argon2', where: 'Password hashing' },
    ],
  },
  {
    group: 'AI',
    items: [
      { n: 'Ollama', where: 'MenderBit · Video Studio' },
      { n: 'LangGraph', where: 'Elyfin AI' },
      { n: 'Gemini', where: 'Elyfin AI' },
      { n: 'Whisper', where: 'Voice Studio · Health Peek' },
      { n: 'Transformers', where: 'Health Peek' },
      { n: 'ComfyUI', where: 'Video Studio' },
    ],
  },
  {
    group: 'Payments & APIs',
    items: [
      { n: 'Razorpay', where: 'TFM · EquiEbook' },
      { n: 'BBPS', where: 'TFM bill pay' },
      { n: 'Wallet passes', where: 'Google & Apple' },
      { n: 'Maps / Places', where: 'DEEP · EquiEbook' },
      { n: 'Jira API', where: 'Lead pipeline' },
    ],
  },
]

/* ------------------------------------------------------------------ */
/*  Lab — personal projects                                            */
/* ------------------------------------------------------------------ */
export const LAB = [
  {
    id: 'menderbit',
    name: 'MenderBit',
    what: 'A local-first coding agent that plans, edits, runs your real tests — and only claims what the evidence proves. Runs on an 8 GB laptop GPU.',
    stat: '11 / 16 hidden-test tasks with a 4B local model',
    stack: ['TypeScript', 'Tauri 2', 'VS Code API', 'Ollama', 'SQLite FTS5'],
    status: 'Beta v0.6 · private source',
    preview: 'agent',
    span: 'wide',
  },
  {
    id: 'video',
    name: 'Local AI Video Studio',
    what: 'One prompt in, a finished multi-shot video out — voices, music, captions. A chain of open-weight models choreographed inside 8 GB of VRAM.',
    stat: '1080×1920 video in 32 min, no cloud',
    stack: ['Python', 'FastAPI', 'ComfyUI', 'Wan 2.2', 'FFmpeg', 'React'],
    status: 'Working prototype · private source',
    preview: 'film',
  },
  {
    id: 'ied',
    name: 'Invisible Errors Detector',
    what: 'Static analysis for the bugs linters miss — null after find(), a missing await, swallowed errors — across 12 language families.',
    stat: '101 rules · 432 tests · ~60 ms per 2K lines',
    stack: ['TypeScript', 'Tree-sitter', 'LSP', 'VS Code', 'SARIF'],
    status: 'v0.1 · open source',
    href: 'https://github.com/manisharai01/ErrorDetectorExtension',
    preview: 'lint',
  },
  {
    id: 'healthpeek',
    name: 'Health Peek',
    what: 'A multilingual mental-health chat analyzer: emotion models, red-flag detection, CBT-based suggestions and clinical PDF reports. My B.Tech capstone.',
    stat: '21 languages + Hinglish',
    stack: ['FastAPI', 'Transformers', 'React', 'React Native', 'MongoDB'],
    status: 'Deployed MVP',
    href: 'https://github.com/manisharai01/health-peek',
    live: 'https://manisharai01.github.io/health-peek',
    preview: 'mood',
  },
  {
    id: 'voice',
    name: 'Voice Studio',
    what: 'Clone your own voice from a few minutes of audio and turn scripts into voiceovers — fully offline, with Whisper checking every take.',
    stat: '−16 LUFS masters + SRT subtitles',
    stack: ['Electron', 'React 19', 'FastAPI', 'Chatterbox TTS', 'Whisper'],
    status: 'v1.0 · private source',
    preview: 'wave',
  },
  {
    id: 'commits',
    name: 'CommitsTracker',
    what: 'Complete, de-duplicated reports of a developer’s GitHub work — every branch, fork and squash merge counted once.',
    stat: '163 s → 23 s after a GraphQL rewrite',
    stack: ['Python', 'asyncio', 'GraphQL', 'pandas'],
    status: 'Open source',
    href: 'https://github.com/manisharai01/CommitsTracker',
    preview: 'bars',
  },
  {
    id: 'scrollless',
    name: 'ScrollLess',
    what: 'An Android app that closes just the Reels and Shorts feeds once your daily limit is up. The rest of each app keeps working.',
    stat: 'Zero network permissions',
    stack: ['Kotlin', 'Jetpack Compose', 'Accessibility API'],
    status: 'Working APK',
    preview: 'limit',
  },
  {
    id: 'sign',
    name: 'Sign Language Translator',
    what: 'Real-time ASL alphabet recognition from a webcam, spelled on screen and spoken aloud. Where the ML habit started.',
    stat: '29 classes · MobileNetV2',
    stack: ['TensorFlow', 'OpenCV', 'Python'],
    status: 'College project',
    href: 'https://github.com/manisharai01/sign-language-translator',
    preview: 'spell',
  },
]

export const NAV = [
  { href: '#work', label: 'Work', n: '01' },
  { href: '#signal', label: 'Signal', n: '02' },
  { href: '#journey', label: 'Journey', n: '03' },
  { href: '#lab', label: 'Lab', n: '04' },
  { href: '#contact', label: 'Contact', n: '05' },
]
