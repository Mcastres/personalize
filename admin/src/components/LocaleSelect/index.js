/* eslint-disable react/jsx-indent */
import React from 'react';
import { ComboboxOption, Combobox } from '@strapi/design-system/Combobox';
import { useIntl } from 'react-intl';
import PropTypes from 'prop-types';
import useLocales from '../../hooks/useLocales';
import { getTrad } from '../../utils';

/**
 * The component is memoized and needs a useCallback over the onLocaleChange and
 * onClear props to prevent the Select from re-rendering N times when typing on a specific
 * key in a formik form
 */
const LocaleSelect = React.memo(({ value, onClear, onLocaleChange, error }) => {
  const { formatMessage } = useIntl();
  const { locales, isLoading } = useLocales();

  const options = (locales || [])
    .map(locale => ({
      label: locale.name,
      value: locale.slug,
    }))

  const computedValue = value || '';

  return (
    <Combobox
      aria-busy={isLoading}
      error={error}
      label={formatMessage({
        id: getTrad('Settings.locales.modal.locales.label'),
        defaultMessage: 'Locales',
      })}
      value={computedValue}
      onClear={value ? onClear : undefined}
      onChange={selectedLocaleKey => {
        const selectedLocale = locales.find(locale => locale.value === selectedLocaleKey);

        if (selectedLocale) {
          onLocaleChange({ slug: selectedLocale.value, displayName: selectedLocale.label });
        }
      }}
      placeholder={formatMessage({
        id: 'components.placeholder.select',
        defaultMessage: 'Select',
      })}
    >
      {options.map(option => (
        <ComboboxOption value={option.value} key={option.value}>
          {option.label}
        </ComboboxOption>
      ))}
    </Combobox>
  );
});

LocaleSelect.defaultProps = {
  error: undefined,
  value: undefined,
  onClear: () => {},
  onLocaleChange: () => undefined,
};

LocaleSelect.propTypes = {
  error: PropTypes.string,
  onClear: PropTypes.func,
  onLocaleChange: PropTypes.func,
  value: PropTypes.string,
};

export default LocaleSelect;
