'use client';

import Home from "@jwp/ott-ui-react-next/src/pages/Home/Home";

import { ClientProvider } from "../client-provider/ClientProvider";

export default function HomePage() {
    return (
        <ClientProvider>
            <Home/>
        </ClientProvider>
    );
}