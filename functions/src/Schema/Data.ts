import * as Schema from 'zod';

import { Billing } from './Billing';
import { Image } from './Image';
import { Address } from './Address';

export const EmployeeData = Schema.object({
    name: Schema.string(),
    email: Schema.string(),
});

export const PlanData = Schema.object({
    name: Schema.string(),
    courses: Schema.array(Schema.string()),
    description: Schema.string(),
    licensedNumberOfEmployees: Schema.number(),
    billing: Schema.nullable(Billing)
});

export const CompanyData = Schema.object({
    logo: Image,
    plan: Schema.string(),
    name: Schema.string(),
    email: Schema.string(),
    phoneNumber: Schema.string(),
    numberOfEmployees: Schema.string(),
    industry: Schema.nullable(Schema.string()),
    address: Address,
    postalAddress: Schema.nullable(Schema.string())
});

export const HRData = Schema.object({
    email: Schema.string(),
    password: Schema.string(),
    displayName: Schema.string(),
});

export type EmployeeData = Schema.infer<typeof EmployeeData>;
export type PlanData = Schema.infer<typeof PlanData>;
export type CompanyData = Schema.infer<typeof CompanyData>;
export type HRData = Schema.infer<typeof HRData>;