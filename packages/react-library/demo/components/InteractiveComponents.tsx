'use client';

import { useState } from 'react';
import { Paper, Text, Badge, Progress, Group } from '@mantine/core';

const contentTypes = ['Datasets', 'Publications', 'Software', 'Workflows'] as const;

export function ContentTypeToggles() {
  const [active, setActive] = useState<string>('Datasets');

  return (
    <Paper shadow="sm" padding="lg" radius="md" withBorder>
      <Text fw={600} size="sm" mb={4}>Content Type Toggles</Text>
      <Text size="xs" c="dimmed" mb="md">
        These toggles maintain state independently of the autodetection
        running above. React state is not blocked by DOM tree traversal.
      </Text>
      <Group gap="xs">
        {contentTypes.map((type) => (
          <Badge
            key={type}
            component="button"
            onClick={() => setActive(type)}
            size="lg"
            variant={active === type ? 'filled' : 'outline'}
            color={active === type ? 'indigo' : 'gray'}
            style={{ cursor: 'pointer' }}
          >
            {type}
          </Badge>
        ))}
      </Group>
      <Text size="xs" c="dimmed" mt="md">
        Selected: {active}
      </Text>
    </Paper>
  );
}

export function ProgressIndicators() {
  return (
    <Paper shadow="sm" padding="lg" radius="md" withBorder>
      <Text fw={600} size="sm" mb={4}>Download Progress</Text>
      <Text size="xs" c="dimmed" mb="md">
        Progress updates work while autodetection runs above.
        requestAnimationFrame is not blocked.
      </Text>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <Group justify="space-between" mb={4}>
            <Text size="xs">Dataset download</Text>
            <Text size="xs" c="dimmed">73%</Text>
          </Group>
          <Progress value={73} color="green" size="sm" radius="xl" />
        </div>
        <div>
          <Group justify="space-between" mb={4}>
            <Text size="xs">Metadata extraction</Text>
            <Text size="xs" c="dimmed">45%</Text>
          </Group>
          <Progress value={45} color="indigo" size="sm" radius="xl" />
        </div>
        <div>
          <Group justify="space-between" mb={4}>
            <Text size="xs">Validation</Text>
            <Text size="xs" c="dimmed">12%</Text>
          </Group>
          <Progress value={12} color="yellow" size="sm" radius="xl" />
        </div>
      </div>
    </Paper>
  );
}