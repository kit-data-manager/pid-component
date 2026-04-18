import './globals.css';

export const metadata = {
  title: 'PID Component - Next.js Demo',
  description: 'Demo application for PID Component in Next.js',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
