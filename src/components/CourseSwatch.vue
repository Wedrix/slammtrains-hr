<template>
    <v-card
        class="rounded-lg">
            <v-img
                :src="course.thumbnail.src"
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
                    :to="`courses/${course.id}`">
                        {{ course.name }}
                </router-link>
            </v-card-title>

            <v-card-subtitle class="pt-1">
                {{ course.overview }}
            </v-card-subtitle>

            <v-divider/>

            <div class="px-4 py-2 d-flex" style="justify-content:space-between;">
                <div>
                    <v-icon small>mdi-book-outline</v-icon>
                    <span class="text-caption">12 lessons</span>
                </div>
                <div>
                    <v-icon small>mdi-clock-outline</v-icon>
                    <span class="text-caption">24 hours</span>
                </div>
            </div>
    </v-card>
</template>

<script>
    export default {
        name: 'CourseSwatch',
        props: ['course']
    };
</script>