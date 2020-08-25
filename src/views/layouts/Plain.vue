<template>
    <v-app>
        <v-main>
            <v-sheet class="textured-background" color="primary" style="height:100%;">
                <v-container fill-height fluid>
                    <router-view/>
                </v-container>
            </v-sheet>
        </v-main>

        <v-footer class="textured-background" color="primary" dark app>
            <div class="text-caption">&#169;2020 Slamm Technologies</div>
        </v-footer>
    </v-app>
</template>
