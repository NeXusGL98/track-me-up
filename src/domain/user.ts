



export class User {
    constructor(private readonly id: string, private readonly name: string, private readonly email: string) {

    }

    getId() {
        return this.id
    }

    getName() {
        return this.name
    }

    getEmail() {
        return this.email
    }

    static fromJira(user: any) {

        return new User(user.accountId, user.displayName, user.emailAddress)
    }
}