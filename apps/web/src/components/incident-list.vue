<script setup lang="ts">
import type { Incident } from "@velora/contracts";
import { TriangleAlert } from "@lucide/vue";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";

defineProps<{
  failed: boolean;
  incidents: Incident[];
  loading: boolean;
}>();
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle>Incidents</CardTitle>
      <CardDescription
        >An incident opens only after the failure threshold is reached.</CardDescription
      >
    </CardHeader>
    <CardContent>
      <Skeleton v-if="loading" class="h-24 w-full" />
      <p v-else-if="failed" role="alert" class="text-destructive text-sm">
        Incidents are unavailable.
      </p>
      <Empty v-else-if="incidents.length === 0" class="border">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <TriangleAlert />
          </EmptyMedia>
          <EmptyTitle>No incidents</EmptyTitle>
          <EmptyDescription>No open or resolved incidents are stored yet.</EmptyDescription>
        </EmptyHeader>
      </Empty>
      <ul v-else class="flex flex-col gap-3">
        <li
          v-for="incident in incidents"
          :key="incident.id"
          class="flex items-center justify-between gap-3"
        >
          <div class="min-w-0">
            <p class="truncate font-medium">{{ incident.openedAt }}</p>
            <p class="text-muted-foreground text-sm">{{ incident.failureCount }} failures</p>
          </div>
          <Badge :variant="incident.state === 'open' ? 'destructive' : 'secondary'">
            {{ incident.state }}
          </Badge>
        </li>
      </ul>
    </CardContent>
  </Card>
</template>
