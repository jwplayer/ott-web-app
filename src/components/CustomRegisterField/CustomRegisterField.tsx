import { type FC, type ChangeEventHandler, type ReactNode, useMemo, useCallback } from 'react';
import type { GetRegisterFieldOption } from '@inplayer-org/inplayer.js';

import Checkbox from '#components/Checkbox/Checkbox';
import TextField from '#components/TextField/TextField';
import Radio from '#components/Radio/Radio';
import Dropdown from '#components/Dropdown/Dropdown';
import { ConsentFieldVariants } from '#src/services/inplayer.account.service';
import { countries, usStates } from '#static/json';

type Props = {
  type: ConsentFieldVariants;
  name: string;
  value: string;
  onChange: (name: string, value: string) => void;
} & Partial<{
  label: ReactNode;
  placeholder: string;
  error: boolean;
  helperText: string;
  disabled: boolean;
  required: boolean;
  options: GetRegisterFieldOption;
}>;

export type CustomRegisterFieldCommonProps = Props;

export const CustomRegisterField: FC<Props> = ({ type, name, value = '', onChange, ...props }) => {
  const changeHandler: ChangeEventHandler<HTMLInputElement> = useCallback(
    (e) => {
      if (type === ConsentFieldVariants.CHECKBOX) {
        onChange(name, `${e.target.checked}`);
      } else {
        onChange(name, e.target.value);
      }
    },
    [type, name, onChange],
  );

  const optionsList = useMemo(() => {
    const optionsObject = (() => {
      switch (type) {
        case ConsentFieldVariants.COUNTRY_SELECT:
          return countries;
        case ConsentFieldVariants.US_STATE_SELECT:
          return usStates;
        default:
          return props.options;
      }
    })();

    if (!optionsObject) {
      return [];
    }

    return Object.entries(optionsObject).map(([value, label]) => ({ value, label }));
  }, [type, props.options]);

  const commonProps = { ...props, name, onChange: changeHandler };

  switch (type) {
    case ConsentFieldVariants.CHECKBOX:
      return <Checkbox {...commonProps} checked={value === 'true'} />;
    case ConsentFieldVariants.INPUT:
      return <TextField {...commonProps} value={value} />;
    case ConsentFieldVariants.RADIO:
      return <Radio {...commonProps} values={optionsList} value={value} header={props.label} />;
    case ConsentFieldVariants.GENERAL_SELECT:
    case ConsentFieldVariants.COUNTRY_SELECT:
    case ConsentFieldVariants.US_STATE_SELECT:
      return <Dropdown {...commonProps} options={optionsList} value={value} defaultLabel={props.placeholder} fullWidth />;
  }

  return null;
};

export default CustomRegisterField;
