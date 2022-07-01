import addVariationToLinksSearch from './utils/addVariationToLinksSearch';

const addVariationToSingleTypesLinks = ({ stLinks, models }, store) => {
  if (!stLinks.length) {
    return { stLinks, models };
  }

  const storeState = store.getState();
  const { variations } = storeState.personalization_variations;
  const { collectionTypesRelatedPermissions } = storeState.rbacProvider;

  const mutatedLinks = addVariationToLinksSearch(
    stLinks,
    'singleType',
    models,
    variations,
    collectionTypesRelatedPermissions
  );

  return { stLinks: mutatedLinks, models };
};

export default addVariationToSingleTypesLinks;
