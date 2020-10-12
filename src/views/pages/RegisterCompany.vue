<template>
    <v-row align="center" justify="center">
        <v-col cols="12" sm="9" lg="5">
            <v-card elevation="12" class="pa-4">
                <div class="d-flex pa-4">
                    <router-link to="/" class="mx-auto">
                        <v-avatar tile width="145" color="white">
                            <img src="@/assets/logo.png"/>
                        </v-avatar>
                    </router-link>
                </div>
                <div class="text-h5 text-capitalize text-center py-4">Kindly fill in your company's details below to get started</div>
                <v-alert v-model="alert.show" 
                    :dismissible="true" 
                    :prominent="true" 
                    :type="alert.context">
                        {{ alert.message }}
                </v-alert>
                <v-form ref="registrationForm" @submit.prevent="validate() && register()">
                    <v-row align="center" justify="center">
                        <v-col cols="12" sm="5">
                            <image-picker directory="companies/logos" 
                                :label="'Company Logo (optional)'"
                                @uploading-image="isUploadingImage = true;"
                                @error-uploading-image="isUploadingImage = false;"
                                @image-upload-successful="logo = $event; isUploadingImage = false;"/>
                        </v-col>
                        <v-col cols="12" sm="7">
                            <v-card-text>
                                <v-text-field v-model="name"
                                    label="Company Name"
                                    name="companyName"
                                    type="text"
                                    :rules="[required]"
                                    required/>

                                <v-text-field v-model="email"
                                    label="Company Email"
                                    name="companyEmail"
                                    type="email"
                                    :rules="[required,isEmail]"
                                    required/>

                                <v-row no-gutters>
                                    <v-col class="pr-2" style="max-width:70px;">
                                        <v-select v-model="phoneNumber.countryCode" 
                                            :items="countries" 
                                            item-text="callingCodes[0]" 
                                            item-value="alpha2Code"
                                            name="countryCode"
                                            :rules="[required]"
                                            required/>
                                    </v-col>
                                    <v-col>
                                        <v-text-field v-model="phoneNumber.input" 
                                            @input="phoneNumber.formatted = formatAsE164PhoneNumber($event)"
                                            label="Company Phone"
                                            name="phoneNumber"
                                            type="tel"
                                            :rules="[required,isPhoneNumber]"
                                            required/>
                                    </v-col>
                                </v-row>

                                <v-select v-model="numberOfEmployees" :items="settings.employeeRanges"
                                    label="Number Of Employees"
                                    name="numberOfEmployees"
                                    :rules="[required]"
                                    required/>

                                <v-select v-model="industry" :items="settings.industries"
                                    label="Industry (optional)"
                                    name="industry"/>
                            </v-card-text>
                        </v-col>
                    </v-row>

                    <v-divider/>

                    <v-row align="center" justify="center">
                        <v-col cols="12" sm="6">
                            <v-card-text>
                                <v-text-field v-model="addressLine1"
                                    label="Address Line 1"
                                    name="addressLine1"
                                    type="text"
                                    :rules="[required]"
                                    required/>

                                <v-text-field v-model="addressLine2"
                                    label="Address Line 2"
                                    name="addressLine2"
                                    type="text"
                                    :rules="[required]"
                                    required/>

                                <v-text-field v-model="city"
                                    label="City"
                                    name="city"
                                    type="text"
                                    :rules="[required]"
                                    required/>

                                <v-text-field v-model="region"
                                    label="State / Province / Region"
                                    name="region"
                                    type="text"
                                    :rules="[required]"
                                    required/>

                                <v-select v-model="country" 
                                    :items="countries" 
                                    item-value="name" 
                                    item-text="name"
                                    label="Country"
                                    name="country"
                                    type="text"
                                    :rules="[required]"
                                    required/>

                                <v-text-field v-model="postalAddress"
                                    label="Postal Address (optional)"
                                    name="postalAddress"
                                    type="text"/>
                            </v-card-text>
                        </v-col>
                        <v-col cols="12" sm="6">
                            <v-card-text>
                                <div class="background--text text-h5 text-capitalize py-2">{{ selectedPlan.name }}</div>

                                <v-divider/>

                                <v-sheet class="pt-1 pb-3 my-2">
                                    <div class="pb-2">
                                        <div class="text-decoration-underline">Courses:</div>
                                        <ul>
                                            <li v-for="course in selectedPlan.courses" :key="course.id">{{ course.name }}</li>
                                        </ul>
                                    </div>
                                    <div class="pb-1">
                                        <span class="text-decoration-underline">License:</span> {{ selectedPlan.licensedNumberOfEmployees }} Employees
                                    </div>
                                    <div class="pb-1">
                                        <span class="text-decoration-underline">Billing:</span> 
                                        <span v-if="selectedPlan.billing">
                                            {{ $$config.currency }} {{ selectedPlan.billing.amount / 100 }} {{ selectedPlan.billing.interval }}
                                        </span>
                                        <span v-else>Free</span>
                                    </div>
                                </v-sheet>

                                <v-select v-model="selectedPlan" :items="plans" :item-text="'name'" return-object hide-selected 
                                    label="Select Another Plan"
                                    name="plan"
                                    :hint="'NB: You will not be immediately billed. You are free to change your plan anytime.'"
                                    persistent-hint
                                    outlined
                                    :rules="[required]"
                                    required/>
                            </v-card-text>
                        </v-col>
                    </v-row>
                    <v-card-actions>
                        <v-btn :loading="isRegistering" block rounded large type="submit" color="secondary">REGISTER</v-btn>
                    </v-card-actions>
                </v-form>
            </v-card>
        </v-col>
    </v-row>
</template>

<script>
    import firebase from '@/firebase';
    import 'firebase/auth';
    import 'firebase/functions';
    import 'firebase/firestore';
    import validators from '@/mixins/validators';
    import ImagePickerComponent from '@/components/ImagePicker.vue';
    import axios from 'axios';

    export default {
        name: 'CompanyRegistrationPage',
        components: {
            'image-picker': ImagePickerComponent,
        },
        mixins: [validators],
        data() {
            return {
                logo: null,
                name: null,
                email: null,
                phoneNumber: {
                    countryCode: 'GH',
                    input: null,
                    formatted: null,
                },
                numberOfEmployees: null,
                industry: null,
                addressLine1: null,
                addressLine2: null,
                city: null,
                country: 'Ghana',
                region: null,
                postalAddress: null,
                selectedPlan: {
                    courses: [],
                    licensedNumberOfEmployees: null,
                    name: null,
                    subscription: {
                        fee: null,
                        paymentCycleInDays: null,
                    }
                },
                plans: [],
                settings: {
                    employeeRanges: [],
                    industries: [],
                },
                countries: [],
                isUploadingImage: false,
                isRegistering: false,
                alert: {
                    message: null,
                    show: false,
                    context: null,
                },
            };
        },
        methods: {
            validate() {
                if (this.isUploadingImage) {
                    this.alert = {
                        message: 'Kindly wait for the image upload to complete',
                        show: true,
                        context: 'info'
                    };

                    return false;
                }

                return this.$refs.registrationForm.validate();
            },
            async register() {
                this.isRegistering = true;

                try {
                    const registerCompany = firebase.functions().httpsCallable('registerCompany');

                    await registerCompany({
                        logo: this.logo,
                        subscription: {
                            planId: this.selectedPlan.id,
                        },
                        name: this.name,
                        email: this.email,
                        phoneNumber: this.phoneNumber.formatted,
                        numberOfEmployees: this.numberOfEmployees,
                        industry: this.industry,
                        address: {
                            addressLine1: this.addressLine1,
                            addressLine2: this.addressLine2,
                            city: this.city,
                            region: this.region,
                            country: this.country
                        },
                        postalAddress: this.postalAddress
                    });

                    this.$router.push('/dashboard');
                } catch (error) {           
                    const message = error.message;
                    
                    this.alert = {
                        message,
                        show: true,
                        context: 'error'
                    };
                }

                this.isRegistering = false;
            }
        },
        firestore: {
            plans: firebase.firestore().collection('plans'),
            settings: firebase.firestore().collection('settings').doc('companyRegistrationPage'),
        },
        watch: {
            plans(plans) {
                if (plans.length > 0) {
                    if (this.$route.query.plan) {
                        const selectedPlan = plans.find(plan => {
                            return plan.id == this.$route.query.plan;
                        });

                        if (selectedPlan) {
                            this.selectedPlan = selectedPlan;
                            
                            return;
                        }
                    }

                    this.selectedPlan = plans[0];
                }
            }
        },
        async mounted() {
            this.countries = (await axios.get('https://restcountries.eu/rest/v2/all?fields=name;alpha2Code;callingCodes;flag')).data;
        }
    };
</script>