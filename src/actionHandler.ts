import { AppCtx } from "./app.js";
import { Commander, SelectOption } from "./command.js";
import { EnvSchema } from "./config/config.js";
import { Intervable, WeekDay } from "./domain/interval.js";
import { Issue } from "./domain/issue.js";
import { Worklog } from "./domain/worklog.js";
import { JiraGateway } from "./infra/jira.js";
import { formatDate } from "./utils/time.js";

export interface Handler {
    execute(): Promise<unknown>
}




export class GetIssuesHandler implements Handler {

    constructor(
        private readonly jira: JiraGateway,
        private readonly Commander: Commander,
        private readonly interval: Intervable,
        private ctx: AppCtx
    ) { }



    async execute(): Promise<Issue[]> {
        const issues = await this.jira.getAllSelfIssues()
        return issues
    }

}


export class CreateIssueFromDateRangeHandler implements Handler {

    constructor(
        private readonly jira: JiraGateway,
        private readonly Commander: Commander,
        private readonly interval: Intervable,
        private ctx: AppCtx
    ) {

    }


    async execute(): Promise<unknown> {

        if (!this.ctx.selectedProject || !this.ctx.user) {
            return;
        }

        const result = await this.Commander.group({
            "start": {
                label: "Start Date",
                type: 'text'
            },
            "end": {
                label: "End Date",
                type: 'text'
            },
            "shouldSkipWeekend": {
                label: "Do you wish to omit Weekends (Saturday, Sunday)?",
                type: 'confirm'
            }
        })


        const inter = await this.interval.generateIntervals(new Date(result.start), new Date(result.end), result.shouldSkipWeekend ? [WeekDay.Saturday, WeekDay.Sunday] : []);

        const issuesPayload = inter.map(interval => new Issue({
            summary: `${this.ctx.user?.getName()} ${formatDate(interval)} - Time report`,
            type: 'Task',
            user: this.ctx.user!,
            project: this.ctx.selectedProject!
        }))

        this.Commander.loading().start(`Creating ${issuesPayload.length} issues`)
        const totalCreated = await this.jira.createIssues(issuesPayload)
        this.Commander.loading().stop(`${totalCreated} issues created`)

        return Promise.resolve(null)


    }



}

export class WorkLogToIssuesHandler implements Handler {

    constructor(
        private readonly jira: JiraGateway,
        private readonly Commander: Commander,
        private readonly interval: Intervable,
        private ctx: AppCtx
    ) {

    }


    async execute(): Promise<unknown> {

        if (!this.ctx.selectedProject || !this.ctx.user) {
            return;
        }

        const issues = await this.jira.getAllSelfIssues()

        const result= await this.Commander.multiSelect("Select issues to log work", issues.map((issue):SelectOption<string> => {
            return {
                label: issue.getSummary(),
                value: issue.getId()
            }
        }))

        const first = issues.find(issue => issue.getId() === result[0])

        if(!first) {
            return;
        }

        const aDayInSeconds = 86400

        const workLog = new Worklog({
            comment: "Test",
            timeSpentSeconds: aDayInSeconds, // 1 day in seconds,
            started: new Date('2024-01-29T08:00:00.000+0000')
        })

        const t = await this.jira.addWorklog(first.getId(), workLog)

        
    }
}