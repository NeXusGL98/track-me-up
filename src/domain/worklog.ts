


export class Worklog {

    comment: string
    started: Date | null
    timeSpentSeconds: number 


    constructor(
        payload: Partial<Worklog>
    ) {
        this.comment = payload.comment || ''
        this.started = payload.started || null
        this.timeSpentSeconds = payload.timeSpentSeconds || 0
    }
}