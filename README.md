# 🗓️ Wall Calendar

<div align="center">

![Wall Calendar Preview](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)

### 🌐 [Live Demo → wall-calendar-brown.vercel.app](https://wall-calendar-brown.vercel.app/)

*A polished, fully interactive wall calendar component built with React + Vite + Tailwind CSS*

</div>

---

## 📸 Overview

This project is a production-grade interactive wall calendar that faithfully recreates the aesthetic of a **physical wall calendar** — complete with spiral binding, a hero image per month, and a clean date grid. Every interaction is smooth, every detail is intentional.

---

## ✨ Features

### 🎨 Wall Calendar Aesthetic
- Decorative **spiral binding** at the top
- Large **hero image** that changes every month with a stylish month/year badge overlay
- Premium card layout with subtle shadows and paper-like texture
- **Month flip animation** — a CSS 3D page-turn effect on every navigation

### 📅 Smart Date Selection
- **Day Range Selector** — click any start date, then an end date
- **Live hover preview** — range highlights in real-time as you hover before confirming
- Distinct visual states: solid circle for start/end, soft tint for in-between days
- Today's date always marked with a subtle ring indicator
- **Escape key** clears selection instantly

### 📝 Integrated Notes
- Notes panel updates its title dynamically: *"Notes for Apr 7 → Apr 12"*
- **Persisted via localStorage** — notes survive page reloads
- Separate notes per date range AND per month
- Character counter (0/500) with smooth Save confirmation

### 🌦️ Indian Season Themes
Dynamic accent colors shift based on Indian seasons:

| Season | Months | Color |
|--------|--------|-------|
| ❄️ Winter | Dec, Jan, Feb | Cool Blue |
| 🌸 Spring | Mar | Fresh Green |
| ☀️ Summer | Apr, May, Jun | Warm Orange |
| 🌧️ Monsoon | Jul, Aug, Sep | Teal/Cyan |
| 🍂 Autumn | Oct, Nov | Amber |

### 🎉 Holiday Markers
Key Indian and international holidays highlighted directly on the grid with color-coded dots.

### 📱 Fully Responsive
- **Desktop** — side-by-side layout: hero image left, calendar + notes right
- **Mobile** — gracefully stacked vertically with touch-friendly 44px+ tap targets
- Zero horizontal scroll on any screen size

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- npm

### Run Locally
```bash
# Clone the repository
git clone https://github.com/Lokeshbabugorrepati/wall-calendar.git

# Navigate into the project
cd wall-calendar

# Install dependencies
npm install

# Start the dev server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for Production
```bash
npm run build
```

---

## 🗂️ Project Structure
```
wall-calendar/
├── src/
│   ├── WallCalendar.jsx   # Core component — all calendar logic + UI
│   ├── App.jsx            # Root wrapper
│   ├── App.css            # App-level styles
│   └── index.css          # Global styles, animations, keyframes
├── public/                # Static assets
├── index.html
├── tailwind.config.js     # Tailwind configuration
├── vite.config.js         # Vite build config
├── postcss.config.js
└── package.json
```

---

## 🧠 Technical Design Decisions

| Decision | Reasoning |
|----------|-----------|
| **Single component architecture** | `WallCalendar.jsx` is fully self-contained and portable — drop it into any React project |
| **No external date libraries** | Pure native `Date` API throughout — zero bundle overhead, no dependencies |
| **localStorage keying strategy** | Notes keyed by `range:start:end` or `month:YYYY-M` for precise per-range persistence |
| **Indian seasonal themes** | Culturally relevant color shifts instead of generic Western seasons |
| **CSS 3D flip animation** | Re-triggered via `key={flipKey}` prop — React unmounts/remounts to replay the animation cleanly |
| **Live range preview** | `hoverDate` state tracks mouse position to paint ghost highlights before the 2nd click |
| **useCallback for date helpers** | `isStart`, `isEnd`, `isPreview` memoized to avoid unnecessary re-renders on every cell |

---

## 🛠️ Tech Stack

| Tool | Version | Purpose |
|------|---------|---------|
| React | 18 | UI & state management |
| Vite | 5 | Build tool & dev server |
| Tailwind CSS | 3 | Utility-first styling |
| localStorage | Native | Client-side data persistence |
| CSS Keyframes | Native | Flip & transition animations |

---

## 🌐 Deployment

Live on **Vercel** with automatic deployments on every push to `main`.

👉 **[https://wall-calendar-brown.vercel.app/](https://wall-calendar-brown.vercel.app/)**

---

## ⌨️ Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `←` / `→` | Navigate months |
| `Esc` | Clear date selection |
| `Home` | Jump to today |

---

<div align="center">

Built with ❤️ as part of a Frontend Engineering Challenge

</div>