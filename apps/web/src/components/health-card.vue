<script setup lang="ts">
import { HeartPulse } from "@lucide/vue";
import { computed } from "vue";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useHealthQuery } from "@/queries/health";

const health = useHealthQuery();
const loading = computed(() => health.isLoading.value);
const failed = computed(() => health.isError.value);
const status = computed(() => health.data.value?.status);
const database = computed(() => health.data.value?.database);
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle class="flex items-center gap-2">
        <HeartPulse class="size-4" />
        API health
      </CardTitle>
      <CardDescription
        >Status from the Hono API. The database can stay unconfigured.</CardDescription
      >
    </CardHeader>
    <CardContent>
      <Skeleton v-if="loading" class="h-6 w-40" />
      <Badge v-else-if="failed" variant="destructive">Unavailable</Badge>
      <Badge v-else-if="status && database" variant="secondary">
        {{ status }} · database {{ database }}
      </Badge>
    </CardContent>
  </Card>
</template>
