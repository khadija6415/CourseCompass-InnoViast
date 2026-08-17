# Release Notes

## v2.0 — Week 6: Enhancement & Showcase

### New features

- **Progress Tracking & Comprehension Quiz**
  - Resources can now be marked Saved / In Progress / Completed
  - Per-topic progress bar shows completion percentage
  - After a resource, students can take a 5-question quiz auto-assembled from that topic's question bank
  - Quiz History page shows every attempt with marks and date
  - Best score per resource shown on the resource detail page

- **Ratings & Reviews**
  - Students can leave a 1–5 star rating with an optional comment on any resource
  - One review per student per resource (editable, not duplicated)
  - Average rating and review count shown on resource cards and detail pages

- **Analytics Dashboard** *(admin-only)*
  - Platform overview: users, courses, topics, resources, completion rate, average rating, quiz stats
  - Resource match-status breakdown (syllabus match / extra / missing)
  - Top 5 most popular resources by engagement
  - Per-topic performance: completion count, average quiz score, average rating
  - 14-day engagement trend (completions and quiz attempts)

- **Auth & Security Hardening**
  - **Fixed:** public registration could previously let a user self-assign the `admin` role by sending `role: "admin"` in the request body — registration now always creates a `student` account
  - Access tokens now expire in 15 minutes (previously 7 days); a 30-day refresh token (hashed, rotated on each use) keeps sessions alive without the security risk of a long-lived access token
  - Rate limiting added to `/login` and `/register` (8 attempts per 15 minutes per IP)
  - Logout now invalidates the stored refresh token server-side, not just the client's local storage

### Improvements

- Resource detail page redesigned to surface progress status, quiz access, and reviews in one view
- "My Bookmarks" page upgraded to "My Learning" with status filter tabs (All / Saved / In Progress / Completed)

### Known issues / not yet fixed

- No password reset flow yet (see ROADMAP.md — Must Have)
- Resource thumbnails are placeholders, not real YouTube thumbnails yet
- Review and quiz question lists are not paginated — fine at current demo scale, listed in roadmap for scale

---

## v1.0 — Week 5: MVP

- Course → Topic → Resource browsing with syllabus-match tagging (match / extra / missing)
- Syllabus PDF upload and keyword matching against resources
- JWT authentication, student bookmarks, admin panel for managing courses/topics/resources
- Per-topic ✓/✕ concept breakdown on resource cards (added after user testing with Aysha and Sajal)