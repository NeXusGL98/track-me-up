import { Issue } from "./issue.js"



export class Worklog {

    id: string | undefined
    comment: string
    started: Date | undefined
    timeSpent: string | undefined 
    issue: Issue | undefined


    constructor(
        payload: Partial<Worklog>
    ) {
        this.comment = payload.comment || ''
        this.started = payload.started || undefined
        this.timeSpent = payload.timeSpent || undefined
        this.issue = payload.issue || undefined
        this.id = payload.id || undefined
    }
}