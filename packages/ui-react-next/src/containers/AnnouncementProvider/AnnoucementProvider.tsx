import { secondsToMilliseconds } from 'date-fns';
import { type PropsWithChildren, createContext, useCallback, useContext, useState } from 'react';
import { createPortal } from 'react-dom';

import FormFeedback from '../../components/FormFeedback/FormFeedback';

export type AriaAnnouncerVariant = 'success' | 'error' | 'warning' | 'info';
type Announcement = { message: string; variant: AriaAnnouncerVariant };
type AnnounceFn = (message: string, variant: AriaAnnouncerVariant, duration?: number) => void;
type ContextValue = { announce: AnnounceFn };

const AriaAnnouncerContext = createContext<ContextValue | undefined>(undefined);

export const useAriaAnnouncer = () => {
  const announce = useContext(AriaAnnouncerContext);

  if (!announce) throw new Error('Announcer context is not defined');

  return announce.announce;
};

export const AriaAnnouncerProvider = ({ children }: PropsWithChildren) => {
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);

  const announce = useCallback((message: string, variant: AriaAnnouncerVariant, duration = secondsToMilliseconds(10)) => {
    setAnnouncement({ message, variant });

    setTimeout(() => {
      setAnnouncement(null);
    }, duration);
  }, []);

  return (
    <AriaAnnouncerContext.Provider value={{ announce }}>
      {announcement &&
        createPortal(
          <FormFeedback variant={announcement.variant} visible={false}>
            {announcement.message}
          </FormFeedback>,
          document.body,
        )}
      {children}
    </AriaAnnouncerContext.Provider>
  );
};
