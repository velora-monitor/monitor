<script setup lang="ts">
import SignInForm from "@/components/sign-in-form.vue";
</script>

<template>
  <section class="mx-auto flex w-full max-w-md flex-col gap-4">
    <div>
      <h2 class="text-2xl font-semibold tracking-tight">Sign in</h2>
      <p class="text-muted-foreground text-sm">
        Authentication runs only when Supabase env is set.
      </p>
    </div>
    <SignInForm />
  </section>
</template>
