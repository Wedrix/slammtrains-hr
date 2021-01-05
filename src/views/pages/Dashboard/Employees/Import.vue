<template>
    <v-card>
        <v-form @submit.prevent="importEmployees()" ref="importEmployeesForm">
            <v-card-title>
                <span class="headline primary--text">Import Employees (CSV)</span>
            </v-card-title>
            <v-alert
                type="info"
                color="primary">
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
</template>

<script>
    import firebase from '@/firebase';
    import 'firebase/storage';

    import validators from '@/mixins/validators';

    import { v4 as uuidv4 } from 'uuid';

    import { mapState } from 'vuex';

    export default {
        name: 'EmployeesImport',
        mixins: [validators],
        data() {
            return {
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
        },
        methods: {
            async importEmployees() {
                if (!this.$refs.importEmployeesForm.validate()) {
                    return;
                }

                this.isImportingEmployees = true;

                const unwatch = this.$watch('company.employeesTotalCount', () => {
                    unwatch();

                    this.employeesCSVs = [];
                    this.isImportingEmployees = false;
                    this.$refs.importEmployeesForm.resetValidation();
                    this.$router.push('/dashboard/employees');
                });

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
        }
    };
</script>