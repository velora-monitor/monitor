export type LatencyPoint = {
  label: string;
  latencyMs: number;
};

export const latencySeries: readonly LatencyPoint[] = [
  { label: "00:00", latencyMs: 118 },
  { label: "04:00", latencyMs: 96 },
  { label: "08:00", latencyMs: 142 },
  { label: "12:00", latencyMs: 127 },
  { label: "16:00", latencyMs: 163 },
  { label: "20:00", latencyMs: 134 },
];
