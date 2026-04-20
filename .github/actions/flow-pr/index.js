import { getInput, setFailed, info } from "@actions/core";
import { getOctokit, context } from "@actions/github";
import { createIssueHandler, PROMOTION_LABELS } from "./issue-handler";

const PROTECTED_BRANCHES = Object.freeze({
  MAIN: "main",
  DEV: "dev",
  TEST: "test",
});
const ISSUE_BRANCH = /^(\d+)-[a-z0-9._-]+$/;

async function run() {
  try {
    const token = getInput("github-token", { required: true });
    const octokit = getOctokit(token);

    const pr = context.payload.pull_request;
    if (!pr) {
      setFailed("This action only supports pull_request events.");
      return;
    }

    const head = pr.head.ref;
    const base = pr.base.ref;
    const action = context.payload.action;
    const merged = !!pr.merged;
    const { owner, repo } = context.repo;

    info(`PR flow found: ${head} -> ${base} (${action})`);

    const issues = createIssueHandler(octokit, owner, repo);

    // ISSUE -> DEV
    if (head !== PROTECTED_BRANCHES.TEST && base === PROTECTED_BRANCHES.DEV) {
      const match = head.match(ISSUE_BRANCH);
      if (!match) {
        setFailed(
          'Invalid PR flow. Into "dev" you may only merge issue branches "{id}-{name}" or backport from "test".',
        );
        return;
      }

      const issueNumber = Number(match[1]);
      const issue = await issues.get(issueNumber);

      if (!issue) {
        setFailed(`Issue #${issueNumber} does not exist.`);
        return;
      }

      if (action !== "closed") {
        await issues.setPromotionLabel(issueNumber, PROMOTION_LABELS.REVIEWING);
      } else if (merged) {
        await issues.setPromotionLabel(issueNumber, PROMOTION_LABELS.DEV);
      } else info("Issue PR was closed without merge.");

      return;
    }

    // DEV -> TEST
    if (head === PROTECTED_BRANCHES.DEV && base === PROTECTED_BRANCHES.TEST) {
      if (action !== "closed") {
        await issues.relabelAll(PROMOTION_LABELS.DEV, PROMOTION_LABELS.TESTING);
      } else if (merged) {
        await issues.relabelAll(
          PROMOTION_LABELS.TESTING,
          PROMOTION_LABELS.PREPARED,
        );
      } else info("Promotion PR dev -> test was closed without merge.");

      return;
    }

    // TEST -> MAIN
    if (head === PROTECTED_BRANCHES.TEST && base === PROTECTED_BRANCHES.MAIN) {
      if (action !== "closed") {
        await issues.relabelAll(
          PROMOTION_LABELS.PREPARED,
          PROMOTION_LABELS.DEPLOYING,
        );
      } else if (merged) {
        await issues.closeAll(PROMOTION_LABELS.DEPLOYING);
      } else info("Promotion PR test -> main was closed without merge.");

      return;
    }

    // Allowed backport flows with no label changes: MAIN -> TEST, TEST -> DEV
    if (
      (head === PROTECTED_BRANCHES.MAIN && base === PROTECTED_BRANCHES.TEST) ||
      (head === PROTECTED_BRANCHES.TEST && base === PROTECTED_BRANCHES.DEV)
    ) {
      info(`Backport PR ${head} -> ${base}: no label changes.`);
      return;
    }

    setFailed(
      `Invalid PR flow: ${head} -> ${base}. Allowed flows are "{id}-{name} -> dev", "dev -> test", "test -> main". Exceptional allowed backport flows are "main -> test" and "test -> dev".`,
    );
  } catch (error) {
    setFailed(error.message);
  }
}

run();
