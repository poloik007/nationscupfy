import './globals.css';

export const metadata = {
  title: 'NationsCupfy',
  description: 'Live tournament management and results',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
