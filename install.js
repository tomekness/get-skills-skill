#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const os = require('os');
const readline = require('readline');

const SKILL_NAME = 'get-skills-skill';
const SKILL_FILES = ['SKILL.md', 'skill.js'];

function ask(q) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(r => rl.question(q, a => { rl.close(); r(a.trim()); }));
}

function ensureDir(d) { fs.mkdirSync(d, { recursive: true }); }

function updateConfig(configFile, skillName) {
  let conf = {};
  if (fs.existsSync(configFile)) {
    try { conf = JSON.parse(fs.readFileSync(configFile, 'utf-8')); } catch {}
  }
  if (!conf.$schema) conf.$schema = 'https://opencode.ai/config.json';
  if (!conf.permission) conf.permission = {};
  if (!conf.permission.skill) conf.permission.skill = {};
  conf.permission.skill[skillName] = 'allow';
  fs.writeFileSync(configFile, JSON.stringify(conf, null, 2) + '\n');
}

async function main() {
  let target = process.argv[2];
  if (!['global', 'local'].includes(target)) {
    const ans = await ask('Install globally or locally? [g=global / l=local]: ');
    target = ans.toLowerCase().startsWith('g') ? 'global' : 'local';
  }

  const skillDir = target === 'global'
    ? path.join(os.homedir(), '.config', 'opencode', 'skills', SKILL_NAME)
    : path.join(process.cwd(), '.opencode', 'skills', SKILL_NAME);

  const configFile = target === 'global'
    ? path.join(os.homedir(), '.config', 'opencode', 'opencode.json')
    : path.join(process.cwd(), '.opencode', 'opencode.json');

  ensureDir(skillDir);
  ensureDir(path.dirname(configFile));

  for (const file of SKILL_FILES) {
    fs.copyFileSync(path.join(__dirname, file), path.join(skillDir, file));
  }

  updateConfig(configFile, SKILL_NAME);

  console.log(`\n✓ ${SKILL_NAME} installed`);
  console.log(`  Skill:  ${skillDir}`);
  console.log(`  Config: ${configFile}`);
  console.log('\nRestart OpenCode to activate the skill.');
}

main().catch(err => { console.error('Install failed:', err.message); process.exit(1); });
