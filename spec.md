# Injury Protocol Workout App

## Current State
New project. No existing code.

## Requested Changes (Diff)

### Add
- Mobile-first single-page workout app, no backend
- Display the 8-week injury protocol workout schedule
- Auto-detect current day of week and show that day's workout
- Day picker to manually select any day
- Each exercise shown with sets/reps/duration info
- RPE (Rate of Perceived Exertion) input field per exercise (optional logging, local state only)
- Rest day screen for Thursday and Sunday
- Minimal UI with big typography

### Modify
- None

### Remove
- None

## Implementation Plan
- Single React component app, all data hardcoded in frontend
- Workout data structure: map of day -> { name, type, exercises[] }
- Each exercise: { name, sets, reps/duration, hasRPE }
- State: selectedDay (defaults to current weekday), RPE values per exercise (local state)
- Day picker: horizontal scrollable row of day abbreviations (Mon–Sun)
- Workout view: day title, workout type, exercise list with big text
- RPE inputs: simple 1-10 number input or tap selector below each exercise
- Rest day: large "REST" text with minimal info
- No backend calls, no persistence beyond session state
