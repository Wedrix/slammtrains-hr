<template>
    <v-app>
        <v-navigation-drawer app :mini-variant.sync="isShowingNavDrawer">
            <v-list>
                <v-list-item class="px-2">
                    <v-list-item-avatar tile>
                        <v-img v-if="company.logo" :src="company.logo.src"></v-img>
                        <v-btn v-else fab :elevation="0" small>
                            {{ getInitials(company.name) }}
                        </v-btn>
                    </v-list-item-avatar>

                    <v-list-item-title>{{ company.name }}</v-list-item-title>

                    <v-btn icon>
                        <v-icon>mdi-circle-edit-outline</v-icon>
                    </v-btn>
                </v-list-item>

                <v-divider/>

                <v-list-item v-for="navItem in navItems" :key="navItem.title" link>
                    <v-list-item-icon>
                        <v-icon>{{ navItem.icon }}</v-icon>
                    </v-list-item-icon>

                    <v-list-item-content>
                        <v-list-item-title>{{ navItem.title }}</v-list-item-title>
                    </v-list-item-content>
                </v-list-item>

                <v-divider/>

                <v-list-item link>
                    <v-list-item-icon>
                        <v-icon>mdi-wallet-outline</v-icon>
                    </v-list-item-icon>

                    <v-list-item-content>
                        <v-list-item-title>Subscription</v-list-item-title>
                    </v-list-item-content>
                </v-list-item>
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

        <v-app-bar app dark color="primary" class="textured-background" elevate-on-scroll>
            <v-app-bar-nav-icon @click="isShowingNavDrawer = !isShowingNavDrawer"/>

            <v-toolbar-title class="mr-12">Home</v-toolbar-title>
            
            <v-text-field
                flat
                solo-inverted
                hide-details
                prepend-inner-icon="mdi-magnify"
                label="Search"
                class="hidden-sm-and-down">
            </v-text-field>

            <v-spacer/>

            <v-btn icon>
                <v-icon>mdi-bell</v-icon>
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

        <v-main>
            <v-container fluid>
                <router-view/>
            </v-container>
            <notification/>
        </v-main>

        <v-footer class="textured-background" color="primary" dark inset app>
            <div class="text-caption">&#169;2020 Slamm Technologies</div>
        </v-footer>
    </v-app>
</template>

<script>
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
                    },
                    {
                        title: 'Payments',
                        icon: 'mdi-credit-card-outline',
                        to: '/dashboard/payments',
                    },
                ],
                isShowingNavDrawer: false,
            };
        },
        computed: {
            ...mapState([
                'company',
            ]),
            ...mapGetters([
                'admin',
            ]),
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