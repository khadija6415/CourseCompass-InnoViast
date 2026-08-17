# Screenshot Shot List

Assignment requires 3–5 screenshots. These 5 are chosen to each show a *different* Week 6 enhancement, so a reviewer scanning quickly sees all 4 features at a glance.

## 1. Resource detail — Progress + Quiz card
**Where:** Any resource detail page, logged in as a student
**Shows:** Status control (Saved/In Progress/Completed) + the Comprehension Quiz card with "Take the quiz" button
**Before shooting:** Set status to "Completed" so the full state is visible

## 2. Quiz results screen
**Where:** `/resources/[id]/quiz` after submitting a quiz
**Shows:** Score, percentage, and the per-question correct/incorrect breakdown
**Before shooting:** Answer a mix of correct and incorrect so both colors (verdigris ✓ / rust ✕) are visible in one shot

## 3. Ratings & Reviews section
**Where:** Bottom of a resource detail page
**Shows:** Average star rating + at least 1–2 written reviews
**Before shooting:** Make sure at least 2 test accounts have left reviews so it doesn't look empty

## 4. Admin Analytics Dashboard
**Where:** `/admin/analytics`
**Shows:** Stat cards, resource breakdown bars, and the 14-day engagement chart
**Before shooting:** Use the app a few times across different days if possible so the engagement trend isn't a flat line — otherwise just note in the demo that it's a fresh dataset

## 5. My Learning — status filter tabs
**Where:** `/bookmarks`
**Shows:** The All/Saved/In Progress/Completed filter tabs with a few resources in different states
**Before shooting:** Have at least one resource in each of the 3 statuses

---

## Before every screenshot

- [ ] No real email addresses, passwords, or JWT tokens visible in the browser (check URL bar and any dev tools panels are closed)
- [ ] Browser window sized consistently across all shots (e.g. maximize, same zoom level — `Ctrl+0` to reset zoom)
- [ ] Logged in as a **student** account for shots 1–3 and 5, **admin** account for shot 4
- [ ] Save as PNG, named clearly: `01-progress-quiz.png`, `02-quiz-results.png`, `03-reviews.png`, `04-analytics.png`, `05-my-learning.png`