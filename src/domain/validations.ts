import z from 'zod';

// Todo: add more validations since passing a 1 to the date schema will pass
export const dateSchema = z.coerce.date();

export type DateSchema = z.infer<typeof dateSchema>;

export const validRange = z.object({
    start: z.date(),
    end: z.date(),
    skipWeekends: z.boolean().default(true),
})