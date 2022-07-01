import React, { useMemo } from 'react';
import get from 'lodash/get';
import has from 'lodash/has';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { useCMEditViewDataManager, useQueryParams } from '@strapi/helper-plugin';
import selectPersonalizationVariations from '../../selectors/selectPersonalizationVariations';
import useContentTypePermissions from '../../hooks/useContentTypePermissions';
import CMEditViewVariationPicker from './CMEditViewVariationPicker';

const CMEditViewInjectedComponents = () => {
  const { layout, modifiedData, initialData, slug, isSingleType } = useCMEditViewDataManager();
  const { createPermissions, readPermissions } = useContentTypePermissions(slug);
  const variations = useSelector(selectPersonalizationVariations);
  const params = useParams();
  const [{ query }, setQuery] = useQueryParams();

  const id = get(params, 'id', null);
  const currentEntityId = id;
  const defaultVariation = variations.find(loc => loc.isDefault);
  const currentVariation = get(query, 'plugins.personalization.variation', defaultVariation.slug);
  const hasPersonalizationEnabled = get(layout, ['pluginOptions', 'personalization', 'personalized'], false);
  const hasDraftAndPublishEnabled = get(layout, ['options', 'draftAndPublish'], false);

  const defaultQuery = useMemo(() => {
    if (!query) {
      return { plugins: { personalization: { variation: currentVariation } } };
    }

    return query;
  }, [query, currentVariation]);

  if (!hasPersonalizationEnabled) {
    return null;
  }

  if (!currentVariation) {
    return null;
  }

  const personalizations = get(modifiedData, 'personalizations', []);

  let currentVariationStatus = 'did-not-create-variation';

  if (has(initialData, 'publishedAt')) {
    currentVariationStatus = initialData.publishedAt ? 'published' : 'draft';
  }

  return (
    <CMEditViewVariationPicker
      appVariations={variations}
      currentEntityId={currentEntityId}
      createPermissions={createPermissions}
      currentVariationStatus={currentVariationStatus}
      hasDraftAndPublishEnabled={hasDraftAndPublishEnabled}
      personalizations={personalizations}
      isSingleType={isSingleType}
      query={defaultQuery}
      readPermissions={readPermissions}
      setQuery={setQuery}
      slug={slug}
    />
  );
};

export default CMEditViewInjectedComponents;
