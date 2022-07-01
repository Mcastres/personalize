import getVariationFromQuery from './getVariationFromQuery';

const getInitialVariation = (query, variations = []) => {
  const variationFromQuery = getVariationFromQuery(query);

  if (variationFromQuery) {
    return variations.find(variation => variation.slug === variationFromQuery);
  }

  // Returns the default variation when nothing is in the query
  return variations.find(variation => variation.isDefault);
};

export default getInitialVariation;
