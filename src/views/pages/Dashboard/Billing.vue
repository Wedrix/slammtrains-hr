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
                    <v-tab>Invoices</v-tab>
                    <v-tab>Previous Payments</v-tab>
                    <v-tab>Payment Method</v-tab>
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
                            <div class="text-h6">
                                {{ subscription.plan.name }} 
                                <span class="text-caption">(current plan)</span>
                            </div>
                            
                            <div class="text-caption py-2">
                                <div>
                                    <span>
                                        <strong>{{ subscription.plan.licensedNumberOfEmployees }}</strong> Employee Licenses,
                                    </span>
                                    <span>
                                        <strong>{{ employeeLicencesRemaining }}</strong> remaining
                                    </span>
                                </div>
                                <div>
                                    <strong>{{ subscription.plan.courses.length }}</strong> licensed courses
                                </div>
                            </div>

                            <v-divider class="my-2"/>

                            <div class="pb-2">
                                <div 
                                    v-for="course in subscription.plan.courses" 
                                    :key="course.id" 
                                    class="text-body-2 py-1">
                                        <v-icon small color="green">mdi-check</v-icon>
                                        {{ course.name }}
                                </div>
                            </div>
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
                                <v-btn color="secondary" block>Contact Us for a Custom Quote</v-btn>
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
                                <v-col cols="12" md="4" v-for="plan in plans" :key="plan.id">
                                    <v-card-title>{{ plan.name }}</v-card-title>
                                    <v-card-subtitle>{{ plan.description }}</v-card-subtitle>
                                    <v-card-text class="primary--text">
                                        <div class="pb-3">
                                            <div v-if="plan.billing">
                                                <span class="text-h4">{{ plan.billing.currency }} {{ plan.billing.amount }}</span>
                                                <span class="text--secondary"> / {{ plan.billing.interval }}</span>
                                            </div>
                                            <div v-else>
                                                <span class="text-h4">FREE</span>
                                            </div>
                                        </div>
                                        <v-btn rounded width="150" color="secondary">Select Plan</v-btn>
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
            };
        },
        computed: {
            ...mapState([
                'company',
            ]),
            ...mapGetters([
                'admin',
                'subscription',
            ]),
            employeeLicencesRemaining() {
                if (this.subscription.plan.licensedNumberOfEmployees) {
                    return (this.subscription.plan.licensedNumberOfEmployees - this.employeesTotalCount);
                }

                return null;
            },
            employeesTotalCount() {
                if (this.company) {
                    return this.company.employeesTotalCount;
                }

                return null;
            }
        },
        firestore: {
            plans: firebase.firestore().collection('plans'),
        },
    };
</script>