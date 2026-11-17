<script setup lang="ts">
import type { Monitor } from "@velora/contracts";
import { Activity } from "@lucide/vue";
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
  loading: boolean;
  monitors: Monitor[];
}>();
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle>Monitors</CardTitle>
      <CardDescription>Endpoints stay empty until a session can read them.</CardDescription>
    </CardHeader>
    <CardContent>
      <Skeleton v-if="loading" class="h-24 w-full" />
      <p v-else-if="failed" role="alert" class="text-destructive text-sm">
        Monitors are unavailable.
      </p>
      <Empty v-else-if="monitors.length === 0" class="border">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Activity />
          </EmptyMedia>
          <EmptyTitle>No monitors</EmptyTitle>
          <EmptyDescription>Nothing is probed while probe mode is off.</EmptyDescription>
        </EmptyHeader>
      </Empty>
      <ul v-else class="flex flex-col gap-3">
        <li
          v-for="monitor in monitors"
          :key="monitor.id"
          class="flex items-center justify-between gap-3"
        >
          <div class="min-w-0">
            <p class="truncate font-medium">{{ monitor.name }}</p>
            <p class="text-muted-foreground truncate text-sm">{{ monitor.url }}</p>
          </div>
          <Badge :variant="monitor.enabled ? 'secondary' : 'outline'">
            {{ monitor.enabled ? "Enabled" : "Disabled" }}
          </Badge>
        </li>
      </ul>
    </CardContent>
  </Card>
</template>
