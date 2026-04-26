<script setup lang="ts">
import { PidComponent } from '../../lib';
import { ref, reactive } from 'vue';

interface Dataset {
  id: string;
  title: string;
  doi: string;
  license: string;
}

defineProps<{
  datasets: Dataset[];
}>();

const columnWidths = reactive<Record<string, number>>({
  title: 30,
  doi: 30,
  license: 25,
  actions: 15,
});

let resizing: { key: string; startX: number; startWidth: number } | null = null;

function onResizeStart(event: MouseEvent, key: string) {
  event.preventDefault();
  resizing = { key, startX: event.clientX, startWidth: columnWidths[key] };
  document.addEventListener('mousemove', onResizeMove);
  document.addEventListener('mouseup', onResizeEnd);
}

function onResizeMove(event: MouseEvent) {
  if (!resizing) return;
  const table = document.querySelector('.dataset-table-inner') as HTMLElement | null;
  if (!table) return;
  const tableWidth = table.offsetWidth;
  const deltaPercent = ((event.clientX - resizing.startX) / tableWidth) * 100;
  const newWidth = Math.max(5, resizing.startWidth + deltaPercent);
  columnWidths[resizing.key] = newWidth;
}

function onResizeEnd() {
  resizing = null;
  document.removeEventListener('mousemove', onResizeMove);
  document.removeEventListener('mouseup', onResizeEnd);
}
</script>

<template>
  <v-card elevation="1" style="overflow: hidden">
    <v-card-title class="d-flex align-center pa-4 border-b">
      <v-icon color="grey-darken-2" class="mr-2">mdi-file-document</v-icon>
      <span class="text-h6">Related Datasets</span>
    </v-card-title>
    <div style="overflow-x: auto">
      <v-table class="dataset-table-inner elevation-0" style="table-layout: fixed; width: 100%">
        <thead>
        <tr>
          <th
            v-for="col in [
                { key: 'title', label: 'Title' },
                { key: 'doi', label: 'DOI' },
                { key: 'license', label: 'License' },
                { key: 'actions', label: 'Actions' },
              ]"
            :key="col.key"
            :style="{ width: columnWidths[col.key] + '%', position: 'relative', userSelect: 'none' }"
          >
            {{ col.label }}
            <span
              class="resize-handle"
              @mousedown.prevent="onResizeStart($event, col.key)"
            ></span>
          </th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="item in datasets" :key="item.id">
          <td style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap">{{ item.title }}</td>
          <td style="overflow: hidden">
            <pid-component :value="item.doi" :emphasize-component="false" style="display: inline-block;" />
          </td>
          <td style="overflow: hidden">
            <pid-component :value="item.license" :emphasize-component="false" style="display: inline-block;" />
          </td>
          <td style="overflow: hidden">
            <v-btn size="small" variant="text" color="primary">View</v-btn>
          </td>
        </tr>
        </tbody>
      </v-table>
    </div>
  </v-card>
</template>

<style scoped>
.resize-handle {
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  cursor: col-resize;
  background: transparent;
}

.resize-handle:hover {
  background: #90caf9;
}
</style>
