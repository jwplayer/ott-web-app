import React from 'react';
import { useProgram, type Program } from 'planby';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { testId } from '@jwp/ott-common/src/utils/common';

import styles from './EpgProgramItem.module.scss';

type Props = {
  program: Program;
  onClick?: (program: Program) => void;
  isActive: boolean;
  compact: boolean;
  disabled: boolean;
  isBaseTimeFormat: boolean;
};

const ProgramItem: React.VFC<Props> = ({ program, onClick, isActive, compact, disabled, isBaseTimeFormat }) => {
  const {
    styles: { position },
    formatTime,
    set12HoursTimeFormat,
    isLive,
    isMinWidth,
  } = useProgram({
    program,
    isBaseTimeFormat,
  });

  const { t } = useTranslation('common');
  const { data } = program;
  const { image, title, since, till } = data;

  const sinceTime = formatTime(since, set12HoursTimeFormat()).toLowerCase();
  const tillTime = formatTime(till, set12HoursTimeFormat()).toLowerCase();

  const showImage = !compact && isMinWidth;
  const showLiveTagInImage = !compact && isMinWidth && isLive;
  const alt = ''; // intentionally empty for a11y, because adjacent text alternative

  return (
    <div className={styles.epgProgramBox} style={position} onClick={() => onClick && onClick(program)}>
      <div
        className={classNames(styles.epgProgram, {
          [styles.selected]: isActive,
          [styles.live]: isLive,
          [styles.disabled]: disabled,
        })}
        style={{ width: styles.width }}
        data-testid={testId(program.data.id)}
      >
        {showImage && <img className={styles.epgProgramImage} src={image} alt={alt} />}
        {showLiveTagInImage && <div className={styles.epgLiveTag}>{t('live')}</div>}
        <div className={styles.epgProgramContent}>
          {compact && isLive && <div className={styles.epgLiveTag}>{t('live')}</div>}
          <h2 className={styles.epgProgramTitle}>{title}</h2>
          <span className={styles.epgProgramText}>
            {sinceTime} - {tillTime}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProgramItem;
