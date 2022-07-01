import get from 'lodash/get';

const getVariationFromQuery = query => {
  return get(query, 'plugins.personalization.variation', undefined);
};

export default getVariationFromQuery;
