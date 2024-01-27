

export class Project {


    constructor(private readonly id: string, private readonly key: string, private readonly name: string,) {

    }

    static fromJira(project: any) {
        return new Project(project.id, project.key, project.name)
    }

    toString() {
        return `${this.name} (${this.key})`
    }

    getId() {
        return this.id
    }

    getName() {
        return this.name
    }

    getKey() {
        return this.key
    }
}