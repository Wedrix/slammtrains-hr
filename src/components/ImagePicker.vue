<template>
    <slim :options="options" :key="refreshKey" :initial-image="image.src">
        <input type="file" name="image" ref="image"/>
    </slim>
</template>

<script>
    import firebase from '@/firebase';
    import 'firebase/storage';
    import { v4 as uuidv4 } from 'uuid';

    import Slim from '@/components/Slim.vue';

    import { cloneDeep } from 'lodash';

    const init = {
        src: '',
        fileName: '',
        fullPath: ''
    };

    export default {
        name: 'ImagePickerComponent',
        components: {
            'slim': Slim,
        },
        props: {
            directory: {
                type: String,
                default: 'images',
            },
            label: {
                type: String,
                default: 'image'
            },
            aspectRatio: {
                type: String,
                default: '1:1'
            }
        },
        data() {
            return {
                image: cloneDeep(init),

                options: {
                    ratio: this.aspectRatio,
                    label: this.label,
                    service: (files,progress,success,failure) => {
                        this.$emit('uploading-image');

                        const file = files[0];
                        const ref = `${this.directory}/${uuidv4()}_${file.name}`;
                        const storageRef = firebase.storage().ref();

                        const metadata = {
                            contentType: file.type,
                        };

                        const uploadTask = storageRef.child(ref).put(file, metadata);
                        
                        uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED, snapshot => {
                            progress(snapshot.bytesTransferred,snapshot.totalBytes);
                        }, error => {
                            failure(error);

                            this.$emit('error-uploading-image');
                        }, async () => {
                            const src = await uploadTask.snapshot.ref.getDownloadURL();

                            const image = {
                                fileName: file.name,
                                fullPath: ref,
                                src,
                            };

                            this.image = image;

                            success('Upload Completed');

                            this.refreshKey++;

                            this.$emit('image-upload-successful', image);
                        });
                    },
                    didRemove: removedImage => {
                        const storageRef = firebase.storage().ref();

                        storageRef.child(this.image.fullPath)
                                .delete()
                                .catch(error => {
                                    const notification = {
                                        message: error.message,
                                        context: 'error',
                                    };

                                    this.$store.commit('push_notification', { notification });
                                });

                        this.image = cloneDeep(init);
                    },
                    serviceFormat: 'file',
                    instantEdit: true,
                    push: true,    
                },

                refreshKey: 0,
            };
        },
    };
</script>