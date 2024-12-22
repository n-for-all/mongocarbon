import { Links, Meta, Outlet, Scripts, ScrollRestoration } from "@remix-run/react";
import type { LinksFunction } from "@remix-run/node";
import { Toaster } from "~/ui/toaster";

import "./tailwind.css";

export const links: LinksFunction = () => [
    {
        rel: "icon",
        type: "image/svg+xml",
        href: "/favicon.svg",
    },
];

export function Layout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <head>
                <meta charSet="utf-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <Meta />
                <Links />
            </head>
            <body>
                {children}
                <ScrollRestoration />
                <Scripts />
                <Toaster />
            </body>
        </html>
    );
}

export default function App() {
    return <Outlet />;
}
