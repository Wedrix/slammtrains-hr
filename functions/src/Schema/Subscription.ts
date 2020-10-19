import * as Schema from 'zod';

import * as Paystack from './Paystack';

export const Subscription = Schema.object({
    endsAt: Schema.number(),
    transaction: Paystack.Transaction,
    notified: Schema.boolean(),
});

export type Subscription = Schema.infer<typeof Subscription>;