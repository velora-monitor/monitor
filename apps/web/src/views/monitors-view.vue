<script setup lang="ts">
import { computed } from "vue";
import MonitorList from "@/components/monitor-list.vue";
import { useMonitorsQuery } from "@/queries/monitors";

const monitorsQuery = useMonitorsQuery();
const monitors = computed(() => monitorsQuery.data.value ?? []);
const loading = computed(() => monitorsQuery.isLoading.value);
const failed = computed(() => monitorsQuery.isError.value);
</script>

<template>
  <section class="flex flex-col gap-4">
    <h2 class="text-2xl font-semibold tracking-tight">Monitors</h2>
    <MonitorList :failed="failed" :loading="loading" :monitors="monitors" />
  </section>
</template>
