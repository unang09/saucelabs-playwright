import type { FullConfig, FullResult, Reporter, Suite, TestCase } from '@playwright/test/reporter';

const API = 'https://api.telegram.org';
const LIMIT = 4096;
const MAX_FAILURES = 5;
const ERROR_CHARS = 220;

const STATUS: Record<FullResult['status'], string> = {
  passed: 'PASSED',
  failed: 'FAILED',
  timedout: 'TIMED OUT',
  interrupted: 'INTERRUPTED',
};

const escape = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const ANSI = new RegExp(String.fromCharCode(27) + '\\[[0-9;]*m', 'g');

const clean = (value: string) =>
  value.replace(ANSI, '').replace(/\s+/g, ' ').trim();

const elapsed = (ms: number) => {
  const seconds = Math.round(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  return minutes ? `${minutes}m ${seconds % 60}s` : `${seconds}s`;
};

const caseId = (test: TestCase) => test.titlePath().join(' ').match(/TC-[A-Z]+-\d+/)?.[0];

type CaseGroup = { first: TestCase; projects: string[] };

const byCase = (tests: TestCase[]): CaseGroup[] => {
  const groups = new Map<string, CaseGroup>();
  for (const test of tests) {
    const key = `${test.location.file}:${test.location.line}`;
    const group = groups.get(key) ?? { first: test, projects: [] };
    group.projects.push(test.parent.project()?.name ?? 'unknown');
    groups.set(key, group);
  }
  return [...groups.values()];
};

const label = ({ first, projects }: CaseGroup) => {
  const id = caseId(first);
  const title = id ? first.title.replace(`${id}:`, '').trim() : first.title;
  return `${id ? `${id} ` : ''}[${projects.join(', ')}] ${title}`;
};

class TelegramReporter implements Reporter {
  private suite!: Suite;
  private startedAt = Date.now();

  onBegin(_config: FullConfig, suite: Suite) {
    this.suite = suite;
    this.startedAt = Date.now();
  }

  async onEnd(result: FullResult) {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    if (!token || !chatId) return;

    try {
      const response = await fetch(`${API}/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: this.message(result),
          parse_mode: 'HTML',
          disable_web_page_preview: true,
        }),
      });
      if (!response.ok) {
        console.error(`Telegram notification failed: ${response.status} ${await response.text()}`);
      }
    } catch (error) {
      console.error('Telegram notification failed:', error);
    }
  }

  private message(result: FullResult) {
    const tests = this.suite.allTests();
    const by = (outcome: ReturnType<TestCase['outcome']>) =>
      tests.filter((test) => test.outcome() === outcome);

    const failed = by('unexpected');
    const flaky = by('flaky');

    const lines = [
      `<b>Swag Labs E2E — ${STATUS[result.status]}</b>`,
      escape(this.context()),
      '',
      `${by('expected').length} passed, ${failed.length} failed, ${flaky.length} flaky, ${by('skipped').length} skipped`,
      `Duration ${elapsed(Date.now() - this.startedAt)}`,
      this.projects(tests),
    ];

    if (failed.length) lines.push('', ...this.failures(failed));
    if (flaky.length) {
      lines.push('', '<b>Flaky</b>', ...byCase(flaky).map((group) => escape(label(group))));
    }

    const links = this.links();
    if (links.length) lines.push('', ...links);

    const text = lines.filter((line) => line !== undefined).join('\n');
    return text.length > LIMIT ? `${text.slice(0, LIMIT - 20)}\n[truncated]` : text;
  }

  private context() {
    const { GITHUB_REF_NAME, GITHUB_SHA, GITHUB_ACTOR, GITHUB_EVENT_NAME } = process.env;
    if (!GITHUB_REF_NAME) return 'Local run';
    const parts = [`Branch ${GITHUB_REF_NAME}`];
    if (GITHUB_SHA) parts.push(GITHUB_SHA.slice(0, 7));
    if (GITHUB_EVENT_NAME) parts.push(`${GITHUB_EVENT_NAME} by ${GITHUB_ACTOR ?? 'unknown'}`);
    return parts.join(' · ');
  }

  private projects(tests: TestCase[]) {
    const totals = new Map<string, { passed: number; total: number }>();
    for (const test of tests) {
      const name = test.parent.project()?.name ?? 'unknown';
      const entry = totals.get(name) ?? { passed: 0, total: 0 };
      entry.total += 1;
      if (test.outcome() !== 'unexpected') entry.passed += 1;
      totals.set(name, entry);
    }
    return [...totals]
      .map(([name, { passed, total }]) => `${name} ${passed}/${total}`)
      .join(' · ');
  }

  private failures(failed: TestCase[]) {
    const groups = byCase(failed);
    const lines = ['<b>Failed</b>'];
    for (const group of groups.slice(0, MAX_FAILURES)) {
      lines.push(escape(label(group)));
      const error = group.first.results.at(-1)?.error?.message;
      if (error) lines.push(`<code>${escape(clean(error).slice(0, ERROR_CHARS))}</code>`);
    }
    if (groups.length > MAX_FAILURES) {
      lines.push(`and ${groups.length - MAX_FAILURES} more`);
    }
    return lines;
  }

  private links() {
    const { REPORT_URL, GITHUB_REPOSITORY, GITHUB_RUN_ID } = process.env;
    const links: string[] = [];
    if (REPORT_URL) links.push(`<a href="${REPORT_URL}">Full report</a>`);
    if (GITHUB_REPOSITORY && GITHUB_RUN_ID) {
      links.push(`<a href="https://github.com/${GITHUB_REPOSITORY}/actions/runs/${GITHUB_RUN_ID}">CI run</a>`);
    }
    return links;
  }
}

export default TelegramReporter;
