import z from 'zod';

export interface EnvSchema {
    JIRA_TOKEN: string;
    JIRA_ORG_HOST: string;
    JIRA_USERNAME: string;
    NODE_ENV: 'development' | 'production' | 'test';
}

const envSchema = z.object({
    JIRA_TOKEN: z.string(),
    JIRA_ORG_HOST: z.string().trim(),
    JIRA_USERNAME: z.string().trim(),
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

 const envClientSchema = envSchema.safeParse
({
    JIRA_TOKEN: process.env.JIRA_TOKEN,
    JIRA_ORG_HOST: process.env.JIRA_ORG_HOST,
    JIRA_USERNAME: process.env.JIRA_USERNAME,
    NODE_ENV: process.env.NODE_ENV,

});

if(!envClientSchema.success) {
    console.log(envClientSchema.error.issues)
    throw new Error('Environment variables are not set correctly')
    process.exit(1)
}

export default  envClientSchema.data
