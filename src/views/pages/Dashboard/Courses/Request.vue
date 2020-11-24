<template>
    <v-card>
        <v-form @submit.prevent="addRequestedCourse()" ref="requestCourseForm">
            <v-card-title>
                <span class="headline primary--text">Request A Course</span>
            </v-card-title>
            <v-card-text>
                <v-row>
                    <v-col cols="12">
                        <v-text-field 
                            v-model="requestedCourse.name"
                            label="Course Name" 
                            :rules="[required]"
                            required/>
                    </v-col>
                    <v-col cols="12">
                        <v-textarea
                            v-model="requestedCourse.description"
                            label="Course Description"
                            :rules="[required]"
                            required/>
                    </v-col>
                </v-row>
            </v-card-text>
            <v-card-actions>
                <v-spacer/>
                <v-btn color="primary" type="submit" dark :loading="isAddingRequestedCourse">Request Course</v-btn>
            </v-card-actions>
        </v-form>
    </v-card>
</template>

<script>
    import firebase from '@/firebase';
    import 'firebase/functions';

    import validators from '@/mixins/validators';
    
    import { cloneDeep } from 'lodash';

    const init = {
        requestedCourse: {
            name: '',
            description: '',
        },
    };

    export default {
        name: 'BroadcastEmail',
        mixins: [validators],
        data() {
            return {
                requestedCourse: cloneDeep(init.requestedCourse),
                isAddingRequestedCourse: false,
            };
        },
        methods: {
            async addRequestedCourse() {
                this.isAddingRequestedCourse = true;

                const requestedCourseData = cloneDeep(this.requestedCourse);
                
                try {
                    const requestCourse = firebase.functions()
                                                        .httpsCallable('requestCourse');

                    await requestCourse({ requestedCourseData });

                    const notification = {
                        message: 'Your Course Request Has Been Received.',
                        context: 'success',
                    };

                    this.$store.commit('push_notification', { notification });
                } catch (error) {
                    const notification = {
                        message: error.message,
                        context: 'error',
                    };

                    this.$store.commit('push_notification', { notification });
                }

                this.isAddingRequestedCourse = false;
                this.requestedCourse = cloneDeep(init.requestedCourse);
                this.$refs.requestCourseForm.resetValidation();

                this.$router.push('/dashboard/courses');
            },
        }
    };
</script>