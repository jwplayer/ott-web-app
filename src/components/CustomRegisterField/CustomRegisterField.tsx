import { type FC, type ChangeEventHandler, type ReactNode, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { GetRegisterFieldOption } from '@inplayer-org/inplayer.js';

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
  options: GetRegisterFieldOption;
}>;

export type CustomRegisterFieldCommonProps = Props;

export const CustomRegisterField: FC<Props> = ({ type, value = '', ...props }) => {
  const { t, i18n } = useTranslation();

  const optionsList = useMemo(() => {
    switch (type) {
      case 'country':
      case 'us_state': {
        const codes = Object.keys(i18n.getResourceBundle(i18n.language, type));

        return codes.map((code) => ({
          value: code,
          label: t(`${type}:${code}`),
        }));
      }
      default: {
        if (props.options) {
          return Object.entries(props.options).map(([value, label]) => ({ value, label }));
        }

        return [];
      }
    }
  }, [t, type, props.options, i18n]);

  const commonProps = { 'data-testid': testId(`crf-${type}`), ...props };

  switch (type) {
    case 'input':
      return <TextField {...commonProps} value={value as string} />;
    case 'radio':
      return <Radio {...commonProps} values={optionsList} value={value as string} header={props.label} />;
    case 'select':
    case 'country':
    case 'us_state':
      return <Dropdown {...commonProps} options={optionsList} value={value as string} defaultLabel={props.placeholder} fullWidth />;
    case 'datepicker':
      return <DateField {...commonProps} value={value as string} />;
    default:
      return <Checkbox {...commonProps} checked={isTruthyCustomParamValue(value)} />;
  }
};

export default CustomRegisterField;
