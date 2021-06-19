import React, { useState, useEffect, useCallback, ReactNode } from 'react';

type Props = {
  open?: boolean;
  duration?: number;
  children: ReactNode;
};

type Status = 'opening' | 'open' | 'closing' | 'closed';

const Fade = ({ open = true, duration = 250, children }: Props): JSX.Element | null => {
  const [status, setStatus] = useState<Status>('closed');
  const seconds = duration / 1000;
  const transition = `opacity ${seconds}s ease`;

  const prepareClose = useCallback(() => {
    if (open) {
      setStatus('closing');
      setTimeout(() => setStatus('closed'), duration);
    }
  }, [duration, open]);

  useEffect(() => {
    if (open) {
      setTimeout(() => setStatus('opening'), 10);
      setTimeout(() => setStatus('open'), duration - 10);
    } else {
      setStatus('closing');
      setTimeout(() => setStatus('closed'), duration);
    }
  }, [duration, transition, open, prepareClose]);

  return (
    <div style={{ display: status === 'closed' ? 'none' : '' }}>
      <div style={{ opacity: status === 'opening' || status === 'open' ? 1 : 0, transition }}>{children}</div>
    </div>
  );
};

export default Fade;
