'use client';

import { Container, Group, Text, Button } from '@mantine/core';
import { IconDatabase } from '@tabler/icons-react';

export function Footer() {
  return (
    <div style={{
      borderTop: '1px solid #e0e0e0',
      backgroundColor: 'white',
      marginTop: 48,
    }}>
      <Container size="xl">
        <Group justify="space-between" py="xl">
          <Group gap="sm">
            <Button
              variant="filled"
              color="indigo"
              size="xs"
              leftSection={<IconDatabase size={14} />}
              radius="md"
            >
              ResearchNexus
            </Button>
          </Group>
          <Text size="sm" c="dimmed">
            Research Data Portal powered by KIT Data Manager
          </Text>
        </Group>
      </Container>
    </div>
  );
}