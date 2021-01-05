<template>
    <v-card
        outlined
        elevation="1"
        color="white"
        class="rounded-lg">
            <v-img
                :src="course.thumbnail.src"
                height="150px">
                    <div v-if="isNew" class="lightbox fill-height" style="position:relative;">
                        <v-chip 
                            small
                            dark 
                            label
                            style="position:absolute;top:5px;right:5px;"
                            color="white"
                            text-color="primary">
                                <span class="font-weight-medium">NEW</span>
                        </v-chip>
                    </div>
            </v-img>

            <v-card-title>
                <router-link 
                    class="d-inline-block text-truncate" 
                    style="text-decoration:none;" 
                    :to="`courses/${course.id}`">
                        {{ course.name }}
                </router-link>
            </v-card-title>

            <v-card-subtitle class="pt-1">
                <div class="three-line-clamped">
                    {{ course.overview }}
                </div>
            </v-card-subtitle>

            <v-card-text>
                <div class="d-flex justify-space-between">
                    <div class="text-overline primary--text">{{ formatDate(course.createdAt) }}</div>
                    <v-chip
                        class="label mt-2"
                        color="white"
                        text-color="secondary"
                        label
                        small
                        :style="{ 'visibility': label ? 'visible' : 'hidden' }">
                            <strong>{{ label }}</strong>
                    </v-chip>
                </div>
            </v-card-text>

            <v-divider/>

            <div class="px-4 py-2 d-flex" style="justify-content:space-between;">
                <div>
                    <v-icon color="primary" class="mr-1" small>mdi-book-outline</v-icon>
                    <span class="text-caption">{{ courseModuleCount }} module(s)</span>
                </div>
                <div>
                    <v-icon color="primary" class="mr-1" small>mdi-timer-outline</v-icon>
                    <span class="text-caption">{{ courseDurationInSeconds | toTimer }}</span>
                </div>
            </div>
    </v-card>
</template>

<script>
    import moment from 'moment';

    export default {
        name: 'CourseSwatch',
        props: ['course', 'label'],
        computed: {
            courseDurationInSeconds() {
                return this.course.modules.reduce((total, courseModule) => {
                    return this.computeCourseModuleDurationInSeconds(courseModule);
                }, 0);
            },
            courseModuleCount() {
                let courseModuleCount = 0;

                for (const courseModule in this.course.modules) {
                    courseModuleCount++;
                }

                return courseModuleCount;
            },
            isNew() {
                if (this.settings.daysToOld) {
                    return moment().isBefore(moment(this.course.createdAt).add(this.settings.daysToOld,'days'));
                }

                return false;
            },
            settings() {
                return this.$store.state.settings.course;
            },
        },
        methods: {
            computeCourseModuleDurationInSeconds(courseModule) {
                const durationInSeconds = (courseModule.lessons.reduce((total, currentModule) => {
                                            return total + currentModule.durationInSeconds;
                                        }, 0));

                return durationInSeconds;
            },
            formatDate(timestamp) {
                return moment(timestamp).format("DD/MM/YY");
            },
        },
        filters: {
            toTimer(durationInSeconds) {
                const seconds = (durationInSeconds % 60);
                const minutes = (Math.floor(durationInSeconds / 60));

                let secondsString = seconds.toString();
                let minutesString = minutes.toString();

                if (secondsString.length === 1) {
                    secondsString = `0${secondsString}`;
                }

                if (minutesString.length === 1) {
                    minutesString = `0${minutesString}`;
                }

                return `${minutesString}:${secondsString}`;
            },
        }
    };
</script>

<style scoped>
    .three-line-clamped {
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        line-height: 1.375rem;
        height: 4.2rem;
        -webkit-line-clamp: 3; /* number of lines to show */
        -webkit-box-orient: vertical;
    }
    .label::before {
        opacity: 0.12;
    }
    .lightbox {
        box-shadow: 0 0 20px inset rgba(0, 0, 0, 0.2);
        background-image: linear-gradient(to top, rgba(0, 0, 0, 0.4) 0%, transparent 72px);
    }
</style>