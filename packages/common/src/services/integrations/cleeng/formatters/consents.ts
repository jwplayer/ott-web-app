import type { PublisherConsent } from '../types/models';
import type { CustomFormField } from '../../../../../types/account';

export const formatPublisherConsent = (consent: PublisherConsent): CustomFormField => {
  return {
    type: 'checkbox',
    name: consent.name,
    label: consent.label,
    defaultValue: '',
    required: consent.required,
    placeholder: consent.placeholder,
    options: {},
    enabledByDefault: false,
    version: consent.version,
  };
};
