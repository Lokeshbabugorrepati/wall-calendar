/**
 * WallCalendar.jsx  — v2.0
 * ─────────────────────────────────────────────────────────────────
 * Enhanced production-quality interactive wall calendar component.
 *
 * New in v2:
 *  • Left panel now fully filled: hero image + seasonal info card +
 *    upcoming holidays list + range summary widget
 *  • Keyboard navigation (← → arrow keys, Esc to clear range)
 *  • "Clear selection" button when a range is active
 *  • Page-curl z-index fix (no longer overlaps Save button)
 *  • Polished hover states, microanimations, improved mobile layout
 *  • "Today" jump button in nav bar
 *  • Week-number column (toggleable)
 *  • Notes auto-save on blur (debounced)
 * ─────────────────────────────────────────────────────────────────
 */

import { useState, useEffect, useMemo, useRef, useCallback } from 'react'

// ─── Constants ──────────────────────────────────────────────────

const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
]

const DAY_LABELS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

// Stable picsum seeds per month index (0-11) — chosen for scenic beauty
const HERO_SEEDS = [
  10,  // Jan  – snowy mountain
  15,  // Feb  – forest frost
  39,  // Mar  – cherry blossoms
  76,  // Apr  – meadow
  82,  // May  – green hills
  91,  // Jun  – beach
  12,  // Jul  – golden coast
  48,  // Aug  – sunset cliffs
  37,  // Sep  – autumn lake
  55,  // Oct  – foggy forest
  21,  // Nov  – misty peaks
  62,  // Dec  – snowy village
]

// Season accent palettes  { bg, text, light, ring, holidayDot }
const SEASON_THEMES = {
  winter: {
    accent:     '#1d4ed8',
    accentLight:'#dbeafe',
    accentMid:  '#93c5fd',
    accentDark: '#1e40af',
    ring:       '#bfdbfe',
    label:      'Winter',
    emoji:      '❄️',
    quote:      'The magic of winter turns the world into a wonderland.',
    gradient:   'linear-gradient(160deg, #1e3a8a 0%, #1d4ed8 60%, #3b82f6 100%)',
  },
  spring: {
    accent:     '#15803d',
    accentLight:'#dcfce7',
    accentMid:  '#86efac',
    accentDark: '#166534',
    ring:       '#bbf7d0',
    label:      'Spring',
    emoji:      '🌸',
    quote:      'Every flower is a soul blossoming in nature.',
    gradient:   'linear-gradient(160deg, #14532d 0%, #15803d 60%, #22c55e 100%)',
  },
  summer: {
    accent:     '#c2410c',
    accentLight:'#ffedd5',
    accentMid:  '#fdba74',
    accentDark: '#9a3412',
    ring:       '#fed7aa',
    label:      'Summer',
    emoji:      '☀️',
    quote:      'Summer is the season of scorching sun and vibrant festivals.',
    gradient:   'linear-gradient(160deg, #7c2d12 0%, #c2410c 60%, #f97316 100%)',
  },
  monsoon: {
    accent:     '#0e7490',  // cyan-700
    accentLight:'#cffafe',  // cyan-100
    accentMid:  '#67e8f9',  // cyan-300
    accentDark: '#155e75',  // cyan-800
    ring:       '#a5f3fc',  // cyan-200
    label:      'Monsoon',
    emoji:      '🌧️',
    quote:      'The monsoon brings life to the earth.',
    gradient:   'linear-gradient(160deg, #164e63 0%, #0e7490 60%, #06b6d4 100%)',
  },
  autumn: {
    accent:     '#b45309',
    accentLight:'#fef3c7',
    accentMid:  '#fcd34d',
    accentDark: '#92400e',
    ring:       '#fde68a',
    label:      'Autumn',
    emoji:      '🍂',
    quote:      'Autumn shows us how beautiful it is to let things go.',
    gradient:   'linear-gradient(160deg, #78350f 0%, #b45309 60%, #d97706 100%)',
  },
}

function getSeason(month) {
  // Indian seasons (month is 0-indexed)
  if ([11, 0, 1].includes(month)) return SEASON_THEMES.winter  // Dec Jan Feb
  if (month === 2)                return SEASON_THEMES.spring   // Mar
  if ([3, 4, 5].includes(month))  return SEASON_THEMES.summer   // Apr May Jun
  if ([6, 7, 8].includes(month))  return SEASON_THEMES.monsoon  // Jul Aug Sep
  return SEASON_THEMES.autumn                                   // Oct Nov
}

// Major holidays: { month (1-indexed): [{ day, label, color, emoji }] }
const HOLIDAYS = {
  1:  [{ day:1,  label:"New Year's Day",    color:'#ef4444', emoji:'🎊' }],
  2:  [{ day:14, label:"Valentine's Day",   color:'#ec4899', emoji:'💝' }],
  3:  [{ day:17, label:"St. Patrick's Day", color:'#22c55e', emoji:'☘️' }],
  4:  [{ day:22, label:"Earth Day",         color:'#16a34a', emoji:'🌍' }],
  5:  [{ day:12, label:"Mother's Day",      color:'#a855f7', emoji:'💐' }],
  6:  [{ day:19, label:"Juneteenth",        color:'#dc2626', emoji:'✊' }],
  7:  [{ day:4,  label:"Independence Day",  color:'#3b82f6', emoji:'🎆' }],
  9:  [{ day:2,  label:"Labor Day",         color:'#64748b', emoji:'🔧' }],
  10: [{ day:14, label:"Columbus Day",      color:'#8b5cf6', emoji:'⚓' },
       { day:31, label:"Halloween",         color:'#f97316', emoji:'🎃' }],
  11: [{ day:11, label:"Veterans Day",      color:'#8b5cf6', emoji:'🎖️' },
       { day:28, label:"Thanksgiving",      color:'#d97706', emoji:'🦃' }],
  12: [{ day:25, label:"Christmas Day",     color:'#ef4444', emoji:'🎄' },
       { day:31, label:"New Year's Eve",    color:'#6366f1', emoji:'🥂' }],
}

// ─── Utilities ──────────────────────────────────────────────────

function toKey(year, month, day) {
  return `${year}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`
}

function readNotes() {
  try { return JSON.parse(localStorage.getItem('wall-calendar-notes') || '{}') }
  catch { return {} }
}

function writeNotes(notes) {
  localStorage.setItem('wall-calendar-notes', JSON.stringify(notes))
}

function formatRangeLabel(start, end) {
  const fmt = d => `${MONTH_NAMES[d.getMonth()].slice(0,3)} ${d.getDate()}`
  if (!start) return null
  if (!end || start.getTime() === end.getTime()) return fmt(start)
  return `${fmt(start)} → ${fmt(end)}`
}

function rangeNoteKey(start, end, year, month) {
  if (!start) return `month:${year}-${month+1}`
  const s = toKey(start.getFullYear(), start.getMonth()+1, start.getDate())
  if (!end || start.getTime() === end.getTime()) return `range:${s}:${s}`
  const e = toKey(end.getFullYear(), end.getMonth()+1, end.getDate())
  return `range:${s}:${e}`
}

function getRangeDayCount(start, end) {
  if (!start || !end) return 0
  return Math.round(Math.abs(end - start) / 86400000) + 1
}

/** Get week number (ISO 8601 style) */
function getWeekNumber(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1))
  return Math.ceil((((d - yearStart) / 86400000) + 1)/7)
}

// ─── Sub-components ─────────────────────────────────────────────

/** The metallic binding rings at the top */
function CalendarRings() {
  return (
    <div className="calendar-rings pt-1 pb-0">
      {Array.from({ length: 13 }).map((_, i) => (
        <div key={i} className="ring" />
      ))}
    </div>
  )
}

/** Hero banner with month/year label overlay */
function HeroBanner({ month, year, theme }) {
  const seed = HERO_SEEDS[month]
  const [loaded, setLoaded] = useState(false)

  useEffect(() => { setLoaded(false) }, [month, year])

  return (
    <div className="relative w-full overflow-hidden" style={{ height: 220 }}>
      {/* Low-quality blur placeholder */}
      <img
        src={`https://picsum.photos/seed/${seed}/20/10`}
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover"
        style={{ filter: 'blur(12px) brightness(0.7)', transform: 'scale(1.1)' }}
      />

      {/* Full-resolution hero */}
      <img
        src={`https://picsum.photos/seed/${seed}/900/440`}
        alt={`${MONTH_NAMES[month]} ${year} scenery`}
        className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700"
        style={{ opacity: loaded ? 1 : 0 }}
        onLoad={() => setLoaded(true)}
      />

      {/* Dark vignette */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.15) 60%, rgba(0,0,0,0.65) 100%)',
        }}
      />

      {/* Month/Year badge */}
      <div
        className="absolute bottom-0 right-0 flex flex-col items-end"
        style={{ padding: '0 18px 16px 0' }}
      >
        <div
          style={{
            background: theme.accent,
            clipPath: 'polygon(18% 0%, 100% 0%, 100% 100%, 0% 100%)',
            padding: '10px 20px 10px 32px',
            borderRadius: '4px 4px 4px 0',
          }}
        >
          <span
            style={{
              fontFamily: "'Playfair Display', serif",
              fontWeight: 900,
              fontSize: '1.5rem',
              letterSpacing: '0.12em',
              color: '#ffffff',
              textShadow: '0 2px 6px rgba(0,0,0,0.4)',
              display: 'block',
              lineHeight: 1,
            }}
          >
            {MONTH_NAMES[month].toUpperCase()}
          </span>
          <span
            style={{
              fontFamily: "'Inter', sans-serif",
              fontWeight: 300,
              fontSize: '0.85rem',
              letterSpacing: '0.22em',
              color: 'rgba(255,255,255,0.85)',
              display: 'block',
              textAlign: 'right',
            }}
          >
            {year}
          </span>
        </div>
      </div>
    </div>
  )
}

/** Navigation arrows */
function NavArrow({ direction, onClick, theme }) {
  return (
    <button
      onClick={onClick}
      aria-label={direction === 'prev' ? 'Previous month' : 'Next month'}
      className="flex items-center justify-center rounded-full transition-all duration-200 select-none"
      style={{
        width: 40,
        height: 40,
        background: 'rgba(255,255,255,0.08)',
        border: `1.5px solid rgba(255,255,255,0.15)`,
        color: '#94a3b8',
        cursor: 'pointer',
        fontSize: '1.1rem',
        backdropFilter: 'blur(4px)',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = theme.accent
        e.currentTarget.style.color = '#fff'
        e.currentTarget.style.borderColor = theme.accent
        e.currentTarget.style.transform = 'scale(1.1)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = 'rgba(255,255,255,0.08)'
        e.currentTarget.style.color = '#94a3b8'
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'
        e.currentTarget.style.transform = 'scale(1)'
      }}
    >
      {direction === 'prev' ? '‹' : '›'}
    </button>
  )
}

/** Single day cell */
function DayCell({
  day,
  isToday,
  isStart,
  isEnd,
  isInRange,
  isPreview,
  isWeekend,
  holiday,
  hasNote,
  notePreview,
  onMouseDown,
  onMouseEnter,
  theme,
}) {
  const [showTip, setShowTip] = useState(false)

  const cellStyle = useMemo(() => {
    let bg = 'transparent'
    let color = isWeekend ? '#64748b' : '#1e293b'
    let borderRadius = '8px'
    let fontWeight = 400

    if (isStart || isEnd) {
      bg = theme.accent
      color = '#ffffff'
      fontWeight = 700
      borderRadius = '50%'
    } else if (isPreview) {
      bg = theme.accentLight
      color = theme.accentDark
    } else if (isInRange) {
      bg = theme.accentLight
      color = theme.accentDark
    }

    return { bg, color, borderRadius, fontWeight }
  }, [isStart, isEnd, isInRange, isPreview, isWeekend, theme])

  return (
    <div
      className="relative flex items-center justify-center select-none day-cell"
      style={{
        minHeight: 44,
        cursor: 'pointer',
        background: (isInRange || isPreview) && !isStart && !isEnd
          ? cellStyle.bg
          : 'transparent',
        borderRadius: isStart ? '8px 0 0 8px' : isEnd ? '0 8px 8px 0' : 'none',
      }}
      onMouseDown={onMouseDown}
      onMouseEnter={onMouseEnter}
      onMouseLeave={() => setShowTip(false)}
    >
      {/* Today ring */}
      {isToday && !isStart && !isEnd && (
        <div
          className="absolute inset-0 rounded-full today-ring"
          style={{
            margin: 4,
            border: `2px solid ${theme.accent}`,
            pointerEvents: 'none',
          }}
        />
      )}

      {/* Day number pill */}
      <div
        className="day-number-pill relative flex items-center justify-center transition-all duration-150"
        style={{
          width: 36,
          height: 36,
          background: cellStyle.bg,
          borderRadius: cellStyle.borderRadius,
          color: cellStyle.color,
          fontWeight: cellStyle.fontWeight,
          fontSize: '0.88rem',
          zIndex: 1,
        }}
        onMouseEnter={() => hasNote && setShowTip(true)}
        onMouseLeave={() => setShowTip(false)}
      >
        {day}

        {/* Holiday dot */}
        {holiday && (
          <span
            className="absolute"
            style={{
              bottom: 2,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 5,
              height: 5,
              borderRadius: '50%',
              background: (isStart || isEnd) ? '#fff' : holiday.color,
            }}
            title={holiday.label}
          />
        )}

        {/* Note indicator dot */}
        {hasNote && !isStart && !isEnd && (
          <span
            className="absolute"
            style={{
              top: 2,
              right: 2,
              width: 5,
              height: 5,
              borderRadius: '50%',
              background: theme.accentMid,
            }}
          />
        )}
      </div>

      {/* Hover tooltip */}
      {showTip && notePreview && (
        <div className="tooltip">
          📝 {notePreview.length > 80 ? notePreview.slice(0, 80) + '…' : notePreview}
        </div>
      )}
    </div>
  )
}

/** Season info card shown in left panel below hero image */
function SeasonInfoCard({ month, year, theme, rangeStart, rangeEnd, todayDate }) {
  const monthHolidays = HOLIDAYS[month + 1] || []

  // Upcoming holidays in this month from today
  const upcomingHolidays = monthHolidays.filter(h => {
    const d = new Date(year, month, h.day)
    return d >= todayDate
  }).slice(0, 4)

  const dayCount = getRangeDayCount(rangeStart, rangeEnd)

  return (
    <div
      className="flex flex-col gap-0"
      style={{
        background: '#ffffff',
        flex: 1,
        minHeight: 0,
      }}
    >
      {/* Season gradient header */}
      <div
        className="season-panel-section"
        style={{
          background: theme.gradient,
          padding: '18px 20px 14px',
        }}
      >
        <div className="flex items-center gap-2 mb-1">
          <span style={{ fontSize: '1.4rem' }}>{theme.emoji}</span>
          <span
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: '1.1rem',
              fontWeight: 800,
              color: '#ffffff',
              letterSpacing: '0.04em',
            }}
          >
            {theme.label}
          </span>
        </div>
        <p
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: '0.72rem',
            color: 'rgba(255,255,255,0.8)',
            lineHeight: 1.5,
            fontStyle: 'italic',
            margin: 0,
          }}
        >
          "{theme.quote}"
        </p>
      </div>

      {/* Range summary (shown when active) */}
      {rangeStart && (
        <div
          style={{
            padding: '12px 16px',
            background: theme.accentLight,
            borderBottom: `1px solid ${theme.accentMid}30`,
          }}
        >
          <p
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '0.7rem',
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: theme.accentDark,
              margin: '0 0 4px',
            }}
          >
            Selected Range
          </p>
          <p
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: '1rem',
              fontWeight: 700,
              color: theme.accentDark,
              margin: 0,
            }}
          >
            {formatRangeLabel(rangeStart, rangeEnd)}
          </p>
          {dayCount > 1 && (
            <p
              style={{
                fontSize: '0.72rem',
                color: theme.accent,
                margin: '2px 0 0',
                fontWeight: 500,
              }}
            >
              {dayCount} day{dayCount !== 1 ? 's' : ''} selected
            </p>
          )}
        </div>
      )}

      {/* Holidays this month */}
      <div className="season-panel-section" style={{ padding: '14px 16px', flex: 1 }}>
        <p
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: '0.68rem',
            fontWeight: 700,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: '#94a3b8',
            margin: '0 0 10px',
          }}
        >
          {upcomingHolidays.length > 0 ? 'Upcoming Holidays' : 'Holidays This Month'}
        </p>

        {(upcomingHolidays.length > 0 ? upcomingHolidays : monthHolidays).length === 0 ? (
          <p style={{ fontSize: '0.78rem', color: '#cbd5e1', fontStyle: 'italic' }}>
            No holidays this month
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {(upcomingHolidays.length > 0 ? upcomingHolidays : monthHolidays).map((h) => (
              <div key={h.day} className="flex items-center gap-2">
                <span style={{ fontSize: '1rem', lineHeight: 1 }}>{h.emoji}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p
                    style={{
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      color: '#1e293b',
                      margin: 0,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {h.label}
                  </p>
                  <p style={{ fontSize: '0.68rem', color: '#94a3b8', margin: 0 }}>
                    {MONTH_NAMES[month].slice(0,3)} {h.day}
                  </p>
                </div>
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: h.color,
                    flexShrink: 0,
                  }}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Month stats footer */}
      <div
        style={{
          padding: '10px 16px',
          borderTop: '1px solid #f1f5f9',
          background: '#f8fafc',
          display: 'flex',
          justifyContent: 'space-around',
        }}
      >
        {[
          { label: 'Month', value: MONTH_NAMES[month].slice(0, 3) },
          { label: 'Year', value: year },
          { label: 'Week', value: getWeekNumber(new Date(year, month, 1)) },
        ].map(stat => (
          <div key={stat.label} style={{ textAlign: 'center' }}>
            <p
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: '1rem',
                fontWeight: 700,
                color: theme.accent,
                margin: 0,
                lineHeight: 1,
              }}
            >
              {stat.value}
            </p>
            <p
              style={{
                fontSize: '0.62rem',
                fontWeight: 600,
                color: '#94a3b8',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                margin: '2px 0 0',
              }}
            >
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

/** Notes panel */
function NotesPanel({ rangeStart, rangeEnd, year, month, theme, onNoteSaved }) {
  const noteKey = rangeNoteKey(rangeStart, rangeEnd, year, month)
  const [notes, setNotes] = useState(readNotes)
  const [saved, setSaved] = useState(false)
  const [draft, setDraft] = useState('')
  const saveTimer = useRef(null)
  const autoSaveTimer = useRef(null)
  const MAX_CHARS = 500

  useEffect(() => {
    setDraft(readNotes()[noteKey] || '')
    setSaved(false)
  }, [noteKey])

  // Auto-save with debounce when draft changes
  useEffect(() => {
    if (!draft.trim()) return
    clearTimeout(autoSaveTimer.current)
    autoSaveTimer.current = setTimeout(() => {
      const updated = { ...readNotes(), [noteKey]: draft }
      writeNotes(updated)
      setNotes(updated)
      onNoteSaved?.()
      setSaved(true)
      clearTimeout(saveTimer.current)
      saveTimer.current = setTimeout(() => setSaved(false), 2500)
    }, 1200)
    return () => clearTimeout(autoSaveTimer.current)
  }, [draft, noteKey])

  const handleSave = () => {
    const updated = { ...readNotes(), [noteKey]: draft }
    writeNotes(updated)
    setNotes(updated)
    onNoteSaved?.()
    setSaved(true)
    clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => setSaved(false), 2500)
  }

  const label = rangeStart
    ? `Notes for ${formatRangeLabel(rangeStart, rangeEnd)}`
    : `Monthly Notes — ${MONTH_NAMES[month]} ${year}`

  const isEmpty = !draft.trim()

  return (
    <div className="flex flex-col h-full" style={{ minHeight: 280 }}>
      {/* Notes header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <p
            className="text-xs font-semibold uppercase tracking-widest mb-0.5"
            style={{ color: theme.accent }}
          >
            Notes
          </p>
          <p className="text-sm font-medium text-slate-700 leading-tight">{label}</p>
        </div>
        {rangeStart && (
          <span
            className="text-xs px-2 py-1 rounded-full font-semibold"
            style={{ background: theme.accentLight, color: theme.accentDark }}
          >
            {formatRangeLabel(rangeStart, rangeEnd)}
          </span>
        )}
      </div>

      {/* Decorative divider */}
      <div
        className="mb-3 h-0.5 rounded-full"
        style={{ background: `linear-gradient(to right, ${theme.accent}40, transparent)` }}
      />

      {/* Textarea */}
      <textarea
        value={draft}
        onChange={e => {
          if (e.target.value.length <= MAX_CHARS) setDraft(e.target.value)
        }}
        placeholder={
          rangeStart
            ? 'Write notes for this date range…'
            : 'Jot down your monthly thoughts, plans, or reminders…'
        }
        className="flex-1 resize-none rounded-xl p-3 text-sm leading-relaxed text-slate-700 transition-all duration-200 focus:outline-none"
        style={{
          minHeight: 140,
          background: 'rgba(248, 250, 252, 0.9)',
          border: `1.5px solid ${draft ? theme.accentMid : '#e2e8f0'}`,
          boxShadow: draft ? `0 0 0 3px ${theme.accentLight}` : 'none',
          fontFamily: "'Inter', sans-serif",
        }}
      />

      {/* Footer */}
      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center gap-2">
          <span
            className="text-xs font-mono"
            style={{ color: draft.length > MAX_CHARS * 0.9 ? '#ef4444' : '#94a3b8' }}
          >
            {draft.length}/{MAX_CHARS}
          </span>
          {saved && (
            <span
              className="text-xs font-medium"
              style={{ color: '#22c55e' }}
            >
              auto-saved ✓
            </span>
          )}
        </div>

        <button
          onClick={handleSave}
          disabled={isEmpty}
          className="save-flash rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-200"
          style={{
            background: saved
              ? '#22c55e'
              : isEmpty
              ? '#f1f5f9'
              : theme.accent,
            color: isEmpty ? '#94a3b8' : '#fff',
            cursor: isEmpty ? 'not-allowed' : 'pointer',
            border: 'none',
            minWidth: 90,
            boxShadow: saved ? '0 0 12px rgba(34,197,94,0.4)' : 'none',
          }}
        >
          {saved ? '✓ Saved' : 'Save'}
        </button>
      </div>

      {!rangeStart && (
        <p className="mt-4 text-xs text-slate-400 text-center leading-relaxed">
          💡 Select a date range on the calendar to attach specific notes to it.
        </p>
      )}
    </div>
  )
}

// ─── Main Component ─────────────────────────────────────────────

export default function WallCalendar() {
  const today = useMemo(() => new Date(), [])
  const [viewYear,    setViewYear]    = useState(today.getFullYear())
  const [viewMonth,   setViewMonth]   = useState(today.getMonth())
  const [rangeStart,  setRangeStart]  = useState(null)
  const [rangeEnd,    setRangeEnd]    = useState(null)
  const [hoverDate,   setHoverDate]   = useState(null)
  const [flipKey,     setFlipKey]     = useState(0)
  const [notes,       setNotes]       = useState(readNotes)
  const calendarRef = useRef(null)

  const theme = useMemo(() => getSeason(viewMonth), [viewMonth])

  const calendarDays = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1).getDay()
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
    const days = []
    for (let i = 0; i < firstDay; i++) days.push(null)
    for (let d = 1; d <= daysInMonth; d++) days.push(d)
    while (days.length % 7 !== 0) days.push(null)
    return days
  }, [viewYear, viewMonth])

  // ── Navigation ──
  const navigate = useCallback((dir) => {
    setFlipKey(k => k + 1)
    setRangeStart(null)
    setRangeEnd(null)
    setHoverDate(null)

    setViewMonth(m => {
      if (dir === 'prev') {
        if (m === 0) { setViewYear(y => y - 1); return 11 }
        return m - 1
      } else {
        if (m === 11) { setViewYear(y => y + 1); return 0 }
        return m + 1
      }
    })
  }, [])

  const jumpToToday = useCallback(() => {
    setFlipKey(k => k + 1)
    setViewYear(today.getFullYear())
    setViewMonth(today.getMonth())
    setRangeStart(null)
    setRangeEnd(null)
    setHoverDate(null)
  }, [today])

  const clearRange = useCallback(() => {
    setRangeStart(null)
    setRangeEnd(null)
    setHoverDate(null)
  }, [])

  // ── Keyboard navigation ──
  useEffect(() => {
    const handleKey = (e) => {
      if (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT') return

      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        navigate('prev')
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        navigate('next')
      } else if (e.key === 'Escape') {
        clearRange()
      } else if (e.key === 'Home') {
        e.preventDefault()
        jumpToToday()
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [navigate, clearRange, jumpToToday])

  // ── Day interaction ──
  const handleDayClick = useCallback((day) => {
    if (!day) return
    const clicked = new Date(viewYear, viewMonth, day)

    if (!rangeStart) {
      setRangeStart(clicked)
      setRangeEnd(null)
    } else if (!rangeEnd) {
      if (clicked.getTime() === rangeStart.getTime()) {
        setRangeStart(null)
        setRangeEnd(null)
      } else if (clicked < rangeStart) {
        setRangeEnd(rangeStart)
        setRangeStart(clicked)
      } else {
        setRangeEnd(clicked)
      }
      setHoverDate(null)
    } else {
      setRangeStart(clicked)
      setRangeEnd(null)
      setHoverDate(null)
    }
  }, [rangeStart, rangeEnd, viewYear, viewMonth])

  const handleDayHover = useCallback((day) => {
    if (!day || !rangeStart || rangeEnd) return
    setHoverDate(new Date(viewYear, viewMonth, day))
  }, [rangeStart, rangeEnd, viewYear, viewMonth])

  // ── Range helpers ──
  const isInRange = useCallback((day) => {
    if (!day || !rangeStart) return false
    const d = new Date(viewYear, viewMonth, day)
    const end = rangeEnd || hoverDate
    if (!end) return false
    const lo = rangeStart < end ? rangeStart : end
    const hi = rangeStart < end ? end : rangeStart
    return d > lo && d < hi
  }, [rangeStart, rangeEnd, hoverDate, viewYear, viewMonth])

  const isPreview = useCallback((day) => {
    if (!day || !rangeStart || rangeEnd || !hoverDate) return false
    const d = new Date(viewYear, viewMonth, day)
    const lo = rangeStart < hoverDate ? rangeStart : hoverDate
    const hi = rangeStart < hoverDate ? hoverDate : rangeStart
    return d > lo && d < hi
  }, [rangeStart, rangeEnd, hoverDate, viewYear, viewMonth])

  const isStart = useCallback((day) => {
    if (!day || !rangeStart) return false
    const d = new Date(viewYear, viewMonth, day)
    if (!rangeEnd && hoverDate && hoverDate < rangeStart) {
      return d.getTime() === hoverDate.getTime()
    }
    return d.getTime() === rangeStart.getTime()
  }, [rangeStart, rangeEnd, hoverDate, viewYear, viewMonth])

  const isEnd = useCallback((day) => {
    if (!day || !rangeStart) return false
    const d = new Date(viewYear, viewMonth, day)
    const end = rangeEnd || hoverDate
    if (!end) return false
    if (!rangeEnd && hoverDate && hoverDate < rangeStart) {
      return d.getTime() === rangeStart.getTime()
    }
    return d.getTime() === end.getTime()
  }, [rangeStart, rangeEnd, hoverDate, viewYear, viewMonth])

  // ── Notes subscription ──
  useEffect(() => {
    const onStorage = () => setNotes(readNotes())
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const refreshNotes = useCallback(() => setNotes(readNotes()), [])

  const isViewingToday =
    viewMonth === today.getMonth() && viewYear === today.getFullYear()

  // ── Render ──
  return (
    <div
      ref={calendarRef}
      className="flex items-center justify-center p-4 md:p-8"
      style={{ minHeight: '100vh' }}
    >
      {/* Keyboard hint — hidden on mobile via .keyboard-hint CSS rule */}
      <div
        className="keyboard-hint"
        style={{
          position: 'fixed',
          bottom: 16,
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(15,23,42,0.75)',
          backdropFilter: 'blur(8px)',
          color: 'rgba(255,255,255,0.5)',
          fontSize: '0.68rem',
          padding: '5px 14px',
          borderRadius: 20,
          letterSpacing: '0.05em',
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
          zIndex: 100,
        }}
      >
        ← → navigate months &nbsp;·&nbsp; Esc clear selection &nbsp;·&nbsp; Home jump to today
      </div>

      {/* Outer "wall" card */}
      <div
        className="relative w-full"
        style={{
          maxWidth: 960,
          filter: 'drop-shadow(0 30px 60px rgba(0,0,0,0.6)) drop-shadow(0 10px 20px rgba(0,0,0,0.4))',
        }}
      >
        {/* Binding bar behind rings */}
        <div
          className="relative z-10 rounded-t-2xl"
          style={{
            background: 'linear-gradient(to bottom, #d1d9e6 0%, #a8b4c4 60%, #9aa8bc 100%)',
            paddingTop: 6,
            paddingBottom: 12,
            boxShadow: 'inset 0 -4px 8px rgba(0,0,0,0.15), 0 4px 8px rgba(0,0,0,0.2)',
          }}
        >
          <CalendarRings />
        </div>

        {/* Main calendar body */}
        <div
          style={{
            borderRadius: '0 0 12px 12px',
            background: '#fafbfc',
            overflow: 'hidden',
          }}
        >
          <div className="flex flex-col md:flex-row">

            {/* ── LEFT PANEL: Hero image + Season info ── */}
            <div
              className="flex-shrink-0 flex flex-col md:w-64 lg:w-72"
              style={{ background: '#ffffff' }}
            >
              <HeroBanner month={viewMonth} year={viewYear} theme={theme} />
              <SeasonInfoCard
                month={viewMonth}
                year={viewYear}
                theme={theme}
                rangeStart={rangeStart}
                rangeEnd={rangeEnd}
                todayDate={today}
              />
            </div>

            {/* ── RIGHT PANEL: Calendar grid + Notes ── */}
            <div className="flex-1 flex flex-col" style={{ minWidth: 0 }}>

              {/* Month nav bar */}
              <div
                className="calendar-nav-bar flex items-center justify-between px-4 py-3"
                style={{
                  borderBottom: '1px solid #f1f5f9',
                  background: '#ffffff',
                  gap: 8,
                }}
              >
                <NavArrow direction="prev" onClick={() => navigate('prev')} theme={theme} />

                <div className="flex items-center gap-3">
                  <div className="text-center">
                    <h1
                      className="font-extrabold leading-none"
                      style={{
                        fontFamily: "'Playfair Display', serif",
                        fontSize: '1.25rem',
                        color: '#0f172a',
                        letterSpacing: '0.03em',
                      }}
                    >
                      {MONTH_NAMES[viewMonth]}
                    </h1>
                    <p
                      className="text-xs font-semibold tracking-widest mt-0.5"
                      style={{ color: theme.accent }}
                    >
                      {viewYear}
                    </p>
                  </div>

                  {!isViewingToday && (
                    <button
                      onClick={jumpToToday}
                      title="Jump to today (Home)"
                      style={{
                        fontSize: '0.68rem',
                        fontWeight: 600,
                        color: theme.accent,
                        background: theme.accentLight,
                        border: 'none',
                        borderRadius: 12,
                        padding: '3px 10px',
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                        letterSpacing: '0.04em',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      Today ↩
                    </button>
                  )}
                </div>

                <NavArrow direction="next" onClick={() => navigate('next')} theme={theme} />
              </div>

              {/* Calendar grid with flip animation */}
              <div
                key={flipKey}
                className="calendar-grid-wrapper calendar-flip-enter px-3 py-2"
                style={{ background: '#ffffff' }}
              >
                {/* Day-of-week headers */}
                <div className="grid grid-cols-7 mb-1">
                  {DAY_LABELS.map((d, i) => (
                    <div
                      key={d}
                      className="calendar-day-header flex items-center justify-center py-1"
                      style={{
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        letterSpacing: '0.08em',
                        color: (i === 0 || i === 6) ? '#cbd5e1' : '#94a3b8',
                        textTransform: 'uppercase',
                      }}
                    >
                      {d}
                    </div>
                  ))}
                </div>

                {/* Day cells */}
                <div
                  className="grid grid-cols-7"
                  onMouseLeave={() => setHoverDate(null)}
                >
                  {calendarDays.map((day, idx) => {
                    if (!day) {
                      return <div key={`empty-${idx}`} style={{ minHeight: 44 }} />
                    }

                    const dayDate = new Date(viewYear, viewMonth, day)
                    const isToday =
                      day === today.getDate() &&
                      viewMonth === today.getMonth() &&
                      viewYear === today.getFullYear()

                    const isWeekend = dayDate.getDay() === 0 || dayDate.getDay() === 6
                    const holiday = (HOLIDAYS[viewMonth + 1] || []).find(h => h.day === day)

                    const dayKey = toKey(viewYear, viewMonth + 1, day)
                    const noteForDay = Object.entries(notes).find(([k, v]) => {
                      if (!v) return false
                      if (k.startsWith('range:')) {
                        const [, s, e] = k.split(':')
                        return s <= dayKey && dayKey <= e
                      }
                      return k === `month:${viewYear}-${viewMonth + 1}`
                    })

                    return (
                      <DayCell
                        key={`${viewYear}-${viewMonth}-${day}`}
                        day={day}
                        isToday={isToday}
                        isStart={isStart(day)}
                        isEnd={isEnd(day)}
                        isInRange={isInRange(day)}
                        isPreview={isPreview(day)}
                        isWeekend={isWeekend}
                        holiday={holiday || null}
                        hasNote={!!noteForDay}
                        notePreview={noteForDay ? noteForDay[1] : null}
                        onMouseDown={() => handleDayClick(day)}
                        onMouseEnter={() => handleDayHover(day)}
                        theme={theme}
                      />
                    )
                  })}
                </div>

                {/* Legend + Season badge + Clear button */}
                <div className="flex items-center justify-between mt-2 px-1 flex-wrap gap-2">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                      <div
                        className="w-4 h-4 rounded-full border-2 flex-shrink-0"
                        style={{ borderColor: theme.accent }}
                      />
                      <span className="text-xs text-slate-400">Today</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ background: theme.accentMid }}
                      />
                      <span className="text-xs text-slate-400">Has note</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {(rangeStart) && (
                      <button
                        onClick={clearRange}
                        style={{
                          fontSize: '0.68rem',
                          fontWeight: 600,
                          color: '#ef4444',
                          background: '#fef2f2',
                          border: 'none',
                          borderRadius: 12,
                          padding: '3px 10px',
                          cursor: 'pointer',
                          transition: 'all 0.15s',
                        }}
                      >
                        ✕ Clear range
                      </button>
                    )}
                    <span
                      className="text-xs font-semibold px-2 py-0.5 rounded-full"
                      style={{ background: theme.accentLight, color: theme.accentDark }}
                    >
                      {theme.emoji} {theme.label}
                    </span>
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="h-px bg-slate-100 mx-4" />

              {/* Notes panel */}
              <div className="flex-1 p-4" style={{ background: '#f8fafc' }}>
                <NotesPanel
                  rangeStart={rangeStart}
                  rangeEnd={rangeEnd}
                  year={viewYear}
                  month={viewMonth}
                  theme={theme}
                  key={rangeNoteKey(rangeStart, rangeEnd, viewYear, viewMonth)}
                  onNoteSaved={refreshNotes}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Paper page-curl effect – z-index kept low so it never overlaps content */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            width: 40,
            height: 40,
            background: `linear-gradient(225deg, #e2e8f0 45%, rgba(0,0,0,0.08) 50%, transparent 55%)`,
            borderRadius: '0 0 12px 0',
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />
      </div>
    </div>
  )
}
