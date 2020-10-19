import * as Schema from 'zod';

import { Course } from './Course';
import { resolveCourse } from '../Helpers/ResolveDocuments';
import { Billing } from './Billing';

export const Plan = Schema.object({
    id: Schema.string(),
    name: Schema.string(), 
    courses: Schema.array(
        Schema.transformer(Schema.any(), Course, async (course) => {
            if (!Course.check(course)) {
                return resolveCourse(course);
            }

            return course;
        })
    ),
    description: Schema.string(),
    licensedNumberOfEmployees: Schema.number(),
    billing: Schema.nullable(Billing),
});

export const NewPlan = Plan.omit({ id: true });

export type Plan = Schema.infer<typeof Plan>;
export type NewPlan = Schema.infer<typeof NewPlan>;