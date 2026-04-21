import '@/app/globals.css';

import type { Metadata, Viewport } from "next";
import { KumaRegistry } from '@kuma-ui/next-plugin/registry'

export const metadata: Metadata = {
  title: 'ImageSet Manager',
  description: 'Manage your imagesets with ease.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja">
      <body>
        <KumaRegistry>
          {children}
        </KumaRegistry>
      </body>
    </html>
  );
}
