import { VueQueryPlugin } from "@tanstack/vue-query";
import { createPinia } from "pinia";
import { createApp } from "vue";
import App from "@/App.vue";
import { connectSession } from "@/bootstrap";
import { webEnv } from "@/env";
import { queryClient } from "@/lib/query-client";
import { router } from "@/router";
import { useSessionStore } from "@/stores/session";

const app = createApp(App);
app.use(createPinia());
connectSession(webEnv);
await useSessionStore().refresh();
app.use(router);
app.use(VueQueryPlugin, { queryClient });
app.mount("#app");
