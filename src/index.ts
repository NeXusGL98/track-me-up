#!/usr/bin/env node

import { SelectOption } from './command.js'
import envSchema from './config/config.js'
import  { ChalkImpl } from './infra/chalkImpl.js'
import { JiraStandardGateway } from './infra/jiraStandardGateway.js'
import { App } from './app.js'



async function main() {

    const env = envSchema

    if (env.NODE_ENV === 'development') {
        console.log('Executing in development mode');
    }

    const jiraGateway = new JiraStandardGateway(env);

    const app = new App(jiraGateway, new ChalkImpl())

    app.run()





}

main()