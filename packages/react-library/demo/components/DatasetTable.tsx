'use client';

import { Paper, Table, Button, Group, Text } from '@mantine/core';
import { IconFileText } from '@tabler/icons-react';
import { PidComponent } from '../../lib';

interface Dataset {
  id: string;
  title: string;
  doi: string;
  license: string;
}

interface DatasetTableProps {
  datasets: Dataset[];
}

export function DatasetTable({ datasets }: DatasetTableProps) {
  return (
    <Paper shadow="sm" padding={0} radius="md" withBorder>
      <div style={{ padding: '20px 24px', borderBottom: '1px solid #e0e0e0' }}>
        <Group gap="xs">
          <IconFileText size={20} color="#6366f1" />
          <Text fw={600} size="md">Related Datasets</Text>
        </Group>
      </div>
      <Table striped highlightOnHover>
        <Table.Thead>
          <Table.Tr style={{ backgroundColor: '#f8f9fa' }}>
            <Table.Th
              style={{ fontWeight: 600, fontSize: 12, textTransform: 'uppercase', color: '#6b7280' }}>Title</Table.Th>
            <Table.Th
              style={{ fontWeight: 600, fontSize: 12, textTransform: 'uppercase', color: '#6b7280' }}>DOI</Table.Th>
            <Table.Th
              style={{ fontWeight: 600, fontSize: 12, textTransform: 'uppercase', color: '#6b7280' }}>License</Table.Th>
            <Table.Th
              style={{ fontWeight: 600, fontSize: 12, textTransform: 'uppercase', color: '#6b7280' }}>Actions</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {datasets.map((dataset) => (
            <Table.Tr key={dataset.id}>
              <Table.Td style={{ fontSize: 14 }}>{dataset.title}</Table.Td>
              <Table.Td><PidComponent value={dataset.doi} emphasizeComponent={false} /></Table.Td>
              <Table.Td><PidComponent value={dataset.license} emphasizeComponent={false} /></Table.Td>
              <Table.Td>
                <Button variant="subtle" color="gray" size="xs">View</Button>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </Paper>
  );
}
