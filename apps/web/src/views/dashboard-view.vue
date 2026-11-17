<script setup lang="ts">
import { computed } from "vue";
import HealthCard from "@/components/health-card.vue";
import IncidentList from "@/components/incident-list.vue";
import LatencyChart from "@/components/latency-chart.vue";
import MonitorList from "@/components/monitor-list.vue";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useIncidentsQuery } from "@/queries/incidents";
import { useMonitorsQuery } from "@/queries/monitors";

const monitorsQuery = useMonitorsQuery();
const incidentsQuery = useIncidentsQuery();
const monitorRows = computed(() => monitorsQuery.data.value ?? []);
const monitorLoading = computed(() => monitorsQuery.isLoading.value);
const monitorFailed = computed(() => monitorsQuery.isError.value);
const incidentRows = computed(() => incidentsQuery.data.value ?? []);
const incidentLoading = computed(() => incidentsQuery.isLoading.value);
const incidentFailed = computed(() => incidentsQuery.isError.value);
</script>

<template>
  <div class="flex flex-col gap-6">
    <div>
      <h2 class="text-2xl font-semibold tracking-tight">Dashboard</h2>
      <p class="text-muted-foreground text-sm">
        Probes are off. The latency chart uses a local fixture.
      </p>
    </div>
    <div class="grid gap-6 lg:grid-cols-2">
      <HealthCard />
      <Card>
        <CardHeader>
          <CardTitle>Latency</CardTitle>
          <CardDescription>Fixture series rendered without live checks.</CardDescription>
        </CardHeader>
        <CardContent>
          <LatencyChart />
        </CardContent>
      </Card>
    </div>
    <div class="grid gap-6 lg:grid-cols-2">
      <MonitorList :failed="monitorFailed" :loading="monitorLoading" :monitors="monitorRows" />
      <IncidentList :failed="incidentFailed" :incidents="incidentRows" :loading="incidentLoading" />
    </div>
  </div>
</template>
