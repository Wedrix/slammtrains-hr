<template>
    <v-app>
        <v-navigation-drawer 
            v-model="isShowingNavDrawer"
            app>
                <v-list>
                    <v-list-item class="px-2">
                        <v-list-item-avatar tile>
                            <v-img v-if="company.logo" :src="company.logo.src"></v-img>
                            <v-btn v-else fab :elevation="0" small>
                                {{ getInitials(company.name) }}
                            </v-btn>
                        </v-list-item-avatar>

                        <v-list-item-title>{{ company.name }}</v-list-item-title>
                    </v-list-item>

                    <v-divider/>

                    <v-list-item 
                        v-for="navItem in navItems" 
                        :key="navItem.title" 
                        :to="navItem.to"
                        color="primary"
                        link
                        exact>
                            <v-list-item-icon>
                                <v-icon>{{ navItem.icon }}</v-icon>
                            </v-list-item-icon>

                            <v-list-item-content>
                                <v-list-item-title>{{ navItem.title }}</v-list-item-title>
                            </v-list-item-content>
                    </v-list-item>

                    <v-divider/>

                    <v-list-group
                        prepend-icon="mdi-cog-outline"
                        group="/settings/i"
                        no-action>
                            <template v-slot:activator>
                                <v-list-item-title>Settings</v-list-item-title>
                            </template>

                            <v-divider inset/>

                            <v-list-item 
                                v-for="navItem in settingsNavItems" 
                                :key="navItem.title" 
                                :to="navItem.to"
                                color="primary"
                                link
                                exact>
                                    <v-list-item-icon>
                                        <v-icon>{{ navItem.icon }}</v-icon>
                                    </v-list-item-icon>

                                    <v-list-item-content>
                                        <v-list-item-title>{{ navItem.title }}</v-list-item-title>
                                    </v-list-item-content>
                            </v-list-item>
                    </v-list-group>
                </v-list>

                <template v-slot:append>
                    <v-list>
                        <v-divider/>
                        
                        <v-list-item @click="logout()">
                            <v-list-item-icon>
                                <v-icon>mdi-logout</v-icon>
                            </v-list-item-icon>

                            <v-list-item-content>
                                <v-list-item-title>LOGOUT</v-list-item-title>
                            </v-list-item-content>
                        </v-list-item>
                    </v-list>
                </template>
        </v-navigation-drawer>

        <v-app-bar app color="white" flat style="border-bottom: thin solid rgba(0, 0, 0, 0.12) !important">
            <v-app-bar-nav-icon class="mr-6" :class="{ 'd-none': isShowingNavDrawer }"
                @click="isShowingNavDrawer = !isShowingNavDrawer"/>
    
            <v-avatar tile width="145" color="white" size="40">
                <img src="@/assets/logo.png"/>
            </v-avatar>

            <v-spacer/>

            <v-btn icon>
                <v-icon>mdi-bell</v-icon>
            </v-btn>

            <v-btn icon>
                <v-icon>mdi-help-circle</v-icon>
            </v-btn>

            <v-menu left bottom>
                <template v-slot:activator="{ on, attrs }">
                    <v-btn class="ml-2" color="secondary" fab :elevation="0" small v-bind="attrs" v-on="on">
                        {{ getInitials(admin.name) }}
                    </v-btn>
                </template>

                <v-list>
                    <v-list-item>
                        <v-list-item-icon>
                            <v-icon>mdi-account-circle</v-icon>
                        </v-list-item-icon>

                        <v-list-item-content>
                            <v-list-item-title>Account</v-list-item-title>
                        </v-list-item-content>
                    </v-list-item>

                    <v-divider/>

                    <v-list-item>
                        <v-btn @click="logout()" color="secondary" small block>
                            <v-icon>mdi-logout</v-icon> LOGOUT
                        </v-btn>
                    </v-list-item>
                </v-list>
            </v-menu>
        </v-app-bar>

        <v-main class="plain-background">
            <v-container fluid>
                <v-alert :value="hasDueBill"
                    dismissible
                    color="secondary"
                    border="left"
                    elevation="2"
                    class="mx-lg-6"
                    colored-border>
                        Your current plan is inactive. Kindly make payment or pick another plan.
                        <v-btn color="secondary" class="ml-4">Make Payment</v-btn>
                </v-alert>

                <router-view/>
            </v-container>
            <notification/>
        </v-main>

        <v-footer app inset color="white" flat style="border-top: thin solid rgba(0, 0, 0, 0.12) !important;">
            <div class="text-caption">&#169;2020 Slamm Technologies</div>
        </v-footer>
    </v-app>
</template>

<script>
    import moment from 'moment';
    import firebase from '@/firebase';
    import 'firebase/auth';

    import Notification from '@/components/Notification.vue';

    import { mapState, mapGetters } from 'vuex';

    export default {
        name: 'DashboardLayout',
        components: {
            'notification': Notification,
        },
        data() {
            return {
                navItems: [
                    {
                        title: 'Home',
                        icon: 'mdi-home-variant-outline',
                        to: '/dashboard',
                    },
                    {
                        title: 'Employees',
                        icon: 'mdi-account-multiple-outline',
                        to: '/dashboard/employees',
                    },
                    {
                        title: 'Courses',
                        icon: 'mdi-book-open-outline',
                        to: '/dashboard/courses',
                    }
                ],

                settingsNavItems: [
                    {
                        title: 'Account',
                        icon: 'mdi-account-outline',
                        to: '',
                    },
                    {
                        title: 'Billing',
                        icon: 'mdi-wallet-outline',
                        to: '/dashboard/settings/billing',
                    }
                ],
                
                hasDueBill: false,
                isShowingNavDrawer: null,
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
        },
        watch: {
            subscription(subscription) {
                if (subscription) {
                    if (subscription.plan.billing === undefined) {
                        this.hasDueBill = false;
                    }

                    if (subscription.expiresAt) {
                        const expiresAt = moment(subscription.expiresAt.toMillis());

                        this.hasDueBill = moment().isAfter(expiresAt);
                    }
                } else {
                    this.hasDueBill = true;
                }
            }
        },
        methods: {
            async logout() {
                try {
                    await firebase.auth().signOut();
                } catch (error) {
                    const notification = {
                        message: error.message,
                        context: 'error',
                    };

                    this.$store.commit('push_notification', { notification });
                }
            },
            getInitials(name) {
                const names = name.split(' ');

                let initials = `${names[0].charAt(0)}`;

                if (names[names.length - 1]) {
                    initials = initials + `${names[names.length - 1].charAt(0)}`;
                }

                return initials;
            }
        },
        created() {
            firebase.auth().onAuthStateChanged(user => {
                if (user) {
                    const uid = user.uid;

                    this.$store.dispatch('initialize', { uid });
                } else {
                    this.$store.dispatch('clear');
                }
            });
        }
    }
</script>

<style lang="scss">
    .textured-background {
        background-image: url('../../assets/background.png');
        background-repeat: repeat;
    }
    .plain-background {
        background-color: #32527910 !important;
    }
</style>