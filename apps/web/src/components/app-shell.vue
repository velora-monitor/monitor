<script setup lang="ts">
import { Activity, LayoutDashboard, LogIn, Menu, TriangleAlert } from "@lucide/vue";
import { RouterLink, RouterView, useRoute } from "vue-router";
import { watch } from "vue";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useSessionStore } from "@/stores/session";
import { useUiStore } from "@/stores/ui";

const session = useSessionStore();
const ui = useUiStore();
const route = useRoute();

const links = [
  { icon: LayoutDashboard, label: "Dashboard", name: "dashboard" },
  { icon: Activity, label: "Monitors", name: "monitors" },
  { icon: TriangleAlert, label: "Incidents", name: "incidents" },
] as const;

watch(
  () => route.fullPath,
  () => {
    ui.closeNav();
  },
);

function navClass(name: string): string {
  const active = route.name === name;
  return active
    ? "bg-accent text-accent-foreground"
    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground";
}

function onSignOut(): void {
  void session.signOut();
}
</script>

<template>
  <div class="bg-background flex min-h-screen flex-col">
    <header class="flex items-center gap-3 px-4 py-3 md:px-6">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-controls="app-nav"
        :aria-expanded="ui.navOpen"
        @click="ui.toggleNav()"
      >
        <Menu />
        <span class="sr-only">Toggle navigation</span>
      </Button>
      <h1 class="text-lg font-semibold tracking-tight">Velora</h1>
      <div class="ml-auto flex items-center gap-3">
        <p v-if="!session.configured" role="status" class="text-muted-foreground text-sm">
          Supabase is not configured
        </p>
        <Badge v-else-if="session.user" variant="secondary">{{ session.user.email }}</Badge>
        <RouterLink
          v-if="!session.authenticated"
          :to="{ name: 'sign-in' }"
          class="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 text-sm"
        >
          <LogIn class="size-4" />
          Sign in
        </RouterLink>
        <Button v-else type="button" variant="outline" @click="onSignOut">Sign out</Button>
      </div>
    </header>
    <Separator />
    <div class="flex flex-1">
      <nav
        id="app-nav"
        class="border-border w-56 flex-col gap-1 border-r p-3"
        :class="ui.navOpen ? 'flex' : 'hidden md:flex'"
      >
        <RouterLink
          v-for="link in links"
          :key="link.name"
          :to="{ name: link.name }"
          class="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium"
          :class="navClass(link.name)"
        >
          <component :is="link.icon" class="size-4" />
          {{ link.label }}
        </RouterLink>
      </nav>
      <main class="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 p-6">
        <RouterView />
      </main>
    </div>
  </div>
</template>
