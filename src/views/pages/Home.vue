<template>
    <div>
        <v-sheet 
            color="background" 
            class="textured-background"
            width="100%"
            min-height="80vh"
            dark>
                <v-container
                    fluid 
                    style="max-width:1200px;">
                        <v-app-bar color="transparent" flat height="100">
                            <v-avatar tile width="145">
                                <img src="@/assets/logo-mono-white.png"/>
                            </v-avatar>
                            <v-spacer/>
                            <div class="d-none d-md-flex flex-grow-1 justify-end">
                                <router-link
                                    v-for="(link, key) in navigationLinks"
                                    :key="`navigation-link-${key}`"
                                    :to="link.to"
                                    style="text-decoration:none;"
                                    class="px-4">
                                        {{ link.text }}
                                </router-link>
                            </div>
                            <div class="d-none d-md-flex justify-space-between align-center ml-8">
                                <router-link
                                    to="/signin"
                                    style="text-decoration:none;"
                                    class="px-6">
                                        Sign In
                                </router-link>
                                <v-btn to="/signup" rounded depressed color="accent" large>Try A Free Course</v-btn>
                            </div>
                        </v-app-bar>

                        <v-sheet 
                            color="transparent" 
                            class="d-flex flex-column align-center"
                            min-height="60vh"
                            dark>
                                <div class="text-h4 py-12">
                                    The Learning Platform for Businesses
                                </div>
                                <v-container
                                    fluid 
                                    style="max-width:1200px;">
                                        <v-row>
                                            <v-col cols="12" md="5">
                                                <div>
                                                    <div class="text-overline font-weight-bold blue-grey--text text--lighten-3">FOR BUSINESSES OF ANY SIZE</div>
                                                    <div class="text-h5" style="line-height:2.2rem;">
                                                        Professional courses that empower your employees to do more
                                                    </div>
                                                    <div class="pt-4">
                                                        <v-btn to="/signup" rounded depressed color="accent" x-large>Try A Free Course</v-btn>
                                                    </div>
                                                </div>
                                            </v-col>
                                            <v-col cols="12" md="7" class="d-flex justify-end">
                                                <img width="600" src="@/assets/quiz-view.png"/>
                                            </v-col>
                                        </v-row>
                                        <div class="d-flex justify-space-around align-center pt-12 pb-6">
                                            <img 
                                                height="20"
                                                src="@/assets/carbonite.png"/>
                                            <img 
                                                height="40"
                                                src="@/assets/isaca.png"/>
                                            <img 
                                                height="80"
                                                src="@/assets/pearson-vue.png"/>
                                            <img 
                                                height="80"
                                                src="@/assets/iso-quality.png"/>
                                            <img
                                                height="80"
                                                src="@/assets/symantec.png"/>
                                        </div>
                                </v-container>
                        </v-sheet>
                </v-container>
        </v-sheet>

        <v-sheet color="white">
            <v-container
                fluid 
                style="max-width:1600px;min-height:65vh;">
                    <div class="py-10 d-flex flex-column justify-center align-center">
                        <div class="text-overline text-center font-weight-bold secondary--text">IN GOOD COMPANY</div>
                        <div class="text-h4 text-center primary--text">Trusted by many businesses</div>
                        <div class="pt-6 text-center text--secondary" style="max-width:800px;">
                            We are trusted by many companies in the United States and Ghana to keep their employees well trained and informed.
                        </div>
                    </div>
                    <v-row class="py-10">
                        <v-col cols="12" md="4" class="d-flex flex-column align-center justify-center">
                            <v-icon size="60" color="secondary">mdi-book</v-icon>
                            <div class="pt-4 text-h5 primary--text">Comprehensive Courses</div>
                            <div class="pt-3 text-center text--secondary" style="max-width:400px;">
                                Our courses are very comprehensive, designed to be straightforward and concise.
                            </div>
                        </v-col>
                        <v-col cols="12" md="4" class="d-flex flex-column align-center justify-center">
                            <v-icon size="60" color="secondary">mdi-earth</v-icon>
                            <div class="pt-4 text-h5 primary--text">International Standards</div>
                            <div class="pt-3 text-center text--secondary" style="max-width:400px;">
                                Our curriculum follows internationally acclaimed guidelines and the official recommendations
                                of the issuing bodies.
                            </div>
                        </v-col>
                        <v-col cols="12" md="4" class="d-flex flex-column align-center justify-center">
                            <v-icon size="60" color="secondary">mdi-school</v-icon>
                            <div class="pt-4 text-h5 primary--text">Self-paced Learning</div>
                            <div class="pt-3 text-center text--secondary" style="max-width:400px;">
                                Our courses are designed to be self-paced so employees can take the 
                                courses without interference in their work.
                            </div>
                        </v-col>
                    </v-row>
            </v-container>
        </v-sheet>

        <v-sheet class="plain-background">
            <v-container
                fluid 
                style="max-width:1200px;min-height:85vh;"
                class="d-flex flex-column justify-space-around">
                    <div>
                        <v-row>
                            <v-col cols="12" md="5">
                                <div>
                                    <div class="text-overline font-weight-bold secondary--text">GREAT LEARNING EXPERIENCE</div>
                                    <div class="text-h5 primary--text">
                                        Gain surety in your employees' skillset.
                                    </div>
                                    <div class="pt-4 text--secondary" style="max-width:800px;">
                                        We design our curricula with intermittent tests to ensure your employees have understood the course content.
                                    </div>
                                    <div class="pt-4">
                                        <v-btn dark color="accent2" depressed block rounded large>
                                            View Course List
                                        </v-btn>
                                    </div>
                                </div>
                            </v-col>
                            <v-col cols="12" md="6" offset-md="1">
                                <v-img src="@/assets/quiz-view.png"/>
                            </v-col>
                        </v-row>
                    </div>
                    <div class="d-flex justify-center">
                        <div style="max-width:800px;">
                            <div class="text-overline text-center font-weight-bold secondary--text">CUSTOM BILLING</div>
                            <div class="text-h5 text-center primary--text">Enterprise solutions tailored for your specific business needs.</div>
                            <div class="py-4 text-center text--secondary" style="max-width:800px;">
                                Tell us about your specific business needs and we create a custom plan with select courses and custom billing.
                            </div>
                            <div class="d-flex justify-center">
                                <v-btn rounded depressed color="secondary" x-large>Learn More About Custom Billing</v-btn>
                            </div>
                        </div>
                    </div>
            </v-container>
        </v-sheet>

        <v-sheet color="white">
            <v-container
                fluid 
                style="max-width:1600px;min-height:65vh;"
                class="d-flex flex-column align-center py-12">
                    <div class="py-10">
                        <div class="text-overline text-center font-weight-bold secondary--text">Learners Love Us</div>
                        <div class="text-h4 text-center primary--text">Reviews From Some Of Our Learners</div>
                    </div>
                    <v-container
                        fluid 
                        style="max-width:1200px;">
                            <v-row>
                                <v-col 
                                    cols="12" 
                                    md="6" 
                                    class="d-flex justify-center"
                                    v-for="(review, index) in reviews"
                                    :key="`review-${index}`">
                                        <div class="d-flex flex-column">
                                            <div class="pt-3 text--secondary" style="max-width:400px;">
                                                “{{ review.body }}”
                                            </div>
                                            <div class="d-flex align-center py-4">
                                                <v-avatar class="mr-4">
                                                    <v-img :src="review.reviewer.avatarLink"/>
                                                </v-avatar>
                                                <div>
                                                    <div class="text-h6 primary--text">{{ review.reviewer.name }}</div>
                                                    <div class="text-caption text--disabled">{{ review.reviewer.role }}</div>
                                                </div>
                                            </div>
                                        </div>
                                </v-col>
                            </v-row>
                    </v-container>
            </v-container>
        </v-sheet>

        <v-sheet class="plain-background">
            <v-container
                fluid 
                style="max-width:1200px;min-height:40vh;"
                class="d-flex flex-column justify-space-around">
                    <div class="d-flex justify-center">
                        <div style="max-width:800px;">
                            <div class="text-overline text-center font-weight-bold secondary--text">SIGN UP</div>
                            <div class="text-h5 text-center primary--text">It takes less than 2 minutes to get started.</div>
                            <div class="py-4 text-center text--secondary" style="max-width:800px;">
                                Empower your employees to do more.
                            </div>
                            <div class="d-flex justify-center">
                                <v-btn to="/signup" rounded depressed color="secondary" x-large>Sign Up For Free</v-btn>
                            </div>
                        </div>
                    </div>
            </v-container>
        </v-sheet>
    </div>
</template>

<script lang="ts">
    export default {
        name: 'HomePage',
        data() {
            return {
                navigationLinks: [
                    {
                        text: 'Courses',
                        to: '',
                    },
                    {
                        text: 'Plans',
                        to: '',
                    },
                    {
                        text: 'Contact Us',
                        to: '',
                    },
                ],
                reviews: [
                    {
                        body: `Before Slamm I didn’t know which path to take. 
                            My thoughts were scattered trying different resources, 
                            and that resulted in confusion. 
                            Slamm helped first and most importantly to gain clear focus, 
                            to show me the road, and to tell me this is the way, 
                            you have to walk it out but they will hold your hand along the way. 
                            I loved the constant support.`,
                        reviewer: {
                            name: 'Vesna',
                            role: 'Former Student',
                            avatarLink: 'https://firebasestorage.googleapis.com/v0/b/slammtrains-2d580.appspot.com/o/demo%2Fvesna-avatar.jpg?alt=media&token=640571a5-0b25-4d17-9ad4-5d7cde028f0c',
                        }
                    },
                    {
                        body: `Slamm LLC is the best institution to start your career in I.T. 
                            Dr. I. T. and his team are always available to ensure you get quality hands on training. 
                            Your success is their success; you’ll never regret studying with the SLAMMERS🤠`,
                        reviewer: {
                            name: 'Kwame',
                            role: 'Former Student',
                            avatarLink: 'https://firebasestorage.googleapis.com/v0/b/slammtrains-2d580.appspot.com/o/demo%2Fkwame-avatar.jpg?alt=media&token=c7a6521c-1c05-43d9-bd47-bf5e69a2247c',
                        }
                    },
                    {
                        body: `Slamm is the institute that introduced me into the IT program and Cyber Security. 
                            I had little knowledge in IT but now with the help of Slamm I can boldly say 
                            I am now a fulfilled Cyber Security Analyst with great analytical skills and experience in IT. 
                            Thanks to Slamm!`,
                        reviewer: {
                            name: 'Janet',
                            role: 'Former Student',
                            avatarLink: 'https://firebasestorage.googleapis.com/v0/b/slammtrains-2d580.appspot.com/o/demo%2Fjanet-avatar.jpg?alt=media&token=b7c39409-aff4-4d21-82fd-c21fa6130a44',
                        }
                    },
                    {
                        body: `I will always recommend Slamm Technologies to anyone who has interest in becoming an IT professional.
                            They work with you and ensure you get what you need to begin with in all areas of the field.
                            That notwithstanding, they have dedicated instructors and also very considerate and flexible when 
                            it comes to the tuition of the programs they offer and as far as I'm concerned, nothing beats that.`,
                        reviewer: {
                            name: 'Maclean',
                            role: 'Former Student',
                            avatarLink: 'https://firebasestorage.googleapis.com/v0/b/slammtrains-2d580.appspot.com/o/demo%2Fmaclean-avatar.jpg?alt=media&token=451ef871-6c76-44af-b4ff-96282b91357c',
                        }
                    },
                ],
            };
        },
    };
</script>