'use client';

import { useEffect, useRef, useState } from 'react';
import { Paper, Badge, Text } from '@mantine/core';
import {
  initPidDetection,
  type PidDetectionController,
  type PidDetectionConfig,
} from '@kit-data-manager/pid-component';

interface ArticleSectionProps {
  config?: PidDetectionConfig;
  standalone?: boolean;
}

export function ArticleSection({ config, standalone = true }: ArticleSectionProps) {
  const articleRef = useRef<HTMLDivElement>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (!articleRef.current || !standalone) return;

    const controller = initPidDetection({
      root: articleRef.current,
      darkMode: 'light',
      emphasizeComponent: false,
      ...config,
    });

    setIsInitialized(true);

    return () => {
      controller.destroy();
      setIsInitialized(false);
    };
  }, [config, standalone]);

  return (
    <div style={{ marginBottom: 32 }}>
      <Text fw={600} size="md" mb="md" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        Article Content
        <Badge
          color={isInitialized ? 'green' : 'red'}
          variant="light"
          size="sm"
        >
          {isInitialized ? 'Autodetection Active' : 'Autodetection Inactive'}
        </Badge>
      </Text>
      <Paper
        ref={articleRef}
        shadow="sm"
        padding="xl"
        radius="md"
        withBorder
      >
        <Text size="sm" style={{ lineHeight: 1.8, marginBottom: 16, color: '#374151' }}>
          This research paper investigates the integration of persistent identifiers across distributed
          research infrastructures. The dataset was created as part of the project identified by
          <strong> 21.T11981/be908bd1-e049-4d35-975e-8e27d40117e6</strong> and is hosted at
          the <strong>https://ror.org/04t3en479</strong> research institution. The work builds upon
          previous findings published in DOI <strong>10.1109/eScience.2024.1042</strong> and extends
          the methodology to handle Handle System resolutions at scale.
        </Text>
        <Text size="sm" style={{ lineHeight: 1.8, marginBottom: 16, color: '#374151' }}>
          For questions about this research, please contact the corresponding author
          at <strong>someone@example.com</strong>. The complete analysis framework is available under
          <strong> https://spdx.org/licenses/Apache-2.0</strong> and can be freely reused
          in accordance with the license terms. The research was conducted at the institution
          associated with ROR <strong>https://ror.org/04t3en479</strong>.
        </Text>
        <Text size="sm" style={{ lineHeight: 1.8, marginBottom: 16, color: '#374151' }}>
          The research has been published in multiple venues including the.Handle System
          <strong> 20.1000/100</strong> and DOI <strong>10.1016/j.future.2025.01.004</strong>.
          Related works include ISBN references <strong>978-3-642-54441-6</strong> and
          ISSN <strong>2041-1723</strong> for the journal.
        </Text>
        <Text size="sm" style={{ lineHeight: 1.8, color: '#374151' }}>
          The Handle identifier <strong>20.1000/100</strong> resolves to the Handle system
          documentation. For more information about persistent identifiers, visit
          <strong> https://www.pidconsortium.eu/</strong>. The research data is archived
          at <strong>https://doi.org/10.5281/zenodo.1234567</strong>.
        </Text>
      </Paper>
    </div>
  );
}
