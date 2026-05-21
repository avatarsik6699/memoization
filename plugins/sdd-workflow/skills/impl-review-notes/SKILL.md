---
name: impl-review-notes
description: Fix unchecked Architect Review Notes for a phase. Reads review note checkboxes, records exploration, implementation plan, and implementation notes in PHASE_XX_NOTES.md, applies narrow fixes, and checks off resolved notes without running gate/sync or creating a branch.
metadata:
  priority: 5
  pathPatterns:
    - 'docs/PHASE_*.md'
    - 'docs/PHASE_*_NOTES.md'
    - 'docs/CONTEXT.md'
    - 'docs/STACK.md'
  promptSignals:
    phrases:
      - "impl review notes"
      - "architect review notes"
      - "fix review notes"
      - "review note fix"
    allOf:
      - [impl, review, notes]
      - [architect, review, notes]
    anyOf:
      - "phase"
      - "fix"
      - "unchecked"
    noneOf: []
    minScore: 5
retrieval:
  aliases:
    - sdd impl review notes
    - fix architect review notes
  intents:
    - implement fixes for unchecked architect review notes
    - record review note fix metadata in phase notes
  entities:
    - PHASE_XX.md
    - PHASE_XX_NOTES.md
---

# impl-review-notes

Execute the canonical playbook in [docs/playbooks/impl-review-notes.md](../../../../docs/playbooks/impl-review-notes.md). That file is the source of truth for review note resolution, metadata format, skip rules, and the final report.
