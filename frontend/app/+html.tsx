import { ScrollViewStyleReset } from 'expo-router/html';
import React from 'react';

/**
 * Root HTML template for the Expo Router web application.
 * This is the ONLY reliable way to put static tags in the <head>.
 */
export default function RootHTML({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />

        {/* 🎨 Fonts */}
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />

        {/* Reset styles for the web */}
        <ScrollViewStyleReset />

        {/* Google AdSense Verification */}
        <script 
          async 
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4000404993258529"
          crossOrigin="anonymous"
        ></script>

        {/* Global CSS Reset */}
        <style dangerouslySetInnerHTML={{ __html: `
          body { background-color: #0F0D15; margin: 0; padding: 0; overflow-x: hidden; }
          #root { display: flex; flex: 1; flex-direction: column; min-height: 100vh; }
        ` }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
