import { EnvSchema } from "../config/config.js";
import { Issue } from "../domain/issue.js";
import { Project } from "../domain/project.js";
import { User } from "../domain/user.js";
import { Worklog } from "../domain/worklog.js";
import { JiraGateway } from "./jira.js";
import JiraApi from 'jira-client';

export class JiraStandardGateway implements JiraGateway {

    private jira: JiraApi
    constructor(
        env: EnvSchema
    ) {
        this.jira = new JiraApi({
            protocol: 'https',
            host: env.JIRA_ORG_HOST,
            username: env.JIRA_USERNAME,
            password: env.JIRA_TOKEN,
            apiVersion: '2',
            strictSSL: true
        });
    }

    async getProjects(): Promise<Project[]> {

        this.jira.addWorklog('', {})
        const projects = await this.jira.listProjects()
        return projects.map((project) => {
            return new Project(project.id, project.key, project.name)
        })

    }

    async getSelfUser() {
        const user = await this.jira.getCurrentUser()


        return User.fromJira(user)

    }

    async getAllSelfIssues() {
        const data = await this.jira.searchJira(`assignee = currentUser()`)
        return data.issues.map((issue: any) => {
            return new Issue({
                id: issue.id,
                summary: issue.fields.summary,
                assigneeId: issue.fields.assignee.key,
                projectId: issue.fields.project.key,
            })

        })
    }

    async createIssues(issues: Partial<Issue>[]): Promise<number> {


        const allS = issues.map((issue) => {
            return this.jira.addNewIssue({
                fields: {
                    project: {
                        key: issue.project?.getKey()
                    },
                    summary: issue.summary,
                    issuetype: {
                        name: 'Task'
                    },
                    assignee: {
                        id: issue.user?.getId()
                    }
                }
            })

        })
        

        const res = (await Promise.allSettled(allS))

        const success = res.filter((r) => r.status === 'fulfilled').length

        const error = res.filter((r) => r.status === 'rejected')

        for (const e of error) {
            console.error(e)
        }

        return success
    }

    async addWorklog(issueId: string, worklog: Worklog): Promise<void> {

        //format date to this pattern 021-01-17T12:34:00.000+0000

        // todo make hour 8:00 am utc from local time.

        const date = worklog.started || new Date()
        const formattedDate = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}T${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}.000+0000`

        // todo: delete previous worklogs to ensure that we are not duplicating worklogs
        

        await this.jira.addWorklog(issueId, {
            comment: worklog.comment,
            started: formattedDate,
            timeSpent: '#1d'
        }).then((r) => {
            console.log(r)
        }).catch((e) => {
            console.error(e)
        })
    }


}