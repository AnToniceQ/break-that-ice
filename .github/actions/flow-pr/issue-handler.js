import { info } from "@actions/core";

export const LABELS = Object.freeze({
  REVIEWING: "reviewing",
  DEV: "dev",
  TESTING: "testing",
  PREPARED: "prepared",
  DEPLOYING: "deploying",
});

export function createIssueHandler(octokit, owner, repo) {
  async function removeLabels(issueNumber) {
    for (const label of Object.values(LABELS)) {
      try {
        await octokit.rest.issues.removeLabel({
          owner,
          repo,
          issue_number: issueNumber,
          name: label,
        });
      } catch (error) {
        if (error.status !== 404) {
          throw error;
        }
      }
    }
  }

  async function setLabel(issueNumber, label) {
    await removeLabels(issueNumber);
    await octokit.rest.issues.addLabels({
      owner,
      repo,
      issue_number: issueNumber,
      labels: [label],
    });
    info(`#${issueNumber} -> ${label}`);
  }

  async function get(issueNumber) {
    try {
      const response = await octokit.rest.issues.get({
        owner,
        repo,
        issue_number: issueNumber,
      });
      return response.data;
    } catch (error) {
      if (error.status === 404) {
        return null;
      }
      throw error;
    }
  }

  async function listByLabel(label) {
    const issues = await octokit.paginate(octokit.rest.issues.listForRepo, {
      owner,
      repo,
      state: "open",
      labels: label,
      per_page: 100,
    });

    return issues.filter((item) => !item.pull_request);
  }

  async function relabelAll(fromLabel, toLabel) {
    const issues = await listByLabel(fromLabel);
    info(`Relabel ${issues.length} issues: ${fromLabel} -> ${toLabel}`);

    for (const issue of issues) {
      await setLabel(issue.number, toLabel);
    }
  }

  async function closeAll(label) {
    const issues = await listByLabel(label);
    info(`Close ${issues.length} issues with label "${label}"`);

    for (const issue of issues) {
      await removeLabels(issue.number);
      await octokit.rest.issues.update({
        owner,
        repo,
        issue_number: issue.number,
        state: "closed",
      });
      info(`#${issue.number} closed`);
    }
  }

  return {
    get,
    setLabel,
    relabelAll,
    closeAll,
  };
}
