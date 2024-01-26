import * as p from '@clack/prompts'
import { Commander, GroupOption, Primitive, SelectOption } from '../command.js';

import pc from 'picocolors'


export class ChalkImpl implements Commander {


    private spinner: {
        start: (message: string) => void;
        stop: (message: string) => void;
    } | null
    constructor() {
        this.spinner = null
    }

    intro(message: string) {
        p.intro(message)
    }

    async select<T extends Primitive>(message: string, options: SelectOption<T>[]): Promise<T> {
        const result = await p.select({ message, options, })
        return result as T
    }

    loading() {
        if (!this.spinner)
            this.spinner = p.spinner()

        return this.spinner
    }

   
    async group<T extends GroupOption>(data: T){

        const dataObject = Object.entries(data).reduce((acc, [key, value]) => {

            const { label, type, validate } = value

            if (type === 'text') {
                acc[key] = () => p.text({message: label,validate})
            } else if (type === 'confirm') {
                acc[key] = () => p.confirm({
                    message: label,
                })
            }

            return acc

        }, {} as Record<string, any>)


        return p.group(dataObject) as Promise<{ [K in keyof T]: T[K]['type'] extends 'text' ? string : boolean }>
    }

    async multiSelect<T extends Primitive>(message: string, options: SelectOption<T>[]): Promise<T[]> {
        const result = await p.multiselect({ message, options, })
        return result as T[]
    }



}