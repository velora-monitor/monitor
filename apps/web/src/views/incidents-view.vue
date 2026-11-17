<script setup lang="ts">
import { computed } from "vue";
import IncidentList from "@/components/incident-list.vue";
import { useIncidentsQuery } from "@/queries/incidents";

const incidentsQuery = useIncidentsQuery();
const incidents = computed(() => incidentsQuery.data.value ?? []);
const loading = computed(() => incidentsQuery.isLoading.value);
const failed = computed(() => incidentsQuery.isError.value);
</script>

<template>
  <section class="flex flex-col gap-4">
    <h2 class="text-2xl font-semibold tracking-tight">Incidents</h2>
    <IncidentList :failed="failed" :incidents="incidents" :loading="loading" />
  </section>
</template>
