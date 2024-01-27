import { AppCtx } from "./app.js";
import { Commander, SelectOption } from "./command.js";
import { Intervable, WeekDay } from "./domain/interval.js";
import { Issue } from "./domain/issue.js";
import { Worklog } from "./domain/worklog.js";
import { JiraGateway } from "./infra/jira.js";
import { formatDate } from "./utils/time.js";

export interface Handler {
  execute(): Promise<unknown>;
}

export class GetIssuesHandler implements Handler {
  constructor(
    private readonly jira: JiraGateway,
    private readonly Commander: Commander,
    private readonly interval: Intervable,
    private ctx: AppCtx
  ) {}

  async execute(): Promise<Issue[]> {
    const issues = await this.jira.getAllSelfIssues();
    return issues;
  }
}

export class CreateIssueFromDateRangeHandler implements Handler {
  constructor(
    private readonly jira: JiraGateway,
    private readonly Commander: Commander,
    private readonly interval: Intervable,
    private ctx: AppCtx
  ) {}

  async execute(): Promise<unknown> {
    if (!this.ctx.selectedProject || !this.ctx.user) {
      return;
    }

    const result = await this.Commander.group({
      start: {
        label: "Start Date",
        type: "text",
      },
      end: {
        label: "End Date",
        type: "text",
      },
      shouldSkipWeekend: {
        label: "Do you wish to omit Weekends (Saturday, Sunday)?",
        type: "confirm",
      },
    });

    const inter = await this.interval.generateIntervals(
      new Date(result.start),
      new Date(result.end),
      result.shouldSkipWeekend ? [WeekDay.Saturday, WeekDay.Sunday] : []
    );

    const issuesPayload = inter.map(
      (interval) =>
        new Issue({
          summary: `${this.ctx.user?.getName()} ${formatDate(
            interval
          )} - Time report`,
          type: "Task",
          user: this.ctx.user!,
          project: this.ctx.selectedProject!,
        })
    );

    this.Commander.loading().start(`Creating ${issuesPayload.length} issues`);
    const totalCreated = await this.jira.createIssues(issuesPayload);
    this.Commander.loading().stop(`${totalCreated} issues created`);

    return Promise.resolve(null);
  }
}

export class WorkLogToIssuesHandler implements Handler {
  constructor(
    private readonly jira: JiraGateway,
    private readonly Commander: Commander,
    private readonly interval: Intervable,
    private ctx: AppCtx
  ) {}

  async execute(): Promise<unknown> {
    if (!this.ctx.selectedProject || !this.ctx.user) {
      return;
    }

    const issues = await this.jira.getTodoIssues();

    const issueHash = issues.reduce((acc, issue) => {
      acc[issue.getId()] = issue;
      return acc;
    }, {} as Record<string, Issue>);

    const result = await this.Commander.multiSelect(
      "Select issues to log work",
      issues.map((issue): SelectOption<string> => {
        return {
          label: issue.getSummary(),
          value: issue.getId(),
        };
      })
    );

    // filter all issues that are selected and that holds some started date
    const selectedIssues: Issue[] = [];
    for (const issueId of result) {
      const issueAtId = issueHash[issueId];
      if (issueAtId && issueAtId.created) {
        selectedIssues.push(issueAtId);
      }
    }

    const worklogs = selectedIssues.map((issue) => {
      const workLog = new Worklog({
        comment: "Time report",
        issue: issue,
        started: issue.created,
        timeSpent: "1d",
      });

      workLog.started!.setHours(8, 0, 0, 0);
      return workLog;
    });

    this.Commander.loading().start(
      `Adding worklogs to ${worklogs.length} issues`
    );

    const promises = worklogs.map((worklog) => {
      return this.jira.addWorklog(worklog.issue?.id!, worklog);
    });

    const r = await Promise.allSettled(promises);

    const success = r.filter((r) => r.status === "fulfilled");

    this.Commander.loading().stop(`${success.length} worklogs added`);



  }
}
