'use client';

import { Button, Group, Modal, Paper, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconScale } from '@tabler/icons-react';
import { PidComponent } from '../../lib';

export function LicenseDialog() {
  const [opened, { open, close }] = useDisclosure(false);

  return (
    <>
      <Paper shadow="sm" padding="xl" radius="md" withBorder>
        <Text fw={600} size="md" mb="md" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <IconScale size={20} />
          License Information
        </Text>
        <Button onClick={open} color="indigo" leftSection={<IconScale size={16} />}>
          View License Details
        </Button>
      </Paper>

      <Modal
        opened={opened}
        onClose={close}
        title="Apache License 2.0"
        centered
        size="md"
      >
        <Text size="sm" c="dimmed" mb="md">
          This dataset is published under the Apache 2.0 license, allowing free reuse
          with appropriate attribution.
        </Text>
        <PidComponent value="https://spdx.org/licenses/Apache-2.0" openByDefault={true} width="100%" />
        <Group justify="flex-end" mt="xl">
          <Button variant="outline" color="gray" onClick={close}>
            Close
          </Button>
        </Group>
      </Modal>
    </>
  );
}
