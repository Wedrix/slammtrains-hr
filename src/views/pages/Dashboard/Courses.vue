<template>
    <v-sheet color="transparent" class="mx-lg-6">
        <v-toolbar
            dark
            extended
            rounded
            color="background"
            class="textured-background">
                <v-toolbar-title class="text-h5">
                    Courses
                </v-toolbar-title>
                <template v-slot:extension>
                    <v-btn light color="white" class="mr-4">
                        <v-icon left>mdi-clipboard-list-outline</v-icon> Request A Course
                    </v-btn>
                </template>
        </v-toolbar>
        <v-sheet color="transparent">
            <v-row>
                <v-col cols="12" md="3">
                    <v-card 
                        light
                        outlined
                        elevation="2"
                        class="pa-4"
                        color="white">
                            <div>
                                <div class="text-h6">{{ company.plan.name }}:</div>
                                <div class="text-caption pb-2">
                                    <strong>{{ company.plan.courses.length }}</strong> licensed courses
                                </div>
                                <v-divider/>
                                <v-list two-line light color="transparent">
                                    <template 
                                        v-for="(course, index) in company.plan.courses">
                                            <v-list-item :key="course.id">
                                                <v-list-item-avatar v-if="course.thumbnail">
                                                    <v-img :src="course.thumbnail.src"/>
                                                </v-list-item-avatar>

                                                <v-list-item-content>
                                                    <v-list-item-title>{{ course.name }}</v-list-item-title>
                                                    <v-list-item-subtitle>
                                                        <div class="d-flex">
                                                            <div class="pt-1 mr-3">
                                                                <v-icon small>mdi-book-outline</v-icon>
                                                                <span class="text-caption">12 modules</span>
                                                            </div>
                                                            <div class="pt-1 mr-3">
                                                                <v-icon small>mdi-clock-outline</v-icon>
                                                                <span class="text-caption">24 hours</span>
                                                            </div>
                                                        </div>
                                                    </v-list-item-subtitle>
                                                </v-list-item-content>
                                            </v-list-item>

                                            <v-divider :key="`divider-${index}`" inset/>
                                        </template>
                                </v-list>
                            </div>
                            <v-btn class="mt-4" color="secondary" block>Upgrade Plan</v-btn>
                    </v-card>
                </v-col>
                <v-col cols="12" md="9">    
                    <v-sheet dark
                        color="primary"
                        class="pa-2 elevation-4 rounded-t">  
                            <v-row no-gutters>
                                <v-col cols="12" sm="3">
                                    <v-select v-model="search.field"
                                        :items="['Title','ID']"
                                        light
                                        flat
                                        solo
                                        hide-details/>
                                </v-col>
                                <v-col cols="12" sm="9">
                                    <v-text-field v-model="search.text"
                                        flat
                                        solo-inverted
                                        hide-details
                                        prepend-inner-icon="mdi-magnify"
                                        :label="`Search Courses by ${search.field}`"/>
                                    <v-spacer/>
                                </v-col>
                            </v-row>
                    </v-sheet>
                    <v-toolbar 
                        light
                        flat
                        rounded
                        outlined
                        height="60">  
                            <v-tabs v-model="tab">
                                <v-tab>All Courses</v-tab>
                                <v-tab>Workplace Security</v-tab>
                                <v-tab>Soft Skills</v-tab>
                                <v-tab>Microsoft Suite</v-tab>
                            </v-tabs>
                    </v-toolbar>
                    <v-data-iterator
                        :items="courses"
                        :items-per-page.sync="itemsPerPage"
                        hide-default-footer>
                            <template v-slot:default="props">
                                <v-row>
                                    <v-col
                                        v-for="item in props.items"
                                        :key="item.name"
                                        cols="12"
                                        sm="6"
                                        md="4"
                                        lg="3">
                                            <v-card
                                                class="rounded-lg"
                                                max-width="300">
                                                    <v-img
                                                        :src="item.thumbnail.src"
                                                        height="150px">
                                                            <div class="fill-height" style="position:relative;">
                                                                <v-chip dark style="position:absolute;top:10;right:10;"
                                                                    color="accent"
                                                                    label>
                                                                        New
                                                                </v-chip>
                                                            </div>
                                                    </v-img>

                                                    <v-card-title>
                                                        <router-link 
                                                            class="d-inline-block text-truncate" 
                                                            style="text-decoration:none;" 
                                                            :to="`courses/${item.id}`">
                                                                {{ item.name }}
                                                        </router-link>
                                                    </v-card-title>

                                                    <v-card-subtitle class="pt-1">
                                                        {{ item.overview }}
                                                    </v-card-subtitle>

                                                    <v-divider/>

                                                    <div class="px-4 py-2 d-flex" style="justify-content:space-between;">
                                                        <div>
                                                            <v-icon small>mdi-book-outline</v-icon>
                                                            <span class="text-caption">12 modules</span>
                                                        </div>
                                                        <div>
                                                            <v-icon small>mdi-clock-outline</v-icon>
                                                            <span class="text-caption">24 hours</span>
                                                        </div>
                                                    </div>
                                            </v-card>
                                    </v-col>
                                </v-row>
                            </template>
                    </v-data-iterator>
                </v-col>
            </v-row>
        </v-sheet>
    </v-sheet>
</template>

<script>
    import firebase from '@/firebase';
    import 'firebase/auth';
    import 'firebase/functions';
    import 'firebase/firestore';

    import { mapState, mapGetters } from 'vuex';

    export default {
        name: 'Courses',
        data() {
            return {
                tab: 0,
                courses: [],
                itemsPerPage: 10,
                search: {
                    field: 'Title',
                    text: '',
                }
            };
        },
        computed: {
            ...mapState([
                'company',
            ]),
            ...mapGetters([
                'hr',
            ])
        },
        firestore() {
            return {
                courses: firebase.firestore().collection(`courses`),
            };
        }
    };
</script>