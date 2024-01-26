

export enum WeekDay {
    Sunday,
    Monday,
    Tuesday,
    Wednesday,
    Thursday,
    Friday,
    Saturday,
}

export const WeekDayOptions = {
    [WeekDay.Sunday]: 'Sunday',
    [WeekDay.Monday]: 'Monday',
    [WeekDay.Tuesday]: 'Tuesday',
    [WeekDay.Wednesday]: 'Wednesday',
    [WeekDay.Thursday]: 'Thursday',
    [WeekDay.Friday]: 'Friday',
    [WeekDay.Saturday]: 'Saturday',
}

function assert(condition: any, msg?: string): asserts condition {
    if (!condition) {
        throw new Error(msg);
    }
}

const A_MINUTE_IN_MILLISECONDS = 60000

export interface Intervable {
    generateIntervals(
        from: Date,
        to: Date,
        skippedDays?: WeekDay[]
    ): Date[]
}

function toLocale(date: Date): Date {
    return new Date(date.getTime() + date.getTimezoneOffset() * A_MINUTE_IN_MILLISECONDS)
}

export class Interval implements Intervable {
   
    constructor() {

      
    }

    generateIntervals(
        from: Date,
        to: Date,
        skippedDays: WeekDay[] = []
    ): Date[] {
        const intervals: Date[] = []


        // create a new date object to user's local timezone, this to avoid utc colliding with local time

        const currentDate = toLocale(from)
        const endDate = toLocale(to)

        while (currentDate <= endDate) {

            const dayOfWeek = currentDate.getDay() as WeekDay

            const shouldSkyp = skippedDays.includes(dayOfWeek)

            if (!shouldSkyp) {
                const newDate = toLocale(currentDate)
                intervals.push(newDate);
            }

            currentDate.setDate(currentDate.getDate() + 1)

        }
        return intervals
    }

}

