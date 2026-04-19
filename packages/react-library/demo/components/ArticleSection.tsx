'use client';

import { useEffect, useRef } from 'react';
import { Paper, Badge, Text } from '@mantine/core';
import { initPidDetection, type PidDetectionConfig } from '@kit-data-manager/pid-component';

interface ArticleSectionProps {
  config?: Partial<PidDetectionConfig>;
}

export function ArticleSection({ config }: ArticleSectionProps) {
  const articleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!articleRef.current) return;
    const ctrl = initPidDetection({ root: articleRef.current, darkMode: 'light', ...config });
    return () => ctrl.destroy();
  }, [config]);

  return (
    <div style={{ marginBottom: 32 }}>
      <Text fw={600} size="md" mb="md" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        Article Content
        <Badge color="green" variant="light" size="sm">Autodetection Active</Badge>
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
          For questions about the dataset, please contact the corresponding author
          at <strong>someone@example.com</strong>. The complete analysis framework is available under
          <strong> https://spdx.org/licenses/Apache-2.0</strong> and can be freely reused
          in accordance with the license terms.
        </Text>
        <Text size="sm" style={{ lineHeight: 1.8, color: '#374151' }}>
          The research team, led by <strong>0009-0005-2800-4833</strong> and including
          contributions from <strong>0009-0003-2196-9187</strong>, has made the dataset
          available through the KIT Data Manager repository. Additional resources are accessible
          at <strong>https://scc.kit.edu</strong>.
        </Text>
      </Paper>
    </div>
  );
}