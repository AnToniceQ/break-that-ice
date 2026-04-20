import { info } from "@actions/core";

export const PROMOTION_LABELS = Object.freeze({
  REVIEWING: "reviewing",
  DEV: "dev",
  TESTING: "testing",
  PREPARED: "prepared",
  DEPLOYING: "deploying",
});

const PROMOTION_LABEL_VALUES = Object.values(PROMOTION_LABELS);

function getLabelName(label) {
  if (typeof label === "string") {
    return label;
  }

  return label?.name;
}

export function createIssueHandler(octokit, owner, repo) {
  async function removePromotionLabels(issueNumber, existingLabels) {
    let labelsToInspect = existingLabels;

    if (!labelsToInspect) {
      const response = await octokit.rest.issues.listLabelsOnIssue({
        owner,
        repo,
        issue_number: issueNumber,
        per_page: 100,
      });
      labelsToInspect = response.data;
    }

    const promotionLabelsToRemove = labelsToInspect
      .map(getLabelName)
      .filter((labelName) => PROMOTION_LABEL_VALUES.includes(labelName));

    for (const promotionLabelName of promotionLabelsToRemove) {
      await octokit.rest.issues.removeLabel({
        owner,
        repo,
        issue_number: issueNumber,
        name: promotionLabelName,
      });
    }
  }

  async function setPromotionLabel(issueNumber, promotionLabel) {
    await removePromotionLabels(issueNumber);
    await octokit.rest.issues.addLabels({
      owner,
      repo,
      issue_number: issueNumber,
      labels: [promotionLabel],
    });
    info(`#${issueNumber} -> ${promotionLabel}`);
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

  async function listByPromotionLabel(promotionLabel) {
    const issues = await octokit.paginate(octokit.rest.issues.listForRepo, {
      owner,
      repo,
      state: "open",
      labels: promotionLabel,
      per_page: 100,
    });

    return issues.filter((item) => !item.pull_request);
  }

  async function relabelAll(fromPromotionLabel, toPromotionLabel) {
    const issues = await listByPromotionLabel(fromPromotionLabel);
    info(
      `Relabel ${issues.length} issues: ${fromPromotionLabel} -> ${toPromotionLabel}`,
    );

    for (const issue of issues) {
      await removePromotionLabels(issue.number, issue.labels);
      await octokit.rest.issues.addLabels({
        owner,
        repo,
        issue_number: issue.number,
        labels: [toPromotionLabel],
      });
      info(`#${issue.number} -> ${toPromotionLabel}`);
    }
  }

  async function closeAll(promotionLabel) {
    const issues = await listByPromotionLabel(promotionLabel);
    info(`Close ${issues.length} issues with label "${promotionLabel}"`);

    for (const issue of issues) {
      await removePromotionLabels(issue.number, issue.labels);
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
    setPromotionLabel,
    relabelAll,
    closeAll,
  };
}
