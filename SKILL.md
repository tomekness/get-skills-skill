---
applyTo: '**'
description: |
  get-skills-skill – Installs OpenCode skills semi-automatically and asks for
  global/local if not explicitly specified in the prompt.

  - Fetches skills via npx skills add (non-interactive when possible)
  - Detects global vs local target, prompts if missing
  - Moves the skill into ~/.config/opencode/skills or the project .opencode/skills
  - Updates the corresponding opencode.json
  - Supports repos and subskills (e.g., --skill pdf)
  - Interacts via prompt when required inputs are missing

usage:
  - "Install the skill <name>"
  - "Add the skill <name> locally"
  - "Add the skill <name> globally"
  - Prompts if global/local is missing

automation:
  - Resolves target
  - Downloads via npx skills add
  - Moves skill into the target and updates opencode.json
  - Logs success/failure

impl_note: Node.js script or OpenCode skill reacting to prompts (skill mode, no CLI needed).
---

# get-skills-skill (interactive)

**Install skills based on input, global/local selectable:**

1. Fetches the requested skill via npx.
2. Prompts if the target is missing: "Install globally or locally?"
3. Creates missing skills folders and opencode.json.
4. Moves the skill into the target.
5. Updates the correct opencode.json.
6. Returns success or error.

**Prompt formats:**

- "Install the skill from <repo/url> --skill <sub>"
- "Install the skill from <repo/url> global"
- "Install the skill from <repo/url> local"

**No CLI needed – use as an OpenCode skill.**

## Behavior

- Detects `--skill <name>` in the prompt
- Detects `global`/`local` and prompts if missing
- Updates opencode.json with `"<skill>": "allow"`
- Returns `success`, `message`, optional `error`, and on success `skill`, `target`, `config`

## Output example

Success:
{
  "success": true,
  "message": "Skill installed and registered",
  "skill": "pdf",
  "target": "/home/tk/.config/opencode/skills/pdf",
  "config": "/home/tk/.config/opencode/opencode.json"
}

Error:
{
  "success": false,
  "message": "Temp skills directory not found after npx install"
}
