import { Project } from "./project.js";
import { User } from "./user.js";



export class Issue {

    id: string
    type: string;
    user: User
    project: Project;
    summary: string;

    constructor(
        payload?: Partial<Issue>
    ) {
        Object.assign(this, payload);
    }

    getSummary(): string {
        return this.summary
    }

    
    getProject(): Project {
        return this.project
    }

    getUser(): User {
        return this.user
    }
    

    getId(): string {
        return this.id
    }
}