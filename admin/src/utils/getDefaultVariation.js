import get from 'lodash/get';

const hasVariationPermission = (permissions, variationSlug) => {
  if (permissions) {
    const hasPermission = permissions.some(permission =>
      get(permission, 'properties.variations', []).includes(variationSlug)
    );

    if (hasPermission) {
      return true;
    }
  }

  return false;
};

const getFirstVariation = permissions => {
  if (permissions && permissions.length > 0) {
    const firstAuthorizedNonDefaultVariation = get(permissions, [0, 'properties', 'variations', 0], null);

    if (firstAuthorizedNonDefaultVariation) {
      return firstAuthorizedNonDefaultVariation;
    }
  }

  return null;
};

/**
 * Entry point of the module
 */
const getDefaultVariation = (ctPermissions, variations = []) => {
  const defaultVariation = variations.find(variation => variation.isDefault);

  if (!defaultVariation) {
    return null;
  }

  const readPermissions = ctPermissions['plugin::content-manager.explorer.read'];
  const createPermissions = ctPermissions['plugin::content-manager.explorer.create'];

  if (hasVariationPermission(readPermissions, defaultVariation.slug)) {
    return defaultVariation.slug;
  }

  if (hasVariationPermission(createPermissions, defaultVariation.slug)) {
    return defaultVariation.slug;
  }

  // When the default variation is not authorized, we return the first authorized variation
  const firstAuthorizedForReadNonDefaultVariation = getFirstVariation(readPermissions);

  if (firstAuthorizedForReadNonDefaultVariation) {
    return firstAuthorizedForReadNonDefaultVariation;
  }

  return getFirstVariation(createPermissions);
};

export default getDefaultVariation;
