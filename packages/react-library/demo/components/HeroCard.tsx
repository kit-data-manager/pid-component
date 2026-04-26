'use client';

import { Paper, Title, Text, Badge, Group, Button, Stack } from '@mantine/core';
import { IconDownload, IconExternalLink } from '@tabler/icons-react';
import { PidComponent } from '../../lib';
import type { ReactNode } from 'react';

interface HeroCardProps {
  title: string;
  description: string;
  doi?: string;
  actions?: ReactNode;
}

export function HeroCard({ title, description, doi, actions }: HeroCardProps) {
  return (
    <Paper shadow="sm" padding="xl" radius="md" withBorder>
      <Group gap="xs" mb="md">
        <Badge color="blue" variant="light" size="sm">DOI</Badge>
        <Badge color="green" variant="light" size="sm">Research Data</Badge>
      </Group>
      <Title order={2} mb="sm" fw={700} style={{ color: '#1a1a2e', lineHeight: 1.3 }}>
        {title}
      </Title>
      <Text size="sm" c="dimmed" mb="lg" style={{ lineHeight: 1.7 }}>
        {description}
      </Text>
      <Group gap="sm">
        {actions || (
          <>
            <Button color="indigo" leftSection={<IconDownload size={16} />}>
              Download Dataset
            </Button>
            <Button variant="outline" color="gray" leftSection={<IconExternalLink size={16} />}>
              View Source
            </Button>
          </>
        )}
      </Group>
    </Paper>
  );
}

interface DoiCardProps {
  value: string;
  license?: string;
}

export function DoiCard({ value, license }: DoiCardProps) {
  return (
    <Paper shadow="sm" padding="lg" radius="md" withBorder>
      <Text size="xs" fw={600} c="dimmed" mb="xs" tt="uppercase" style={{ letterSpacing: 1 }}>
        Digital Object Identifier
      </Text>
      <PidComponent value={value} openByDefault={true} width="100%" />
      {license && (
        <>
          <div style={{ borderTop: '1px solid #e0e0e0', marginTop: 16, paddingTop: 16 }}>
            <Text size="xs" fw={600} c="dimmed" mb="xs" tt="uppercase" style={{ letterSpacing: 1 }}>
              License
            </Text>
            <PidComponent value={license} width="100%" />
          </div>
        </>
      )}
    </Paper>
  );
}