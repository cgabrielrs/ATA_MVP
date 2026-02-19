import type {Metadata} from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AtaZap - Geração Inteligente de Atas',
  description: 'Gere atas de reunião profissionais a partir de transcrições com IA.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased min-h-screen flex flex-col">{children}</body>
    </html>
  );
}