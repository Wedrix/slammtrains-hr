<template>
    <v-card>
        <v-form @submit.prevent="addCourseRequest()" ref="courseRequestForm">
            <v-card-title>
                <span class="headline primary--text">Request A Course</span>
            </v-card-title>
            <v-card-text>
                <v-row>
                    <v-col cols="12">
                        <v-text-field 
                            v-model="courseRequest.courseName"
                            label="Course Name" 
                            :rules="[required]"
                            required/>
                    </v-col>
                    <v-col cols="12">
                        <v-textarea
                            v-model="courseRequest.details"
                            label="Request Details"
                            :rules="[required]"
                            required/>
                    </v-col>
                </v-row>
            </v-card-text>
            <v-card-actions>
                <v-spacer/>
                <v-btn 
                    color="primary" 
                    type="submit" 
                    dark 
                    :loading="isAddingCourseRequest">
                        Request Course
                </v-btn>
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
        courseRequest: {
            courseName: '',
            details: '',
        },
    };

    export default {
        name: 'BroadcastEmail',
        mixins: [validators],
        data() {
            return {
                courseRequest: cloneDeep(init.courseRequest),
                isAddingCourseRequest: false,
            };
        },
        methods: {
            async addCourseRequest() {
                if (!this.$refs.courseRequestForm.validate()) {
                    return;
                }

                this.isAddingCourseRequest = true;

                const courseRequestData = cloneDeep(this.courseRequest);
                
                try {
                    const requestCourse = firebase.functions()
                                                        .httpsCallable('requestCourse');

                    await requestCourse({ courseRequestData });

                    const notification = {
                        message: 'Your Course Request Has Been Received.',
                        context: 'success',
                    };

                    this.$store.commit('push_notification', { notification });

                    this.courseRequest = cloneDeep(init.courseRequest);
                    this.$refs.courseRequestForm.resetValidation();
                } catch (error) {
                    const notification = {
                        message: error.message,
                        context: 'error',
                    };

                    this.$store.commit('push_notification', { notification });
                }

                this.isAddingCourseRequest = false;
            },
        },
    };
</script>