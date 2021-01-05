<template>
    <v-app>
        <v-main>
            <router-view/>
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
                                    :key="`social-account-${socialAccount.icon}`"
                                    class="px-4" 
                                    icon 
                                    color="white" 
                                    large
                                    :to="socialAccount.link">
                                        <v-icon>{{ `mdi-${socialAccount.icon}` }}</v-icon>
                                </v-btn>
                            </v-col>
                            <v-col cols="12" md="4">
                                <div class="text-right">{{ supportEmail }}</div>
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
                        <div class="text-caption">&#169;{{ year }} Slamm Technologies Inc. All rights reserved.</div>
                </v-container>
            </v-sheet>
        </v-footer>
    </v-app>
</template>

<script lang="ts">
    export default {
        name: 'DefaultLayout',
        data() {
            return {
                supportEmail: 'support@slammtrains.com',
                socialAccounts: [
                    {
                        icon: 'twitter',
                        link: ''
                    },
                    {
                        icon: 'facebook',
                        link: ''
                    },
                    {
                        icon: 'linkedin',
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
            year() {
                return new Date().getFullYear();
            }
        }
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