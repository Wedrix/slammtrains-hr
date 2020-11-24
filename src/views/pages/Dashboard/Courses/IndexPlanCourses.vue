<template>
    <v-data-iterator
        :items="courses"
        hide-default-footer>
            <template v-slot:default="props">
                <v-row>
                    <v-col
                        v-for="item in props.items"
                        :key="item.id"
                        cols="12"
                        sm="6"
                        md="4"
                        lg="3">
                            <course-swatch :course="item"/>
                    </v-col>
                </v-row>
            </template>
    </v-data-iterator>
</template>

<script>
    import { mapState } from 'vuex';

    import CourseSwatch from '@/components/CourseSwatch';

    export default {
        name: 'PlanCourses',
        components: {
            'course-swatch': CourseSwatch,
        },
        computed: {
            ...mapState([
                'company',
            ]),
            courses() {
                return Array.purify(this.company.plan.courses);
            }
        },
    };
</script>