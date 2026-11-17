<script setup lang="ts">
import { toTypedSchema } from "@vee-validate/zod";
import { useForm } from "vee-validate";
import { ref } from "vue";
import { useRouter } from "vue-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signInSchema } from "@/schemas/sign-in";
import { useSessionStore } from "@/stores/session";

const session = useSessionStore();
const router = useRouter();
const formError = ref("");

const { defineField, errors, handleSubmit, isSubmitting } = useForm({
  validationSchema: toTypedSchema(signInSchema),
  initialValues: {
    email: "",
    password: "",
  },
});

const [email, emailProps] = defineField("email");
const [password, passwordProps] = defineField("password");

const onSubmit = handleSubmit(async (values) => {
  formError.value = "";
  const result = await session.signIn(values.email, values.password);
  if (result === "unconfigured") {
    formError.value = "Supabase is not configured.";
    return;
  }
  if (result === "rejected") {
    formError.value = "Sign-in failed.";
    return;
  }
  await router.push({ name: "dashboard" });
});
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle>Account</CardTitle>
      <CardDescription>
        <span v-if="session.configured">Sign in with Supabase Auth.</span>
        <span v-else>Supabase is not configured. The shell stays available.</span>
      </CardDescription>
    </CardHeader>
    <CardContent>
      <form class="flex flex-col gap-4" @submit="onSubmit">
        <div class="flex flex-col gap-2">
          <Label for="email">Email</Label>
          <Input
            id="email"
            type="email"
            autocomplete="email"
            v-model="email"
            v-bind="emailProps"
            :aria-invalid="Boolean(errors.email)"
          />
          <p v-if="errors.email" class="text-destructive text-sm">{{ errors.email }}</p>
        </div>
        <div class="flex flex-col gap-2">
          <Label for="password">Password</Label>
          <Input
            id="password"
            type="password"
            autocomplete="current-password"
            v-model="password"
            v-bind="passwordProps"
            :aria-invalid="Boolean(errors.password)"
          />
          <p v-if="errors.password" class="text-destructive text-sm">{{ errors.password }}</p>
        </div>
        <p v-if="formError" role="alert" class="text-destructive text-sm">{{ formError }}</p>
        <Button type="submit" :disabled="isSubmitting">
          {{ isSubmitting ? "Signing in" : "Sign in" }}
        </Button>
      </form>
    </CardContent>
  </Card>
</template>
