import "../styles/globals.css";

export const metadata = {
  title: "Synir AI — Intelligence at the Core",
  description: "AI-powered creative and workflow tools by Synir AI.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {/* Auth session provider for client components using useSession */}
        {/**/}
        {/* eslint-disable-next-line @next/next/no-head-element */}
        {/* Wrap in a client Providers component */}
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}

import AppProviders from "./providers";
