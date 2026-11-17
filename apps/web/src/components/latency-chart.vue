<script setup lang="ts">
import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from "chart.js";
import type { ChartData, ChartOptions } from "chart.js";
import { Line } from "vue-chartjs";
import { latencySeries } from "@/fixtures/latency";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip);

const data: ChartData<"line"> = {
  labels: latencySeries.map((point) => point.label),
  datasets: [
    {
      label: "Latency (ms)",
      data: latencySeries.map((point) => point.latencyMs),
      borderColor: "#2563eb",
      backgroundColor: "rgba(37, 99, 235, 0.16)",
      fill: true,
      tension: 0.35,
      pointRadius: 3,
    },
  ],
};

const options: ChartOptions<"line"> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    tooltip: {
      displayColors: false,
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      title: {
        display: true,
        text: "ms",
      },
    },
  },
};
</script>

<template>
  <div class="h-64 w-full">
    <Line :data="data" :options="options" aria-label="Fixture latency" role="img" />
  </div>
</template>
