<script setup lang="ts">
import type { PrimitiveProps } from "reka-ui";
import type { HTMLAttributes } from "vue";
import type { BadgeVariants } from ".";
import { reactiveOmit } from "@vueuse/core";
import { cn } from "cn";
import { Primitive } from "reka-ui";
import { computed } from "vue";
import { definedProps } from "@/lib/defined-props";
import { badgeVariants } from ".";

const props = defineProps<
  PrimitiveProps & {
    variant?: BadgeVariants["variant"];
    class?: HTMLAttributes["class"];
  }
>();

const delegatedProps = computed(() => definedProps(reactiveOmit(props, "class", "variant")));
</script>

<template>
  <Primitive
    data-slot="badge"
    :class="cn(badgeVariants({ variant: props.variant }), props.class)"
    v-bind="delegatedProps"
  >
    <slot />
  </Primitive>
</template>
