const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

async function promptGlobalLocal() {
  // Fallback prompt if no target was provided. For non-interactive calls,
  // pass installTarget explicitly.
  return await new Promise((resolve) => {
    process.stdout.write(
      '\nInstall target not detected!\nInstall globally (~/.config/opencode/skills) or locally (.opencode/skills)? [g=global / l=local]: '
    );
    process.stdin.setEncoding('utf8');
    process.stdin.once('data', (input) => {
      if (input && input.trim().toLowerCase().startsWith('g')) resolve('global');
      else resolve('local');
    });
  });
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function tryReadJson(file) {
  if (!fs.existsSync(file)) return null;
  try { return JSON.parse(fs.readFileSync(file, 'utf-8')); }
  catch { return null; }
}

function writeJson(file, obj) { fs.writeFileSync(file, JSON.stringify(obj, null, 2) + '\n'); }

function addPermissionToConfig(configFile, skillName) {
  let conf = tryReadJson(configFile);
  if (!conf) conf = { "$schema": "https://opencode.ai/config.json", permission: { skill: {} } };
  if (!conf.permission) conf.permission = {};
  if (!conf.permission.skill) conf.permission.skill = {};
  conf.permission.skill[skillName] = 'allow';
  writeJson(configFile, conf);
}

function skillDirNameFromUrl(url, subSkill) {
  // Extrahiere den End-Repo-Namen, ggf. mit Subskill
  let repo = url.split('/').pop().replace(/\.git$/, '');
  return subSkill ? `${repo}-${subSkill}` : repo;
}

async function install({ repoUrl, subSkill, installTarget }) {
  // Step 1: npx skills add ...
  let npxCmd = `npx -y skills add ${repoUrl}`;
  if (subSkill) npxCmd += ` --skill ${subSkill}`;
  // Non-interactive hint if supported by skills CLI
  npxCmd += ' --yes';
  try {
    execSync(npxCmd, { stdio: 'inherit' });
  } catch (err) {
    return {
      success: false,
      message: 'npx install failed',
      error: err.message
    };
  }

  // Step 2: Resolve temporary skills directory.
  // npx/skills often creates <tmp>/skills-*/skills, but may also use .agents/skills.
  const possibleTemp = [];

  // Local skills folders that the skills CLI may use
  const localAgentsSkills = path.join(process.cwd(), '.agents', 'skills');
  const localOpenCodeSkills = path.join(process.cwd(), '.opencode', 'skills');
  if (fs.existsSync(localAgentsSkills)) possibleTemp.push(localAgentsSkills);
  if (fs.existsSync(localOpenCodeSkills)) possibleTemp.push(localOpenCodeSkills);
  try {
    const tmpRoot = os.tmpdir();
    const tmpDirs = fs.readdirSync(tmpRoot, { withFileTypes: true })
      .filter(d => d.isDirectory() && d.name.startsWith('skills-'))
      .map(d => ({ name: d.name, mtime: fs.statSync(path.join(tmpRoot, d.name)).mtimeMs }));
    if (tmpDirs.length) {
      tmpDirs.sort((a, b) => b.mtime - a.mtime);
      possibleTemp.push(path.join(tmpRoot, tmpDirs[0].name, 'skills'));
    }
  } catch (e) {
    // ignore
  }

  // Fallback: ./skills in current working directory
  possibleTemp.push(path.resolve('skills'));

  let tempSkillsDir = null;
  for (const p of possibleTemp) {
    if (fs.existsSync(p)) { tempSkillsDir = p; break; }
  }
  if (!tempSkillsDir) {
    return {
      success: false,
      message: 'Temp skills directory not found after npx install'
    };
  }

  let skillFolder = null;
  let skillName = skillDirNameFromUrl(repoUrl, subSkill);
  const subdirs = fs.readdirSync(tempSkillsDir, { withFileTypes: true }).filter(e => e.isDirectory());
  skillFolder = subdirs.find(d => subSkill ? d.name.includes(subSkill) : d.name.includes(skillName));
  skillFolder = skillFolder ? skillFolder.name : subdirs.length === 1 ? subdirs[0].name : null;
  if (!skillFolder) {
    return {
      success: false,
      message: 'Could not locate installed skill in temp directory'
    };
  }

  // Step 3: Determine target
  let target, configF;
  if (!installTarget) installTarget = await promptGlobalLocal();
  if (installTarget === 'global') {
    target = path.join(os.homedir(), '.config', 'opencode', 'skills');
    configF = path.join(os.homedir(), '.config', 'opencode', 'opencode.json');
  } else {
    target = path.join(process.cwd(), '.opencode', 'skills');
    configF = path.join(process.cwd(), '.opencode', 'opencode.json');
  }
  ensureDir(target);
  ensureDir(path.dirname(configF));

  // Step 4: Move skill (overwrite if exists)
  const dest = path.join(target, skillFolder);
  try {
    if (fs.existsSync(dest)) fs.rmSync(dest, { recursive: true, force: true });
    fs.renameSync(path.join(tempSkillsDir, skillFolder), dest);
  } catch (err) {
    return {
      success: false,
      message: 'Failed to move skill folder',
      error: err.message
    };
  }

  // Step 5: Update config
  try { addPermissionToConfig(configF, skillFolder); }
  catch (err) {
    return {
      success: false,
      message: 'Config update failed',
      error: err.message
    };
  }

  // Step 6: Return result
  return {
    success: true,
    message: 'Skill installed and registered',
    skill: skillFolder,
    target,
    config: configF
  };
}

// Minimal entry, usually via require().
module.exports = { install };

// Example for manual test:
// install({ repoUrl:'https://github.com/anthropics/skills', subSkill:'pdf' });

// OpenCode adapter: simple run(entry) function.
// Expects an object with at least one of: repoUrl, subSkill, installTarget
// Alternatively accepts `text` containing a URL.
async function run(entry = {}) {
  try {
    let repoUrl = entry.repoUrl || null;
    let subSkill = entry.subSkill || null;
    let installTarget = entry.installTarget || null;

    if (!repoUrl && entry.text) {
      // simple URL detection in free text
      const m = entry.text.match(/https?:\/\/[^\s]+/);
      if (m) repoUrl = m[0];
    }

    if (!subSkill && entry.text) {
      const m = entry.text.match(/--skill\s+([^\s]+)/i);
      if (m) subSkill = m[1];
    }

    if (!installTarget && entry.text) {
      if (/\bglobal\b/i.test(entry.text)) installTarget = 'global';
      else if (/\blocal\b/i.test(entry.text) || /\blokal\b/i.test(entry.text)) installTarget = 'local';
    }

    if (!repoUrl) {
      return {
        success: false,
        message: 'No repoUrl provided'
      };
    }

    const res = await install({ repoUrl, subSkill, installTarget });
    return res;
  } catch (err) {
    return {
      success: false,
      message: 'Unexpected error',
      error: err.message
    };
  }
}

module.exports.run = run;
