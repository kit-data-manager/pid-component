'use client';

import { PidComponent } from '@kit-data-manager/react-pid-component';

export default function Home() {
  return (
    <main style={{ padding: '2rem' }}>
      <h1>PID Component - Next.js Demo</h1>
      <p>This is a demo of the PID Component in a Next.js application.</p>
      <div style={{ marginTop: '2rem' }}>
        <PidComponent value="10.5445/ir/1000185135" />
      </div>
    </main>
  );
}
