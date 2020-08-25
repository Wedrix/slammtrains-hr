<template>
    <v-app>
        <v-app-bar app color="white" elevate-on-scroll>
            <v-row align="center" justify="center">
                <v-col cols="6" md="5" offset-md="1">
                    <router-link to="/">
                        <v-avatar tile width="145" color="white">
                            <img src="@/assets/logo.png"/>
                        </v-avatar>
                    </router-link>
                </v-col>
                <v-col cols="6" md="5" class="mr-md-auto">
                    <div class="float-right">
                        <v-btn text to="/signin">SIGN IN</v-btn>
                        <v-btn to="/signup" color="accent" class="ml-sm-4 d-none d-md-inline-flex">TRY OUR FREE PLAN</v-btn>
                    </div>
                </v-col>
            </v-row>
        </v-app-bar>

        <v-main>
            <router-view/>
        </v-main>

        <v-footer app>
        </v-footer>
    </v-app>
</template>