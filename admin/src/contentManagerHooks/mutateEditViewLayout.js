import React from 'react';
import get from 'lodash/get';
import Personalization from '@strapi/icons/Earth';
import StrikedWorld from '@strapi/icons/EarthStriked';
import LabelAction from '../components/LabelAction';
import { getTrad } from '../utils';

const enhanceRelationLayout = (layout, variation) =>
  layout.map(current => {
    const labelActionProps = {
      title: {
        id: getTrad('Field.personalized'),
        defaultMessage: 'This value is unique for the selected variation',
      },
      icon: <Personalization aria-hidden />,
    };
    let queryInfos = current.queryInfos;

    if (get(current, ['targetModelPluginOptions', 'personalization', 'personalized'], false)) {
      queryInfos = {
        ...queryInfos,
        defaultParams: { ...queryInfos.defaultParams, variation },
        paramsToKeep: ['plugins.personalization.variation'],
      };
    }

    return { ...current, labelAction: <LabelAction {...labelActionProps} />, queryInfos };
  });

const enhanceEditLayout = layout =>
  layout.map(row => {
    const enhancedRow = row.reduce((acc, field) => {
      const type = get(field, ['fieldSchema', 'type'], null);
      const hasPersonalizationEnabled = get(
        field,
        ['fieldSchema', 'pluginOptions', 'personalization', 'personalized'],
        type === 'uid'
      );

      const labelActionProps = {
        title: {
          id: hasPersonalizationEnabled ? getTrad('Field.personalized') : getTrad('Field.not-personalized'),
          defaultMessage: hasPersonalizationEnabled
            ? 'This value is unique for the selected variation'
            : 'This value is common to all variations',
        },
        icon: hasPersonalizationEnabled ? <Personalization aria-hidden /> : <StrikedWorld aria-hidden />,
      };

      acc.push({ ...field, labelAction: <LabelAction {...labelActionProps} /> });

      return acc;
    }, []);

    return enhancedRow;
  });

const enhanceComponentsLayout = (components, variation) => {
  return Object.keys(components).reduce((acc, current) => {
    const currentComponentLayout = components[current];

    const enhancedEditLayout = enhanceComponentLayoutForRelations(
      currentComponentLayout.layouts.edit,
      variation
    );

    acc[current] = {
      ...currentComponentLayout,
      layouts: { ...currentComponentLayout.layouts, edit: enhancedEditLayout },
    };

    return acc;
  }, {});
};

const enhanceComponentLayoutForRelations = (layout, variation) =>
  layout.map(row => {
    const enhancedRow = row.reduce((acc, field) => {
      if (
        get(field, ['fieldSchema', 'type']) === 'relation' &&
        get(field, ['targetModelPluginOptions', 'personalization', 'personalized'], false)
      ) {
        const queryInfos = {
          ...field.queryInfos,
          defaultParams: { ...field.queryInfos.defaultParams, variation },
          paramsToKeep: ['plugins.personalization.variation'],
        };

        acc.push({ ...field, queryInfos });

        return acc;
      }

      acc.push({ ...field });

      return acc;
    }, []);

    return enhancedRow;
  });

const getPathToContentType = pathArray => ['contentType', ...pathArray];

const mutateEditViewLayoutHook = ({ layout, query }) => {
  const hasPersonalizationEnabled = get(
    layout,
    getPathToContentType(['pluginOptions', 'personalization', 'personalized']),
    false
  );

  if (!hasPersonalizationEnabled) {
    return { layout, query };
  }

  const currentVariation = get(query, ['plugins', 'personalization', 'variation'], null);

  // This might break the cm, has the user might be redirected to the homepage
  if (!currentVariation) {
    return { layout, query };
  }

  const editLayoutPath = getPathToContentType(['layouts', 'edit']);
  const editRelationsPath = getPathToContentType(['layouts', 'editRelations']);
  const editLayout = get(layout, editLayoutPath);
  const editRelationsLayout = get(layout, editRelationsPath);
  const nextEditRelationLayout = enhanceRelationLayout(editRelationsLayout, currentVariation);
  const nextEditLayout = enhanceEditLayout(editLayout);

  const enhancedLayouts = {
    ...layout.contentType.layouts,
    editRelations: nextEditRelationLayout,
    edit: nextEditLayout,
  };

  const components = enhanceComponentsLayout(layout.components, currentVariation);

  const enhancedData = {
    query,
    layout: {
      ...layout,
      contentType: {
        ...layout.contentType,
        layouts: enhancedLayouts,
      },
      components,
    },
  };

  return enhancedData;
};

export default mutateEditViewLayoutHook;
export {
  enhanceComponentLayoutForRelations,
  enhanceComponentsLayout,
  enhanceEditLayout,
  enhanceRelationLayout,
};
