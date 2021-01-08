<template>
    <v-app>
        <v-main>
            <router-view @toggle-auth="toggleAuthDialog()"/>
            <v-dialog
                v-model="auth.showDialog"
                max-width="400px">
                    <v-card
                        outlined
                        elevation="1"
                        color="white"
                        class="pb-4">
                            <template v-if="auth.mode === 'authenticate'">
                                <v-form @submit.prevent="authenticate()" ref="authForm">
                                    <v-card-title>
                                        <span class="headline primary--text">Sign In</span>
                                    </v-card-title>
                                    <template v-if="auth.emailLinkSent">
                                        <v-card-text class="primary--text">
                                            A sign in link has been sent to the provided email. 
                                            <br/>Kindly use it to authenticate your account.
                                        </v-card-text>
                                        <v-card-actions>
                                            <v-btn 
                                                color="secondary" 
                                                depressed
                                                large
                                                rounded
                                                block
                                                :disabled="auth.cannotResendEmailLink">
                                                    Resend Link 
                                                    <span v-if="auth.cannotResendEmailLink" class="pl-2">
                                                        ({{ auth.resendEmailLinkTimer.secondsRemaining | toTimer }})
                                                    </span>
                                            </v-btn>
                                        </v-card-actions>
                                    </template>
                                    <template v-else>
                                        <v-card-text>
                                            <v-alert 
                                                v-model="auth.error.show" 
                                                :dismissible="false" 
                                                prominent
                                                colored-border
                                                border="right"
                                                type="error">
                                                    {{ auth.error.message }}
                                            </v-alert>

                                            <v-text-field 
                                                v-model="auth.email"
                                                label="Work Email" 
                                                :rules="[required]"
                                                required/>
                                        </v-card-text>
                                        <v-card-actions>
                                            <v-btn 
                                                color="secondary" 
                                                type="submit"
                                                depressed
                                                :loading="auth.isAuthenticating"
                                                large
                                                rounded
                                                block>
                                                    Sign In
                                            </v-btn>
                                        </v-card-actions>
                                    </template>
                                </v-form>
                            </template>
                            <template v-if="auth.mode === 'verify'">
                                <v-form @submit.prevent="signIn(auth.email)" ref="authForm">
                                    <v-card-title>
                                        <span class="headline primary--text">Verify Email</span>
                                    </v-card-title>
                                    <v-card-text class="primary--text">
                                        Kindly verify the email to which the authentication link was sent.
                                    </v-card-text>
                                    <v-card-text>
                                        <v-alert 
                                            v-model="auth.error.show" 
                                            :dismissible="false" 
                                            prominent
                                            colored-border
                                            border="right"
                                            type="error">
                                                {{ auth.error.message }}
                                        </v-alert>
                                        
                                        <v-text-field 
                                            v-model="auth.email"
                                            label="Authenticated Email" 
                                            :rules="[required]"
                                            required/>
                                    </v-card-text>
                                    <v-card-actions>
                                        <v-btn 
                                            color="secondary" 
                                            type="submit"
                                            depressed
                                            :loading="auth.isAuthenticating"
                                            large
                                            rounded
                                            block>
                                                Verify Email
                                        </v-btn>
                                    </v-card-actions>
                                </v-form>
                            </template>
                    </v-card>
            </v-dialog>
            <v-overlay :value="loading">
                <v-progress-circular indeterminate size="64"/>
            </v-overlay>
        </v-main>

        <v-footer app inset class="pa-0" flat dark absolute>
            <v-sheet dark color="background" class="textured-background" width="100%">
                <v-container
                    fluid 
                    style="max-width:1200px;"
                    class="py-6">
                        <v-row align="center">
                            <v-col cols="12" md="4">
                                <v-avatar tile width="145">
                                    <img src="@/assets/logo-mono-white.png"/>
                                </v-avatar>
                            </v-col>
                            <v-col cols="12" md="4" class="d-flex justify-center">
                                <v-btn
                                    v-for="socialAccount in socialAccounts"
                                    :key="`social-account-${socialAccount.name}`"
                                    class="px-4" 
                                    icon 
                                    color="white" 
                                    large
                                    :to="socialAccount.link">
                                        <v-icon>{{ `mdi-${socialAccount.name}` }}</v-icon>
                                </v-btn>
                            </v-col>
                            <v-col cols="12" md="4">
                                <div class="text-right">{{ settings.business.supportEmail }}</div>
                            </v-col>
                        </v-row>
                </v-container>
                <v-divider/>
                <v-container
                    fluid 
                    style="max-width:1200px;"
                    class="py-6">
                        <v-row>
                            <v-col 
                                cols="12" 
                                md="4"
                                v-for="linkGroup in footerLinkGroups"
                                :key="`link-group-${linkGroup.header}`">
                                    <div class="text-h5 white--text">{{ linkGroup.header }}</div>
                                    <div class="py-4">
                                        <a v-for="(link, index) in linkGroup.links"
                                            :key="`footer-link-${linkGroup.header}-${index}`"
                                            class="footer-link blue-grey--text text--lighten-4 py-1"
                                            :href="link.href">
                                                {{ link.name }}
                                        </a>
                                    </div>
                            </v-col>
                        </v-row>
                </v-container>
                <v-divider/>
                <v-container
                    fluid
                    style="max-width:1200px;"
                    class="py-10">
                        <div class="text-caption">&#169;{{ year }} {{ settings.business.legalName }} All rights reserved.</div>
                </v-container>
            </v-sheet>
        </v-footer>
    </v-app>
</template>

<script>
    import firebase from '@/firebase';
    import 'firebase/auth';
    import 'firebase/firestore';

    import { cloneDeep } from 'lodash';
    import { mapState } from 'vuex';

    import validators from '@/mixins/validators';

    const init = {
        timer: {
            id: null,
            secondsRemaining: 0,
            callbackFunction: null,
        },
    };

    export default {
        name: 'DefaultLayout',
        mixins: [validators],
        data() {
            return {
                loading: false,
                auth: {
                    mode: 'authenticate',
                    showDialog: false,
                    error: {
                        show: false,
                        message: '',
                    },
                    email: '',
                    isAuthenticating: false,
                    emailLinkSent: false,
                    cannotResendEmailLink: true,
                    resendEmailLinkTimer: cloneDeep(init.timer),
                },
                socialAccounts: [
                    {
                        name: 'twitter',
                        link: ''
                    },
                    {
                        name: 'facebook',
                        link: ''
                    },
                    {
                        name: 'linkedin',
                        link: ''
                    },
                ],
                footerLinkGroups: [
                    {
                        header: 'Company',
                        links: [
                            {
                                name: 'About Us',
                                href: '',
                            },
                            {
                                name: 'Testimonials',
                                href: '',
                            },
                            {
                                name: 'Courses',
                                href: '',
                            },
                        ]
                    },
                    {
                        header: 'Services',
                        links: [
                            {
                                name: 'Support',
                                href: '',
                            },
                            {
                                name: 'Test Center',
                                href: '',
                            },
                            {
                                name: 'Career Services',
                                href: '',
                            },
                            {
                                name: 'Cyber Hygiein',
                                href: '',
                            },
                        ]
                    },
                    {
                        header: 'Contact',
                        links: [
                            {
                                name: 'Contact Us',
                                href: '',
                            },
                            {
                                name: 'Locations',
                                href: '',
                            },
                            {
                                name: 'FAQs',
                                href: '',
                            },
                        ]
                    },
                ]
            };
        }, 
        computed: {
            ...mapState([
                'settings',
            ]),
            year() {
                return new Date().getFullYear();
            }
        },
        methods: {
            toggleAuthDialog() {
                this.auth.showDialog = !this.auth.showDialog;
            },
            async authenticate() {
                this.auth.isAuthenticating = true;

                const actionCodeSettings = {
                    url: this.$$config.auth.app_domain,
                    handleCodeInApp: true, // This must be true
                };

                try {
                    await firebase.auth().sendSignInLinkToEmail(this.auth.email, actionCodeSettings);

                    localStorage.setItem('authEmail', this.auth.email);

                    this.auth.emailLinkSent = true;

                    this.auth.cannotResendEmailLink = true;

                    this.setTimer(this.auth.resendEmailLinkTimer, 60, () => {
                        this.auth.cannotResendEmailLink = false;
                    });

                    this.auth.email = '';
                    this.$refs.authForm.resetValidation();
                }
                catch (error) {
                    this.auth.error = {
                        ...error,
                        show: true,
                    };
                }

                this.auth.isAuthenticating = false;
            },
            async signIn(email) {
                this.loading = true;
                this.auth.isAuthenticating = true;

                try {
                    await firebase.auth().signInWithEmailLink(email, location.href);
                }
                catch (error) {
                    this.auth.error = {
                        ...error,
                        show: true,
                    };
                }

                this.auth.isAuthenticating = false;
                this.loading = false;
            },
            setTimer(timer, durationInSeconds, callbackFunction = null) {
                this.clearTimer(timer);

                timer.secondsRemaining = durationInSeconds;

                timer.callbackFunction = callbackFunction;

                timer.id = setInterval(() => {
                    if (timer.secondsRemaining > 0) {
                        timer.secondsRemaining--;
                    } else {
                        timer.callbackFunction();

                        clearInterval(timer.id);
                    }
                }, 1000);
            },
            clearTimer(timer) {
                if (timer.id) {
                    clearInterval(timer.id);
                }

                timer = cloneDeep(init.timer);
            },
        },
        mounted() {
            if (firebase.auth().isSignInWithEmailLink(location.href)) {
                const email = localStorage.getItem('authEmail');

                if (!email) {
                    this.auth.mode = 'verify';
                    this.auth.showDialog = true;

                    return;
                }

                this.signIn(email);

                localStorage.removeItem('authEmail');
            }
        },
        created() {
            this.$store.dispatch('initializeSettings');
        },
        filters: {
            toTimer(durationInSeconds) {
                const seconds = (durationInSeconds % 60);
                const minutes = (Math.floor(durationInSeconds / 60));

                let secondsString = seconds.toString();
                let minutesString = minutes.toString();

                if (secondsString.length === 1) {
                    secondsString = `0${secondsString}`;
                }

                if (minutesString.length === 1) {
                    minutesString = `0${minutesString}`;
                }

                return `${minutesString}:${secondsString}`;
            }
        },
    };
</script>

<style scoped>
    .footer-link {
        font-size: 0.875em;
        line-height: 1.71;
        text-decoration: none;
        display: block;
    }
    .footer-link:hover {
        text-decoration: underline;
    }
</style>