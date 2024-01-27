import { Issue } from "../domain/issue.js";
import { Project } from "../domain/project.js";
import { User } from "../domain/user.js";
import { Worklog } from "../domain/worklog.js";


export interface JiraGateway {

    getProjects(): Promise<Project[]>
    getSelfUser(): Promise<User>
    getAllSelfIssues(): Promise<Issue[]>
    getTodoIssues(): Promise<Issue[]>
    createIssues(issue: Partial<Issue>[]): Promise<number>
    addWorklog(issueId: string, worklog: Worklog): Promise<Worklog>
    getIssueWorklogs(issueId: string): Promise<Worklog[]>

}