import './globals.css';

export const metadata = {
  title: 'Tarot Reader',
  description: 'Витягни карту й отримай своє тлумачення · Вытяни карту и получи своё толкование · Draw a card and receive your reading',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#04020e',
};

export default function RootLayout({ children }) {
  return (
    <html lang="uk">
      <body>{children}</body>
    </html>
  );
}
