import get from 'lodash/get';
import { stringify, parse } from 'qs';
import getDefaultVariation from '../../utils/getDefaultVariation';

const addVariationToLinksSearch = (links, kind, contentTypeSchemas, variations, permissions) => {
  return links.map(link => {
    const contentTypeUID = link.to.split(`/${kind}/`)[1];

    const contentTypeSchema = contentTypeSchemas.find(({ uid }) => uid === contentTypeUID);

    const hasPersonalizationEnabled = get(contentTypeSchema, 'pluginOptions.personalization.personalized', false);

    if (!hasPersonalizationEnabled) {
      return link;
    }

    const contentTypePermissions = permissions[contentTypeUID];
    const requiredPermissionsToViewALink =
      kind === 'collectionType'
        ? ['plugin::content-manager.explorer.read', 'plugin::content-manager.explorer.create']
        : ['plugin::content-manager.explorer.read'];

    const contentTypeNeededPermissions = Object.keys(contentTypePermissions).reduce(
      (acc, current) => {
        if (requiredPermissionsToViewALink.includes(current)) {
          acc[current] = contentTypePermissions[current];

          return acc;
        }

        acc[current] = [];

        return acc;
      },
      {}
    );

    const defaultVariation = getDefaultVariation(
      contentTypeNeededPermissions,
      variations
    );

    if (!defaultVariation) {
      return { ...link, isDisplayed: false };
    }

    const linkParams = link.search ? parse(link.search) : {};

    const params = linkParams
      ? { ...linkParams, plugins: { ...linkParams.plugins, personalization: { variation: defaultVariation } } }
      : { plugins: { personalization: { variation: defaultVariation } } };

    const search = stringify(params, { encode: false });
    return { ...link, search };
  });
};

export default addVariationToLinksSearch;
