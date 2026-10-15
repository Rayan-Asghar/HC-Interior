# Project rules

## Machine limits (15 GB RAM)
- Run only one heavy command at a time: typecheck, lint, tests, DB rebuilds, and browser checks (headless Chrome, screenshots).
- Wrap each one in `flock /tmp/heavy.lock <cmd>` so they queue, including across subagents.
- Never run them in parallel tool calls, and never background them alongside each other.
- If the editor still dies, move to two lanes with a second lock file.
- Why: running them in parallel, or with the dev server and Chrome up, has killed the editor from memory pressure.

## Motion graphics
- The website is built on a canvas scroll film, and that stays.
- When a design critique or audit suggests cutting the scroll scrub or replacing it with static content, fix around the film instead. Options: a progress rail, a shorter scroll track, a text fallback, accessibility, contrast and mobile fixes.
- Why: the motion graphics are the stated brief for the site and its strongest part.

## Design workflow
- Use the `impeccable` skill for design, critique, polish and audit work on the frontend.
- Use the motion skills (`motion-art-direction`, `animation-principles`, `javascript-animation`) for motion work.
