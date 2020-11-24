<template>
    <v-sheet color="transparent" class="mx-lg-6">
        <v-toolbar
            dark
            rounded
            color="background"
            class="textured-background">
                <v-toolbar-title class="text-h5">
                    Billing
                </v-toolbar-title>
        </v-toolbar>
        <v-toolbar 
            light
            flat
            rounded
            outlined
            height="60">  
                <v-tabs v-model="tab">
                    <v-tab>Plans</v-tab>
                    <v-tab>Transactions</v-tab>
                </v-tabs>
        </v-toolbar>
        <template v-if="tab === 0">
            <v-row>
                <v-col cols="12" md="3">
                    <v-card 
                        light
                        outlined
                        elevation="2"
                        class="pa-4 mb-6"
                        color="white">
                            <template v-if="isLoadingPlan">
                                <div class="d-flex" style="justify-content:center;align-items:center;min-height:120px;">
                                    <v-progress-circular
                                        :size="50"
                                        color="primary"
                                        indeterminate/>
                                </div>
                            </template>
                            <template v-else>
                                <template v-if="planNotSet">
                                    <div class="d-flex" style="justify-content:center;align-items:center;min-height:120px;">
                                        <div class="primary--text">Kindly select a plan or request an enterprise solution.</div>
                                    </div>
                                </template>
                                <template v-else>
                                    <div class="text-h6">
                                        {{ company.plan.name }} 
                                        <span class="text-caption">(current plan)</span>
                                    </div>
                                    
                                    <div class="text-caption py-2">
                                        <div>
                                            <span>
                                                <strong>{{ company.plan.licensedNumberOfEmployees }}</strong> Employee Licenses,
                                            </span>
                                            <span>
                                                <strong>{{ employeeLicencesRemaining }}</strong> remaining
                                            </span>
                                        </div>
                                        <div>
                                            <strong>{{ Array.purify(company.plan.courses).length }}</strong> licensed courses
                                        </div>
                                    </div>

                                    <div v-if="unsubscribed" class="py-3">
                                        <v-btn color="accent" rounded block @click="activatePlan()">
                                            {{ unsubscribed ? 'Subscribe' : ((subscriptionHasExpired || subscriptionShouldBeRenewed) ? 'Renew Subscription' : '') }}
                                        </v-btn>
                                    </div>

                                    <v-divider class="my-2"/>

                                    <div class="pb-2">
                                        <div 
                                            v-for="course in Array.purify(company.plan.courses)" 
                                            :key="course.id" 
                                            class="text-body-2 py-1">
                                                <v-icon small color="green">mdi-check</v-icon>
                                                {{ course.name }}
                                        </div>
                                    </div>
                                </template>
                            </template>
                    </v-card>
                    <v-card 
                        light
                        outlined
                        elevation="1"
                        color="white">
                            <v-card-title>Custom / Enterprise Solution</v-card-title>
                            <v-card-subtitle>Custom-tailored solution for your business</v-card-subtitle>
                            <v-card-text>
                                <div class="text-body-2 pb-6">
                                    Tell us about your particular business needs and we will devise a custom-plan just for you. 
                                </div>
                                <v-btn color="secondary" rounded block>Contact Us</v-btn>
                            </v-card-text>
                    </v-card>
                </v-col>
                <v-col cols="12" md="9">
                    <v-card 
                        light
                        outlined
                        elevation="1"
                        color="white">
                            <v-row>
                                <v-col cols="12" md="4" v-for="plan in otherPlans" :key="plan.id">
                                    <v-card-title>{{ plan.name }}</v-card-title>
                                    <v-card-subtitle>{{ plan.description }}</v-card-subtitle>
                                    <v-card-text class="primary--text">
                                        <div class="pb-3">
                                            <div v-if="plan.billing">
                                                <span class="text-h4">{{ plan.billing.currency }} {{ plan.billing.price }}</span>
                                                <span class="text--secondary"> / {{ plan.billing.interval }}</span>
                                            </div>
                                            <div v-else>
                                                <span class="text-h4">FREE</span>
                                            </div>
                                        </div>
                                        <v-btn rounded width="150" color="secondary" @click="setChangedPlan(plan)">Select Plan</v-btn>
                                    </v-card-text>
                                    <v-divider/>
                                    <v-card-text>
                                        <div 
                                            v-for="course in Array.purify(plan.courses)" 
                                            :key="course.id" 
                                            class="text-body-2 py-2">
                                                <v-icon small color="green">mdi-check</v-icon>
                                                {{ course.name }}
                                        </div>
                                    </v-card-text>
                                </v-col>
                            </v-row>
                    </v-card>
                </v-col>
            </v-row>
            <v-dialog
                v-model="isShowingCancelSubscriptionWarningDialog"
                max-width="600px"
                persistent>
                    <v-card>
                        <v-card-title class="headline">WARNING!</v-card-title>

                        <v-card-text>
                            Changing your plan cancels any active subscription. This means, in case you change your
                            mind and decide to revert to your current plan, you will have to pay the price in full.
                        </v-card-text>

                        <v-card-actions>
                            <v-spacer/>

                            <v-btn 
                                text
                                @click="unsetChangedPlan()">
                                    Cancel
                            </v-btn>

                            <v-btn
                                color="primary"
                                @click="changePlan()">
                                    Proceed
                            </v-btn>
                        </v-card-actions>
                    </v-card>
            </v-dialog>
        </template>
        <template v-if="tab === 1">
            <v-row>
                <v-col cols="12">
                    <v-data-table
                        :headers="transactionsHeaders"
                        :items="transactions"
                        :loading="isLoadingTransactions"
                        :server-items-length="transactionsTotalCount"
                        :options.sync="pagination"
                        class="elevation-1"
                        disable-sort>
                            <template v-slot:[`item.amount`]="{ item }">
                                <span class="font-weight-bold">
                                    {{ item.currency }}
                                    {{ item.amount / 100 }}
                                </span>
                            </template>
                            <template v-slot:[`item.status`]="{ item }">
                                <span 
                                    class="font-weight-medium" 
                                    :class="{ 
                                            'green--text text--darken-2': item.status === 'success',
                                            'purple--text text--darken-2': item.status === 'abandoned',
                                            'red--text text--darken-2': item.status === 'failed',
                                        }">
                                        {{ item.status }}
                                </span>
                            </template>
                            <template v-slot:[`item.channel`]="{ item }">
                                {{ item.channel | inLowerCase }}
                            </template>
                            <template v-slot:[`item.createdAt`]="{ item }">
                                {{ formatDate(item.createdAt, 'verbose') }}
                            </template>
                    </v-data-table>
                </v-col>
            </v-row>
        </template>
    </v-sheet>
</template>

<script>
    import firebase from '@/firebase';
    import 'firebase/firestore';
    import 'firebase/functions';

    import moment from 'moment';
    import Case from 'case';

    import { mapState, mapGetters } from 'vuex';

    import { cloneDeep } from 'lodash';

    export default {
        name: 'Billing',
        data() {
            return {
                tab: 0,
                plans: [],
                isLoadingPlan: false,
                changedPlan: null,
                isShowingCancelSubscriptionWarningDialog: false,

                transactionsHeaders: [
                    {
                        text: 'ID',
                        value: 'id',
                    },
                    {
                        text: 'Reference',
                        value: 'reference',
                    },
                    {
                        text: 'Amount',
                        value: 'amount',
                    },
                    { 
                        text: 'Status', 
                        value: 'status',
                    },
                    { 
                        text: 'Channel', 
                        value: 'channel',
                    },
                    {
                        text: 'Created At',
                        value: 'createdAt',
                    },
                ],
                transactions: [],
                pagination: {
                    page: 1,
                    itemsPerPage: 10,
                },
                transactionsTotalCount: 0,

                isLoadingTransactions: false,
            };
        },
        computed: {
            ...mapState([
                'company',
            ]),
            ...mapGetters([
                'hr',
                'employeeLicencesRemaining',
                'unsubscribed',
                'subscriptionHasExpired',
                'subscriptionShouldBeRenewed',
                'planNotSet'
            ]),
            otherPlans() {
                const otherPlans = this.plans;

                if (this.company.plan) {
                    return this.plans.filter(plan => {
                        return (plan.id !== this.company.plan.id);
                    });
                }

                return otherPlans;
            }
        },
        watch: {
            'company.subscription': {
                handler() {
                    if (!this.unsubscribed && !this.subscriptionHasExpired && !this.subscriptionShouldBeRenewed) {
                        this.isLoadingPlan = false;
                    }
                }
            },
            pagination: {
                immediate: true,
                deep: true,
                async handler() {
                    await this.loadTransactions();
                }
            },
        },
        methods: {
            initPaystackJS() {
                this.paystackLoader = setInterval(() => {
                    if (!window.Paystack) {
                        let paystackScript = document.getElementById('paystackjs-script');

                        if (!paystackScript) {
                            paystackScript = document.createElement('script');
                            paystackScript.setAttribute('src','https://js.paystack.co/v1/inline.js'); //https://js.paystack.co/v2/paystack.js
                            paystackScript.setAttribute('id','paystackjs-script');
                            document.head.appendChild(paystackScript);
                        }

                        return;
                    }

                    window.clearInterval(this.paystackLoader);
                }, 500);
            },
            async changePlan() {
                this.isShowingCancelSubscriptionWarningDialog = false;

                this.isLoadingPlan = true;

                if (this.changedPlan.billing) {
                    const changedPlan = cloneDeep(this.changedPlan);

                    const unwatch = this.$watch('company.plan', async (plan) => {
                        if (plan.id === changedPlan.id) {
                            await this.activatePlan();

                            unwatch();
                        }
                    });
                }

                try {
                    const setCompanyPlan = firebase.functions()
                                                    .httpsCallable('setCompanyPlan');

                    await setCompanyPlan({ planId: this.changedPlan.id });
                } catch (error) {
                    const notification = {
                        message: error.message,
                        context: 'error',
                    };

                    this.$store.commit('push_notification', { notification });
                }

                this.isLoadingPlan = false;

                this.unsetChangedPlan();
            },
            async activatePlan() {
                if (this.company.plan?.billing) {

                    const billing = this.company.plan.billing;

                    const paystackPop = PaystackPop.setup({
                        key: this.$$config.paystack.public_key,
                        email: this.company.emailId,
                        label: this.company.name,
                        amount: billing.price * 100,
                        currency: billing.currency,
                        metadata: {
                            planId: this.company.plan.id
                        },
                        callback: (response) => {
                            if (this.unsubscribed || this.subscriptionHasExpired || this.subscriptionShouldBeRenewed) {
                                this.isLoadingPlan = true;
                            }
                        },
                        onClose: () => {
                            //
                        }
                    });
                    
                    paystackPop.openIframe();
                }
            },
            setChangedPlan(plan) {
                this.changedPlan = plan;
                this.isShowingCancelSubscriptionWarningDialog = true;
            },
            unsetChangedPlan() {
                this.changedPlanId = null;
                this.isShowingCancelSubscriptionWarningDialog = false;
            },
            async loadTransactions() {
                this.isLoadingTransactions = true;

                try {
                    const fetchCompanyTransactions = firebase.functions()
                                                            .httpsCallable('fetchCompanyTransactions');

                    const transactionsPaginationData = {
                        perPage: this.pagination.itemsPerPage,
                        page: this.pagination.page,
                    };

                    const transactionsData = (await fetchCompanyTransactions({ transactionsPaginationData })).data;

                    this.transactions = transactionsData.data;
                    this.transactionsTotalCount = transactionsData.meta.total;
                } catch (error) {
                    const notification = {
                        message: error.message,
                        context: 'error',
                    };

                    this.$store.commit('push_notification', { notification });
                }

                this.isLoadingTransactions = false;
            },
            formatDate(timestamp, format) {
                if (format === 'verbose') {
                    return moment(timestamp).format("MMMM Do, YYYY h:mm A");
                }
            },
        },
        mounted() {
            this.initPaystackJS();
        },
        firestore: {
            plans: firebase.firestore().collection('plans'),
        },
        filters: {
            inLowerCase(string) {
                return Case.lower(string);
            }
        }
    };
</script>

<style scoped>
    .table-top {
        border-bottom: thin solid rgba(0, 0, 0, 0.12);
    }
    .table-bottom {
        border-top: thin solid rgba(0, 0, 0, 0.12);
    }
</style>