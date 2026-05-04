'use client';

import { useCallback, useRef } from 'react';
import { Button, Group, Paper, Table, Text } from '@mantine/core';
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

/** Minimal column-resize hook – drag the right edge of a <th> to resize. */
function useColumnResize() {
  const tableRef = useRef<HTMLTableElement>(null);

  const onMouseDown = useCallback((colIndex: number, e: React.MouseEvent) => {
    e.preventDefault();
    const table = tableRef.current;
    if (!table) return;
    const th = table.querySelectorAll('th')[colIndex] as HTMLTableCellElement;
    if (!th) return;

    const startX = e.clientX;
    const startWidth = th.offsetWidth;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const newWidth = Math.max(60, startWidth + moveEvent.clientX - startX);
      th.style.width = `${newWidth}px`;
    };
    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }, []);

  return { tableRef, onMouseDown };
}

const thStyle: React.CSSProperties = {
  fontWeight: 600,
  fontSize: 12,
  textTransform: 'uppercase',
  color: '#6b7280',
  position: 'relative',
  overflow: 'hidden',
};

const resizeHandleStyle: React.CSSProperties = {
  position: 'absolute',
  right: 0,
  top: 0,
  bottom: 0,
  width: 5,
  cursor: 'col-resize',
  userSelect: 'none',
};

export function DatasetTable({ datasets }: DatasetTableProps) {
  const { tableRef, onMouseDown } = useColumnResize();

  return (
    <Paper shadow="sm" padding={0} radius="md" withBorder style={{ overflow: 'hidden' }}>
      <div style={{ padding: '20px 24px', borderBottom: '1px solid #e0e0e0' }}>
        <Group gap="xs">
          <IconFileText size={20} color="#6366f1" />
          <Text fw={600} size="md">Related Datasets</Text>
        </Group>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <Table striped highlightOnHover ref={tableRef} style={{ tableLayout: 'fixed', width: '100%' }}>
          <Table.Thead>
            <Table.Tr style={{ backgroundColor: '#f8f9fa' }}>
              <Table.Th style={{ ...thStyle, width: '30%' }}>
                Title
                <span style={resizeHandleStyle} onMouseDown={(e) => onMouseDown(0, e)} />
              </Table.Th>
              <Table.Th style={{ ...thStyle, width: '30%' }}>
                DOI
                <span style={resizeHandleStyle} onMouseDown={(e) => onMouseDown(1, e)} />
              </Table.Th>
              <Table.Th style={{ ...thStyle, width: '25%' }}>
                License
                <span style={resizeHandleStyle} onMouseDown={(e) => onMouseDown(2, e)} />
              </Table.Th>
              <Table.Th style={{ ...thStyle, width: '15%' }}>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {datasets.map((dataset) => (
              <Table.Tr key={dataset.id}>
                <Table.Td style={{
                  fontSize: 14,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}>{dataset.title}</Table.Td>
                <Table.Td style={{ overflow: 'hidden' }}><PidComponent value={dataset.doi} emphasizeComponent={false} /></Table.Td>
                <Table.Td style={{ overflow: 'hidden' }}><PidComponent value={dataset.license}
                                                                       emphasizeComponent={false} /></Table.Td>
                <Table.Td>
                  <Button variant="subtle" color="gray" size="xs">View</Button>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </div>
    </Paper>
  );
}
