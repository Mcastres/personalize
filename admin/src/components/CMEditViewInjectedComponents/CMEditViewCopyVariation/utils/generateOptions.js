import get from 'lodash/get';

const generateOptions = (appVariations, currentVariation, personalizations, permissions) => {
  return appVariations
    .filter(({ slug }) => {
      return (
        slug !== currentVariation &&
        (personalizations || []).findIndex(({ variation }) => variation === slug) !== -1
      );
    })
    .filter(({ slug }) => {
      return permissions.some(({ properties }) => get(properties, 'variations', []).includes(slug));
    })
    .map(variation => {
      return {
        label: variation.name,
        value: personalizations.find(loc => variation.slug === loc.variation).id,
      };
    });
};

export default generateOptions;
