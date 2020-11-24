<template>
    <div>
        <v-sheet dark
            color="primary"
            class="pa-2 elevation-4 rounded-t">  
                <v-row no-gutters>
                    <v-col cols="12" sm="3">
                        <v-select 
                            v-model="search.field"
                            :items="[
                                {
                                    text: 'Name', 
                                    value: '__name',
                                },
                                {
                                    text: 'Email', 
                                    value: 'email',
                                },
                            ]"
                            :item-value="item => item"
                            light
                            flat
                            solo
                            hide-details/>
                    </v-col>
                    <v-col cols="12" sm="9">
                        <v-text-field 
                            v-model="search.term"
                            flat
                            solo-inverted
                            hide-details
                            clearable
                            prepend-inner-icon="mdi-magnify"
                            type="search"
                            :label="`Search Employees by ${search.field.text}`"/>
                        <v-spacer/>
                    </v-col>
                </v-row>
        </v-sheet>
        <v-data-table
            :headers="headers"
            :items="employees"
            :loading="isLoadingEmployees"
            :server-items-length="pagination.itemsTotalCount"
            :sort-by.sync="pagination.sortBy"
            :sort-desc.sync="pagination.sortDesc"
            class="elevation-1"
            must-sort
            hide-default-footer>
                <template v-slot:[`item.enrolledCourses`]="{ item }">
                    {{ getEmployeeTotalCoursesEnrolled(item.enrolledCourses) }}
                </template>
                <template v-slot:[`item.createdAt`]="{ item }">
                    {{ formatDate(item.createdAt, 'createdAt') }}
                </template>
                <template v-slot:[`item.actions`]="{ item }">
                    <v-tooltip top>
                        <template v-slot:activator="{ on, attrs }">
                            <v-btn icon 
                                v-bind="attrs"
                                v-on="on"
                                color="primary" 
                                @click="viewEmployeeProgress(item)">
                                    <v-icon small>mdi-chart-bubble</v-icon>
                            </v-btn>
                        </template>
                        <span>View Progress</span>
                    </v-tooltip>
                    <v-tooltip top>
                        <template v-slot:activator="{ on, attrs }">
                            <v-btn icon 
                                v-bind="attrs"
                                v-on="on"
                                color="purple" 
                                :loading="isRegeneratingEmployeesSignInLink[item.id]"
                                @click="regenerateEmployeeSignInLink(item)">
                                    <v-icon small>mdi-key</v-icon>
                            </v-btn>
                        </template>
                        <span>Regenerate Sign In Link</span>
                    </v-tooltip>
                    <v-tooltip top>
                        <template v-slot:activator="{ on, attrs }">
                            <v-btn icon 
                                v-bind="attrs"
                                v-on="on"
                                color="red" 
                                :loading="isRemovingEmployees[item.id]"
                                @click="removeEmployee(item)">
                                    <v-icon small>mdi-close</v-icon>
                            </v-btn>
                        </template>
                        <span>Remove</span>
                    </v-tooltip>
                </template>
                <template v-slot:top>
                    <div class="table-top px-6">
                        <v-row align="center">
                            <v-col cols="12" md="9">
                                <v-btn 
                                    outlined
                                    color="secondary" 
                                    class="mr-4"
                                    @click="isShowingAddEmployeeDialog = true;">
                                        <v-icon left small>mdi-plus</v-icon>
                                        Add An Employee
                                </v-btn>
                                <v-btn 
                                    outlined
                                    color="secondary" 
                                    class="mr-4"
                                    @click="isShowingImportEmployeesDialog = true;">
                                        <v-icon left small>mdi-file-import-outline</v-icon>
                                        Import Employees
                                </v-btn>
                            </v-col>
                            <v-col cols="12" md="3" class="d-flex align-center justify-end">
                                <v-tooltip left>
                                    <template v-slot:activator="{ on, attrs }">
                                        <v-btn 
                                            v-on="on"
                                            v-bind="attrs"
                                            class="mr-2" 
                                            color="secondary" 
                                            icon 
                                            small
                                            @click="reloadEmployees()"
                                            :loading="isReloadingEmployees">
                                                <v-icon>mdi-refresh</v-icon>
                                        </v-btn>
                                    </template>
                                    <span>Reload</span>
                                </v-tooltip>
                                <div class="caption text-right">
                                    showing {{ employees.length }} of {{ pagination.itemsTotalCount }} results
                                </div>
                            </v-col>
                        </v-row>
                    </div>
                </template>
                <template v-slot:footer v-if="(pagination.itemsTotalCount !== employees.length) && !isLoadingEmployees">
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
        <v-dialog 
            v-model="isShowingAddEmployeeDialog" 
            max-width="600" 
            persistent>
                <v-card>
                    <v-form @submit.prevent="addEmployee()" ref="addEmployeeForm">
                        <v-card-title>
                            <span class="headline">Add An Employee</span>
                            <v-spacer/>
                            <v-btn 
                                color="primary" 
                                @click="isShowingAddEmployeeDialog = false;"
                                icon>
                                    <v-icon>mdi-close</v-icon>
                            </v-btn>
                        </v-card-title>
                        <v-card-text>
                            <v-row>
                                <v-col cols="12">
                                    <v-text-field 
                                        v-model="newEmployee.name"
                                        label="Employee Name" 
                                        :rules="[required]"
                                        required/>
                                </v-col>
                                <v-col cols="12">
                                    <v-text-field 
                                        v-model="newEmployee.email"
                                        label="Employee Email" 
                                        :rules="[required]"
                                        type="email"
                                        required/>
                                </v-col>
                            </v-row>
                        </v-card-text>
                        <v-card-actions>
                            <v-spacer/>
                            <v-btn color="primary" type="submit" dark :loading="isAddingEmployee">Add Employee</v-btn>
                        </v-card-actions>
                    </v-form>
                </v-card>
        </v-dialog>
        <v-dialog
            v-model="isShowingImportEmployeesDialog"
            max-width="600"
            persistent>
                <v-card>
                    <v-form @submit.prevent="importEmployees()" ref="importEmployeesForm">
                        <v-card-title>
                            <span class="headline">Import Employees (CSV)</span>
                            <v-spacer/>
                            <v-btn 
                                color="primary" 
                                @click="isShowingImportEmployeesDialog = false;" 
                                icon>
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
                                :rules="[nonEmpty, minFileSize(10)]"
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
    </div>
</template>

<script>
    import firebase from '@/firebase';
    import 'firebase/functions';
    import 'firebase/firestore';
    import 'firebase/storage';

    import validators from '@/mixins/validators';

    import { v4 as uuidv4 } from 'uuid';

    import Case from 'case';
    import { cloneDeep } from 'lodash';
    import { debounce } from 'debounce';

    import { mapState } from 'vuex';

    import moment from 'moment';

    const init = {
        newEmployee: {
            email: '',
            name: '',
        },
        search: {
            field: {
                text: 'Name',
                value: '__name'
            },
            term: '',
        },
        pagination: {
            limit: 30,
            sortBy: 'createdAt',
            sortDesc: true,
            lastDocument: null,
        },
    };

    export default {
        name: 'Employees',
        mixins: [validators],
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
                        text: 'Total Courses Enrolled', 
                        value: 'enrolledCourses',
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
                pagination: cloneDeep(init.pagination),

                search: cloneDeep(init.search),

                isLoadingEmployees: false,
                isReloadingEmployees: false,
                isRemovingEmployees: {},
                isRegeneratingEmployeesSignInLink: {},

                newEmployee: cloneDeep(init.newEmployee),
                isAddingEmployee: false,
                isShowingAddEmployeeDialog: false,

                isShowingImportEmployeesDialog: false,
                employeesCSVs: [],
                CSVUploadInputKey: 0,
                isImportingEmployees: false,
                sampleCSVFileLink: 'https://firebasestorage.googleapis.com/v0/b/slammtrains-2d580.appspot.com/o/Employees%20Sample.csv?alt=media&token=50c6dafe-d9e6-46ff-af83-1c793b69b95d',
            };
        },
        computed: {
            ...mapState([
                'company',
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
                    this.search = cloneDeep(init.search);

                    await this.loadEmployees();
                },
            },
            search: {
                deep: true,
                async handler(search) {
                    if (search.term) {
                        if (search.term.length > 3) {
                            await this.searchEmployees();
                        }
                    }
                    else {
                        await this.loadEmployees();
                    }
                },
            },
            isShowingAddEmployeeDialog() {
                this.newEmployee = cloneDeep(init.newEmployee);
                this.isAddingEmployee = false;

                if (this.$refs.addEmployeeForm) {
                    this.$refs.addEmployeeForm.resetValidation();
                }
            },
            isShowingImportEmployeesDialog() {
                if (this.$refs.importEmployeesForm) {
                    this.$refs.importEmployeesForm.resetValidation();
                }
            },
        },
        methods: {
            async reloadEmployees() {
                this.isReloadingEmployees = true;

                await this.loadEmployees();

                this.isReloadingEmployees = false;
            },
            async loadEmployees() {
                this.isLoadingEmployees = true;

                this.employees = await this.fetchEmployees(this.query);

                this.pagination.itemsTotalCount = this.employeesTotalCount;

                this.isLoadingEmployees = false;
            },
            async loadMoreEmployees() {
                this.isLoadingEmployees = true;

                const lastDocument = this.pagination.lastDocument;

                const query = this.query.startAfter(lastDocument);

                const newEmployees = await this.fetchEmployees(query);

                this.employees = this.employees.concat(newEmployees);

                this.isLoadingEmployees = false;
            },
            searchEmployees: debounce(async function () {
                this.isLoadingEmployees = true;

                const searchTerm = Case.lower(this.search.term);
                const searchField = this.search.field.value;

                const query = firebase.firestore()
                                    .collection(`companies/${this.company.id}/employees`)
                                    .orderBy(searchField)
                                    .startAt(searchTerm)
                                    .endAt(searchTerm + "\uf8ff");

                this.employees = await this.fetchEmployees(query);

                this.pagination.itemsTotalCount = this.employees.length;

                this.isLoadingEmployees = false;
            }, 300),
            async fetchEmployees(query) {
                return await query
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

                                    return employees;
                                });
            },
            formatDate(timestamp, format) {
                if (format === 'createdAt') {
                    return moment(timestamp).format("MMMM Do, YYYY h:mm a");
                }
            },
            async removeEmployee(employee) {
                this.$set(this.isRemovingEmployees, employee.id, true);

                try {
                    const removeCompanyEmployee = firebase.functions()
                                                        .httpsCallable('removeCompanyEmployee');

                    await removeCompanyEmployee({ employeeId: employee.id });
                } catch (error) {
                    const notification = {
                        message: error.message,
                        context: 'error',
                    };

                    this.$store.commit('push_notification', { notification });
                }

                this.$set(this.isRemovingEmployees, employee.id, false);
            },
            async addEmployee() {
                this.isAddingEmployee = true;

                const employeeData = cloneDeep(this.newEmployee);
                
                try {
                    const addCompanyEmployee = firebase.functions()
                                                    .httpsCallable('addCompanyEmployee');

                    await addCompanyEmployee({ employeeData });

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

                this.isAddingEmployee = false;
                this.newEmployee = cloneDeep(init.newEmployee);
                this.isShowingAddEmployeeDialog = false;
                this.$refs.addEmployeeForm.resetValidation();
            },
            async importEmployees() {
                this.isImportingEmployees = true;

                try {
                    await Promise.all(
                        this.employeesCSVs.map(async (file, index) => {
                            await this.uploadFile(file, `companies/${this.company.id}/employees`);                 
                        })
                    );
                } catch (error) {
                    const notification = {
                        message: error.message,
                        context: 'error',
                    };

                    this.$store.commit('push_notification', { notification });
                }

                this.isLoadingEmployees = true;

                this.employeesCSVs = [];
                this.isShowingImportEmployeesDialog = false;
                this.isImportingEmployees = false;
                this.$refs.importEmployeesForm.resetValidation();
            },
            async uploadFile(file, storagePath) {
                return new Promise((resolve, reject) => {
                    const ref = `${storagePath}/${uuidv4()}_${file.name}`;
                    const storageRef = firebase.storage().ref();

                    const metadata = {
                        contentType: file.type,
                    };

                    const uploadTask = storageRef.child(ref).put(file, metadata);

                    uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED, snapshot => {
                        const percentUpload = Math.floor((snapshot.bytesTransferred / snapshot.totalBytes) * 100);

                        this.$store.commit('push_notification', { 
                            notification: {
                                message: `Uploading "${file.name}" (${percentUpload}%)`,
                                context: 'info',
                                timeout: -1,
                                tag: 'upload',
                            }
                        });
                    }, error => {
                        this.$store.commit('push_notification', { 
                            notification: {
                                message: `Error uploading "${file.name}"`,
                                context: 'error',
                                tag: 'upload',
                            }
                        });

                        reject(error);
                    }, async () => {
                        this.$store.commit('push_notification', { 
                            notification: {
                                message: `Successfully uploaded "${file.name}"`,
                                context: 'success',
                                tag: 'upload',
                            }
                        });

                        const downloadUrl = await uploadTask.snapshot.ref.getDownloadURL();

                        const upload = {
                            fileName: file.name,
                            fullPath: ref,
                            src: downloadUrl,
                        }
                        
                        resolve(upload);
                    });
                });
            },
            getEmployeeTotalCoursesEnrolled(enrolledCourses) {
                const enrolledCoursesIds = [];

                for (const enrolledCourseId in enrolledCourseId) {
                    enrolledCoursesIds.push(enrolledCourseId);
                }

                return enrolledCoursesIds.length;
            },
            async regenerateEmployeeSignInLink(employee) {
                this.$set(this.isRegeneratingEmployeesSignInLink, employee.id, true);

                try {
                    const generateCompanyEmployeeSignInLink = firebase.functions()
                                                                    .httpsCallable('generateCompanyEmployeeSignInLink');

                    await generateCompanyEmployeeSignInLink({ employeeId: employee.id });

                    const notification = {
                        message: `Sign In link successfully generated for ${employee.name}`,
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

                this.$set(this.isRegeneratingEmployeesSignInLink, employee.id, false);
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