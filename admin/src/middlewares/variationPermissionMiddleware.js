import get from 'lodash/get';

const filterPermissionWithVariation = variation => permission =>
  get(permission, 'properties.variations', []).indexOf(variation) !== -1;

const variationPermissionMiddleware = () => () => next => action => {
  if (action.type !== 'ContentManager/RBACManager/SET_PERMISSIONS') {
    return next(action);
  }

  const containerName = get(action, '__meta__.containerName', null);

  if (!['editView', 'listView'].includes(containerName)) {
    return next(action);
  }

  const variation = get(action, '__meta__.plugins.personalization.variation', null);

  if (!variation) {
    return next(action);
  }

  const permissions = action.permissions;

  const nextPermissions = Object.keys(permissions).reduce((acc, key) => {
    const currentPermission = permissions[key];
    const filteredPermissions = currentPermission.filter(filterPermissionWithVariation(variation));

    if (filteredPermissions.length) {
      acc[key] = filteredPermissions;
    }

    return acc;
  }, {});

  return next({ ...action, permissions: nextPermissions });
};

export default variationPermissionMiddleware;
