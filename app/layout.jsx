import "../styles/globals.css";

export const metadata = {
  title: "Synir AI — Intelligence at the Core",
  description: "AI-powered creative and workflow tools by Synir AI.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

