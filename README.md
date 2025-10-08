# 🏆 ICPC Training Logger

A web application to track team activities during ICPC training sessions. Built with React + TypeScript + Vite.

## Features

- **Contest Setup**: Configure name, duration, team members (1-3), and tasks (1-26)
- **Real-time Tracking**: Live timers with two-tap logging (Member → Task → Operation)
- **Activity States**: Reading, Thinking, Implementing with visual feedback
- **CSV Export**: Detailed logs and per-task summaries
- **Offline-first**: Works entirely in browser with localStorage persistence

## Usage

1. **Setup**: Enter contest name, duration, team members, and number of tasks
2. **Logging**: Click member → task → operation to start tracking
3. **Stop**: Click active member's red button to end current activity
4. **Export**: Download CSV reports when contest ends

## Development

```bash
npm install    # Install dependencies
npm run dev    # Start development server
npm run build  # Build for production
```

## Tech Stack

React + TypeScript + Vite + React Router + PapaParse
