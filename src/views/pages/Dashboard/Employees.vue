<template>
    <v-sheet color="transparent" class="mx-lg-6">
        <v-toolbar
            dark
            extended
            rounded
            color="background"
            class="textured-background">
                <v-toolbar-title class="text-h5">
                    Employees
                </v-toolbar-title>
                <template v-slot:extension>
                    <v-dialog v-model="isShowingAddEmployeeForm" persistent max-width="600px">
                        <template v-slot:activator="{ on, attrs }">
                            <v-btn light color="white" class="mr-4" v-bind="attrs" v-on="on">
                                <v-icon left>mdi-plus</v-icon> Add Employee
                            </v-btn>
                        </template>
                        <v-card>
                            <v-form @submit.prevent="addEmployee()">
                                <v-card-title>
                                    <span class="headline">Add An Employee</span>
                                    <v-spacer/>
                                    <v-btn color="primary" @click="isShowingAddEmployeeForm = false;" fab x-small dark>
                                        <v-icon>mdi-close</v-icon>
                                    </v-btn>
                                </v-card-title>
                                <v-card-text>
                                    <v-row>
                                        <v-col cols="12">
                                            <v-text-field 
                                                v-model="newEmployee.name"
                                                label="Employee Name" 
                                                required/>
                                        </v-col>
                                        <v-col cols="12">
                                            <v-text-field 
                                                v-model="newEmployee.email"
                                                label="Employee Email" 
                                                type="email"
                                                required/>
                                        </v-col>
                                    </v-row>
                                </v-card-text>
                                <v-card-actions>
                                    <v-spacer/>
                                    <v-btn color="primary" type="submit" dark :loading="isAddingNewEmployee">Add Employee</v-btn>
                                </v-card-actions>
                            </v-form>
                        </v-card>
                    </v-dialog>
                    <v-dialog v-model="isShowingImportEmployeesForm" persistent max-width="600px">
                        <template v-slot:activator="{ on, attrs }">
                            <v-btn light color="white" class="mr-4" v-bind="attrs" v-on="on">
                                <v-icon left>mdi-download-outline</v-icon> Import Employees
                            </v-btn>
                        </template>
                        <v-card>
                            <v-form @submit.prevent="importEmployees()">
                                <v-card-title>
                                    <span class="headline">Import Employees (CSV)</span>
                                    <v-spacer/>
                                    <v-btn color="primary" @click="isShowingImportEmployeesForm = false;" icon>
                                        <v-icon>mdi-close</v-icon>
                                    </v-btn>
                                </v-card-title>
                                <v-alert
                                    color="primary"
                                    dark
                                    icon="mdi-help-circle-outline"
                                    border="left"
                                    prominent>
                                        <ul>
                                            <li>Only the CSV format is supported.</li> 
                                            <li>You may upload multiple fies at a go.</li> 
                                            <li>The maximum file size allowed is 10 MB.</li>
                                            <li>The notification panel at the bottom right of the page indicates the upload progress for each of the files.</li> 
                                            <li>Kindly refrain from closing the tab or reloading the page until all the files have been uploaded.</li>
                                            <li>The time it takes to complete the upload process depends on the number of records in the files.</li>
                                            <li>The process may take some minutes to complete.</li> 
                                            <li>
                                                <a class="white--text font-weight-bold" style="text-decoration: underline;" :href="sampleCSVFileLink">Download</a> the sample CSV for the expected format.
                                            </li>
                                        </ul>
                                </v-alert>
                                <v-card-text>
                                    <v-file-input 
                                        v-model="employeesCSVs"
                                        :rules="CSVUploadRules"
                                        :key="CSVUploadInputKey" 
                                        multiple 
                                        counter 
                                        show-size 
                                        size-displaying 
                                        small-chips 
                                        accept=".csv"/>
                                </v-card-text>
                                <v-card-actions>
                                    <v-spacer/>
                                    <v-btn color="primary" type="submit" dark :loading="isImportingEmployees">Upload & Import</v-btn>
                                </v-card-actions>
                            </v-form>
                        </v-card>
                    </v-dialog>
                </template>
        </v-toolbar>
        <v-sheet color="transparent">
            <v-row>
                <v-col cols="12" md="3">
                    <v-card
                        light
                        outlined
                        elevation="2"
                        class="pa-4"
                        color="white">
                            <template v-if="planNotSet">
                                <div class="d-flex" style="justify-content:center;align-items:center;min-height:120px;">
                                    <div class="primary--text">Your account has no associated plan!</div>
                                </div>
                            </template>
                            <template v-else>
                                <div class="text-h6">{{ company.plan.name }}:</div>
                                <div class="text-caption">
                                    <strong>{{ employeeLicencesRemaining }}</strong> Employee Licenses remaining
                                </div>
                                <v-btn class="mt-4" color="secondary" block>Upgrade Plan</v-btn>
                            </template>
                        </v-card>
                </v-col>
                <v-col cols="12" md="9">  
                    <v-sheet dark
                        color="primary"
                        class="pa-2 elevation-4 rounded-t">  
                            <v-row no-gutters>
                                <v-col cols="12" sm="3">
                                    <v-select v-model="search.field"
                                        :items="['Name','Email','ID']"
                                        light
                                        flat
                                        solo
                                        hide-details/>
                                </v-col>
                                <v-col cols="12" sm="9">
                                    <v-text-field v-model="search.text"
                                        flat
                                        solo-inverted
                                        hide-details
                                        prepend-inner-icon="mdi-magnify"
                                        :label="`Search Employees by ${search.field}`"/>
                                    <v-spacer/>
                                </v-col>
                            </v-row>
                    </v-sheet>
                    <v-data-table
                        :headers="headers"
                        :items="employees"
                        :loading="isLoadingEmployees"
                        :server-items-length="employeesTotalCount"
                        :sort-by.sync="pagination.sortBy"
                        :sort-desc.sync="pagination.sortDesc"
                        class="elevation-1"
                        must-sort
                        show-select
                        hide-default-footer>
                            <template v-slot:[`item.createdAt`]="{ item }">
                                {{ formatDate(item.createdAt.toMillis(), 'createdAt') }}
                            </template>
                            <template v-slot:[`item.actions`]="{ item }">
                                <v-tooltip top>
                                    <template v-slot:activator="{ on, attrs }">
                                        <v-btn icon 
                                            v-bind="attrs"
                                            v-on="on"
                                            color="red" 
                                            :loading="isRemovingEmployees[item.id]"
                                            @click="removeEmployee(item.id)">
                                                <v-icon small>mdi-close</v-icon>
                                        </v-btn>
                                    </template>
                                    <span>Remove</span>
                                </v-tooltip>
                            </template>
                            <template v-slot:top>
                                <div class="table-top px-6">
                                    <v-row>
                                        <v-col cols="12" md="9"></v-col>
                                        <v-col cols="12" md="3">
                                            <div class="caption text-right">
                                                showing {{ employees.length }} of {{ employeesTotalCount }} results
                                            </div>
                                        </v-col>
                                    </v-row>
                                </div>
                            </template>
                            <template v-slot:footer v-if="(employeesTotalCount !== employees.length) && !isLoadingEmployees">
                                <div class="table-bottom px-6">
                                    <v-row>
                                        <v-col cols="12">
                                            <div style="display:flex;justify-content:space-around;">
                                                <v-btn color="primary"
                                                    text
                                                    @click="loadMoreEmployees()">
                                                        Load More ...
                                                </v-btn>
                                            </div>
                                        </v-col>
                                    </v-row>
                                </div>
                            </template>
                        </v-data-table>
                </v-col>
            </v-row>
        </v-sheet>
    </v-sheet>
</template>

<script>
    import firebase from '@/firebase';
    import 'firebase/auth';
    import 'firebase/functions';
    import 'firebase/firestore';
    import 'firebase/storage';

    import { mapState, mapGetters } from 'vuex';

    import moment from 'moment';
    import { v4 as uuidv4 } from 'uuid';

    const init = {
        newEmployee: {
            email: '',
            name: ''
        }
    };

    export default {
        name: 'Employees',
        data() {
            return {
                headers: [
                    {
                        text: 'Name',
                        value: 'name',
                    },
                    { 
                        text: 'Email', 
                        value: 'email',
                    },
                    { 
                        text: 'Enrolled Courses', 
                        value: 'enrolledCourses.length',
                        sortable: false,
                    },
                    {
                        text: 'Date Added',
                        value: 'createdAt',
                    },
                    {
                        text: 'Actions',
                        value: 'actions',
                        align: 'center',
                        sortable: false,
                    }
                ],
                employees: [],
                pagination: {
                    limit: 30,
                    sortBy: 'createdAt',
                    sortDesc: true,
                    lastDocument: null,
                },

                isShowingAddEmployeeForm: false,
                newEmployee: { ...init.newEmployee },
                isAddingNewEmployee: false,
                search: {
                    field: 'Name',
                    text: '',
                },

                isShowingImportEmployeesForm: false,
                employeesCSVs: [],
                CSVUploadRules: [
                    (file) => {
                        if (file.size > 10000000) {
                            return `The file "${file.name}" should be less than 10 MB!`;
                        }

                        return true;
                    }
                ],
                CSVUploadInputKey: 0,
                isImportingEmployees: false,
                sampleCSVFileLink: 'https://firebasestorage.googleapis.com/v0/b/slammtrains-2d580.appspot.com/o/Employees%20Sample.csv?alt=media&token=50c6dafe-d9e6-46ff-af83-1c793b69b95d',

                isLoadingEmployees: false,
                isRemovingEmployees: {},
            };
        },
        computed: {
            ...mapState([
                'company',
            ]),
            ...mapGetters([
                'hr',
                'employeeLicencesRemaining',
                'planNotSet'
            ]),
            query() {
                const { sortBy, sortDesc, limit } = this.pagination;
                const sortOrder = sortDesc ? 'desc' : 'asc';

                return firebase.firestore()
                                .collection(`companies/${this.company.id}/employees`)
                                .orderBy(sortBy, sortOrder)
                                .limit(limit);
            },
            employeesTotalCount() {
                if (this.company) {
                    return this.company.employeesTotalCount;
                }

                return null;
            }
        },
        watch: {
            query: {
                immediate: true,
                async handler() {
                    await this.loadEmployees();
                }
            }
        },
        methods: {
            async addEmployee() {
                this.isAddingNewEmployee = true;

                const employeeData = JSON.parse(JSON.stringify(this.newEmployee));
                
                try {
                    const addEmployee = firebase.functions().httpsCallable('addEmployee');
                    const newEmployee = JSON.parse(JSON.stringify(this.newEmployee));

                    await addEmployee({ employeeData });

                    await this.loadEmployees();

                    const notification = {
                        message: 'Employee Successfully Added',
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

                this.isAddingNewEmployee = false;
                this.isShowingAddEmployeeForm = false;
                this.newEmployee = { ...init.newEmployee };
            },
            async importEmployees() {
                this.isImportingEmployees = true;

                this.employeesCSVs.forEach((file, index) => {
                    const fileId = `${uuidv4()}_${file.name}`;
                    const ref = `companies/${this.company.id}/employees` + `/${fileId}`;
                    const storageRef = firebase.storage().ref();

                    const metadata = {
                        contentType: file.type,
                    };

                    const uploadTask = storageRef.child(ref).put(file, metadata);
                    
                    uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED, snapshot => {
                        const percentUploadProgress = ((snapshot.bytesTransferred / snapshot.totalBytes) * 100);

                        const notification = {
                            message: `${file.name} upload progress: ${percentUploadProgress}%`,
                            context: 'info',
                        };

                        this.$store.commit('push_notification', { notification });
                    }, error => {
                        const notification = {
                            message: error.message,
                            context: 'error',
                        };

                        this.$store.commit('push_notification', { notification });
                    });                 
                });
        
                const unwatch = this.$watch('employeesTotalCount', async (newEmployeesTotalCount, oldEmployeesTotalCount) => {
                    if (newEmployeesTotalCount !== oldEmployeesTotalCount) {

                        unwatch();

                        await this.loadEmployees();
                    }
                });

                this.isLoadingEmployees = true;

                this.employeesCSVs = [];
                this.isShowingImportEmployeesForm = false;
                this.isImportingEmployees = false;
            },
            async loadEmployees() {
                this.isLoadingEmployees = true;

                await this.query
                        .get()
                        .then(querySnapshot => {
                            this.pagination.lastDocument = querySnapshot.docs[querySnapshot.size - 1];

                            const employees = [];

                            querySnapshot.forEach(documentSnapshot => {
                                const employee = {
                                    id: documentSnapshot.id,
                                    ...documentSnapshot.data(),
                                };

                                employees.push(employee);
                            });

                            this.employees = employees;
                        });

                this.isLoadingEmployees = false
            },
            async loadMoreEmployees() {
                this.isLoadingEmployees = true;

                const lastDocument = this.pagination.lastDocument;

                await this.query
                        .startAfter(lastDocument)
                        .get()
                        .then(querySnapshot => {
                            this.pagination.lastDocument = querySnapshot.docs[querySnapshot.size - 1];

                            const newEmployees = [];
                            
                            querySnapshot.forEach(documentSnapshot => {
                                const employee = {
                                    id: documentSnapshot.id,
                                    ...documentSnapshot.data(),
                                };

                                newEmployees.push(employee);
                            });

                            this.employees = this.employees.concat(newEmployees);
                        });

                this.isLoadingEmployees = false
            },
            formatDate(timestamp, format) {
                if (format === 'createdAt') {
                    return moment(timestamp).format("MMMM Do, YYYY h:mm a");
                }
            },
            async removeEmployee(employeeId) {
                this.$set(this.isRemovingEmployees, employeeId, true);

                try {
                    const removeEmployee = firebase.functions().httpsCallable('removeEmployee');

                    await removeEmployee({ employeeId });

                    await this.loadEmployees();
                } catch (error) {
                    const notification = {
                        message: error.message,
                        context: 'error',
                    };

                    this.$store.commit('push_notification', { notification });
                }

                this.$set(this.isRemovingEmployees, employeeId, false);
            }
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