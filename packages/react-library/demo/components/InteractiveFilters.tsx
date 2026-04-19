'use client';

import { useState, type MouseEvent, type FormEvent } from 'react';
import { Paper, Text, TextInput, Select, Button, Group, Badge } from '@mantine/core';
import { IconSortAscending } from '@tabler/icons-react';

const defaultDatasets = [
  { id: 1, name: 'Dataset A - 1,234 items', active: true },
  { id: 2, name: 'Dataset B - 567 items', active: true },
  { id: 3, name: 'Dataset C - 2,891 items', active: true },
  { id: 4, name: 'Dataset D - 432 items', active: false },
];

export function SortableList() {
  const [datasets, setDatasets] = useState(defaultDatasets);

  const toggleActive = (id: number) => {
    setDatasets(datasets.map(d =>
      d.id === id ? { ...d, active: !d.active } : d,
    ));
  };

  return (
    <Paper shadow="sm" padding="lg" radius="md" withBorder>
      <Text fw={600} size="sm" mb={4}>Sortable Dataset List</Text>
      <Text size="xs" c="dimmed" mb="md">
        This list is fully interactive - sorting works immediately while
        autodetection runs above. DOM tree traversal does not block event handlers.
      </Text>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {datasets.map((dataset) => (
          <Group
            key={dataset.id}
            onClick={() => toggleActive(dataset.id)}
            justify="space-between"
            style={{
              cursor: 'pointer',
              backgroundColor: '#f8f9fa',
              padding: '8px 12px',
              borderRadius: 8,
            }}
          >
            <Group gap="xs">
              <Badge
                size="xs"
                circle
                color={dataset.active ? 'green' : 'gray'}
              />
              <Text size="sm">{dataset.name}</Text>
            </Group>
            <Button
              size="xs"
              variant="light"
              color="indigo"
              leftSection={<IconSortAscending size={12} />}
              onClick={(e: MouseEvent) => {
                e.stopPropagation();
              }}
            >
              Sort
            </Button>
          </Group>
        ))}
      </div>
      <Text size="xs" c="dimmed" mt="md">
        Active datasets: {datasets.filter(d => d.active).length}
      </Text>
    </Paper>
  );
}

export function FilterForm() {
  const [search, setSearch] = useState('');
  const [dateRange, setDateRange] = useState<string | null>('30');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <Paper shadow="sm" padding="lg" radius="md" withBorder>
      <Text fw={600} size="sm" mb={4}>Dataset Filter</Text>
      <Text size="xs" c="dimmed" mb="md">
        This form is fully functional while autodetection runs above.
        Input events and state updates work immediately.
      </Text>
      <form onSubmit={handleSubmit}>
        <TextInput
          label="Dataset Name"
          placeholder="Search datasets..."
          value={search}
          onChange={(e) => setSearch(e.currentTarget.value)}
          mb="md"
          size="sm"
        />
        <Select
          label="Date Range"
          data={[
            { value: '7', label: 'Last 7 days' },
            { value: '30', label: 'Last 30 days' },
            { value: '90', label: 'Last 90 days' },
            { value: 'all', label: 'All time' },
          ]}
          value={dateRange}
          onChange={setDateRange}
          mb="md"
          size="sm"
        />
        <Button type="submit" color="indigo" fullWidth>
          Apply Filters
        </Button>
      </form>
      {submitted && (
        <Text size="xs" c="green" mt="md">
          Filters applied! Search: "{search}", Range: {dateRange}
        </Text>
      )}
    </Paper>
  );
}
