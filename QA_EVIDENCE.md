# QA Evidence — Week 6

## Testing methodology

- **Testers:** [names — e.g. Aysha, Sajal, or a mentor walkthrough]
- **Date(s):** [fill in]
- **Method:** Live walkthrough on the deployed app / local dev build (specify which)

## Primary flow — end-to-end verification

Each step below was walked through with testers to confirm the core loop still completes without breaking.

- [ ] Sign up as a new student
- [ ] Browse a course → topic → resource list
- [ ] Upload/paste syllabus text and see personalized match percentages
- [ ] Open a resource, mark it "In Progress" then "Completed"
- [ ] See the topic progress bar update
- [ ] Take the comprehension quiz for that resource, submit, see score
- [ ] Check "Quiz History" shows the attempt
- [ ] Leave a star rating + review on the resource
- [ ] Log out and log back in (confirm session/refresh token flow works)
- [ ] (Admin) Log in, view Analytics Dashboard, confirm numbers match what students just did
- [ ] (Admin) Add a new quiz question via the admin UI (not Postman)

## Tester feedback

| Tester | What they tried | Feedback | Action taken |
|---|---|---|---|
| | | | |
| | | | |

## What changed since Week 5 feedback

| Week 5 feedback / pain point | Week 6 change |
|---|---|
| Students couldn't tell if they'd actually watched/finished a resource | Added Progress Tracking (Saved/In Progress/Completed) |
| No way to validate whether a resource actually helped comprehension | Added Comprehension Quiz tied to resource topics |
| No signal on resource quality besides the match tag | Added Ratings & Reviews |
| No visibility into how the platform is actually being used | Added Analytics Dashboard |
| *(add any other direct quotes/paraphrases from your Week 5 testers here)* | |

## Bugs found during this round of testing

| Bug | Severity | Fixed? |
|---|---|---|
| *(e.g. "Resources listing page stuck on infinite loading due to a file-content mix-up between the listing and detail pages")* | High | ✅ Fixed |
| | | |

## Sign-off

Primary end-to-end flow confirmed working as of [date], by [names].