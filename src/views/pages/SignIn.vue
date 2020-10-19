<template>
    <v-row align="center" justify="center">
        <v-col cols="12" sm="6" md="4" lg="3">
            <v-form @submit.prevent="login()">
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
                        <v-text-field
                            label="Email"
                            name="email"
                            prepend-icon="mdi-email"
                            type="email"
                            v-model="email"
                            :rules="[required,isEmail]"
                            required/>

                        <v-text-field
                            id="password"
                            label="Password"
                            name="password"
                            prepend-icon="mdi-lock"
                            type="password"
                            v-model="password"
                            :rules="[required]"
                            required/>
                    </v-card-text>
                    <v-card-actions>
                        <v-btn :loading="isLoggingIn" block large type="submit" color="secondary">SIGN IN</v-btn>
                    </v-card-actions>
                </v-card>
            </v-form>
            <v-sheet dark color="transparent" class="py-6">
                <p class="text-center">Don't have an account yet? <router-link class="accent2--text" to="/signup">SIGN UP HERE</router-link></p>
            </v-sheet>
        </v-col>
    </v-row>
</template>

<script>
    import firebase from '@/firebase';
    import 'firebase/auth';
    import validators from '@/mixins/validators';

    export default {
        name: 'SigninPage',
        mixins: [validators],
        data() {
            return {
                isLoggingIn: false,
                email: null,
                password: null,
                alert: {
                    message: null,
                    show: false,
                },
            };
        },
        methods: {
            async login() {
                this.isLoggingIn = true;

                try {
                    await firebase.auth().signInWithEmailAndPassword(this.email, this.password);
                } catch (error) {             
                    const message = error.message;
                    
                    this.alert = {
                        message,
                        show: true,
                    };
                }

                this.isLoggingIn = false;
            }
        },
        watch: {
            $route: {
                immediate: true,
                deep: true,
                handler($route) {
                    const unauthorized = this.$route.query.unauthorized;

                    if (unauthorized) {
                        this.alert = {
                            message: 'You are not authorized to access the HR Portal.',
                            show: true,
                        }
                    }
                }
            }
        },
    };
</script>