<template>
    <div class="d-flex justify-center align-center pa-6" style="width:100%;">
        <v-card
            outlined
            elevation="1"
            color="white" 
            class="px-4 py-6">
                <div class="text-h5 secondary--text text-center pa-4">
                    You Are Not Authorized To Access This Application
                </div>
                <div class="d-flex justify-center pt-2">
                    <v-btn 
                        depressed
                        large
                        color="primary" 
                        @click="logout()">
                            Return Home
                    </v-btn>
                </div>
        </v-card>
    </div>
</template>

<script>
    import firebase from '@/firebase';
    import 'firebase/auth';

    export default {
        name: 'UnauthorizedPage',
        methods: {
            logout() {
                firebase.auth().signOut();
            },
        },  
    };
</script>