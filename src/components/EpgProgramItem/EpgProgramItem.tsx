import React from 'react';
import { Program, useProgram } from 'planby';
import classNames from 'classnames';

import styles from './EpgProgramItem.module.scss';

type Props = {
  program: Program;
  onClick?: (program: Program) => void;
  isActive: boolean;
};

const ProgramItem: React.VFC<Props> = ({ program, onClick, isActive }) => {
  const {
    styles: { position },
    formatTime,
    set12HoursTimeFormat,
    isLive,
    isMinWidth,
  } = useProgram({
    program,
    isBaseTimeFormat: true,
  });

  const { data } = program;
  const { image, title, since, till } = data;

  const sinceTime = formatTime(since, set12HoursTimeFormat()).toLowerCase();
  const tillTime = formatTime(till, set12HoursTimeFormat()).toLowerCase();

  return (
    <div className={styles.epgProgramBox} style={position} onClick={() => onClick && onClick(program)}>
      <div className={classNames(styles.epgProgramContent, { [styles.active]: isActive, [styles.live]: isLive })} style={{ width: styles.width }}>
        {isMinWidth && <img className={styles.epgProgramImage} src={image} alt="Preview" />}
        <div>
          {/* <div className={styles.epgProgramText}>
            {sinceTime} - {tillTime}
          </div> */}
          <div className={styles.epgProgramTitle}>{title}</div>
          <div className={styles.epgProgramText}>
            {sinceTime} - {tillTime}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgramItem;
