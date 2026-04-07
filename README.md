# 🗓️ Wall Calendar — Interactive React Component

A polished, production-ready interactive wall calendar built with **React + Vite + Tailwind CSS**, inspired by the aesthetic of a physical wall calendar.

## ✨ Features

- **Wall Calendar Aesthetic** — Spiral binding, hero image per month, month/year badge overlay
- **Day Range Selector** — Click a start and end date with live hover preview, distinct visual states for start, end, and in-between dates
- **Integrated Notes** — Attach notes to a date range or the whole month, persisted via `localStorage`
- **Month Flip Animation** — Smooth CSS 3D page-turn animation on month navigation
- **Indian Season Themes** — Dynamic accent colors for Winter, Spring, Summer, Monsoon, and Autumn
- **Holiday Markers** — Key Indian and international holidays highlighted on the grid
- **Fully Responsive** — Side-by-side layout on desktop, stacked on mobile with touch-friendly targets
- **Zero External Dependencies** — Pure native JS Date, no moment.js or date-fns

## 🖥️ Demo

> Navigate months, select a date range, and type notes — all changes persist on reload.

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- npm

### Installation
```bash
git clone https://github.com/Lokeshbabugorrepati/wall-calendar.git
cd wall-calendar
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for Production
```bash
npm run build
```

## 🗂️ Project Structure
```
wall-calendar/
├── src/
│   ├── WallCalendar.jsx   # Main calendar component (all logic + UI)
│   ├── App.jsx            # Root app
│   ├── App.css
│   └── index.css          # Global styles + animations
├── public/
├── index.html
├── tailwind.config.js
├── vite.config.js
└── package.json
```

## 🎨 Design Decisions

- **Single component architecture** — All state and logic lives in `WallCalendar.jsx` for easy portability
- **Indian seasonal themes** — Summer (Apr–Jun), Monsoon (Jul–Sep), Autumn (Oct–Nov), Winter (Dec–Feb), Spring (Mar) with matching color palettes
- **localStorage keying** — Notes keyed by `range:start:end` or `month:YYYY-M` for granular persistence
- **No external date libraries** — Native `Date` API used throughout for zero bundle overhead

## 🛠️ Tech Stack

| Tool | Purpose |
|------|---------|
| React 18 | UI & state management |
| Vite | Build tool & dev server |
| Tailwind CSS | Utility-first styling |
| localStorage | Client-side data persistence |

## 📱 Responsive Behavior

- **Desktop (≥768px):** Hero image panel on left, calendar grid + notes on right
- **Mobile (<768px):** Stacked vertically — image → calendar → notes

---

Built as part of a Frontend Engineering Challenge.