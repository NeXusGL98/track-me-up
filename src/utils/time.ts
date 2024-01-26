

/* Format date returns a string representation of a date in the form of YYYY-MM-DD */
export function formatDate(date: Date): string {
    return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
}