import * as Schema from 'zod';

import { Image } from './Image';
import { Address } from './Address';
import { Plan } from './Plan';

import { resolvePlan } from '../Helpers/ResolveDocuments';
import { Subscription } from './Subscription';

export const HR = Schema.object({
    email: Schema.string(),
    name: Schema.string(),
    uid: Schema.string(),
});

export const Company = Schema.object({
    id: Schema.string(),
    address: Address,
    hr: HR,
    email: Schema.string(),
    emailId: Schema.string(),
    employeesTotalCount: Schema.number(),
    industry: Schema.string().nullable(),
    logo: Image,
    name: Schema.string(),
    numberOfEmployees: Schema.string(),
    phoneNumber: Schema.string(),
    postalAddress: Schema.string().nullable(),
    plan: Schema.transformer(Schema.any(), Plan, async (plan) => {
        if (!Plan.check(plan)) {
            return resolvePlan(plan);
        }

        return plan;
    }),
    subscription: Schema.nullable(Subscription),
});

export type HR = Schema.infer<typeof HR>;
export type Company = Schema.infer<typeof Company>;