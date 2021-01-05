import Vue from 'vue';
import { firestorePlugin } from 'vuefire';

const serialize = snapshot => {
    return Object.defineProperty(snapshot.data(), 'id', 
        { 
            value: snapshot.id, 
            enumerable: true, 
            configurable: true, 
            writable: true 
        });
};

Vue.use(firestorePlugin, { serialize });