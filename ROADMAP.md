# CourseCompass — Product Roadmap

This roadmap reflects what was learned building and testing Week 5 (MVP) and Week 6 (enhancements), and where the product would go next with more time.

## Must Have (next 2–4 weeks)

These are gaps that would block CourseCompass from being used by a real cohort of students, not just demoed.

| Item | Rationale |
|---|---|
| **Password reset flow** | Currently there's no recovery path if a student forgets their password — an admin would have to manually reset it in the database. Blocking for any real rollout. |
| **Pagination on resource/review lists** | Works fine at demo scale (a handful of resources per topic). Once a topic has 50+ resources or a popular resource has 100+ reviews, loading everything at once will slow the page down. |
| **YouTube thumbnail auto-fetch** | Resource cards currently show a placeholder box instead of the real video thumbnail. YouTube's oEmbed API can pull this automatically from the URL — mostly a visual polish item but a high-impact one for first impressions. |
| **Bulk quiz question import (CSV)** | Admin quiz-authoring is one question at a time right now. Fine for a handful of topics; tedious once there are 20+ topics needing 5+ questions each. A CSV upload (reusing the existing Multer pattern from syllabus upload) would fix this quickly. |
| **Accessibility pass** | Color-only status indicators (match/extra/missing tags, quiz correct/incorrect) need text alternatives or ARIA labels for screen-reader users. |

## Later (future vision)

These are genuine product improvements, but need more validation or infrastructure before they're worth building.

| Item | Rationale |
|---|---|
| **Student-submitted resources (with admin review queue)** | Right now only admins can add resources. Opening this to students (with an approval step) would scale content growth faster than one admin can manage alone — but needs moderation tooling first. |
| **Spaced-repetition quiz reminders** | Comprehension quizzes currently only fire once, right after a resource. A "come back and retest yourself in 3 days" notification would reinforce retention — but needs a notification system that doesn't exist yet. |
| **AI-assisted quiz question drafting** | Admins currently write every question by hand. An AI-assist step (admin still reviews and approves every question before it goes live) could speed up quiz-bank creation for new topics — deliberately *not* done this week per the auth/analytics-first prioritization, and because human review matters more than volume for quiz quality. |
| **Engagement gamification (streaks, topic leaderboards)** | Could increase return visits, but risks turning learning into a vanity-metrics competition if not designed carefully — needs real user research first, not just a quick add. |
| **Multi-university syllabus templates** | Currently syllabus matching is per-topic and manually curated. Supporting shared templates across universities would need a more general tagging taxonomy than the current `covers`/`missing` string arrays. |

| **Per-student progress view for admins** | Analytics currently shows platform-wide aggregates only. A per-student breakdown (so an admin/mentor can spot and follow up with inactive students) came up directly in Week 6 user testing — valuable, but needs a privacy-conscious design (e.g. instructor-only access, clear student consent) before building. |
| **Student-suggested courses/topics** | Testers asked for a way to request courses/topics that don't exist yet, rather than only browsing what's curated. Needs a lightweight submission + admin-review flow, similar to the planned student-submitted-resources item above. |

## Explicitly out of scope for now

- Native mobile app — the responsive web app covers the primary use case (students researching resources, often on a laptop while studying).
- Real-time collaborative features (e.g. shared watch parties) — not validated as a student need yet.