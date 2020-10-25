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
                    <v-tab>Payments</v-tab>
                </v-tabs>
        </v-toolbar>
        <v-sheet color="transparent">
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
                                <template v-else-if="company.plan">
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
                                            <strong>{{ company.plan.courses.length }}</strong> licensed courses
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
                                            v-for="course in company.plan.courses" 
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
                                            v-for="course in plan.courses" 
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
        </v-sheet>
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
    </v-sheet>
</template>

<script>
    import firebase from '@/firebase';
    import 'firebase/firestore';
    import 'firebase/functions';

    import { mapState, mapGetters } from 'vuex';

    export default {
        name: 'Billing',
        data() {
            return {
                tab: 0,
                plans: [],
                isLoadingPlan: false,

                changedPlan: null,
                isShowingCancelSubscriptionWarningDialog: false,
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

                if (this.company.plan?.id) {
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
            }
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
                    const changedPlan = { ...this.changedPlan };

                    const unwatch = this.$watch('company.plan', async (plan) => {
                        if (plan.id === changedPlan.id) {
                            await this.activatePlan();

                            unwatch();
                        }
                    });
                }

                try {
                    const setPlanForCompany = firebase.functions()
                                                    .httpsCallable('setPlanForCompany');

                    await setPlanForCompany({ planId: this.changedPlan.id });
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
                if (this.company.plan.billing) {

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
            }
        },
        mounted() {
            this.initPaystackJS();
        },
        firestore: {
            plans: firebase.firestore().collection('plans'),
        },
    };
</script>