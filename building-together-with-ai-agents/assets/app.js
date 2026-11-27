'use strict';

const data = window.PUBLICATION_DATA;
const config = window.SITE_CONFIG || {};
const agent = window.AGENT_RESULTS;
const pages = [
  ['start', 'What the skill does'],
  ['example', 'Follow an example'],
  ['lab', 'Explore scenarios'],
  ['testing', 'How I tested it'],
  ['skill', 'Use it in your project'],
  ['sources', 'Integration guidance']
];
const state = { selected: 'valid', revealed: 1, showAll: false, story: 'valid' };
let focusCase = null;
const labels = {
  verified: 'Verified',
  blocked: 'Blocked',
  changes_required: 'Changes required',
  duplicate: 'Already recorded'
};
const titles = {
  valid: 'Successful handoff',
  stale: 'Tests cover an older version',
  breaking: 'The response contract changed'
};
const nextActions = {
  valid: ['Frontend owner', 'Continue the configured integration work with verified revision b72.'],
  stale: ['Backend owner', 'Provide required test results for b72. Use a new request ID when the evidence reference changes.'],
  breaking: ['Backend and frontend owners', 'Agree the response format, update affected code, and run the required checks.'],
  failed: ['Backend and frontend owners', 'Inspect the failing consumer check, correct the issue, and provide updated evidence.'],
  missing: ['Evidence owner', 'Make the referenced run available to the receiver, then retry the unchanged request.'],
  unavailable: ['Receiving owner', 'Retry the unchanged request when the recipient becomes available.'],
  duplicate: ['Receiving owner', 'Use the recorded decision. Keep its completed side effects deduplicated.'],
  'id-collision': ['Sender', 'Assign a new request ID to the changed payload.'],
  'out-of-order': ['Task owner', 'Review the newer accepted handoff and submit a new request only when more work is needed.'],
  expired: ['Sender', 'Confirm current requirements and create a new request with a policy-approved expiry.'],
  unauthorized: ['Project owner', 'Resolve the requested action against the project permission policy.'],
  spoofed: ['Receiving service owner', 'Resolve the sender through the authenticated session.'],
  'cross-project': ['Project owner', 'Resolve the intended project and its authorized sender scope.'],
  acceptance: ['Sender', 'Include every receiver-approved acceptance condition in a new request.'],
  environment: ['Evidence owner', 'Provide results from the required environment.'],
  injection: ['Receiving owner', 'Use the verified result for the scoped handoff. Apply the project release process to subsequent actions.']
};

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[character]));
}

function heading(label, title, text) {
  return '<div class="eyebrow">' + escapeHtml(label) + '</div><h1>' + title +
    '</h1><p class="intro">' + text + '</p>';
}

function badge(verdict) {
  return '<span class="verdict ' + escapeHtml(verdict) + '">' +
    escapeHtml(labels[verdict] || verdict) + '</span>';
}

function code(value) {
  const content = typeof value === 'string' ? value : JSON.stringify(value, null, 2);
  return '<div class="code-wrap"><button class="copy" type="button">Copy</button><pre><code>' +
    escapeHtml(content) + '</code></pre></div>';
}

function table(headers, rows) {
  return '<div class="table-wrap"><table><thead><tr>' +
    headers.map(header => '<th scope="col">' + escapeHtml(header) + '</th>').join('') +
    '</tr></thead><tbody>' + rows.map(row => '<tr>' +
      row.map(cell => '<td>' + cell + '</td>').join('') + '</tr>').join('') +
    '</tbody></table></div>';
}

function repositoryUrl() {
  try {
    const url = new URL(config.repositoryUrl);
    return url.protocol === 'https:' ? url.href : '';
  } catch {
    return '';
  }
}

function repositoryLink() {
  const url = repositoryUrl();
  if (!url) return '<p class="small">Repository link pending publication.</p>';
  return '<a class="btn" href="' + escapeHtml(url) +
    '" target="_blank" rel="noopener">View the repository</a>';
}

function scenario(id) {
  return data.cases.find(item => item.id === id);
}

function comparison(item) {
  const run = item.evidence[item.message.evidence_id] || {};
  const text = value => escapeHtml(value === undefined ? 'Unavailable' : value);
  return table(['Check', 'Required', 'Observed'], [
    ['Code version covered by tests', text(item.message.revision), text(run.revision)],
    ['Response contract', 'alerts-schema-2', text(item.message.contract)],
    ['Test suite', 'order-alerts-acceptance', text(run.suite)],
    ['Test environment', 'isolated-test', text(run.environment)]
  ]);
}

function report(item) {
  const action = nextActions[item.id] || ['Receiving owner', 'Resolve the recorded blocker and recheck applicable requirements.'];
  const failed = item.result.checks.find(check => check.status === 'fail');
  const reason = failed ? failed.name + ' needs attention.' : 'The recorded checks completed for this request.';
  return '<section class="report"><div class="row"><h2>Verification report</h2>' +
    badge(item.observed) + '</div><p>' + escapeHtml(reason) + '</p>' +
    '<dl><dt>Delivered version</dt><dd>' + escapeHtml(item.message.revision) +
    '</dd><dt>Evidence reference</dt><dd>' + escapeHtml(item.message.evidence_id) +
    '</dd><dt>Next owner</dt><dd>' + escapeHtml(action[0]) +
    '</dd><dt>Next action</dt><dd>' + escapeHtml(action[1]) +
    '</dd></dl><p class="small">Owner assignments here illustrate the example workflow. The checker returns the decision and check trace.</p></section>';
}

function start() {
  return '<section class="hero"><div><div class="eyebrow">Coordinate agent handoffs</div>' +
    '<h1>Help your AI agent verify work handed over by another agent</h1>' +
    '<p>When a backend agent finishes a feature, the frontend agent needs the code version, the agreed response format, and test results that apply to that version.</p>' +
    '<p>This reusable skill guides agents through preparing that handoff, checking it, and recording what happens next.</p>' +
    '<div class="actions"><a class="btn primary" href="#example">Follow the example</a><a class="btn" href="#skill">Use the skill</a></div></div>' +
    '<div class="hero-map"><h2>What your agent produces</h2><p>A structured request and a verification report with evidence, blockers, and a next owner.</p>' +
    '<div class="map-context">Prepare the handoff</div><div class="map-line"></div>' +
    '<div class="map-context">Check the delivered work</div><div class="map-line"></div>' +
    '<div class="map-context">Record the decision and next action</div></div></section>' +
    '<section class="section"><h2>Bring it into your own project</h2><p>The skill contains agent instructions, reusable templates, and a Python checker. The order-alert project below gives you a complete example to run and inspect.</p>' +
    table(['Component', 'What it does'], [
      ['Agent following the skill', 'Reads requirements, prepares the handoff, gathers applicable evidence, and explains the outcome.'],
      ['Python checker', 'Compares supplied inputs against explicit verification rules and records accepted requests.'],
      ["Your team's tools", 'Supply authenticated identities, repository revisions, test runs, and delivery channels.'],
      ['Receiving owner', 'Resolves blockers and coordinates dependent work.']
    ]) + '</section><section class="section"><h2>When to use it</h2><div class="grid cols3">' +
    '<article class="card"><h3>Deliver completed work</h3><p>Give the receiving agent the revision, interface, acceptance criteria, and evidence it needs.</p></article>' +
    '<article class="card"><h3>Verify a dependency</h3><p>Check whether the delivered work satisfies the receiving project\'s requirements.</p></article>' +
    '<article class="card"><h3>Recover or recheck</h3><p>Resolve a blocker or verify work again after code, requirements, or interfaces change.</p></article>' +
    '</div></section>';
}

function example() {
  let item = scenario(state.story);
  if (state.story === 'recovery') {
    const recovery = data.evidence_recovery;
    item = { id: 'valid', message: recovery.message, evidence: recovery.evidence,
      observed: recovery.after_recovery.verdict, result: recovery.after_recovery };
  }
  const descriptions = {
    valid: 'The backend delivers b72. Run run-419 covers b72 and records passing outcomes for both required checks.',
    stale: 'The backend delivers b72, but the available test run covers a19. The receiver blocks verification.',
    recovery: 'The backend provides run-420 for b72 and submits handoff-143. The receiver checks the corrected evidence and verifies the request.'
  };
  return heading('Worked example', 'One late order. One alert.', 'The data pipeline can deliver the same event more than once. The backend must create one alert, and the frontend must be able to display it.') +
    '<div class="grid cols3"><article class="card"><h2>Data event</h2>' + code({ order_id: 'ORD-142', late: true }) +
    '</article><article class="card"><h2>Backend response</h2>' + code({ order_id: 'ORD-142', status: 'late' }) +
    '</article><article class="card"><h2>Frontend output</h2><p class="example-output">Order ORD-142 is late</p></article></div>' +
    '<section class="section"><h2>Follow the handoff</h2><div class="tabs" role="group" aria-label="Example stage">' +
    [['valid', 'Successful handoff'], ['stale', 'Older test evidence'], ['recovery', 'Corrected evidence']].map(([id, title]) =>
      '<button type="button" data-story="' + id + '" aria-pressed="' + (state.story === id) +
      '" class="' + (state.story === id ? 'selected' : '') + '">' + title + '</button>').join('') +
    '</div><p class="small">Recorded Python execution using controlled evidence snapshots.</p><p>' +
    descriptions[state.story] + '</p>' + comparison(item) + report(item) +
    '<details><summary>Inspect the request</summary>' + code(item.message) +
    '</details><details><summary>Inspect the receiver evidence</summary>' + code(item.evidence) +
    '</details><a class="btn dark" href="#lab">Explore the verification checks</a></section>';
}

function lab() {
  const item = scenario(state.selected);
  const checks = item.result.checks;
  const revealed = Math.min(state.revealed, checks.length);
  const choices = state.showAll ? data.cases : data.cases.filter(entry => ['valid', 'stale', 'breaking'].includes(entry.id));
  return heading('Recorded scenarios', 'See why a handoff passes or stops.', 'Start with the successful example. Then compare older test evidence or a changed response contract. Each trace comes from the Python evaluation suite.') +
    '<div class="tabs" role="group" aria-label="Scenario scope"><button type="button" id="toggle-scenarios">' +
    (state.showAll ? 'Show introductory scenarios' : 'Explore all ' + data.cases.length + ' scenarios') + '</button></div>' +
    '<div class="lab-layout"><div class="scenario-list" role="group" aria-label="Select scenario">' +
    choices.map(entry => '<button type="button" data-case="' + escapeHtml(entry.id) +
      '" aria-pressed="' + (entry.id === item.id) + '" class="' +
      (entry.id === item.id ? 'selected' : '') + '">' + escapeHtml(titles[entry.id] || entry.title) + '</button>').join('') +
    '</div><section class="card"><p class="small">Recorded example</p><h2>' +
    escapeHtml(titles[item.id] || item.title) + '</h2><p>' + escapeHtml(item.description) + '</p>' +
    comparison(item) + '<div class="actions"><button class="btn" id="restart">Restart</button>' +
    '<button class="btn dark" id="next-check"' + (revealed === checks.length ? ' disabled' : '') +
    '>Next check</button><button class="btn" id="show-checks">Show all checks</button></div>' +
    '<p class="small" role="status">' + revealed + ' of ' + checks.length + ' recorded checks shown</p>' +
    '<ol class="trace">' + checks.slice(0, revealed).map(check => '<li><span class="check ' +
      check.status + '" aria-hidden="true">' + (check.status === 'pass' ? '&#10003;' : '&#10007;') +
      '</span><div><strong>' + escapeHtml(check.name) + '</strong><small>' +
      escapeHtml(check.status === 'pass' ? 'Passed. ' : 'Stopped. ') + escapeHtml(check.detail) + '</small></div></li>').join('') +
    '</ol>' + (revealed === checks.length ? report(item) : '<p>Continue to reveal the recorded decision and next action.</p>') +
    (item.id === 'injection' ? '<p class="note">This case checks how Python handles a note field. Agent prompt-injection behavior needs evaluation in the actual agent environment.</p>' : '') +
    '<details><summary>Request and evidence JSON</summary>' + code(item.message) + code(item.evidence) +
    '</details><details><summary>Reproduce the recorded suite</summary><p>' + escapeHtml(item.setup) +
    '</p>' + code('python reference/evaluate.py') +
    '<p>The evaluator creates isolated ledgers and uses the fixture clock. It runs every scenario.</p></details></section></div>';
}

function agentSection() {
  if (!agent) return '';
  const passed = agent.exercises.filter(item => item.passed).length;
  return '<section class="section"><h2>Did an agent follow the skill?</h2>' +
    '<p>' + passed + ' of ' + agent.exercises.length + ' exercises met their criteria. Each ran once in a fresh agent context, so this shows the skill can be followed, not how reliably.</p>' +
    '<p>' + escapeHtml(agent.method) + '</p>' +
    table(['Exercise', 'Expected', 'Agent decision', 'Result'], agent.exercises.map(item => [
      escapeHtml(item.title), escapeHtml(item.expected),
      item.verdict ? badge(item.verdict) : escapeHtml(item.observed),
      item.passed ? 'Met criteria' : 'Missed criteria'
    ])) +
    '<h3>What this does not show</h3><ul>' + agent.limitations.map(text => '<li>' + escapeHtml(text) + '</li>').join('') + '</ul>' +
    '<p class="small">Run ' + escapeHtml(agent.run_date) + '. ' + escapeHtml(agent.model) + '</p>' +
    agent.exercises.map(item => '<details><summary>' + escapeHtml(item.title) + '</summary>' +
      '<p class="small">Task given to the agent</p>' + code(item.task) +
      '<p class="small">Criteria</p><ul>' + item.criteria.map(text =>
        '<li>' + (item.passed ? '&#10003; ' : '&#10007; ') + escapeHtml(text) + '</li>').join('') + '</ul>' +
      item.notes.map(text => '<p class="note">' + escapeHtml(text) + '</p>').join('') +
      (item.artifact ? '<p class="small">Request the agent produced</p>' + code(item.artifact) : '') +
      '<p class="small">Report written by the agent</p>' + code(item.report) + '</details>').join('') +
    '<a class="btn" href="evidence/agent-exercises.json" download>Download the agent exercise evidence</a></section>';
}

function testing() {
  const regressions = data.regressions;
  return heading('Executed tests', 'What I tested, and what each result means.', 'The application tests execute the example feature. The handoff scenarios give the checker controlled evidence snapshots. Fresh agents then followed the skill on seven exercises.') +
    table(['Question', 'Evidence', 'Recorded outcome'], [
      ['Does the order-alert feature work?', 'Duplicate and concurrent events, response compatibility, invalid IDs, on-time orders, and restart persistence.',
        data.application.passed ? data.application.tests + ' tests passed' : 'Application failures recorded'],
      ['Does the checker make the expected decision?', 'Valid, stale, missing, incompatible, unauthorized, repeated, and out-of-order requests.',
        data.cases.filter(item => item.passed).length + ' / ' + data.cases.length + ' expected outcomes'],
      ['Does retry handling work?', 'Eight concurrent requests, recipient recovery, and corrected-evidence recovery.',
        data.concurrency.passed && data.recovery.passed && data.evidence_recovery.passed ? 'All checks passed' : 'Inspect recorded failures'],
      ['Do operational failures return useful results?', 'Malformed snapshots, JSON errors, ledger errors, connection cleanup, and packaged script consistency.',
        regressions.passed ? regressions.tests + ' regression tests passed' : 'Regression failures recorded'],
      ['Does an agent follow the skill?', 'Seven fresh-agent exercises: prepare, verify, stale and missing evidence, retry, corrected evidence, and an unrelated billing project.',
        agent ? agent.exercises.filter(item => item.passed).length + ' / ' + agent.exercises.length + ' met their criteria (one run each)' : 'Recorded agent benchmark pending']
    ]) + '<section class="section"><h2>Every scenario has an expected decision</h2>' +
    table(['Scenario', 'Expected', 'Observed', 'Result'], data.cases.map(item => [
      '<a href="#lab" data-open-case="' + escapeHtml(item.id) + '">' + escapeHtml(titles[item.id] || item.title) + '</a>',
      escapeHtml(labels[item.expected]), badge(item.observed), item.passed ? 'Matched' : 'Mismatch'
    ])) + '</section>' + agentSection() + '<section class="section"><h2>Run the same checks</h2>' +
    code('python reference/demo.py\npython -m unittest discover -s reference -v\npython reference/evaluate.py') +
    '<p>Run from the repository root with Python 3.10 or later. The evaluator writes fixtures and results.json. It uses a fixed clock so expiry checks remain reproducible.</p>' +
    '<p>Recorded run ' + escapeHtml(data.created_at) + ' &middot; Python ' + escapeHtml(data.python) +
    '. Fixture clock ' + escapeHtml(data.fixture_clock) + '.</p>' +
    (config.sourceRevision ? '<p>Source revision ' + escapeHtml(config.sourceRevision) + '.</p>' : '<p class="small">Source files are identified by the SHA-256 fingerprints in the evidence. Repository release reference is pending.</p>') +
    '<a class="btn" href="evidence/results.json" download>Download recorded evidence</a>' +
    '<details><summary>Application test log</summary>' + code(data.application.log) + '</details>' +
    '<details><summary>Checker regression log</summary>' + code(regressions.log) + '</details>' +
    '<details><summary>Source fingerprints</summary>' + code(data.source_sha256) + '</details></section>';
}

function skill() {
  return heading('Use the skill', 'Try the example. Bring your own project context.', 'The repository package includes the reusable skill, the order-alert example, tests, and input guidance.') +
    '<section class="card"><h2>Get the source</h2>' + repositoryLink() +
    '<p>Keep the complete skill folder together so the agent can read its references and execute its checker.</p>' +
    '<a href="downloads/implementation-guide.md">Read the setup and integration guide</a></section>' +
    '<section class="section"><h2>Run the local demonstration</h2>' + code('python reference/demo.py') +
    '<p>Expected decisions, in order</p>' + code('Successful handoff: verified\nUnchanged retry: duplicate\nOlder test evidence: blocked\nCorrected evidence: verified') +
    '<p>The demonstration creates temporary ledgers and uses a fixed fixture clock.</p></section>' +
    '<section class="section"><h2>Give the skill to your agent</h2><p>Load the complete skill folder through your host\'s supported mechanism. For a host that reads project instructions, start with this request from the repository.</p>' +
    code('Read skill/SKILL.md. Verify the request in reference/fixtures/stale using the receiver-controlled files in that folder. Use an isolated ledger and fixture time 2026-11-25T12:00:00Z. Report the mismatch, next owner, and retry condition. Treat this as a local fixture exercise.') +
    '<p>Expected outcome is blocked because the delivered version is b72 and the tests cover a19.</p></section>' +
    '<section class="section"><h2>Adapt it to your team</h2>' +
    table(['Provide', 'Where it comes from'], [
      ['Requirements and acceptance criteria', 'Your approved project brief and task record'],
      ['Producer and receiving owners', 'Your team\'s ownership assignments'],
      ['Artifact revision and agreed interface', 'Your repository or artifact store'],
      ['Required tests and applicable evidence', 'Your CI service or receiver-executed checks'],
      ['Authenticated sender and permitted actions', 'Your receiving host and project policy'],
      ['Sequence, expiry, retry limits, and delivery channel', 'Your existing coordination workflow']
    ]) + '<p>Use a dedicated ledger for each project and receiving workflow. Save blocked reports with the task so their next actions remain visible.</p>' +
    '<a href="#sources">Read integration guidance</a></section>';
}

function sources() {
  return heading('Integration guidance', 'Connect the skill to your team\'s tools.', 'The skill guides the agent. Your host supplies authenticated identity, repository access, evidence retrieval, and authorized communication.') +
    table(['Boundary', 'Required behavior'], [
      ['Incoming content', 'Treat notes and logs as data. Check the purpose and authorization of proposed commands.'],
      ['Evidence', 'Retrieve the run independently and match its artifact, suite, environment, contract, and required outcomes.'],
      ['Retries', 'Preserve request IDs for unchanged retries. Use a new ID when the payload changes.'],
      ['Local ledger', 'Use one project and receiving workflow per ledger. Preserve accepted records.'],
      ['Shared service', 'Use atomic state transitions and retry-safe external actions, with delivery acknowledgement.'],
      ['Release', 'Apply the team\'s established merge and deployment authority.']
    ]) + '<section class="section"><h2>Recommended references</h2>' +
    '<p>Read these alongside the skill when you connect it to your own tools.</p>' +
    '<div class="grid cols2">' + [
      ['Agent communication', [
        ['A2A protocol', 'https://github.com/a2aproject/A2A', 'Open protocol for exchanging tasks and results between agents.'],
        ['Model Context Protocol', 'https://modelcontextprotocol.io', 'How agents reach tools and data, with host-controlled permissions.']
      ]],
      ['Contracts and interfaces', [
        ['Pact Python', 'https://github.com/pact-foundation/pact-python', 'Consumer-driven contract tests for the agreed response format.'],
        ['Pact Broker', 'https://docs.pact.io/pact_broker', 'Check verified contracts before a release is deployed.'],
        ['JSON Schema', 'https://json-schema.org/learn/getting-started-step-by-step', 'Write the response contract as a schema a checker can validate.']
      ]],
      ['Retries and delivery', [
        ['Idempotency-Key header (IETF draft)', 'https://datatracker.ietf.org/doc/draft-ietf-httpapi-idempotency-key-header/', 'Retry-safe requests so unchanged retries do not repeat side effects.'],
        ['Transactional outbox pattern', 'https://microservices.io/patterns/data/transactional-outbox.html', 'Record state and outgoing handoffs together, then deliver and acknowledge.']
      ]],
      ['Security', [
        ['OWASP Top 10 for LLM Applications', 'https://genai.owasp.org/llm-top-10/', 'Prompt injection and unsafe handling of content from other agents.'],
        ['OWASP AI agent security cheat sheet', 'https://cheatsheetseries.owasp.org/cheatsheets/AI_Agent_Security_Cheat_Sheet.html', 'Host controls and trust boundaries for agents.']
      ]]
    ].map(([group, items]) => '<article class="card"><h3>' + escapeHtml(group) + '</h3><ul>' +
      items.map(([name, url, note]) => '<li><a href="' + escapeHtml(url) + '" target="_blank" rel="noopener">' +
        escapeHtml(name) + '</a><p class="small">' + escapeHtml(note) + '</p></li>').join('') +
      '</ul></article>').join('') + '</div></section>';
}

const views = { start, example, lab, testing, skill, sources };
const aliases = { workspace: 'example', results: 'testing', security: 'sources' };

function render(focusId) {
  const requested = location.hash.slice(1) || 'start';
  const page = aliases[requested] || requested;
  const active = views[page] ? page : 'start';
  document.querySelector('nav').innerHTML = pages.map(([id, title]) =>
    '<a href="#' + id + '"' + (active === id ? ' aria-current="page" class="active"' : '') +
    '>' + title + '</a>').join('');
  document.querySelector('#main').innerHTML = views[active]();
  document.title = (pages.find(([id]) => id === active)?.[1] || 'Integration guidance') + ' | Coordinate Agent Handoffs';
  if (focusId) document.getElementById(focusId)?.focus();
}

window.addEventListener('hashchange', () => {
  render();
  if (focusCase) {
    const selectedButton = document.querySelector('[data-case="' + focusCase + '"]');
    focusCase = null;
    selectedButton?.focus({ preventScroll: true });
    document.querySelector('.lab-layout > .card')?.scrollIntoView({ block: 'start' });
    return;
  }
  document.querySelector('#main').focus();
  window.scrollTo(0, 0);
});

document.addEventListener('click', async event => {
  const target = event.target.closest('button,a');
  if (!target) return;
  if (target.classList.contains('skip')) {
    event.preventDefault();
    document.querySelector('#main').focus();
    return;
  }
  if (target.dataset.story) {
    state.story = target.dataset.story;
    render();
    document.querySelector('[data-story="' + state.story + '"]').focus();
  }
  if (target.dataset.case || target.dataset.openCase) {
    state.selected = target.dataset.case || target.dataset.openCase;
    state.revealed = 1;
    if (target.dataset.openCase) {
      state.showAll = true;
      focusCase = location.hash === '#lab' ? null : target.dataset.openCase;
    }
    if (!target.dataset.openCase || location.hash === '#lab') {
      render();
      document.querySelector('[data-case="' + state.selected + '"]')?.focus();
    }
  }
  if (target.id === 'toggle-scenarios') {
    state.showAll = !state.showAll;
    if (!state.showAll && !['valid', 'stale', 'breaking'].includes(state.selected)) state.selected = 'valid';
    render('toggle-scenarios');
  }
  if (target.id === 'restart') {
    state.revealed = 1;
    render('restart');
  }
  if (target.id === 'next-check') {
    state.revealed += 1;
    render(state.revealed >= scenario(state.selected).result.checks.length ? 'show-checks' : 'next-check');
  }
  if (target.id === 'show-checks') {
    state.revealed = scenario(state.selected).result.checks.length;
    render('show-checks');
  }
  if (target.classList.contains('copy')) {
    const content = target.parentElement.querySelector('code').textContent;
    try {
      await navigator.clipboard.writeText(content);
      target.textContent = 'Copied';
    } catch {
      target.textContent = 'Select and copy the text below';
    }
  }
});

render();
