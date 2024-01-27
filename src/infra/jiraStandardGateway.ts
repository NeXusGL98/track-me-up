import { EnvSchema } from "../config/config.js";
import { Issue } from "../domain/issue.js";
import { Project } from "../domain/project.js";
import { User } from "../domain/user.js";
import { Worklog } from "../domain/worklog.js";
import { JiraGateway } from "./jira.js";
import JiraApi from "jira-client";

export class JiraStandardGateway implements JiraGateway {
  private jira: JiraApi;
  constructor(env: EnvSchema) {
    this.jira = new JiraApi({
      protocol: "https",
      host: env.JIRA_ORG_HOST,
      username: env.JIRA_USERNAME,
      password: env.JIRA_TOKEN,
      apiVersion: "2",
      strictSSL: true,
    });
  }

  async getProjects(): Promise<Project[]> {
    this.jira.addWorklog("", {});
    const projects = await this.jira.listProjects();
    return projects.map((project) => {
      return new Project(project.id, project.key, project.name);
    });
  }

  async getSelfUser() {
    const user = await this.jira.getCurrentUser().catch((e) => {
      console.error(e);
    });

    return User.fromJira(user);
  }

  async getAllSelfIssues(filters?: { status?: string }) {
    const defaultFilter = ["assignee = currentUser()"];

    if (filters?.status) {
      defaultFilter.push(`status = "${filters.status}"`);
    }

    const allFilters = defaultFilter.join(" AND ");

    const data = await this.jira.searchJira(allFilters);
    return data.issues.map((issue: any) => {
      return Issue.fromJira(issue);
    });
  }

  getTodoIssues(): Promise<Issue[]> {
    return this.getAllSelfIssues({ status: "To Do" });
  }

  async createIssues(issues: Partial<Issue>[]): Promise<number> {
    const allS = issues.map((issue) => {
      return this.jira.addNewIssue({
        fields: {
          project: {
            key: issue.project?.getKey(),
          },
          summary: issue.summary,
          issuetype: {
            name: "Task",
          },
          assignee: {
            id: issue.user?.getId(),
          },
        },
      });
    });

    const res = await Promise.allSettled(allS);

    const success = res.filter((r) => r.status === "fulfilled").length;

    const error = res.filter((r) => r.status === "rejected");

    for (const e of error) {
      console.error(e);
    }

    return success;
  }

  getIssueWorklogs(issueId: string): Promise<Worklog[]> {
    return this.jira.getIssueWorklogs(issueId).then((r) => {
      return r.worklogs.map((worklog: any) => {
        return new Worklog({
          id: worklog.id,
          comment: worklog.comment,
          started: new Date(worklog.created),
          timeSpent: worklog.timeSpent,
          issue: new Issue({
            id: worklog.issueId,
          }),
        });
      });
    });
  }

  async addWorklog(issueId: string, worklog: Worklog): Promise<Worklog> {
    // get all existing worklogs for this issue and delete them
    const workLogs = await this.getIssueWorklogs(issueId);

    if (workLogs.length > 0) {
      const allS = workLogs.map((worklog) => {
        return this.jira.deleteWorklog(issueId, worklog.id!);
      });

      const result = await Promise.allSettled(allS);
    }

    const date = worklog.started!;
    const formattedDate = `${date.getFullYear()}-${
      date.getMonth() + 1
    }-${date.getDate()}T${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}.000+0000`;

    return this.jira
      .addWorklog(issueId, {
        comment: worklog.comment,
        started: formattedDate,
        timeSpent: worklog.timeSpent,
      })
      .then((r) => {
        return new Worklog({
          id: r.id,
          comment: r.comment,
          started: new Date(r.created),
          timeSpent: r.timeSpent,
          issue: new Issue({
            id: r.issueId,
          }),
        });
      })
      .catch((e) => {
        console.error(e);
        throw e;
      });
  }
}
