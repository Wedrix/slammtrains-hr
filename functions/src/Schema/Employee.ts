import * as Schema from 'zod';

import { Course } from './Course';
import { resolveCourse } from '../Helpers/ResolveDocuments';
import { Timestamp } from './Firebase';

export const Employee = Schema.object({
    name: Schema.string(),
    email: Schema.string(),
    uid: Schema.string(),
    enrolledCourses: Schema.array(
        Schema.transformer(Schema.any(), Course, async (course) => {
            if (!Course.check(course)) {
                return resolveCourse(course);
            }

            return course;
        })
    ),
    createdAt: Timestamp,
});

export type Employee = Schema.infer<typeof Employee>;