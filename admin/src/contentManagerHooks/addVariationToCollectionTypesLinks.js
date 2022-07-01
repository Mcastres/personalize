import addVariationToLinksSearch from './utils/addVariationToLinksSearch';

const addVariationToCollectionTypesLinksHook = ({ ctLinks, models }, store) => {
  if (!ctLinks.length) {
    return { ctLinks, models };
  }

  const storeState = store.getState();
  const { variations } = storeState.personalization_variations;
  const { collectionTypesRelatedPermissions } = storeState.rbacProvider;

  const mutatedLinks = addVariationToLinksSearch(
    ctLinks,
    'collectionType',
    models,
    variations,
    collectionTypesRelatedPermissions
  );

  return { ctLinks: mutatedLinks, models };
};

export default addVariationToCollectionTypesLinksHook;
