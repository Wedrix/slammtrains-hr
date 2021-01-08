<template>
    <v-app>
        <v-main>
            <v-container class="plain-background pa-0" fill-height fluid>
                <router-view/>
            </v-container>
        </v-main>

        <v-footer class="textured-background" color="background" absolute dark app>
            <div class="text-caption">&#169;{{ year }} {{ settings.business.legalName }} All rights reserved.</div>
        </v-footer>
    </v-app>
</template>

<script>
    import { mapState } from 'vuex';

    export default {
        name: 'PlainLayout',
        computed: {
            ...mapState([
                'settings',
            ]),
            year() {
                return new Date().getFullYear();
            }
        },
        created() {
            this.$store.dispatch('initializeSettings');
        }
    }
</script>