
import * as Schema from 'zod';

import { Image } from './Image';

export const Course = Schema.object({
    id: Schema.string(),
    description: Schema.string(),
    name: Schema.string(),
    overview: Schema.string(),
    thumbnail: Image,
});

export type Course = Schema.infer<typeof Course>;