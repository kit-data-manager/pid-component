'use client';

import { useState } from 'react';
import { Title, Text, Card, Tabs, Badge } from '@mantine/core';
import { PidComponent } from '../../lib';

interface AboutPageProps {
}

export function AboutPage({}: AboutPageProps) {
  return (
    <div style={{ marginBottom: 32 }}>
      <Title order={2} mb="md" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        About ResearchDemo
        <Badge color="blue" variant="light" size="sm">Demo Application</Badge>
      </Title>
      <Card shadow="sm" padding="xl" radius="md" withBorder>
        <Text size="sm" style={{ lineHeight: 1.8, marginBottom: 16, color: '#374151' }}>
          ResearchDemo is a demonstration application showcasing the
          <strong> PID Component</strong> library. This component enables
          seamless detection and rendering of Persistent Identifiers (PIDs)
          including DOIs, ORCIDs, Handles, RORs, and more.
        </Text>
        <Text size="sm" style={{ lineHeight: 1.8, marginBottom: 16, color: '#374151' }}>
          Explore the tabs below to see different PID types in action:
        </Text>

        <Tabs defaultValue="dois">
          <Tabs.List>
            <Tabs.Tab value="dois">DOIs</Tabs.Tab>
            <Tabs.Tab value="orcids">ORCIDs</Tabs.Tab>
            <Tabs.Tab value="handles">Handles</Tabs.Tab>
            <Tabs.Tab value="rors">RORs</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="dois" pt="md">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '16px 0' }}>
              <PidComponent value="10.1109/eScience65000.2025.00022" />
              <PidComponent value="10.5445/IR/1000185135" />
              <PidComponent value="10.1007/978-3-642-15582-6" />
            </div>
          </Tabs.Panel>

          <Tabs.Panel value="orcids" pt="md">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '16px 0' }}>
              <PidComponent value="0009-0005-2800-4833" />
              <PidComponent value="0009-0003-2196-9187" />
              <PidComponent value="0000-0001-6575-1022" />
            </div>
          </Tabs.Panel>

          <Tabs.Panel value="handles" pt="md">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '16px 0' }}>
              <PidComponent value="21.T11981/be908bd1-e049-4d35-975e-8e27d40117e6" />
              <PidComponent value="20.1000/100.123456" />
            </div>
          </Tabs.Panel>

          <Tabs.Panel value="rors" pt="md">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '16px 0' }}>
              <PidComponent value="https://ror.org/04t3en479" />
              <PidComponent value="https://ror.org/02aj13c28" />
            </div>
          </Tabs.Panel>
        </Tabs>
      </Card>
    </div>
  );
}
