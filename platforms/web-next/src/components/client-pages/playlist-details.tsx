"use client";
import PlaylistScreenRouter from '@jwp/ott-ui-react-next/src/pages/ScreenRouting/PlaylistScreenRouter';

import { ClientProvider } from '../client-provider/ClientProvider';

export default function PlaylistDetails() {
    return (
        <ClientProvider>
            <PlaylistScreenRouter type='playlist' />
        </ClientProvider>
    )
}