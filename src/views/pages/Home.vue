<template>
    <v-sheet color="background" class="textured-background">
        <v-container fluid>
            <v-row align="center" justify="center" style="min-height:60vh">
                <v-col cols="12" sm="6" md="6" offset-md="1" align-self="center">
                    <div class="text-h4 text-md-h3 font-weight-black white--text">
                        TRAIN YOUR EMPLOYEES IN
                        <div class="d-inline-block">COMPUTER SECURITY</div>
                    </div>
                    <div class="pt-6">
                        <v-btn class="mr-4 mb-4" large dark color="accent2" to="/plans">VIEW PLANS</v-btn>
                        <v-btn to="/signup" class="mr-4 mb-4" large color="accent">TRY OUR FREE PLAN</v-btn>
                    </div>
                </v-col>
                <v-col cols="12" sm="6" md="4" class="mr-auto" align-self="center">
                    <img src="@/assets/business-woman.svg"/>
                </v-col>
            </v-row>
        </v-container>
    </v-sheet>
</template>