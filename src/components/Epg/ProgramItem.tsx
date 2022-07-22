import React from 'react';
import { Program, ProgramBox, ProgramContent, ProgramFlex, ProgramImage, ProgramStack, ProgramText, ProgramTitle, useProgram } from 'planby';

type Props = {
  program: Program;
  onClick?: (program: Program) => void;
  isActive: boolean;
};

const ProgramItem: React.VFC<Props> = ({ program, onClick, isActive }) => {
  const { styles, formatTime, set12HoursTimeFormat, isLive, isMinWidth } = useProgram({
    program,
    isBaseTimeFormat: true,
  });

  const { data } = program;
  const { image, title, since, till } = data;

  const sinceTime = formatTime(since, set12HoursTimeFormat()).toLowerCase();
  const tillTime = formatTime(till, set12HoursTimeFormat()).toLowerCase();

  return (
    <ProgramBox width={styles.width} style={styles.position} onClick={() => onClick && onClick(program)}>
      <ProgramContent width={styles.width} isLive={isLive} style={{ background: isActive ? '#1616c2' : '' }}>
        <ProgramFlex>
          {isLive && isMinWidth && <ProgramImage src={image} alt="Preview" />}
          <ProgramStack>
            <ProgramTitle>{title}</ProgramTitle>
            <ProgramText>
              {sinceTime} - {tillTime}
            </ProgramText>
          </ProgramStack>
        </ProgramFlex>
      </ProgramContent>
    </ProgramBox>
  );
};

export default ProgramItem;
