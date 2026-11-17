import assert from 'node:assert/strict'
import { execFileSync, spawnSync } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import test from 'node:test'

const script = readFileSync(new URL('./update.sh', import.meta.url), 'utf8').replaceAll('\r\n', '\n')
const helpers = script.slice(0, script.indexOf('app=/opt/postter'))
const bash = process.platform === 'win32' ? 'C:/Program Files/Git/bin/bash.exe' : 'bash'
const quote = value => `'${value.replaceAll("'", "'\\''")}'`

function fixture(run) {
  const root = mkdtempSync(path.join(tmpdir(), 'postter-deploy-test-'))
  try { run(root) } finally {
    assert.equal(path.dirname(root), path.resolve(tmpdir()))
    assert.ok(path.basename(root).startsWith('postter-deploy-test-'))
    rmSync(root, { recursive: true, force: true })
  }
}

function shell(cwd, body) {
  return spawnSync(bash, ['--noprofile', '--norc', '-s'], {
    cwd, encoding: 'utf8',
    input: `${process.platform === 'win32' ? 'python3() { python "$@"; }\n' : ''}${helpers}\n${body}\n`,
  })
}

test('deployment shell syntax is valid', () => {
  const result = spawnSync(bash, ['-n'], { input: script, encoding: 'utf8' })
  assert.equal(result.status, 0, result.stderr)
})

test('source check allows templates and rejects tracked runtime data', () => fixture(root => {
  const git = (...args) => execFileSync('git', args, { cwd: root, stdio: 'pipe' })
  git('init', '-q')
  git('config', 'user.name', 'Deployment test')
  git('config', 'user.email', 'deploy-test@example.invalid')
  writeFileSync(path.join(root, '.env.example'), 'DB_DATABASE=example\n')
  git('add', '.')
  git('commit', '-qm', 'Template only')
  assert.equal(shell(root, 'check_source HEAD').status, 0)
  for (const filename of ['.env', '.env.production', 'postter', 'uploads/file.png', 'storage/log.txt', 'frontend/dist/index.html']) {
    // Commit a tree entry directly so each protected path is checked independently.
    const blob = git('hash-object', '-w', '--stdin').toString().trim()
    git('read-tree', '--empty')
    git('update-index', '--add', '--cacheinfo', `100644,${blob},${filename}`)
    const tree = git('write-tree').toString().trim()
    const check = shell(root, `check_source ${quote(tree)}`)
    assert.notEqual(check.status, 0, filename)
    assert.match(check.stderr, /Runtime files must not be tracked/)
  }
}))

test('fast-forward from ahmad preserves the production branch and ignored runtime data', () => fixture(root => {
  const git = (...args) => execFileSync('git', args, { cwd: root, stdio: 'pipe' }).toString().trim()
  git('init', '-q', '-b', 'production')
  git('config', 'user.name', 'Deployment test')
  git('config', 'user.email', 'deploy-test@example.invalid')
  writeFileSync(path.join(root, '.gitignore'), '.env\n')
  writeFileSync(path.join(root, 'source.txt'), 'previous')
  git('add', '.')
  git('commit', '-qm', 'Initial deployment')
  git('switch', '-qc', 'ahmad')
  writeFileSync(path.join(root, 'source.txt'), 'updated')
  git('commit', '-qam', 'Release')
  const release = git('rev-parse', 'HEAD')
  git('switch', '-q', 'production')
  git('remote', 'add', 'origin', root.replaceAll('\\', '/'))
  writeFileSync(path.join(root, '.env'), 'existing-server-value')
  const advance = script.slice(script.indexOf('[[ "$#" -le 1 ]]'), script.indexOf('\nrevision="$(git rev-parse HEAD)"'))
  const result = shell(root, advance)
  assert.equal(result.status, 0, result.stderr)
  assert.equal(git('branch', '--show-current'), 'production')
  assert.equal(git('rev-parse', 'HEAD'), release)
  assert.equal(readFileSync(path.join(root, '.env'), 'utf8'), 'existing-server-value')
  writeFileSync(path.join(root, 'server-change.txt'), 'hotfix')
  git('add', 'server-change.txt')
  git('commit', '-qm', 'Server-only commit')
  const serverCommit = git('rev-parse', 'HEAD')
  const rejected = shell(root, advance)
  assert.notEqual(rejected.status, 0)
  assert.match(rejected.stderr, /Server has commits absent/)
  assert.equal(git('rev-parse', 'HEAD'), serverCommit)
}))

test('readiness requires HTTP 200 and ready JSON, rejecting redirects and errors', () => fixture(root => {
  for (const [code, body, expected] of [
    ['200', '{"status":"ready"}', 0],
    ['301', '{"status":"ready"}', 1],
    ['502', '<html>Bad Gateway</html>', 1],
    ['200', '{"status":"not_ready"}', 1],
    ['200', 'null', 1],
    ['200', '<html>SPA fallback</html>', 1],
  ]) {
    const result = shell(root, `curl() { printf '%s' ${quote(body)} > response.json; printf '%s' ${quote(code)}; }
check_ready https://example.invalid response.json`)
    assert.equal(result.status, expected, `${code} ${body}: ${result.stderr}`)
  }
}))
