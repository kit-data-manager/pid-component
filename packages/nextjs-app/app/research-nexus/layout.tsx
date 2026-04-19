import '../globals.css';

export const metadata = {
  title: 'ResearchNexus - PID Component Demo',
  description: 'A comprehensive demonstration of @kit-data-manager/pid-component in a research data portal',
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
