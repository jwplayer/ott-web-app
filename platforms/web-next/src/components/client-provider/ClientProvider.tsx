"use client"

//must be imported on top of the file ****
import "../../modules/register";
// ***************************************

import { AriaAnnouncerProvider } from "@jwp/ott-ui-react-next/src/containers/AnnouncementProvider/AnnoucementProvider";
import QueryProvider from "@jwp/ott-ui-react-next/src/containers/QueryProvider/QueryProvider";
import React, { useState, useEffect } from 'react';
import { IS_DEMO_MODE, IS_DEVELOPMENT_BUILD, IS_PREVIEW_MODE, IS_PROD_MODE } from '@jwp/ott-common-next/src/utils/common';
import ErrorPage, { ErrorPageWithoutTranslation } from '@jwp/ott-ui-react-next/src/components/ErrorPage/ErrorPage';
import DevConfigSelector from '@jwp/ott-ui-react-next/src/components/DevConfigSelector/DevConfigSelector';
import LoadingOverlay from '@jwp/ott-ui-react-next/src/components/LoadingOverlay/LoadingOverlay';
import { type BootstrapData, useBootstrapApp } from '@jwp/ott-hooks-react-next/src/useBootstrapApp';
import { AppError } from '@jwp/ott-common-next/src/utils/error';
import { logError } from "@jwp/ott-common-next/src/logger";

import initI18n from "../../i18n/config";

interface State {
    isLoading: boolean;
    error?: Error;
}
// import { useTrackConfigKeyChange } from '#src/hooks/useTrackConfigKeyChange';


const IS_DEMO_OR_PREVIEW = IS_DEMO_MODE || IS_PREVIEW_MODE;

const BootstrapError = ({ error }: { error: Error | AppError }) => {
    if (error instanceof AppError) {
        return <ErrorPage title={error.payload.title} message={error.payload.description} helpLink={error.payload.helpLink} error={error} />;
    }
    return <ErrorPage error={error} />;
};

const ProdContentLoader = ({ query }: { query: BootstrapData }) => {
    const { isLoading, error } = query;

    if (isLoading) {
        return <LoadingOverlay />;
    }

    if (error) {
        return <BootstrapError error={error} />;
    }

    return null;
};

const DemoContentLoader = ({ query }: { query: BootstrapData }) => {
    const { isLoading, error, data } = query;

    // Show the spinner while loading except in demo mode (the demo config shows its own loading status)
    if (!IS_DEMO_OR_PREVIEW && isLoading) {
        return <LoadingOverlay />;
    }

    const { configSource } = data || {};

    return (
        <>
            {/* Show the error page when error except in demo mode (the demo mode shows its own error) */}
            {!IS_DEMO_OR_PREVIEW && error && <BootstrapError error={error} />}
            {/* {IS_DEMO_OR_PREVIEW && <DemoConfigDialog query={query} />} */}
            {/* Config select control to improve testing experience */}
            {(IS_DEVELOPMENT_BUILD || IS_PREVIEW_MODE) && <DevConfigSelector selectedConfig={configSource} />}
        </>
    );
};

// This is moved to a separate, parallel component to reduce rerenders
const RootLoader = ({ onReady }: { onReady: () => void }) => {
    const query = useBootstrapApp(window.location.href, onReady);

    // Modify query string to add / remove app-config id
    // useTrackConfigKeyChange(query.data?.settings, query.data?.configSource);

    return IS_PROD_MODE ? <ProdContentLoader query={query} /> : <DemoContentLoader query={query} />;
};

export const ClientProvider = ({ children }: { children: React.JSX.Element }) => {
    const [i18nState, seti18nState] = useState<State>({ isLoading: true });
    const [isLoading, setIsLoading] = useState(true);


    useEffect(() => {
        initI18n()
            .then(() => seti18nState({ isLoading: false }))
            .catch((e) => seti18nState({ isLoading: false, error: e as Error }));
    }, []);

    if (i18nState.isLoading) {
        return <LoadingOverlay />;
    }

    if (i18nState.error) {
        logError('App', 'Failed to load translations', { error: i18nState.error });

        // Don't be tempted to translate these strings. If i18n fails to load, translations won't work anyhow
        return (
            <ErrorPageWithoutTranslation
                title={'Unable to load translations'}
                message={'Check your language settings and try again later. If the problem persists contact technical support.'}
                error={i18nState.error}
            />
        );
    }


    return (
        <QueryProvider >
            <AriaAnnouncerProvider>
                {isLoading && <LoadingOverlay />}
                {!isLoading && children}
                <RootLoader onReady={() => setIsLoading(false)} />
            </AriaAnnouncerProvider>
        </QueryProvider>
    )
}