<template>
    <div>
        <v-sheet dark
            color="primary"
            class="pa-2 elevation-4 rounded-t">  
                <v-row no-gutters>
                    <v-col cols="12" sm="3">
                        <v-select v-model="search.field"
                            :items="[
                                {
                                    text: 'Name', 
                                    value: '__name',
                                },
                            ]"
                            :item-value="item => item"
                            light
                            flat
                            solo
                            hide-details/>
                    </v-col>
                    <v-col cols="12" sm="9">
                        <v-text-field 
                            v-model="search.term"
                            flat
                            solo-inverted
                            hide-details
                            clearable
                            prepend-inner-icon="mdi-magnify"
                            type="search"
                            :label="`Search Courses by ${search.field.text}`"/>
                        <v-spacer/>
                    </v-col>
                </v-row>
        </v-sheet>
        <v-data-iterator
            :items="courses"
            :loading="isLoadingCourses"
            :server-items-length="pagination.itemsTotalCount"
            :sort-by.sync="pagination.sortBy"
            :sort-desc.sync="pagination.sortDesc"
            must-sort
            hide-default-footer>
                <template v-slot:header>
                    <v-sheet color="white" style="border: thin solid rgba(0, 0, 0, 0.12) !important">
                        <div class="table-top px-6">
                            <v-row>
                                <v-col cols="12" md="9"></v-col>
                                <v-col cols="12" md="3" class="d-flex align-center justify-end">
                                    <v-tooltip left>
                                        <template v-slot:activator="{ on, attrs }">
                                            <v-btn 
                                                v-on="on"
                                                v-bind="attrs"
                                                class="mr-2" 
                                                color="secondary" 
                                                icon 
                                                small
                                                @click="reloadCourses()"
                                                :loading="isReloadingCourses">
                                                    <v-icon>mdi-refresh</v-icon>
                                            </v-btn>
                                        </template>
                                        <span>Reload</span>
                                    </v-tooltip>
                                    <div class="caption text-right">
                                        showing {{ courses.length }} of {{ pagination.itemsTotalCount }} results
                                    </div>
                                </v-col>
                            </v-row>
                        </div>
                    </v-sheet>
                </template>
                <template v-slot:default="props">
                    <v-row>
                        <v-col
                            v-for="item in props.items"
                            :key="item.id"
                            cols="12"
                            sm="6"
                            md="4"
                            lg="3">
                                <course-swatch 
                                    :course="item"
                                    :label="courseIsInCurrentPlan(item.id) ? 'In Your Current Plan' : undefined"/>
                        </v-col>
                    </v-row>
                </template>
                <template v-slot:footer v-if="(pagination.itemsTotalCount !== courses.length) && !isLoadingCourses">
                    <div class="table-bottom px-6">
                        <v-row>
                            <v-col cols="12">
                                <div style="display:flex;justify-content:space-around;">
                                    <v-btn color="primary"
                                        text
                                        @click="loadMoreCourses()">
                                            Load More ...
                                    </v-btn>
                                </div>
                            </v-col>
                        </v-row>
                    </div>
                </template>
        </v-data-iterator>
    </div>
</template>

<script>
    import firebase from '@/firebase';
    import 'firebase/firestore';

    import Case from 'case';
    import { cloneDeep } from 'lodash';
    import { debounce } from 'debounce';

    import { mapState } from 'vuex';

    import CourseSwatch from '@/components/CourseSwatch';

    const init = {
        search: {
            field: {
                text: 'Name',
                value: '__name'
            },
            term: '',
        },
        pagination: {
            limit: 30,
            sortBy: 'createdAt',
            sortDesc: true,
            lastDocument: null,
        },
    };

    export default {
        name: 'Courses',
        components: {
            'course-swatch': CourseSwatch,
        },
        data() {
            return {
                courses: [],
                pagination: cloneDeep(init.pagination),
                coursesCounter: {
                    totalCount: 0,
                },

                isLoadingCourses: false,
                isReloadingCourses: false,
                
                search: cloneDeep(init.search),
            };
        },
        computed: {
            query() {
                const { sortBy, sortDesc, limit } = this.pagination;
                const sortOrder = sortDesc ? 'desc' : 'asc';

                return firebase.firestore()
                                .collection('courses')
                                .orderBy(sortBy, sortOrder)
                                .limit(limit);
            },
            ...mapState([
                'company',
            ]),
        },
        watch: {
            query: {
                immediate: true,
                async handler() {
                    this.search = cloneDeep(init.search);

                    await this.loadCourses();
                },
            },
            search: {
                deep: true,
                async handler(search) {
                    if (search.term) {
                        if (search.term.length > 3) {
                            await this.searchCourses();
                        }
                    }
                    else {
                        await this.loadCourses();
                    }
                },
            },
        },
        methods: {
            async reloadCourses() {
                this.isReloadingCourses = true;

                await this.loadCourses();

                this.isReloadingCourses = false;
            },
            async loadCourses() {
                this.isLoadingCourses = true;

                this.courses = await this.fetchCourses(this.query);

                this.pagination.itemsTotalCount = this.coursesCounter.totalCount;

                this.isLoadingCourses = false;
            },
            async loadMoreCourses() {
                this.isLoadingCourses = true;

                const lastDocument = this.pagination.lastDocument;

                const query = this.query.startAfter(lastDocument);

                const newCourses = await this.fetchCourses(query);

                this.courses = this.courses.concat(newCourses);

                this.isLoadingCourses = false;
            },
            searchCourses: debounce(async function () {
                this.isLoadingCourses = true;

                const searchTerm = Case.lower(this.search.term);
                const searchField = this.search.field.value;

                const query = firebase.firestore()
                                    .collection('courses')
                                    .orderBy(searchField)
                                    .startAt(searchTerm)
                                    .endAt(searchTerm + "\uf8ff");

                this.courses = await this.fetchCourses(query);

                this.pagination.itemsTotalCount = this.courses.length;

                this.isLoadingCourses = false;
            }, 300),
            async fetchCourses(query) {
                return await query
                                .get()
                                .then(querySnapshot => {
                                    this.pagination.lastDocument = querySnapshot.docs[querySnapshot.size - 1];

                                    const courses = [];

                                    querySnapshot.forEach(documentSnapshot => {
                                        const course = {
                                            id: documentSnapshot.id,
                                            ...documentSnapshot.data(),
                                        };

                                        courses.push(course);
                                    });

                                    return courses;
                                });
            },
            courseIsInCurrentPlan(courseId) {
                if (this.company.plan) {
                    return (Array.purify(this.company.plan.courses)).find(course => {
                        return course.id === courseId;
                    }) !== undefined;
                }

                return false;
            },
        },
        firestore: {
            coursesCounter: firebase.firestore().doc('__documentCounters/courses'),
        }
    };
</script>