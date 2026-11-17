import { defineStore } from "pinia";
import { ref } from "vue";

export const useUiStore = defineStore("ui", () => {
  const navOpen = ref(false);

  function toggleNav(): void {
    navOpen.value = !navOpen.value;
  }

  function closeNav(): void {
    navOpen.value = false;
  }

  return {
    closeNav,
    navOpen,
    toggleNav,
  };
});
