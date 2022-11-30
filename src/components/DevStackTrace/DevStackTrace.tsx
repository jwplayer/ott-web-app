import React, { useState } from 'react';

import styles from './DevStackTrace.module.scss';

export default function DevStackTrace({ error }: { error: Error | undefined }) {
  const [open, setOpen] = useState(false);

  if (!error?.stack) {
    return null;
  }

  const showClick = () => {
    setOpen((s) => !s);
  };

  return (
    <>
      <a onClick={showClick}>{(open ? 'Hide' : 'Show') + ' Stack Trace'}</a>
      {open && (
        <>
          <br />
          <p>
            {error?.stack?.split('/n').map((line, index) => (
              <span className={styles.stack} key={index}>
                {line}
              </span>
            ))}
          </p>
        </>
      )}
    </>
  );
}
