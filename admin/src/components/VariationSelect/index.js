/* eslint-disable react/jsx-indent */
import React from 'react';
import { ComboboxOption, Combobox } from '@strapi/design-system/Combobox';
import { useIntl } from 'react-intl';
import PropTypes from 'prop-types';
import useVariations from '../../hooks/useVariations';
import { getTrad } from '../../utils';

/**
 * The component is memoized and needs a useCallback over the onVariationChange and
 * onClear props to prevent the Select from re-rendering N times when typing on a specific
 * key in a formik form
 */
const VariationSelect = React.memo(({ value, onClear, onVariationChange, error }) => {
  const { formatMessage } = useIntl();
  const { variations, isLoading } = useVariations();

  const options = (variations || [])
    .map(variation => ({
      label: variation.name,
      value: variation.slug,
    }))

  const computedValue = value || '';

  return (
    <Combobox
      aria-busy={isLoading}
      error={error}
      label={formatMessage({
        id: getTrad('Settings.variations.modal.variations.label'),
        defaultMessage: 'Variations',
      })}
      value={computedValue}
      onClear={value ? onClear : undefined}
      onChange={selectedVariationKey => {
        const selectedVariation = variations.find(
          (variation) => variation.value === selectedVariationKey
        );

        if (selectedVariation) {
          onVariationChange({ slug: selectedVariation.value, displayName: selectedVariation.label });
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

VariationSelect.defaultProps = {
  error: undefined,
  value: undefined,
  onClear: () => {},
  onVariationChange: () => undefined,
};

VariationSelect.propTypes = {
  error: PropTypes.string,
  onClear: PropTypes.func,
  onVariationChange: PropTypes.func,
  value: PropTypes.string,
};

export default VariationSelect;
