<script lang="ts" setup>
import type { Author } from './AuthorCard.vue';
import AuthorCardComponent from './AuthorCard.vue';

defineProps<{
  authors: Author[];
}>();
</script>

<template>
  <div class="mb-8">
    <h2 class="text-h6 font-weight-bold mb-4 d-flex align-center">
      <v-icon class="mr-2" color="grey-darken-2">mdi-account-group</v-icon>
      Developers of the pid-component
    </h2>
    <v-row>
      <v-col v-for="author in authors" :key="author.orcid" cols="4">
        <AuthorCardComponent :author="author" />
      </v-col>
    </v-row>
  </div>
</template>
