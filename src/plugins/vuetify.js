import Vue from 'vue';
import Vuetify from 'vuetify/lib';
import { colors } from 'vuetify/lib';

Vue.use(Vuetify);

export default new Vuetify({
    theme: {
        themes: {
            light: {
                primary: '#325279',
                secondary: colors.teal.darken1,
                accent: colors.pink,
                accent2: colors.orange.darken1,
                background: colors.lightBlue.darken4,
                error: '#FF5252',
                info: '#2196F3',
                success: '#4CAF50',
                warning: '#FFC107',
            },
        },
    }
});
