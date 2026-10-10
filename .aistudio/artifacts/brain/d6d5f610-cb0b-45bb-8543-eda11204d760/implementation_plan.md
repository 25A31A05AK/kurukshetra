# CyberSync: Personal AI Companion & Daily Work Operating System

CyberSync is an ultra-capable, human-like AI companion and daily workspace designed to plan, structure, and supercharge your daily work like an empathetic best friend and razor-sharp executive co-pilot in one.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> The following key decisions were confirmed from your preferences and guide our implementation:

- **Companion Identity & Persona**: Human-like digital companion and powerhouse work partner ("image-version friend"). Combines empathetic, authentic conversational support with high-precision task execution, schedule decomposition, and accountability checks. Includes customizable companion avatar portraits (with upload and curated cyberpunk visual styles).
- **Core Workspace Pillars**:
  1. **Smart Day Planner**: Interactive 24-hour visual time-blocker with drag/click scheduling, priority tags, and one-click "AI Optimize Schedule" powered by Gemini 3.8 Flash.
  2. **Habit & Routine Engine**: Daily streak tracker with XP progression, milestones, consistency shields, and celebratory visual effects.
  3. **Deep Focus Deck & Pomodoro**: Customizable work/break cycles integrated with live generative Web Audio ambient soundscapes (Cyber Rain, Neon Synth Drone, Deep Space Theta Waves, Lo-Fi Cafe Hum) that require no external media dependencies.
- **Visual Aesthetic & Styling**: High-energy cyberpunk dark theme with luminous cyan (`#00f2fe`), electric violet (`#8a2be2`), and neon amber (`#f59e0b`) accents against deep obsidian slate (`#070a13` / `#0f172a`), complying with strict anti-slop rules (no fake telemetry clutter, no pill sandwich badges, crisp tabular figures, and full 1440px viewport layout).

---

## 1. Overview & Core Concept

### What It Does
CyberSync acts as both your daily command center and your personal digital confidant. Whether you're feeling overwhelmed, planning a packed workday, trying to lock into deep focus, or building positive habits, CyberSync gives you:
- An **Interactive Companion Chat Drawer & Floating Buddy** that understands your live schedule, reviews your tasks, suggests optimizations, and cheers you on.
- A **Drag-and-Drop / Interactive Time-Block Schedule** that visually lays out your day by morning, afternoon, and evening blocks with real-time progress indicators.
- A **Gamified Habit Matrix** tracking daily execution, streak counts, completions, and unlocked productivity badges.
- A **Deep Focus Terminal** with full-screen focus mode, customizable Pomodoro intervals, task pinning, and generative ambient acoustic soundscapes.

### Target Persona
Busy professionals, creators, and students who want more than a cold spreadsheet or generic to-do list: someone who wants an intelligent, motivating partner in their screen that keeps them accountable and focused.

---

## 2. User Experience & Visual Design

### Key User Flows
1. **Morning Kickoff & AI Schedule Generation**:
   - The user opens the dashboard and is greeted by their companion with a morning summary of pending items.
   - The user can type or click "Plan My Day": Gemini analyzes pending tasks, estimates durations, and proposes an organized time-blocked timeline with realistic breaks.
   - Tasks can be checked off, rescheduled, edited, or marked as urgent with instantaneous UI feedback.
2. **Habit & Consistency Check-in**:
   - The user toggles habits (e.g., Morning Workout, Deep Reading, Code Practice, Hydration).
   - Completing habits triggers streak increments, sound feedback, and visual progress bars.
3. **Deep Focus Session**:
   - The user selects an active task, switches to Focus Mode, sets a 25-minute Pomodoro timer, and activates "Cyber Rain" ambient sound.
   - The screen minimizes distraction, highlighting only the current objective and live countdown timer.
4. **Companion Dialogue & Work Guidance**:
   - The companion drawer can be opened at any time. The companion has real-time context on the user's tasks, active timer, and habits, offering context-aware advice, motivational check-ins, or work breakdown.

### Visual Identity & Theme
- **Canvas & Surfaces**: Deep obsidian space (`#070a13`), structural glass panels (`rgba(15, 23, 42, 0.7)`), hairline borders (`rgba(56, 189, 248, 0.2)`).
- **Luminous Cyber Accents**: Neon cyan (`#00f2fe`), electric purple (`#a855f7`), vibrant emerald (`#10b981`), and warm amber (`#f59e0b`).
- **Typography**: `Plus Jakarta Sans` for clean, modern headings and UI text; `JetBrains Mono` / `tabular-nums` for timers, schedule intervals, and streak statistics.
- **Audio & Sensory Feedback**: Native Web Audio API synthesis for seamless ambient soundscapes (pink noise filtered for rain, low-frequency oscillators for deep synth drone, binaural theta frequencies) plus subtle UI click tones.

---

## 3. Key Product Decisions & Trade-Offs

- **Full-Stack Express + Vite Architecture with Gemini 3.8 Flash**:
  - *Chosen Approach*: Server-side API endpoint (`/api/companion/chat` and `/api/companion/optimize-schedule`) utilizing `@google/genai` SDK with `gemini-3.8-flash`.
  - *Why*: Securely protects API keys on the server while delivering fast, accurate scheduling and conversational responses with structured JSON output.
- **Web Audio API Generative Sound Engine**:
  - *Chosen Approach*: Synthesize ambient noise and soothing drones directly in the browser using oscillators and audio nodes, rather than loading external audio files.
  - *Why*: Eliminates broken audio links, zero network latency, infinite playback loop without audio pops or gaps, and fully offline capable.
- **Local Persistence with JSON Export/Import**:
  - *Chosen Approach*: React state synchronized with `localStorage`, with quick backup export and restore.
  - *Why*: Instantaneous zero-latency interactions without requiring complex cloud database logins, while ensuring the user never loses their tasks, habits, or chat history across refreshes.

---

## 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                          CYBERSYNC WEB UI                              │
│                                                                        │
│  ┌───────────────────────┐  ┌────────────────────────────────────────┐ │
│  │   Sidebar Navigation  │  │               Main View                │ │
│  │   - Day Planner       │  │   [Day Planner / Habits / Focus Deck]  │ │
│  │   - Habit Matrix      │  │   · Visual Time-Block Grid             │ │
│  │   - Focus Deck        │  │   · Priority Task Queues               │ │
│  │   - Companion Setup   │  │   · Interactive Habit Trackers         │ │
│  └──────────┬────────────┘  └───────────────────┬────────────────────┘ │
│             │                                   │                      │
│             └─────────────────┬─────────────────┘                      │
│                               ▼                                        │
│                 ┌───────────────────────────┐                          │
│                 │ Companion Co-Pilot Drawer │                          │
│                 │ (Chat / AI Advisor / Log) │                          │
│                 └─────────────┬─────────────┘                          │
└───────────────────────────────┼────────────────────────────────────────┘
                                │
                 ┌──────────────┴──────────────┐
                 ▼                             ▼
   ┌───────────────────────────┐ ┌──────────────────────────────────────┐
   │ Client State (Store)      │ │ Backend API Server (/api/companion)  │
   │ - LocalStorage Sync       │ │ - /chat (Gemini 3.8 Flash)           │
   │ - Web Audio Ambient Synth │ │ - /optimize (Schedule Optimizer)     │
   │ - Pomodoro Timer Engine   │ │ - @google/genai SDK with env API key │
   └───────────────────────────┘ └──────────────────────────────────────┘
```

### Core Data Models
- **Task & TimeBlock**: `id`, `title`, `description`, `startTime`, `endTime`, `category` (Work, Deep Work, Health, Personal), `priority` (P1, P2, P3), `completed`, `estimatedMinutes`.
- **Habit**: `id`, `name`, `frequency`, `streak`, `bestStreak`, `completedDates: string[]`, `category`, `color`.
- **FocusSession**: `durationMinutes`, `completedAt`, `taskTitle`, `type` (Work / Short Break / Long Break).
- **CompanionProfile**: `name`, `avatarUrl`, `tone`, `greeting`, `customInstructions`.
- **ChatMessage**: `id`, `role` ('user' | 'assistant'), `content`, `timestamp`, `suggestedActions`.

---

## 5. Execution Steps
1. **Fullstack Server Setup**: Create `server.ts` with Express and `@google/genai` for companion chat and schedule optimization; update `package.json` dev/start scripts and Vite proxy configuration.
2. **Audio & Soundscape Engine**: Implement Web Audio procedural sound synthesis (`webAudioService.ts`) for rain, synth drone, coffee hum, and focus chimes.
3. **Core Store & State Management**: Implement resilient local storage hooks for tasks, schedule blocks, habits, streaks, focus metrics, and companion settings.
4. **Day Planner Component**: Interactive visual time-blocker, task creation modal, category filters, and 1-click AI schedule reorganization.
5. **Habit & Streak Matrix**: Visual streak flame counters, milestone badges, daily check-off grid, and XP progression.
6. **Deep Focus Deck**: Pomodoro countdown timer with circular progress, ambient sound controls, and session logger.
7. **Companion AI Drawer & Avatar Customizer**: Rich chat drawer with quick action chips, schedule awareness, and custom friend image selector.
8. **Polish & Verification**: Test responsive layout, verify compilation with `compile_applet`, and confirm seamless end-to-end functionality.
