# AI Usage Disclosure

This document transparently describes how AI tools were used while building the Week 6 CourseCompass enhancements, per InnoViast's submission requirements.

## Tool used

Claude (Anthropic), used as a step-by-step pair-programming assistant throughout backend and frontend development.

## What the AI was used for

- **Code generation**: Writing Mongoose models, Express controllers/routes, and Next.js/React components, based on requirements and decisions I provided (e.g. schema fields, endpoint behavior, UI copy).
- **Debugging support**: Diagnosing issues during development — for example, tracing a page that got stuck on "Loading resource..." back to two files' contents having been pasted into the wrong paths, by cross-checking rendered HTML in DevTools against the expected component code.
- **Explaining trade-offs**: E.g. why refresh tokens were returned in the JSON response body rather than as httpOnly cookies, given the frontend (Vercel) and backend (Render) are on different domains and cross-origin cookies add real complexity for a project at this scale.
- **Boilerplate for repetitive patterns**: Once one CRUD controller/route pair was established (e.g. Reviews), subsequent ones (e.g. Questions) followed the same structure, generated faster with AI assistance while I verified each one matched the existing codebase's conventions.

## What I did myself

- **Feature selection and product decisions**: Chose which 4 enhancements to build (Progress Tracking, Ratings & Reviews, Analytics, Auth/Security) based on the assignment's evaluation weighting and what would genuinely strengthen the validated Week 5 use case.
- **The comprehension quiz concept**: Proposed tying quiz questions to the existing `covers` field on resources (rather than building a separate content-tagging system), and folding it into Progress Tracking rather than treating it as a 5th standalone feature, to stay within the assignment's 2–4 feature scope while adding real depth.
- **Scoping decisions**: Chose admin-authored quiz questions over AI-generated ones (reliability and control over correctness), and chose aggregation-based analytics over a separate view-tracking system (simplicity, no new failure points).
- **Testing and verification**: Every backend and frontend change was tested locally (via the running dev servers, and via Thunder Client/Postman for early API testing) before moving to the next step — nothing was accepted without running it myself first.
- **Deployment, environment configuration, and git management**: All `.env` values, MongoDB Atlas configuration, Vercel/Render deployment, and commits/pushes were done by me.
- **User re-testing**: Re-tested the enhanced product per the Week 6 validation requirement (see release notes / QA evidence).

## Why this matters

AI accelerated the mechanical parts of implementation (writing consistent CRUD boilerplate, catching a misplaced-file bug quickly), but every product decision — what to build, how it should behave, and whether it actually worked — was mine, and verified by me running the app, not by trusting generated code blindly.