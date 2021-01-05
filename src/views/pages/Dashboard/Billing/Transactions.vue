<template>
    <v-row>
        <v-col cols="12">
            <v-data-table
                :headers="headers"
                :items="transactions"
                :loading="isLoadingTransactions"
                :server-items-length="transactionsTotalCount"
                :options.sync="pagination"
                class="elevation-1"
                disable-sort>
                    <template v-slot:[`item.amount`]="{ item }">
                        <span class="font-weight-bold">
                            {{ item.currency }}
                            {{ item.amount / 100 }}
                        </span>
                    </template>
                    <template v-slot:[`item.status`]="{ item }">
                        <span 
                            class="font-weight-medium" 
                            :class="{ 
                                    'green--text text--darken-2': item.status === 'success',
                                    'purple--text text--darken-2': item.status === 'abandoned',
                                    'red--text text--darken-2': item.status === 'failed',
                                }">
                                {{ item.status }}
                        </span>
                    </template>
                    <template v-slot:[`item.channel`]="{ item }">
                        {{ item.channel | inLowerCase }}
                    </template>
                    <template v-slot:[`item.createdAt`]="{ item }">
                        {{ formatDate(item.createdAt, 'verbose') }}
                    </template>
            </v-data-table>
        </v-col>
    </v-row>
</template>

<script>
    import firebase from '@/firebase';
    import 'firebase/functions';

    import moment from 'moment';
    import Case from 'case';

    export default {
        name: 'BillingTransactions',
        data() {
            return {
                headers: [
                    {
                        text: 'ID',
                        value: 'id',
                    },
                    {
                        text: 'Reference',
                        value: 'reference',
                    },
                    {
                        text: 'Amount',
                        value: 'amount',
                    },
                    { 
                        text: 'Status', 
                        value: 'status',
                    },
                    { 
                        text: 'Channel', 
                        value: 'channel',
                    },
                    {
                        text: 'Created At',
                        value: 'createdAt',
                    },
                ],
                transactions: [],
                pagination: {
                    page: 1,
                    itemsPerPage: 10,
                },
                transactionsTotalCount: 0,

                isLoadingTransactions: false,
            };
        },
        watch: {
            pagination: {
                immediate: true,
                deep: true,
                async handler() {
                    await this.loadTransactions();
                }
            },
        },
        methods: {
            async loadTransactions() {
                this.isLoadingTransactions = true;

                try {
                    const fetchCompanyTransactions = firebase.functions()
                                                            .httpsCallable('fetchCompanyTransactions');

                    const transactionsPaginationData = {
                        perPage: this.pagination.itemsPerPage,
                        page: this.pagination.page,
                    };

                    const transactionsData = (await fetchCompanyTransactions({ transactionsPaginationData })).data;

                    this.transactions = transactionsData.data;
                    this.transactionsTotalCount = transactionsData.meta.total;
                } catch (error) {
                    const notification = {
                        message: error.message,
                        context: 'error',
                    };

                    this.$store.commit('push_notification', { notification });
                }

                this.isLoadingTransactions = false;
            },
            formatDate(timestamp, format) {
                if (format === 'verbose') {
                    return moment(timestamp).format("MMMM Do, YYYY h:mm A");
                }
            },
        },
        filters: {
            inLowerCase(string) {
                return Case.lower(string);
            },
        }
    };
</script>

<style scoped>
    .table-top {
        border-bottom: thin solid rgba(0, 0, 0, 0.12);
    }
    .table-bottom {
        border-top: thin solid rgba(0, 0, 0, 0.12);
    }
</style>