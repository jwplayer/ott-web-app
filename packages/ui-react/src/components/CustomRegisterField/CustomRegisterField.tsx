import { type ChangeEventHandler, type FC, type ReactNode, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { CustomRegisterFieldVariant } from '@jwp/ott-common/types/account';
import { isTruthyCustomParamValue, testId } from '@jwp/ott-common/src/utils/common';

import Checkbox from '../form-fields/Checkbox/Checkbox';
import TextField from '../form-fields/TextField/TextField';
import Radio from '../form-fields/Radio/Radio';
import Dropdown from '../form-fields/Dropdown/Dropdown';
import DateField from '../form-fields/DateField/DateField';

export type CustomRegisterFieldCommonProps = {
  type?: CustomRegisterFieldVariant;
  name: string;
  value: string | boolean;
  onChange: ChangeEventHandler;
} & Partial<{
  label: ReactNode;
  placeholder: string;
  error: boolean;
  helperText: string;
  disabled: boolean;
  required: boolean;
  options: Record<string, string>;
  editing: boolean;
  lang: string;
}>;

const CustomRegisterField: FC<CustomRegisterFieldCommonProps> = ({ type, value = '', label, options, editing, lang, ...props }) => {
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
      return <TextField {...props} value={String(value)} label={label} testId={testId(`crf-${type}`)} />;
    case 'radio':
      return <Radio {...props} label={label} values={optionsList} value={String(value)} data-testid={testId(`crf-${type}`)} lang={lang} />;
    case 'select':
    case 'country':
    case 'us_state':
      return (
        <Dropdown
          {...props}
          options={optionsList}
          value={String(value)}
          label={label}
          defaultLabel={props.placeholder}
          testId={testId(`crf-${type}`)}
          lang={lang}
        />
      );
    case 'datepicker':
      return <DateField {...props} value={String(value)} label={label} testId={testId(`crf-${type}`)} />;
    default:
      return <Checkbox {...props} checkboxLabel={label} checked={isTruthyCustomParamValue(value)} data-testid={testId(`crf-${type}`)} lang={lang} />;
  }
};

export default CustomRegisterField;
