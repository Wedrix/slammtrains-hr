<template>
    <v-snackbar top right app 
        v-model="isShowing"
        :color="active.context"
        :timeout="-1">
            {{ active.message }}

            <template v-slot:action="{ attrs }">
                <v-btn dark text 
                    v-bind="attrs" 
                    @click="isShowing = false">
                        Close
                </v-btn>
            </template>
    </v-snackbar>
</template>

<script>
    export default {
        name: 'Notification',
        data() {
            return {
                isShowing: false,
                active: {
                    context: 'info',
                    message: '',
                },
                timer: null,
            };
        },
        computed: {
            notifications() {
                return this.$store.state.notifications;
            }
        },
        watch: {
            notifications() {
                if (!this.isShowing) {
                    this.showNextNotification();
                }
            },
            isShowing(isShowing) {
                if (!isShowing) {
                    this.showNextNotification();
                }
            }
        },
        methods: {
            showNextNotification() {
                if (this.timer) {
                    clearTimeout(this.timer);
                }
                
                if (this.notifications.length > 0) {
                    setTimeout(() => {
                        const notification = this.notifications[0];
                        const timeout = notification.timeout ? notification.timeout : 5000;

                        this.active = {
                            context: notification.context,
                            message: notification.message
                        };

                        this.$store.commit('pop_notification');

                        this.isShowing = true;

                        this.timer = setTimeout(() => {
                            this.isShowing = false;
                        }, timeout);
                    }, 500);
                }
            }
        }
    };
</script>