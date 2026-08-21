# QA Evidence — Week 6

## Testing methodology

- **Testers:** Aysha, Sajal (classmates — same testers used for Week 5 validation)
- **Date(s):** 21 August 2026
- **Method:** Live walkthrough on the deployed app (Vercel + Render), each tester using their own student account

## Primary flow — end-to-end verification

Each step below was walked through to confirm the core loop still completes without breaking. Items checked below were confirmed either by a tester or by direct developer testing (noted).

- [x] Sign up as a new student *(confirmed by both Aysha and Sajal)*
- [x] Browse a course → topic → resource list *(confirmed by Sajal; Aysha was blocked by the course-loading delay — see bugs below)*
- [ ] Upload/paste syllabus text and see personalized match percentages *(not explicitly re-tested this round; verified in Week 5)*
- [x] Open a resource, mark it "In Progress" then "Completed" *(confirmed by Sajal)*
- [ ] See the topic progress bar update *(to be manually re-verified before submission)*
- [x] Take the comprehension quiz for that resource, submit, see score *(confirmed by Sajal)*
- [ ] Check "Quiz History" shows the attempt *(to be manually re-verified before submission)*
- [x] Leave a star rating + review on the resource *(confirmed by Sajal)*
- [ ] Log out and log back in (confirm session/refresh token flow works) *(developer testing only so far)*
- [x] (Admin) Log in, view Analytics Dashboard, confirm numbers match what students just did *(developer-verified)*
- [x] (Admin) Add a new quiz question via the admin UI (not Postman) *(developer-verified)*

## Tester feedback

| Tester | What they tried | Feedback | Action taken |
|---|---|---|---|
| Aysha | Signup/login, tried course selection | Signup/login easy to understand. Got stuck on "Loading courses…" — could not proceed to test resource flow, progress, quiz, or My Learning. | Identified as a Render free-tier cold-start delay with no feedback shown to the user during the wait. Added a "server waking up" message + spinner after 4s of loading so the wait no longer looks broken. |
| Sajal | Full flow: signup, course/resource browsing, progress tracking, quiz, ratings | Signup/login, course browsing, In Progress→Completed, quiz submission+score, and ratings/reviews all worked correctly. Could not verify the My Learning page specifically. Suggested: admin should be able to see per-student progress to identify inactive students; students should be able to suggest new courses/topics. | My Learning logic reviewed — appears correct on code inspection; to be manually re-verified before submission. Both suggestions added to ROADMAP.md under "Later" with rationale. |

## Bugs found during this round of testing

| Bug | Severity | Fixed? |
|---|---|---|
| Resources listing page stuck on infinite loading due to a file-content mix-up between the listing and detail pages | High | ✅ Fixed |
| Home page "Loading courses..." gives no feedback during a Render cold-start delay, looking broken/frozen on first load after the backend goes idle | Medium | ✅ Fixed — added a waking-up message and spinner |

## Sign-off

Primary end-to-end flow confirmed working as of 21 August 2026, by Khadija (developer testing) with partial validation from Aysha and Sajal. Remaining unchecked items above (My Learning display, Quiz History, logout/login refresh flow) to be manually re-verified before final submission.