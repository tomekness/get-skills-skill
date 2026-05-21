get-skills-skill
================

get-skills-skill lets OpenCode install skills from any repo via a natural-language prompt, handling global/local placement and opencode.json updates automatically.

In short: this skill installs OpenCode skills via `npx skills add`.

## Install

#### Via npx (recommended)

```bash
# Interactive — asks global or local
npx github:tomekness/get-skills-skill

# Or specify directly
npx github:tomekness/get-skills-skill global
npx github:tomekness/get-skills-skill local
```

#### Manually

```bash
# Global
mkdir -p ~/.config/opencode/skills/get-skills-skill
cp SKILL.md skill.js ~/.config/opencode/skills/get-skills-skill/

# Or project-local
mkdir -p .opencode/skills/get-skills-skill
cp SKILL.md skill.js .opencode/skills/get-skills-skill/
```

### Prompt examples (OpenCode):

- "Install the skill from https://github.com/anthropics/skills --skill pdf"
- "Install the skill from https://github.com/anthropics/skills --skill pdf global"
- "Install the skill from https://github.com/anthropics/skills --skill pdf local"

The skill parses natural language input, detects `--skill <name>` and optional
`global`/`local`. If the target is missing, it prompts interactively.


### Platform note

- The skill is implemented cross-platform (temp dir via `os.tmpdir()`).
- Tested so far only on Linux.


### Install (OpenCode)

- Place the folder under `~/.config/opencode/skills/get-skills-skill/`
  (or locally under `./.opencode/skills/get-skills-skill/`).
- Update the matching opencode.json (global or local) with one of these blocks:

Option: allow only the skill
{
  "permission": {
    "skill": {
      "get-skills-skill": "allow",
      "pr-review": "allow",
      "internal-*": "deny",
      "experimental-*": "ask"
    }
  }
}

Option: allow all skills (wildcard)
{
  "permission": {
    "skill": {
      "*": "allow",
      "pr-review": "allow",
      "internal-*": "deny",
      "experimental-*": "ask"
    }
  }
}

Reference: https://opencode.ai/docs/de/skills/

### Where are skills stored?

- Global (user-wide):
  - Skill folder: `~/.config/opencode/skills/<skill-name>`
  - Global config: `~/.config/opencode/opencode.json`

- Local (per project):
  - Skill folder: `./.opencode/skills/<skill-name>`
  - Project config: `./.opencode/opencode.json`

After download, the implementation moves the extracted skill into the target
folder and updates the `permission.skill` section in the matching
`opencode.json` with `"<skill-name>": "allow"`.


### Install flow (short):
- npx downloads and extracts the repo into a temporary directory (usually `<tmp>/skills-*`).
- The skill is moved from the temp folder into the chosen target.
- The matching `opencode.json` is updated with `"<skill-name>": "allow"`.

Return note: the skill returns an object with `success`, `message`, optional
`error`, and on success `skill`, `target`, `config`. OpenCode displays the result.


### Output examples

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

The implementation looks for temporary download folders under the system temp
directory (e.g., `<tmp>/skills-*/skills`) and falls back to `./skills`.

Note: for non-interactive scripts, specify the target explicitly (global/local).
