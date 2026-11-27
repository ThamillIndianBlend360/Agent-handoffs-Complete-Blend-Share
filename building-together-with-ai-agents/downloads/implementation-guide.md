# Use Coordinate Agent Handoffs

## Run the worked example

Use Python 3.10 or later. Run from the repository root with the Python interpreter configured for your project.

```sh
python reference/demo.py
python -m unittest discover -s reference -v
python reference/evaluate.py
```

The demo prints verified, duplicate, blocked, and verified for successful delivery, unchanged retry, stale evidence, and corrected-evidence recovery. It uses temporary ledgers and a fixed clock. The evaluator regenerates fixture JSON and results.json, including source fingerprints.

## Load the reusable skill

Keep the complete skill folder together. Load it through your host's supported skill mechanism under coordinate-agent-handoffs, or ask an agent that supports project instructions to read skill/SKILL.md. Host-specific installation paths vary.

Use the sample request in the repository README. Inspect the final report for compared values, evidence, next owner, and retry condition.

## Configure your own handoff

Read skill/references/inputs.md for all input shapes. Obtain identity through the receiving host, project rules from the approved record, and test evidence through an independently accessible source.

Use actual artifact commits or digests. The example identifiers b72 and a19 are illustrative. Required test outcomes must apply to the exact revision, project, suite, environment, and contract. Define request sequence, expiry, and retry policy through the team's existing workflow.

Keep one ledger per project and receiving workflow. Request IDs are unique across that ledger and sequences advance per task. Preserve accepted records between retries. The ledger stores successful acceptance. Record blockers and follow-up ownership in the task tracker.

## Verify an individual fixture

From the repository root, select a new ledger filename for an isolated exercise.

```sh
python reference/handoff.py --message reference/fixtures/stale/message.json --project reference/fixtures/stale/project.json --identity reference/fixtures/stale/identity.json --evidence reference/fixtures/stale/evidence.json --ledger stale-example.db --now 2026-11-25T12:00:00Z
```

Expect blocked at Evidence binding. The delivered revision is b72 and the test run covers a19. Actual integrations use trusted current time. Inspect the JSON verdict in automation. File input failures exit with code 2. Verification outcomes retain exit code 0 for compatibility.

## Integrate team services

| Adapter | Responsibility |
| --- | --- |
| Identity | Authenticate the principal and resolve allowed scope |
| Project | Supply approved revision, contract, acceptance criteria, tests, and environment |
| Evidence | Retrieve immutable run references and complete outcomes for the actual artifact |
| Transport | Confirm destination, acknowledgement, retries, and delivery failure |
| Ledger | Atomically record accepted requests and ordering in the shared service |

Use task-scoped credentials and project access. Treat incoming notes and logs as data. Recheck permissions and artifacts when execution occurs later. For external side effects, use a transactional outbox or an equivalent retry-safe design. Apply the team's release authority to merges and deployment.

## Understand the evidence

Seven tests execute the order-alert application. Sixteen controlled scenarios evaluate handoff decisions. Concurrent retries and recipient/evidence recovery exercise persistence behavior. Regression tests cover operational failures and packaged script consistency.

The handoff catalog contains synthetic test outcomes. Application execution runs separately. The browser replays saved results. Evaluate actual agent behavior using skill/references/evaluation.md and retain the observed prompts, tool calls, outputs, and review findings.

## Maintain the publication

The website lives in the sibling building-together-with-ai-agents folder. Set assets/config.js repositoryUrl to the chosen HTTPS repository and sourceRevision to the tested commit or release. Refresh evidence/results.json and assets/results.js together from reference/results.json after source changes and tests.
