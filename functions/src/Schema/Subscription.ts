import * as Schema from 'zod';

import * as Paystack from './Paystack';

export const Subscription = Schema.object({
    endsAt: Schema.number(),
    expiryNotificationSentAt: Schema.number().nullable(),
    transaction: Paystack.Transaction,
});

export type Subscription = Schema.infer<typeof Subscription>;