<script lang="ts">
export interface Author {
  orcid: string;
  name: string;
  institution?: string;
}
</script>

<script lang="ts" setup>
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
        <v-avatar class="flex-shrink-0" color="indigo-lighten-5" size="48">
          <span class="text-indigo-darken-2 font-weight-bold">{{ getInitials(author.name) }}</span>
        </v-avatar>
        <div class="flex-grow-1">
          <div class="text-body-1 font-weight-bold">{{ author.name }}</div>
          <div v-if="author.institution" class="text-caption text-grey-lighten-1 mb-2">
            {{ author.institution }}
          </div>
          <pid-component :emphasize-component="false" :value="author.orcid" style="display: block;" />
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>
