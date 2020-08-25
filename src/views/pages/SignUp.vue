<template>
    <v-row align="center" justify="center">
        <v-col cols="12" sm="6" md="4" lg="3">
            <v-form @submit.prevent="signup()">
                <v-card elevation="12" class="px-2 py-4">
                    <div class="d-flex pa-4">
                        <router-link to="/" class="mx-auto">
                            <v-avatar tile width="145" color="white">
                                <img src="@/assets/logo.png"/>
                            </v-avatar>
                        </router-link>
                    </div>
                    <v-card-text>
                        <v-alert v-model="alert.show" 
                            :dismissible="true" 
                            :prominent="true" 
                            type="error">
                                {{ alert.message }}
                        </v-alert>

                        <v-text-field v-model="fullName"
                            label="Full Name"
                            name="fullName"
                            prepend-icon="mdi-account-circle"
                            type="text"
                            :rules="[required]"
                            required/>

                        <v-text-field v-model="email"
                            label="Work Email"
                            name="email"
                            prepend-icon="mdi-email"
                            type="email"
                            :rules="[required,isEmail]"
                            required/>

                            <v-row no-gutters>
                                <v-col class="pr-2" style="max-width:100px;">
                                    <v-select v-model="phoneNumber.countryCode" 
                                        :items="countries" 
                                        item-text="callingCodes[0]" 
                                        item-value="alpha2Code"
                                        name="countryCode"
                                        prepend-icon="mdi-phone"
                                        :rules="[required]"
                                        required/>
                                </v-col>
                                <v-col>
                                    <v-text-field v-model="phoneNumber.input" 
                                        @input="phoneNumber.formatted = formatAsE164PhoneNumber($event)"
                                        label="Phone Number"
                                        name="phoneNumber"
                                        type="tel"
                                        :rules="[required,isPhoneNumber]"
                                        required/>
                                </v-col>
                            </v-row>

                        <v-text-field v-model="password"
                            label="Password"
                            name="password"
                            prepend-icon="mdi-lock-open-variant"
                            type="password"
                            :rules="[required]"
                            required/>

                        <v-text-field
                            label="Confirm Password"
                            name="confirmPassword"
                            prepend-icon="mdi-lock"
                            type="password"
                            :rules="[matchesPassword, required]"
                            required/>
                    </v-card-text>
                    <v-card-actions>
                        <v-btn :loading="isSigningUp" block large type="submit" color="secondary">SIGN UP</v-btn>
                    </v-card-actions>
                </v-card>
            </v-form>
            <v-sheet dark color="transparent" class="pa-6">
                <p class="text-center">Already have an account? <router-link class="accent2--text" to="/signin">SIGN IN HERE</router-link></p>
            </v-sheet>
        </v-col>
    </v-row>
</template>

<script>
    import firebase from '@/firebase';
    import 'firebase/auth';
    import 'firebase/functions';
    import axios from 'axios';
    import validators from '@/mixins/validators';

    export default {
        name: 'SignupPage',
        mixins: [validators],
        data() {
            return {
                email: null,
                phoneNumber: {
                    countryCode: 'GH',
                    input: null,
                    formatted: null,
                },
                password: null,
                fullName: null,
                alert: {
                    message: null,
                    show: false,
                },
                isSigningUp: false,
                countries: [],
            };
        },
        methods: {
            async signup() {
                this.isSigningUp = true;

                try {
                    const signUpHR = firebase.functions().httpsCallable('signUpHR');

                    await signUpHR({
                        email: this.email,
                        phoneNumber: this.phoneNumber.formatted,
                        password: this.password,
                        displayName: this.fullName,
                    });

                    await firebase.auth().signInWithEmailAndPassword(this.email, this.password);
                } catch (error) {            
                    const message = error.message;
                    
                    this.alert = {
                        message,
                        show: true,
                    };
                }

                this.isSigningUp = false;
            }
        },
        async mounted() {
            this.countries = (await axios.get('https://restcountries.eu/rest/v2/all?fields=name;alpha2Code;callingCodes;flag')).data;
        }
    };
</script>