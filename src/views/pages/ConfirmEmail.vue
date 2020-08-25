<template>
    <v-row align="center" justify="center">
        <v-col cols="12" sm="6" md="5">
            <v-card elevation="12" class="px-2 py-4">
                <div class="d-flex pa-4">
                    <router-link to="/" class="mx-auto">
                        <v-avatar tile width="145" color="white">
                            <img src="@/assets/logo.png"/>
                        </v-avatar>
                    </router-link>
                </div>
                <v-card-text>
                    <v-alert prominent type="info" elevation="2">
                        A verification link has been sent to "{{ email }}". 
                        <br/>Kindly verify the email to proceed.
                    </v-alert>
                </v-card-text>
            </v-card>
        </v-col>
    </v-row>
</template>

<script>
    import firebase from '@/firebase';
    import 'firebase/auth';

    export default {
        data() {
            return {
                email: firebase.auth().currentUser.email,
            };
        }
    };
</script>