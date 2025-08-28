"use client";
import MediaScreenRouter from '@jwp/ott-ui-react-next/src/pages/ScreenRouting/MediaScreenRouter';
import { ClientProvider } from '../client-provider/ClientProvider';

export default function MediaDetails({ paths }: { paths: string[] }) {
    return (
        <ClientProvider>
            <MediaScreenRouter mediaId={paths[0]} />
        </ClientProvider>
    )
}