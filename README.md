get-skills-skill
================

An OpenCode skill that installs other OpenCode skills from any GitHub repo — directly from within OpenCode, without leaving the terminal session or the web interface.

**When to use this:** For skills that only contain a `SKILL.md` and have no own `npx` installer. If a skill already has `npx github:<user>/<repo>`, use that directly instead. This skill is the universal fallback for anything else.

---

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

---

## Usage (inside OpenCode)

Once installed, just describe what you want:

```
Install the skill from https://github.com/user/some-skill
Install the skill from https://github.com/user/repo --skill pdf globally
Add the skill from https://github.com/user/repo locally
```

The skill parses the prompt, detects `--skill <name>` and `global`/`local`. If the target is missing it asks interactively.

---

## How it works

1. Downloads the repo via `npx skills add <url>`
2. Locates the extracted skill folder in the temp directory
3. Moves it into the target (`~/.config/opencode/skills/` or `.opencode/skills/`)
4. Updates the matching `opencode.json` with `"<skill-name>": "allow"`

### Where skills are stored

| Target | Skill folder | Config |
|--------|-------------|--------|
| Global | `~/.config/opencode/skills/<name>` | `~/.config/opencode/opencode.json` |
| Local  | `.opencode/skills/<name>` | `.opencode/opencode.json` |

---

## Platform note

Cross-platform (uses `os.tmpdir()`). Tested on Linux only so far.
