<template>
    <v-snackbar 
        top 
        right 
        app 
        v-model="isShowing"
        :color="notification.context"
        :timeout="-1">
            {{ notification.message }}

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
                timer: null,
            };
        },
        computed: {
            notifications() {
                return this.$store.state.notifications;
            },
            notification() {
                return this.$store.state.notification;
            }
        },
        watch: {
            notifications() {
                this.showNextNotification();
            },
            isShowing() {
                this.showNextNotification();
            }
        },
        methods: {
            showNextNotification() {
                if (this.notifications.length > 0) {
                    const showNotification = (notification) => {
                        if (this.timer) {
                            clearTimeout(this.timer);
                        }

                        setTimeout(() => {
                            const timeout = ((notification.timeout === undefined) || (notification.timeout === null)) ? 3000 : notification.timeout;

                            this.$store.commit('set_notification', { notification });

                            this.$store.commit('pop_notification');

                            this.isShowing = true;

                            if (timeout > -1) {
                                this.timer = setTimeout(() => {
                                    this.isShowing = false;
                                }, timeout);
                            }
                        }, 500);
                    };

                    const nextNotification = this.notifications[0];

                    if (nextNotification.tag === this.notification.tag) {
                        showNotification(nextNotification);
                    } else {
                        if (!this.isShowing) {
                            showNotification(nextNotification);
                        }
                    }
                }
            }
        }
    };
</script>