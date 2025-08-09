
import '../styles/globals.css';

export const metadata = {
  title: 'Synir — AI Image Tools',
  description: 'Background removal, upscaling, generation, and outpainting — fast and simple.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
