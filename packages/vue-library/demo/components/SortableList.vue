<script setup lang="ts">
import { ref, computed } from 'vue';

interface Dataset {
  id: number;
  name: string;
  active: boolean;
}

const items = ref<Dataset[]>([
  { id: 1, name: 'Dataset A - 1,234 items', active: true },
  { id: 2, name: 'Dataset B - 567 items', active: true },
  { id: 3, name: 'Dataset C - 2,891 items', active: true },
  { id: 4, name: 'Dataset D - 432 items', active: false },
]);

const activeCount = computed(() => items.value.filter(i => i.active).length);

const toggleActive = (id: number) => {
  const item = items.value.find(i => i.id === id);
  if (item) {
    item.active = !item.active;
  }
};
</script>

<template>
  <v-card class="fill-height" elevation="1">
    <v-card-item>
      <v-card-title class="text-body-1 font-weight-bold">Sortable Dataset List</v-card-title>
      <v-card-subtitle>
        This list is fully interactive while autodetection runs above.
      </v-card-subtitle>
    </v-card-item>
    <v-card-text>
      <v-list bg-color="transparent" class="pa-0">
        <v-list-item
          v-for="item in items"
          :key="item.id"
          :class="['px-0', { 'opacity-50': !item.active }]"
          @click="toggleActive(item.id)"
        >
          <template #prepend>
            <v-icon :color="item.active ? 'success' : 'grey'" size="small">mdi-circle</v-icon>
          </template>
          <v-list-item-title class="text-body-2">{{ item.name }}</v-list-item-title>
          <template #append>
            <v-btn size="x-small" variant="tonal" color="primary" @click.stop>
              <v-icon size="small">mdi-sort</v-icon>
              Sort
            </v-btn>
          </template>
        </v-list-item>
      </v-list>
      <div class="mt-4 text-caption text-grey">
        Active datasets: {{ activeCount }}
      </div>
    </v-card-text>
  </v-card>
</template>