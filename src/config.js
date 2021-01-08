export default {
    currency: 'GH₵',
    paystack: {
        public_key: process.env.VUE_APP_PAYSTACK_PUBLIC_KEY,
        currency: 'GHS'
    },
    auth: {
        app_domain: process.env.VUE_APP_AUTH_DOMAIN,
    },
};