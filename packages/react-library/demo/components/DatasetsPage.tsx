'use client';

import { useState } from 'react';
import { Badge, Card, Table, Title } from '@mantine/core';
import { PidComponent } from '../../lib';

interface DatasetsPageProps {
}

export function DatasetsPage({}: DatasetsPageProps) {
  const [isActive] = useState(false);

  const headers = ['ID', 'Title', 'DOI', 'License'];
  const datasets = [
    {
      id: '1',
      title: 'KIT Data Metadata Analysis',
      doi: '10.5445/IR/1000185135',
      license: 'https://spdx.org/licenses/MIT',
    },
    {
      id: '2',
      title: 'Research Output Repository Schema',
      doi: '10.5445/IR/1000178054',
      license: 'https://spdx.org/licenses/Apache-2.0',
    },
    {
      id: '3',
      title: 'FDO Implementation Guidelines',
      doi: '10.5445/IR/1000151234',
      license: 'https://spdx.org/licenses/CC-BY-4.0',
    },
  ];

  return (
    <div style={{ marginBottom: 32 }}>
      <Title order={2} mb="md" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        Dataset Overview
        <Badge color={isActive ? 'green' : 'red'} variant="light" size="sm">
          {isActive ? 'Scanning Active' : 'Scanning Inactive'}
        </Badge>
      </Title>
      <Card shadow="sm" padding="xl" radius="md" withBorder>
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              {headers.map(h => <Table.Th key={h}>{h}</Table.Th>)}
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {datasets.map(item => (
              <Table.Tr key={item.id}>
                <Table.Td>{item.id}</Table.Td>
                <Table.Td>{item.title}</Table.Td>
                <Table.Td><PidComponent value={item.doi} openByDefault={false} /></Table.Td>
                <Table.Td><PidComponent value={item.license} openByDefault={false} /></Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Card>
    </div>
  );
}
