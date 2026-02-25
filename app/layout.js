import './globals.css';

export const metadata = {
  title: 'Tarot Reader',
  description: 'Draw a card and receive your reading',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}