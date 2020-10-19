import * as Schema from 'zod';

export const Image = Schema.object({
    filename: Schema.string(),
    fullPath: Schema.string(),
    src: Schema.string(),
});

export type Image = Schema.infer<typeof Image>;