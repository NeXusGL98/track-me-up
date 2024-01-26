
/* 
    Command represents a command that can be executed by the user.
    It is the base interface to implement for all commands.
*/

import { intro } from "@clack/prompts";


export type Primitive = Readonly<string | boolean | number>;

export interface SelectOption<T extends Primitive> {
    label: string;
    value: T;
    hint?: string;
}


export type GroupOption = Record<string, {
    label: string;
    type: 'text' | 'confirm',
    hint?: string;
    validate?: (value: string) => string | void
}>

export interface Commander {
    
    intro: (message: string) => void;
    select: <T extends Primitive>(message: string, options: SelectOption<T>[]) => Promise<T>;
    multiSelect: <T extends Primitive>(message: string, options: SelectOption<T>[]) => Promise<T[]>;
    loading: () => {
        start: (message: string) => void;
        stop: (message: string) => void;
    };
    group: <T extends GroupOption>(data: T) => Promise<
        {
            [K in keyof T]: T[K]['type'] extends 'text' ? string : boolean
        }
    >;
}