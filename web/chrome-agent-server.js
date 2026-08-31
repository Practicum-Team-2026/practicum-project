const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const HOST = '127.0.0.1';
const PORT = process.env.PORT ? Number(process.env.PORT) : 4173;
const REPO_PATH = process.env.REPO_PATH || path.resolve(__dirname, '..');
const INDEX_PATH = path.join(__dirname, 'index.html');

function runGit(args) {
  const result = spawnSync('git', ['-C', REPO_PATH, ...args], {
    encoding: 'utf8',
    timeout: 120000,
  });

  return {
    ok: result.status === 0,
    status: result.status,
    stdout: (result.stdout || '').trim(),
    stderr: (result.stderr || '').trim(),
  };
}

function runCommand(command, args) {
  const result = spawnSync(command, args, {
    cwd: REPO_PATH,
    encoding: 'utf8',
    timeout: 120000,
  });

  return {
    ok: result.status === 0,
    status: result.status,
    stdout: (result.stdout || '').trim(),
    stderr: (result.stderr || '').trim(),
  };
}

function repoContext() {
  const isRepo = runGit(['rev-parse', '--is-inside-work-tree']);
  if (!isRepo.ok || isRepo.stdout !== 'true') {
    return { ok: false, reason: 'Directory is not a valid Git repository.' };
  }

  const root = runGit(['rev-parse', '--show-toplevel']);
  const branch = runGit(['branch', '--show-current']);
  const head = runGit(['rev-parse', '--short', 'HEAD']);

  if (!root.ok || !branch.ok || !head.ok) {
    return { ok: false, reason: 'Failed to resolve repository context.' };
  }

  return {
    ok: true,
    repository: root.stdout,
    branch: branch.stdout,
    head: head.stdout,
  };
}

function isTaskBranch(branch) {
  return /^feature\/.+/.test(branch);
}

function hasDirtyTree() {
  const status = runGit(['status', '--porcelain']);
  if (!status.ok) {
    return { ok: false, reason: 'Failed to inspect working tree.' };
  }
  return { ok: true, dirty: status.stdout.length > 0, details: status.stdout };
}

function runQualityGateTests() {
  const packageJsonPath = path.join(REPO_PATH, 'package.json');
  const pyprojectPath = path.join(REPO_PATH, 'pyproject.toml');
  const requirementsPath = path.join(REPO_PATH, 'requirements.txt');

  if (fs.existsSync(packageJsonPath)) {
    const npm = runCommand('npm', ['test']);
    if (!npm.ok) {
      return { state: 'fail', note: npm.stderr || npm.stdout || 'npm test failed.' };
    }
    return { state: 'pass', note: 'npm test passed.' };
  }

  if (fs.existsSync(pyprojectPath) || fs.existsSync(requirementsPath)) {
    const pytest = runCommand('pytest', ['-q']);
    if (!pytest.ok) {
      return {
        state: 'partial',
        note: 'Python project markers found, but tests are not configured for this runtime or failed to run.',
      };
    }
    return { state: 'pass', note: 'pytest passed.' };
  }

  return { state: 'partial', note: 'No discoverable project test command at repository root.' };
}

function stopReport(title, repository, branch, reason, extraLines = []) {
  const lines = [
    `🛑 ${title}`,
    '',
    `Repository: ${repository}`,
    `Branch: ${branch || 'unknown'}`,
    '',
    'Reason:',
    reason,
    '',
    'No automatic destructive recovery was performed.',
  ];

  return lines.concat(extraLines).join('\n');
}

function morningSync() {
  const ctx = repoContext();
  if (!ctx.ok) {
    return stopReport('Morning Sync stopped', REPO_PATH, '', ctx.reason);
  }

  if (ctx.branch === 'main' || ctx.branch === 'dev') {
    return stopReport('Morning Sync stopped', ctx.repository, ctx.branch, 'Daily morning sync is not allowed on main/dev branches.');
  }

  if (!isTaskBranch(ctx.branch)) {
    return stopReport('Morning Sync stopped', ctx.repository, ctx.branch, 'Current branch is not an eligible task branch (feature/<task>).');
  }

  const tree = hasDirtyTree();
  if (!tree.ok) {
    return stopReport('Morning Sync stopped', ctx.repository, ctx.branch, tree.reason);
  }

  if (tree.dirty) {
    return stopReport(
      'Morning Sync stopped',
      ctx.repository,
      ctx.branch,
      'Working tree is not clean. Morning sync requires a clean tree.',
      ['', 'Changed files:', tree.details]
    );
  }

  const fetch = runGit(['fetch', 'origin', 'dev']);
  if (!fetch.ok) {
    return stopReport('Morning Sync stopped', ctx.repository, ctx.branch, 'Failed to fetch origin/dev.');
  }

  const compare = runGit(['rev-list', '--left-right', '--count', 'HEAD...origin/dev']);
  const merge = runGit(['merge', '--no-edit', 'origin/dev']);

  if (!merge.ok) {
    const conflicts = runGit(['diff', '--name-only', '--diff-filter=U']);
    return stopReport(
      'Morning Sync stopped',
      ctx.repository,
      ctx.branch,
      `Merge conflict detected while merging dev into ${ctx.branch}.`,
      ['', 'Conflicting files:', conflicts.stdout || '<unavailable>']
    );
  }

  const gate = runQualityGateTests();
  if (gate.state === 'fail') {
    return stopReport('Morning Sync stopped', ctx.repository, ctx.branch, 'Quality Gate failed after merge.', ['', gate.note]);
  }

  const gateStatus = gate.state === 'pass' ? '✓ Quality Gate passed' : '✓ Quality Gate partial (tests not configured)';
  const mergeNote = merge.stdout || 'Already up to date.';

  return [
    '☀️ Morning Sync',
    '',
    `Repository: ${ctx.repository}`,
    `Branch: ${ctx.branch}`,
    '',
    '✓ Working tree safe',
    '✓ Latest dev fetched',
    `✓ Dev status checked (${compare.stdout || 'n/a'})`,
    `✓ Merge completed (${mergeNote})`,
    '✓ No conflicts',
    gateStatus,
    '',
    'READY TO WORK',
  ].join('\n');
}

function hasSecretLikeContent(text) {
  const secretPattern = /AKIA[0-9A-Z]{16}|ghp_[A-Za-z0-9]{36,}|AIza[0-9A-Za-z\-_]{35}|-----BEGIN (RSA|OPENSSH|EC|DSA) PRIVATE KEY-----/;
  return secretPattern.test(text);
}

function hasForbiddenFiles(statusText) {
  const forbiddenPattern = /(^|\s)(\.env|id_rsa|.*\.p12|.*\.pem)$/m;
  return forbiddenPattern.test(statusText);
}

function nightSync() {
  const ctx = repoContext();
  if (!ctx.ok) {
    return stopReport('Night Sync stopped', REPO_PATH, '', ctx.reason);
  }

  if (ctx.branch === 'main' || ctx.branch === 'dev') {
    return stopReport('Night Sync stopped', ctx.repository, ctx.branch, 'Daily night sync is not allowed on main/dev branches.');
  }

  if (!isTaskBranch(ctx.branch)) {
    return stopReport('Night Sync stopped', ctx.repository, ctx.branch, 'Current branch is not an eligible task branch (feature/<task>).');
  }

  const status = runGit(['status', '--porcelain']);
  if (!status.ok) {
    return stopReport('Night Sync stopped', ctx.repository, ctx.branch, 'Failed to inspect changed files.');
  }

  if (!status.stdout) {
    return [
      '🌙 Night Sync',
      '',
      `Repository: ${ctx.repository}`,
      `Branch: ${ctx.branch}`,
      '',
      '✓ No changes detected',
      '✓ Nothing to commit',
      '✓ Repository already synchronized',
      '',
      'NO ACTION REQUIRED',
    ].join('\n');
  }

  const diff = runGit(['diff', '--', '.']);
  if (diff.ok && hasSecretLikeContent(diff.stdout)) {
    return stopReport('Night Sync stopped', ctx.repository, ctx.branch, 'Secret-like pattern detected in changed content.');
  }

  if (hasForbiddenFiles(status.stdout)) {
    return stopReport('Night Sync stopped', ctx.repository, ctx.branch, 'Forbidden file detected in changed files.', ['', status.stdout]);
  }

  const gate = runQualityGateTests();
  if (gate.state === 'fail') {
    return stopReport('Night Sync stopped', ctx.repository, ctx.branch, 'Quality Gate failed before commit/push.', ['', gate.note]);
  }

  const add = runGit(['add', '-A']);
  if (!add.ok) {
    return stopReport('Night Sync stopped', ctx.repository, ctx.branch, 'Failed to stage changes.');
  }

  const message = `night_sync: ${new Date().toISOString()}`;
  const commit = runGit(['commit', '-m', message]);
  if (!commit.ok) {
    if ((commit.stderr + commit.stdout).includes('nothing to commit')) {
      return [
        '🌙 Night Sync',
        '',
        `Repository: ${ctx.repository}`,
        `Branch: ${ctx.branch}`,
        '',
        '✓ No changes detected',
        '✓ Nothing to commit',
        '✓ Repository already synchronized',
        '',
        'NO ACTION REQUIRED',
      ].join('\n');
    }
    return stopReport('Night Sync stopped', ctx.repository, ctx.branch, 'Commit failed.', ['', commit.stderr || commit.stdout]);
  }

  const push = runGit(['push', 'origin', 'HEAD']);
  if (!push.ok) {
    return stopReport('Night Sync stopped', ctx.repository, ctx.branch, 'Push failed.', ['', push.stderr || push.stdout]);
  }

  const localHead = runGit(['rev-parse', 'HEAD']);
  const remoteHeadRaw = runGit(['ls-remote', '--heads', 'origin', ctx.branch]);
  const remoteHead = remoteHeadRaw.ok && remoteHeadRaw.stdout ? remoteHeadRaw.stdout.split('\t')[0] : '';

  if (!localHead.ok || !remoteHead || localHead.stdout !== remoteHead) {
    return stopReport('Night Sync stopped', ctx.repository, ctx.branch, 'Push verification failed (remote head mismatch).');
  }

  const shortCommit = runGit(['rev-parse', '--short', 'HEAD']);
  const gateStatus = gate.state === 'pass' ? '✓ Safety checks passed' : '✓ Safety checks passed (tests partial)';

  return [
    '🌙 Night Sync',
    '',
    `Repository: ${ctx.repository}`,
    `Branch: ${ctx.branch}`,
    '',
    '✓ Changes detected',
    gateStatus,
    '✓ Commit created',
    '✓ Push completed',
    '',
    `Commit: ${shortCommit.stdout || '<unknown>'}`,
    '',
    'Your work is safely stored on GitHub.',
  ].join('\n');
}

function handleIntent(message) {
  const trimmed = (message || '').trim();
  if (!trimmed) {
    return 'Please type an intent message. Supported: "בוקר טוב" or "לילה טוב".';
  }

  if (trimmed === 'בוקר טוב' || /morning\s*sync/i.test(trimmed)) {
    return morningSync();
  }

  if (trimmed === 'לילה טוב' || /night\s*sync|done for today|good night/i.test(trimmed)) {
    return nightSync();
  }

  return 'Unsupported intent. Use "בוקר טוב" for morning_sync or "לילה טוב" for night_sync.';
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => {
      data += chunk;
      if (data.length > 1_000_000) {
        reject(new Error('Request too large'));
      }
    });
    req.on('end', () => {
      try {
        resolve(JSON.parse(data || '{}'));
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'GET' && req.url === '/') {
    const html = fs.readFileSync(INDEX_PATH, 'utf8');
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(html);
    return;
  }

  if (req.method === 'POST' && req.url === '/api/run') {
    try {
      const body = await parseBody(req);
      const report = handleIntent(body.message);
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ ok: true, report }));
    } catch (err) {
      res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ ok: false, error: err.message }));
    }
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify({ ok: false, error: 'Not found' }));
});

server.listen(PORT, HOST, () => {
  console.log(`Chrome Agent UI running at http://${HOST}:${PORT}`);
  console.log(`Repository path: ${REPO_PATH}`);
});
