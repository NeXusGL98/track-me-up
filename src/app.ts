import { CreateIssueFromDateRangeHandler, GetIssuesHandler, Handler, WorkLogToIssuesHandler } from "./actionHandler.js"
import { Commander, SelectOption } from "./command.js"
import { Interval } from "./domain/interval.js"
import { Project } from "./domain/project.js"
import { User } from "./domain/user.js"
import { JiraGateway } from "./infra/jira.js"


export enum AppCommand {
    GET_ISSUES = 'get-issues',
    CREATE_ISSUE_FROM_DATE_RANGE = 'create-issue-from-date-range',
    WORK_LOG = 'work-log'
}

export type AppHandler = Record<AppCommand, {
    class: new (...args: any[]) => Handler,
    label: string
    hint?: string
}>


const commands: AppHandler = {
    [AppCommand.GET_ISSUES]: {
        class: GetIssuesHandler,
        label: 'Get My Issues'
    }  ,
    [AppCommand.CREATE_ISSUE_FROM_DATE_RANGE]: {
        class: CreateIssueFromDateRangeHandler,
        label: 'Create Issue from Date Range'
    },
    [AppCommand.WORK_LOG]: {
        class: WorkLogToIssuesHandler,
        label: 'Work Log to issues'
    
    }
} as const


export interface AppCtx {
    user: User | null;
    selectedProject: Project | null;
}

export class App {

    private ctx: AppCtx = {
        user: null,
        selectedProject: null
    }
    constructor(
        private jiraGateway: JiraGateway,
        private commander: Commander
    ) {}


    async run() {
       

        // Show Intro
        this.commander.intro("Welcome to Trackmeup a CLI to interact with Jira")

        // Get user

        this.commander.loading().start("Getting user info")
        this.ctx.user = await this.jiraGateway.getSelfUser()
        this.commander.loading().stop(`User ${this.ctx.user.getName()} loaded`)

        // First step is to list the user's project so he can perform actions on the resources inside the project.
        // For now we will only support one project.

        const projects = await this.jiraGateway.getProjects()

        const projectOptions = projects.map(project => {
            return {
                label: project.toString(),
                value: project.getKey()
            }
        })
        

        const projectKey = await this.commander.select("Let's start by selecting a Project 🚀", projectOptions)
        // Show options based commands const.

        const project = projects.find(project => project.getKey() === projectKey)

        if (!project) {
            throw new Error("Project not found")
        }

        this.ctx.selectedProject = project

        const options = Object.entries(commands).map(([key,value]): SelectOption<AppCommand> => {
            return {
                label: value.label,
                value: key as AppCommand
            }
        })

        const result = await this.commander.select<AppCommand>("What do you want to do?", options)

        const handler = commands[result]

        const handlerInstance = new handler.class(this.jiraGateway, this.commander,new Interval(),this.ctx)

        const response = await handlerInstance.execute()

        console.log(response)
        

    }
}