# HabitApp

A mobile-first habit tracker you can install to your home screen. It's a PWA built with plain HTML, CSS and JavaScript, with no build step and no dependencies.

## Features

- **Today view** with a week strip. Tap any day to view or log it, or swipe the strip to change weeks.
- **Counter habits** (water, steps, minutes, pages…) with progress bars, a progress ring on the button, and 🔥 streaks. Goals can be daily or weekly.
- **Check habits** (goal of 1 time) that toggle with one tap.
- **Quit habits** with a live "time since" timer (`35d, 2h 15m, 33s`) and a progress bar toward the next milestone (1, 3, 7, 14, 30… days). Resetting saves your best streak and a history of resets.
- **To-do list** with dates, times, colours, flags and notes. Overdue items roll over to today.
- **Reports** show week, month and year grids for every habit, with completion percentages.
- **Timer** has a stopwatch and a countdown with presets, pause and resume, a session log, and optional completion notifications. Choose a *Focus* habit measured in `min` or `hours`, and the time you spend is added to it automatically.
- **Offline support** comes from a service worker. **Data stays on your device** in `localStorage`, and you can export and import JSON backups from Settings.
- Includes **sample data** so you can see how it looks right away.

## Run locally

```bash
cd site
python3 -m http.server 8000
# open http://localhost:8000
```

(The service worker needs `http://localhost` or HTTPS. Opening `index.html` directly as a file won't register it.)

## Deploy to GitHub Pages

1. Push to the `main` branch. The workflow in `.github/workflows/pages.yml` publishes the `site/` folder.
2. The first time only: go to **Settings → Pages → Build and deployment → Source** and choose **GitHub Actions**.
3. Your app will be live at `https://<user>.github.io/<repo>/`. You can also run the workflow manually from the **Actions** tab.

All paths are relative, so the app works from a repo sub-path without any configuration.

> When you ship changes, bump `CACHE` in `site/sw.js` (for example `habitapp-v2`) so installed apps download the new files.

## Install on your phone

- **iPhone:** open the site in Safari → Share → **Add to Home Screen**.
- **Android (Chrome):** menu ⋮ → **Install app** or **Add to Home screen**.

## Notes

- Countdown notifications only fire while the app is open, because browsers don't run page timers in the background. If the app was closed when the countdown ended, it finishes as soon as you reopen it.
- Clearing your browser's site data erases your habits, so export a backup first.
