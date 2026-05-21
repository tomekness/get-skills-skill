---
name: get-skills-skill
description: "OpenCode only. Use this skill when the user wants to install, add, or get a skill in OpenCode — either globally (~/.config/opencode/skills/) or locally in the current project (.opencode/skills/). Always asks global vs local if not specified. Triggers on: \"install the skill X\", \"add the skill from this repo\", \"get the skill X globally\", \"add skill X to this project\", \"install skill from URL\", or any request to install an OpenCode skill."
compatibility: opencode
allowed-tools: [Bash, Read, Write]
applyTo: '**'
usage: |
  install the skill from <repo-url>
  install the skill from <repo-url> globally
  add the skill <name> to this project
  get the skill <name> --skill pdf
  install skill X globally
  add this skill locally
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
