'use client';

import { Container, Group, Text, Button, Anchor, Badge } from '@mantine/core';
import { IconDatabase } from '@tabler/icons-react';
import { PidComponent } from '../../lib';

interface NavigationProps {
  activePage?: string;
  onNavigate?: (page: string) => void;
}

export function Navigation({ activePage = 'home', onNavigate }: NavigationProps) {
  return (
    <div style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      background: 'white',
      borderBottom: '1px solid #e0e0e0',
    }}>
      <Container size="xl">
        <Group justify="space-between" h={64}>
          <Group gap="sm">
            <Button
              variant="filled"
              color="indigo"
              size="sm"
              leftSection={<IconDatabase size={18} />}
              radius="md"
            >
              ResearchDemo
            </Button>
            <Badge color="orange" variant="light" size="sm">Demo</Badge>
          </Group>
          <Group gap="md">
            <Anchor
              component="button"
              type="button"
              onClick={() => onNavigate?.('home')}
              c={activePage === 'home' ? 'indigo.7' : 'dimmed'}
              fw={activePage === 'home' ? 600 : 400}
              underline="never"
            >
              Home
            </Anchor>
            <Anchor
              component="button"
              type="button"
              onClick={() => onNavigate?.('datasets')}
              c={activePage === 'datasets' ? 'indigo.7' : 'dimmed'}
              fw={activePage === 'datasets' ? 600 : 400}
              underline="never"
            >
              Datasets
            </Anchor>
            <Anchor
              component="button"
              type="button"
              onClick={() => onNavigate?.('about')}
              c={activePage === 'about' ? 'indigo.7' : 'dimmed'}
              fw={activePage === 'about' ? 600 : 400}
              underline="never"
            >
              About
            </Anchor>
            <Text size="sm" c="dimmed">|</Text>
            <Group gap={4}>
              <Text size="sm" c="dimmed">Powered by</Text>
              <PidComponent value="https://ror.org/04t3en479" emphasizeComponent={false} hideSubcomponents={true} />
            </Group>
          </Group>
        </Group>
      </Container>
    </div>
  );
}