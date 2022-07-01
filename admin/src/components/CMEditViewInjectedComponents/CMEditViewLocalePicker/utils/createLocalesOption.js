const createLocalesOption = (localesToDisplay, localesFromData) => {
  return localesToDisplay.map(({ name, slug }) => {
    const matchingLocaleInData = localesFromData.find(({ locale }) => locale === slug);

    let status = 'did-not-create-locale';

    if (matchingLocaleInData) {
      status = matchingLocaleInData.publishedAt === null ? 'draft' : 'published';
    }

    return {
      id: matchingLocaleInData ? matchingLocaleInData.id : null,
      label: name,
      value: slug,
      status,
    };
  });
};

export default createLocalesOption;
