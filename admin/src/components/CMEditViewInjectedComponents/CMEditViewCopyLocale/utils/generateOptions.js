import get from 'lodash/get';

const generateOptions = (appLocales, currentLocale, localizations, permissions) => {
  return appLocales
    .filter(({ slug }) => {
      return (
        slug !== currentLocale &&
        (localizations || []).findIndex(({ locale }) => locale === slug) !== -1
      );
    })
    .filter(({ slug }) => {
      return permissions.some(({ properties }) => get(properties, 'locales', []).includes(slug));
    })
    .map(locale => {
      return {
        label: locale.name,
        value: localizations.find(loc => locale.slug === loc.locale).id,
      };
    });
};

export default generateOptions;
