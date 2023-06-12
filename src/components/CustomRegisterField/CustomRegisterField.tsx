import { type FC, type ChangeEventHandler, type ReactNode, useMemo } from 'react';
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
  value: string | boolean;
  onChange: ChangeEventHandler<HTMLInputElement>;
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

export const CustomRegisterField: FC<Props> = ({ type, value = '', ...props }) => {
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

  switch (type) {
    case ConsentFieldVariants.CHECKBOX:
      return <Checkbox {...props} checked={value === true} />;
    case ConsentFieldVariants.INPUT:
      return <TextField {...props} value={value as string} />;
    case ConsentFieldVariants.RADIO:
      return <Radio {...props} values={optionsList} value={value as string} header={props.label} />;
    case ConsentFieldVariants.GENERAL_SELECT:
    case ConsentFieldVariants.COUNTRY_SELECT:
    case ConsentFieldVariants.US_STATE_SELECT:
      return <Dropdown {...props} options={optionsList} value={value as string} defaultLabel={props.placeholder} fullWidth />;
  }

  return null;
};

export default CustomRegisterField;
