const createVariationsOption = (variationsToDisplay, variationsFromData) => {
  return variationsToDisplay.map(({ name, slug }) => {
    const matchingVariationInData = variationsFromData.find(({ variation }) => variation === slug);

    let status = 'did-not-create-variation';

    if (matchingVariationInData) {
      status = matchingVariationInData.publishedAt === null ? 'draft' : 'published';
    }

    return {
      id: matchingVariationInData ? matchingVariationInData.id : null,
      label: name,
      value: slug,
      status,
    };
  });
};

export default createVariationsOption;
