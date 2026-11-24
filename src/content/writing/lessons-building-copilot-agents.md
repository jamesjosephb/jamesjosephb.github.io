---
title: 'What I learned building Copilot agents for my team'
description: 'Lessons from turning GitHub Copilot into a set of agents a whole engineering team uses every day: context, guardrails, small pieces and adoption.'
pubDate: 2026-12-01
draft: true
tags: ['ai-agents', 'github-copilot', 'engineering-teams']
---

<!--
DRAFT OUTLINE. Not published: `draft: true` keeps it out of the build.
It shows only when you run `npm run dev`.
To publish: finish the text, set the real pubDate, change draft to false, commit and push.
Keep it generic: no internal names, ticket keys, coworker names or hard numbers.
-->

## Intro: the model could write code, but it couldn't do the work

- Starting point: a multi-repo .NET and Angular codebase in a regulated domain.
- What out-of-the-box Copilot got wrong (one file at a time, no standards, no idea how services connect).
- The reframe: treat the model like a new teammate who needs onboarding.

## Lesson 1: Context is the product

- Per-service context docs: what to put in them, how short they should be.
- Repo memory: capturing decisions and gotchas so the agent doesn't relearn them each session.
- Onboarding skills that work for people too.
- _Example to add:_ a question the agent answered badly before context docs and well after.

## Lesson 2: Guardrails before features

- Approval before anything irreversible (push, merge, ticket transition, message).
- Security rules based on the OWASP Top 10, applied to every generated change.
- Dependency preflight and rules for generated files.
- Why guardrails made people trust the tools enough to use them.

## Lesson 3: Instructions, skills, agents, scripts: pick the right layer

- Instructions = standards. Skills = repeatable procedures. Agents = a job. Scripts = the deterministic parts.
- When to move logic out of a prompt and into a script.
- Version everything with the code and review it like code.

## Lesson 4: Start with the chores people complain about

- Correlation-ID triage through Splunk as the first "wow" moment.
- Code review prep, PR health, standup digests.
- What didn't stick, and why.

## Lesson 5: Make the output easy to check

- Evidence over answers: timelines, links, diffs.
- The human stays the decision-maker.

## Lesson 6: Scripts own the facts, the model owns the judgement

- The problem: a reviewing model can cite a file that isn't in the diff, or a line that doesn't exist.
- Asking it to be careful doesn't fix that; checking does.
- The pipeline: a script gathers the facts, the model writes findings as data, a script renders the report and validates every citation.
- A run with an invented citation fails and says why; it never writes a quietly trimmed report.
- _Example to add:_ the findings.json and `render --strict` illustration on the demo app.

## Lesson 7: Budget the context

- Every instruction and skill costs context on every run, used or not.
- Load long references only when a step needs them.
- Tools return briefs, not dumps: the same size however large the input.
- Save large pages and exports to disk and parse them with a script.
- Enforce budgets in code, not in the prompt.

## Lesson 8: Audit the setup against real use

- Instructions and skills are easy to add and hard to remove.
- Read your own session history: tool calls, failures, retry loops, compactions, token cost.
- Compare it with the inventory: what goes unused, what fails often, what costs the most.
- Run the audit through the same checked pipeline, so its numbers are checked too.
- Keep a ledger of declined recommendations so they don't come back.

## Lesson 9: Adoption is a feature

- Demos aren't adoption: how I got teammates using the tools day to day.
- Feedback loops and iterating on real use.

## Closing: what I'd do differently / what's next

- What I'd tell another team starting today (3 bullet takeaways).
