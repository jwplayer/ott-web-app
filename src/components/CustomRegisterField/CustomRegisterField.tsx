import { type FC, type ChangeEventHandler, type ReactNode, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { RegisterFieldOptions } from '@inplayer-org/inplayer.js';

import type { CustomRegisterFieldVariant } from '#types/account';
import { isTruthyCustomParamValue, testId } from '#src/utils/common';
import Checkbox from '#components/Checkbox/Checkbox';
import TextField from '#components/TextField/TextField';
import Radio from '#components/Radio/Radio';
import Dropdown from '#components/Dropdown/Dropdown';
import DateField from '#components/DateField/DateField';

type Props = {
  type?: CustomRegisterFieldVariant;
  name: string;
  value: string | boolean;
  onChange: ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>;
} & Partial<{
  label: ReactNode;
  placeholder: string;
  error: boolean;
  helperText: string;
  disabled: boolean;
  required: boolean;
  options: RegisterFieldOptions;
}>;

export type CustomRegisterFieldCommonProps = Props;

export const CustomRegisterField: FC<Props> = ({ type, value = '', options, ...props }) => {
  const { t, i18n } = useTranslation();

  const optionsList = useMemo(() => {
    if (type && ['country', 'us_state'].includes(type)) {
      const codes = Object.keys(i18n.getResourceBundle(i18n.language, type));

      return codes.map((code) => ({
        value: code,
        label: t(`${type}:${code}`),
      }));
    }

    if (options) {
      return Object.entries(options).map(([value, label]) => ({ value, label }));
    }

    return [];
  }, [t, type, options, i18n]);

  switch (type) {
    case 'input':
      return <TextField {...props} value={value as string} testId={testId(`crf-${type}`)} />;
    case 'radio':
      return <Radio {...props} values={optionsList} value={value as string} header={props.label} data-testid={testId(`crf-${type}`)} />;
    case 'select':
    case 'country':
    case 'us_state':
      return <Dropdown {...props} options={optionsList} value={value as string} defaultLabel={props.placeholder} fullWidth testId={testId(`crf-${type}`)} />;
    case 'datepicker':
      return <DateField {...props} value={value as string} testId={testId(`crf-${type}`)} />;
    default:
      return <Checkbox {...props} checked={isTruthyCustomParamValue(value)} data-testid={testId(`crf-${type}`)} />;
  }
};

export default CustomRegisterField;
