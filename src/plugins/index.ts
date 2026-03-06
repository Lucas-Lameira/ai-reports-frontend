import router from '../router';
import {createPinia} from 'pinia';
import type { App } from 'vue'
import vuetify from './vuetify'

export function registerPlugins (app: App) {
 app.use(vuetify)
 app.use(createPinia());
 app.use(router);
}