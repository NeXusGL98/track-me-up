import { Project } from "./project.js";
import { User } from "./user.js";

export class Issue {
  readonly id: string;
  readonly user: User;
  readonly project: Project;
  type: string;
  summary: string;
  created: Date | undefined;

  constructor(payload?: Partial<Issue>) {
    Object.assign(this, payload);
  }

  static fromJira(issue: any): Issue {
    return new Issue({
      id: issue.id,
      summary: issue.fields.summary,
      user: User.fromJira(issue.fields.assignee),
      project: Project.fromJira(issue.fields.project),
      created: new Date(issue.fields.created),
    });
  }

  getSummary(): string {
    return this.summary;
  }

  getProject(): Project {
    return this.project;
  }

  getUser(): User {
    return this.user;
  }

  getId(): string {
    return this.id;
  }
}
