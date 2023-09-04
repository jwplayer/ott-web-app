import { type FC, type ChangeEventHandler, type ReactNode, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { GetRegisterFieldOption } from '@inplayer-org/inplayer.js';

import Checkbox from '#components/Checkbox/Checkbox';
import TextField from '#components/TextField/TextField';
import Radio from '#components/Radio/Radio';
import Dropdown from '#components/Dropdown/Dropdown';
import DateField from '#components/DateField/DateField';
import { ConsentFieldVariants, REGISTER_FIELD_VARIANT } from '#src/services/inplayer.account.service';

type Props = {
  type: ConsentFieldVariants;
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
  const { t, i18n } = useTranslation(type);

  const optionsList = useMemo(() => {
    if (!i18n.isInitialized) {
      return [];
    }

    switch (type) {
      case REGISTER_FIELD_VARIANT.COUNTRY_SELECT:
      case REGISTER_FIELD_VARIANT.US_STATE_SELECT: {
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

  switch (type) {
    case REGISTER_FIELD_VARIANT.CHECKBOX:
      return <Checkbox {...props} checked={value === true} />;
    case REGISTER_FIELD_VARIANT.INPUT:
      return <TextField {...props} value={value as string} />;
    case REGISTER_FIELD_VARIANT.RADIO:
      return <Radio {...props} values={optionsList} value={value as string} header={props.label} />;
    case REGISTER_FIELD_VARIANT.GENERIC_SELECT:
    case REGISTER_FIELD_VARIANT.COUNTRY_SELECT:
    case REGISTER_FIELD_VARIANT.US_STATE_SELECT:
      return <Dropdown {...props} options={optionsList} value={value as string} defaultLabel={props.placeholder} fullWidth />;
    case REGISTER_FIELD_VARIANT.DATE_PICKER:
      return <DateField {...props} value={value as string} />;
    default:
      return null;
  }
};

export default CustomRegisterField;