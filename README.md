# Syncue
> A simple smart teleprompter web application ready to use

![Version](https://img.shields.io/badge/version-0.1.0-red.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

# What is Syncue?
Syncue is a smart teleprompter web app built with Next.js.  
Write your script, then read it with a smooth, controlled scroll — and soon, a scroll that follows your voice automatically.

## Features

- **Script editor** powered by EditorJS (headings, paragraphs)
- **Teleprompter view** with adjustable font size and scroll speed
- **Voice-driven auto-scroll** — the teleprompter follows your reading automatically
- Script persisted in localStorage — no account needed


## Tech stack

- [Next.js 15](https://nextjs.org/) (App Router, TypeScript)
- [Tailwind CSS](https://tailwindcss.com/)
- [EditorJS](https://editorjs.io/)
- [Zustand](https://zustand-demo.pmnd.rs/) (state management)
- [Fuse.js](https://www.fusejs.io/) (fuzzy text matching for voice sync)
- Web Speech API (Chrome only)

## Getting started

```bash
git clone https://github.com/your-username/syncue.git
cd syncue
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Browser support for voice auto-scroll

Voice-driven auto-scroll relies on the Web Speech API, which is currently only supported on **Google Chrome** (desktop). Other browsers such as Firefox and Safari are not supported yet.

| Language | Status |
|----------|--------|
| English (US) | ✅ Available |
| English (UK) | ✅ Available |
| French (FR) | ✅ Available |
| Spanish (ES) | ✅ Available |
| German (DE) | ✅ Available |
| Italian (IT) | ✅ Available |
| Portuguese (BR) | ✅ Available |
| Others | 🔜 Coming soon |


## Project structure
- app/
    - editor/       → Script editor page
    - prompter/     → Teleprompter view
- components/
    - Editor/       → EditorJS integration
    - Prompter/     → Teleprompter scroll & controls
- hooks/
    - useSpeechSync.ts  → Voice recognition & text alignment
- store/
    - useScriptStore.ts  → Zustand store (shared script state)

## Roadmap

- [x] Script editor
- [x] Teleprompter with manual scroll speed
- [x] Voice-driven auto-scroll (English US, Chrome)
- [x] Multi-language voice support (FR, ES, DE...)

## License

MIT © 2026 — Valentin FOEX
