import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useQueryParams } from '@strapi/helper-plugin';
import { useRouteMatch } from 'react-router-dom';
import get from 'lodash/get';
import { Select, Option } from '@strapi/design-system/Select';
import { useIntl } from 'react-intl';
import useContentTypePermissions from '../../hooks/useContentTypePermissions';
import useHasPersonalization from "../../hooks/useHasPersonalization";
import selectPersonalizationVariations from '../../selectors/selectPersonalizationVariations';
import getInitialVariation from '../../utils/getInitialVariation';
import getTrad from '../../utils/getTrad';

const VariationPicker = () => {
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();
  const variations = useSelector(selectPersonalizationVariations);
  const [{ query }, setQuery] = useQueryParams();
  const {
    params: { slug },
  } = useRouteMatch('/content-manager/collectionType/:slug');
  const isFieldPersonalized = useHasPersonalization();
  const { createPermissions, readPermissions } = useContentTypePermissions(slug);

  const initialVariation = getInitialVariation(query, variations);
  const [selected, setSelected] = useState(initialVariation?.slug || '');

  if (!isFieldPersonalized) {
    return null;
  }

  if (!variations || variations.length === 0) {
    return null;
  }

  const displayedVariations = variations.filter(variation => {
    const canCreate = createPermissions.find(({ properties }) => {
      return get(properties, 'variations', []).includes(variation.slug);
    });
    const canRead = readPermissions.find(({ properties }) =>
      get(properties, 'variations', []).includes(variation.slug)
    );

    return canCreate || canRead;
  });

  const handleClick = slug => {
    if (slug === selected) {
      return;
    }

    dispatch({ type: 'ContentManager/RBACManager/RESET_PERMISSIONS' });

    setSelected(slug);

    setQuery({
      plugins: { ...query.plugins, personalization: { variation: slug } },
    });
  };

  return (
    <Select
      size="S"
      aria-label={formatMessage({ id: getTrad('actions.select-variation'), defaultMessage: '' })}
      value={selected}
      onChange={handleClick}
    >
      {displayedVariations.map(variation => (
        <Option key={variation.id} id={`menu-item${variation.name || variation.slug}`} value={variation.slug}>
          {variation.name}
        </Option>
      ))}
    </Select>
  );
};

export default VariationPicker;
