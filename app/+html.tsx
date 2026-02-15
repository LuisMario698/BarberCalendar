import { ScrollViewStyleReset } from 'expo-router/html';
import { type PropsWithChildren } from 'react';

/**
 * This file is web-only and used to configure the root HTML for every page.
 * The <head> doesn't support event listeners.
 */
export default function Root({ children }: PropsWithChildren) {
    return (
        <html lang="es">
            <head>
                <meta charSet="utf-8" />
                <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1, shrink-to-fit=no, viewport-fit=cover"
                />
                {/* 
          Disable body scrolling on web. This makes ScrollView components work closer to how they do on native. 
          However, body scrolling is often good for mobile web. If you want to enable it, remove this line.
        */}
                <ScrollViewStyleReset />

                {/* Using raw CSS styles as an escape hatch to ensure the background is black */}
                <style dangerouslySetInnerHTML={{
                    __html: `
          body {
            background-color: #000000 !important;
            overscroll-behavior-y: none; /* Disables pull-to-refresh style bounce effects */
          }
          #root {
            display: flex;
            flex: 1;
          }
        `}} />
            </head>
            <body>{children}</body>
        </html>
    );
}
