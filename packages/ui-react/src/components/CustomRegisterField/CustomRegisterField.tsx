import { type ChangeEventHandler, type FC, type ReactNode, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { RegisterFieldOptions } from '@inplayer-org/inplayer.js';
import type { CustomRegisterFieldVariant } from '@jwp/ott-common/types/account';
import { isTruthyCustomParamValue, testId } from '@jwp/ott-common/src/utils/common';

import Checkbox from '../Checkbox/Checkbox';
import TextField from '../TextField/TextField';
import Radio from '../Radio/Radio';
import Dropdown from '../Dropdown/Dropdown';
import DateField from '../DateField/DateField';

export type CustomRegisterFieldCommonProps = {
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
  editing: boolean;
  lang: string;
}>;

const CustomRegisterField: FC<CustomRegisterFieldCommonProps> = ({ type, value = '', options, editing, lang, ...props }) => {
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
  }, [type, options, i18n, t]);

  switch (type) {
    case 'input':
      return <TextField {...props} value={value as string} testId={testId(`crf-${type}`)} />;
    case 'radio':
      return <Radio {...props} values={optionsList} value={value as string} header={props.label} data-testid={testId(`crf-${type}`)} lang={lang} />;
    case 'select':
    case 'country':
    case 'us_state':
      return (
        <Dropdown
          {...props}
          options={optionsList}
          value={value as string}
          defaultLabel={props.placeholder}
          fullWidth
          testId={testId(`crf-${type}`)}
          lang={lang}
        />
      );
    case 'datepicker':
      return <DateField {...props} value={value as string} testId={testId(`crf-${type}`)} />;
    default:
      return <Checkbox {...props} checked={isTruthyCustomParamValue(value)} data-testid={testId(`crf-${type}`)} lang={lang} />;
  }
};

export default CustomRegisterField;
