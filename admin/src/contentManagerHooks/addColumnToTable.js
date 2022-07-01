import React from 'react';
import get from 'lodash/get';
import VariationListCell from '../components/VariationListCell/VariationListCell';

const addColumnToTableHook = ({ displayedHeaders, layout }) => {
  const isFieldPersonalized = get(layout, 'contentType.pluginOptions.personalization.personalized', false);

  if (!isFieldPersonalized) {
    return { displayedHeaders, layout };
  }

  return {
    displayedHeaders: [
      ...displayedHeaders,
      {
        key: '__variation_key__',
        fieldSchema: { type: 'string' },
        metadatas: { label: 'Content available in', searchable: false, sortable: false },
        name: 'variations',
        cellFormatter: props => <VariationListCell {...props} />,
      },
    ],
    layout,
  };
};

export default addColumnToTableHook;
