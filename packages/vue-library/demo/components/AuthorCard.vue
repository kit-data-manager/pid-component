<script lang="ts">
export interface Author {
  orcid: string;
  name: string;
  institution?: string;
}
</script>

<script setup lang="ts">
defineProps<{
  author: Author;
}>();

const getInitials = (name: string): string => {
  return name.split(' ').map(n => n[0]).join('');
};
</script>

<template>
  <v-card elevation="1">
    <v-card-text>
      <div class="d-flex align-start ga-4">
        <v-avatar color="indigo-lighten-5" size="48" class="flex-shrink-0">
          <span class="text-indigo-darken-2 font-weight-bold">{{ getInitials(author.name) }}</span>
        </v-avatar>
        <div class="flex-grow-1">
          <div class="text-body-1 font-weight-bold">{{ author.name }}</div>
          <div v-if="author.institution" class="text-caption text-grey-lighten-1 mb-2">
            {{ author.institution }}
          </div>
          <pid-component :value="author.orcid" :emphasize-component="false" style="display: block;" />
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>