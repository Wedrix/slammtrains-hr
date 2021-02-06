<template>
    <div>
        <v-row>
            <v-col 
                cols="12" 
                md="3">
                    <v-card 
                        outlined
                        elevation="2"
                        color="white"
                        class="pa-4 mb-6">
                            <template v-if="isLoadingPlan">
                                <div class="d-flex" style="justify-content:center;align-items:center;min-height:120px;">
                                    <v-progress-circular
                                        :size="50"
                                        color="secondary"
                                        indeterminate/>
                                </div>
                            </template>
                            <template v-else>
                                <template v-if="planNotSet">
                                    <div class="d-flex" style="justify-content:center;align-items:center;min-height:120px;">
                                        <div class="primary--text">Kindly select a plan or contact us for an enterprise solution.</div>
                                    </div>
                                </template>
                                <template v-else>
                                    <v-card-title
                                        class="pa-0 pb-1">
                                            <span class="pr-2 primary--text">{{ company.plan.name }}</span>
                                            <span class="text-caption">(current plan)</span>
                                    </v-card-title>

                                    <v-card-text
                                        class="pa-0">
                                            <div class="pb-2">
                                                <div class="d-flex">
                                                    <div class="pr-2">
                                                        <strong>{{ company.plan.licensedNumberOfEmployees }}</strong> Employee License(s),
                                                    </div>
                                                    <div>
                                                        <strong>{{ employeeLicencesRemaining }}</strong> Remaining
                                                    </div>
                                                </div>
                                                <div>
                                                    <strong>{{ Array.purify(company.plan.courses).length }}</strong> Licensed Course(s)
                                                </div>
                                            </div>
                                            <div>
                                                <div 
                                                    v-for="course in Array.purify(company.plan.courses)" 
                                                    :key="course.id">
                                                        <v-icon small color="secondary">mdi-check</v-icon>
                                                        {{ course.name }}
                                                </div>
                                            </div>
                                    </v-card-text>

                                    <v-divider class="my-3"/>

                                    <div class="pb-3 primary--text">
                                        <div v-if="company.plan.billing">
                                            <span class="text-h4">{{ company.plan.billing.currency }} {{ company.plan.billing.price }}</span>
                                            <span class="text--secondary"> / {{ company.plan.billing.interval }}</span>
                                        </div>
                                        <div v-else>
                                            <span class="text-h4">FREE</span>
                                        </div>
                                    </div>

                                    <div 
                                        v-if="unsubscribed || subscriptionHasExpired || subscriptionShouldBeRenewed">
                                            <v-btn 
                                                color="accent" 
                                                block 
                                                @click="activatePlan()">
                                                    {{ unsubscribed ? 'Subscribe' : ((subscriptionHasExpired || subscriptionShouldBeRenewed) ? 'Renew Subscription' : '') }}
                                            </v-btn>
                                    </div>
                                </template>
                            </template>
                    </v-card>
                    <v-card 
                        outlined
                        elevation="1"
                        color="white"
                        class="pa-4 mb-6">
                            <v-card-title
                                class="px-0 pt-0 primary--text">
                                    Custom / Enterprise Solution
                            </v-card-title>

                            <v-card-subtitle
                                class="px-0">
                                    Custom-tailored solution for your business
                            </v-card-subtitle>

                            <v-card-text
                                class="px-0">
                                    Tell us about your particular business needs and we will devise a custom solution just for you. 
                            </v-card-text>

                            <div>
                                <v-btn 
                                    block
                                    color="secondary"
                                    :disabled="customPlanRequestExists"
                                    @click="isShowingCustomPlanRequestDialog = true;">
                                        {{ customPlanRequestExists ? 'Request Pending' : 'Request A Custom Plan' }}
                                </v-btn>
                            </div>
                    </v-card>
            </v-col>
            <v-col 
                cols="12" 
                md="9"
                class="pt-0">
                    <v-row>
                        <v-col 
                            v-for="(column, columnIndex) in 3"
                            :key="`column-${column}`"
                            cols="12" 
                            md="4">
                                <template
                                    v-for="(plan, planIndex) in otherPlans">
                                        <v-card 
                                            outlined
                                            elevation="1"
                                            color="white"
                                            class="pa-4 mb-6"
                                            :key="`plan-${plan.id}`"
                                            v-if="(planIndex % 3) === columnIndex">
                                                <v-card-title
                                                    class="px-0 pt-0 primary--text">
                                                        {{ plan.name }}
                                                </v-card-title>

                                                <v-card-subtitle 
                                                    class="px-0 pb-0">
                                                        {{ plan.description }}
                                                </v-card-subtitle>

                                                <v-divider class="my-3"/>

                                                <v-card-text 
                                                    class="pa-0">
                                                        <div class="d-flex pb-2">
                                                            <div class="pr-2">
                                                                <strong>{{ plan.licensedNumberOfEmployees }}</strong> Employee License(s),
                                                            </div>
                                                            <div>
                                                                <strong>{{ Array.purify(plan.courses).length }}</strong> Licensed Course(s)
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <div 
                                                                v-for="course in Array.purify(plan.courses)" 
                                                                :key="course.id">
                                                                    <v-icon small color="secondary">mdi-check</v-icon>
                                                                    {{ course.name }}
                                                            </div>
                                                        </div>
                                                </v-card-text>

                                                <v-divider class="my-3"/>

                                                <div class="pb-3 primary--text">
                                                    <div v-if="plan.billing">
                                                        <span class="text-h4">{{ plan.billing.currency }} {{ plan.billing.price }}</span>
                                                        <span class="text--secondary"> / {{ plan.billing.interval }}</span>
                                                    </div>
                                                    <div v-else>
                                                        <span class="text-h4">FREE</span>
                                                    </div>
                                                </div>

                                                <div>
                                                    <v-btn 
                                                        block
                                                        outlined
                                                        color="primary" 
                                                        @click="setChangedPlan(plan)">
                                                            Select Plan
                                                    </v-btn>
                                                </div>
                                        </v-card>
                                </template>
                        </v-col>
                    </v-row>
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
        <v-dialog
            v-model="isShowingCustomPlanRequestDialog"
            max-width="600px"
            persistent>
                <v-card>
                    <v-form ref="customPlanRequestForm" @submit.prevent="requestCustomPlan()">
                        <v-card-title>
                            <span class="headline primary--text">Request A Custom Plan</span>
                            <v-spacer/>
                            <v-btn
                                icon
                                color="primary"
                                @click="closeCustomPlanRequestDialog()">
                                    <v-icon>mdi-close</v-icon>
                            </v-btn>
                        </v-card-title>
                        <v-card-text>
                            <v-row>
                                <v-col cols="12">
                                    <v-textarea
                                        v-model="customPlanRequest.details"
                                        label="Details"
                                        hint="Kindly provide the details of your request like your use case, budget etc."
                                        rows="3"
                                        auto-grow
                                        persistent-hint
                                        :rules="[required]"
                                        required/>
                                </v-col>
                                <v-col cols="12">
                                    <v-autocomplete
                                        v-model="customPlanRequest.essentialCoursesIds"
                                        :loading="isSearchingCourses"
                                        :items="foundCourses"
                                        :search-input.sync="searchedCourse"
                                        cache-items
                                        chips
                                        label="Essential Courses (Optional)"
                                        item-text="name"
                                        item-value="id"
                                        hint="Kindly select the courses that must be included in the plan"
                                        persistent-hint
                                        multiple>
                                            <template v-slot:selection="data">
                                                <v-chip
                                                    v-bind="data.attrs"
                                                    :input-value="data.selected"
                                                    close
                                                    @click="data.select"
                                                    @click:close="removeEssentialCourseFromCustomPlanRequest(data.item)"
                                                    color="blue-grey lighten-5"
                                                    text-color="primary"
                                                    label>
                                                        {{ data.item.name }}
                                                </v-chip>
                                            </template>
                                    </v-autocomplete>
                                </v-col>
                            </v-row>
                        </v-card-text>
                        <v-card-actions>
                            <v-spacer/>
                            <v-btn 
                                dark 
                                color="primary" 
                                type="submit" 
                                :loading="isRequestingCustomPlan">
                                    Request Custom Plan
                            </v-btn>
                        </v-card-actions>
                    </v-form>
                </v-card>
        </v-dialog>
    </div>
</template>

<script>
    import firebase from '@/firebase';
    import 'firebase/firestore';
    import 'firebase/functions';

    import { mapState, mapGetters } from 'vuex';

    import { cloneDeep } from 'lodash';
    import { debounce } from 'debounce';

    import validators from '@/mixins/validators';

    const init = {
        customPlanRequest: {
            details: '',
            essentialCoursesIds: [],
        },
    };

    export default {
        name: 'BillingPlans',
        mixins: [validators],
        data() {
            return {
                plans: [],
                isLoadingPlan: false,
                changedPlan: null,
                isShowingCancelSubscriptionWarningDialog: false,

                customPlanRequest: cloneDeep(init.customPlanRequest),
                isShowingCustomPlanRequestDialog: false,
                isRequestingCustomPlan: false,
                customPlanRequests: [],

                isSearchingCourses: false,
                foundCourses: [],
                searchedCourse: '',
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
                'planNotSet',
            ]),
            otherPlans() {
                const otherPlans = this.plans;

                if (this.company.plan) {
                    return this.plans.filter(plan => {
                        return (plan.id !== this.company.plan.id);
                    });
                }

                return otherPlans;
            },
            customPlanRequestExists() {
                return this.customPlanRequests.length > 0;
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
            async searchedCourse(searchedCourse) {
                await this.searchCourses();
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
            searchCourses: debounce(async function () {
                if (this.searchedCourse && (this.searchedCourse.length > 3)) {
                    this.isSearchingCourses = true;

                    const query = firebase.firestore()
                                            .collection('courses')
                                            .orderBy('__name')
                                            .startAt(this.searchedCourse)
                                            .endAt(this.searchedCourse + "\uf8ff");

                    await this.$bind('foundCourses', query);

                    this.isSearchingCourses = false;
                }
            }, 300),
            removeEssentialCourseFromCustomPlanRequest(course) {
                const courseIndex = this.customPlanRequest.essentialCoursesIds.indexOf(course.id);

                this.customPlanRequest.essentialCoursesIds.splice(courseIndex, 1);
            },
            async requestCustomPlan() {
                if (!this.$refs.customPlanRequestForm.validate()) {
                    return;
                }

                this.isRequestingCustomPlan = true;

                try {
                    const customPlanRequestData = cloneDeep(this.customPlanRequest);

                    const requestCustomPlan = firebase.functions()
                                                    .httpsCallable('requestCustomPlan');

                    await requestCustomPlan({ customPlanRequestData });

                    const notification = {
                        message: 'Your Custom Plan Request Has Been Received.',
                        context: 'success',
                    };

                    this.$store.commit('push_notification', { notification });
                        
                    this.closeCustomPlanRequestDialog();
                } catch (error) {
                    const notification = {
                        message: error.message,
                        context: 'error',
                    };

                    this.$store.commit('push_notification', { notification });
                }

                this.isRequestingCustomPlan = false;
            },
            closeCustomPlanRequestDialog() {
                this.isShowingCustomPlanRequestDialog = false;
                this.customPlanRequest = cloneDeep(init.customPlanRequest);
                this.$refs.customPlanRequestForm.resetValidation();
            },
        },
        mounted() {
            this.initPaystackJS();
        },
        firestore() {
            return {
                plans: firebase.firestore().collection('plans'),
                customPlanRequests: firebase.firestore()
                                            .collection('customPlanRequests')
                                            .where('company', '==', firebase.firestore().doc(`companies/${this.company.id}`))
            };
        },
    };
</script>