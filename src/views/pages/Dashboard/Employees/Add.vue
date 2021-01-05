<template>
    <v-card>
        <v-form @submit.prevent="addEmployee()" ref="addEmployeeForm">
            <v-card-title>
                <span class="headline primary--text">Add An Employee</span>
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
</template>

<script>
    import firebase from '@/firebase';
    import 'firebase/functions';

    import validators from '@/mixins/validators';

    import { cloneDeep } from 'lodash';

    const init = {
        newEmployee: {
            email: '',
            name: '',
        },
    };

    export default {
        name: 'AddEmployee',
        mixins: [validators],
        data() {
            return {
                newEmployee: cloneDeep(init.newEmployee),
                isAddingEmployee: false,
            };
        },
        methods: {
            async addEmployee() {
                if (!this.$refs.addEmployeeForm.validate()) {
                    return;
                }

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
                    
                    this.newEmployee = cloneDeep(init.newEmployee);
                    this.$refs.addEmployeeForm.resetValidation();
                    this.$router.push('/dashboard/employees');
                } catch (error) {
                    const notification = {
                        message: error.message,
                        context: 'error',
                    };

                    this.$store.commit('push_notification', { notification });
                }

                this.isAddingEmployee = false;
            },
        },
    };
</script>