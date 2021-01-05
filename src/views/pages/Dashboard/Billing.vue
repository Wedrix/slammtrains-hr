<template>
    <v-sheet color="transparent" class="mx-lg-6">
        <v-toolbar
            dark
            rounded
            color="background"
            class="textured-background">
                <v-toolbar-title class="text-h5">
                    Billing
                </v-toolbar-title>
        </v-toolbar>
        <v-toolbar 
            light
            flat
            rounded
            outlined
            height="60">  
                <v-tabs>
                    <v-tab to="/dashboard/settings/billing">Plans</v-tab>
                    <v-tab to="/dashboard/settings/billing/transactions">Transactions</v-tab>
                </v-tabs>
        </v-toolbar>
        <router-view/>
    </v-sheet>
</template>