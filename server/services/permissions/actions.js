'use strict';

const { capitalize, isArray, getOr, prop } = require('lodash/fp');
const { getService } = require('../../utils');

const actions = ['create', 'read', 'update', 'delete'].map(uid => ({
  section: 'settings',
  category: 'Internationalization',
  subCategory: 'Variations',
  pluginName: 'personalization',
  displayName: capitalize(uid),
  uid: `variation.${uid}`,
}));

const addVariationsPropertyIfNeeded = ({ value: action }) => {
  const {
    section,
    options: { applyToProperties },
  } = action;

  // Only add the variations property to contentTypes' actions
  if (section !== 'contentTypes') {
    return;
  }

  // If the 'variations' property is already declared within the applyToProperties array, then ignore the next steps
  if (isArray(applyToProperties) && applyToProperties.includes('variations')) {
    return;
  }

  // Add the 'variations' property to the applyToProperties array (create it if necessary)
  action.options.applyToProperties = isArray(applyToProperties)
    ? applyToProperties.concat('variations')
    : ['variations'];
};

const shouldApplyVariationsPropertyToSubject = ({ property, subject }) => {
  if (property === 'variations') {
    const model = strapi.getModel(subject);

    return getService('content-types').isPersonalizedContentType(model);
  }

  return true;
};

const addAllVariationsToPermissions = async permissions => {
  const { actionProvider } = strapi.admin.services.permission;
  const { find: findAllVariations } = getService('variations');

  const allVariations = await findAllVariations();
  const allVariationsSlug = allVariations.map(prop('slug'));

  return Promise.all(
    permissions.map(async permission => {
      const { action, subject } = permission;

      const appliesToVariationsProperty = await actionProvider.appliesToProperty(
        'variations',
        action,
        subject
      );

      if (!appliesToVariationsProperty) {
        return permission;
      }

      const oldPermissionProperties = getOr({}, 'properties', permission);

      return { ...permission, properties: { ...oldPermissionProperties, variations: allVariationsSlug } };
    })
  );
};

const syncSuperAdminPermissionsWithVariations = async () => {
  const roleService = strapi.admin.services.role;
  const permissionService = strapi.admin.services.permission;

  const superAdminRole = await roleService.getSuperAdmin();

  if (!superAdminRole) {
    return;
  }

  const superAdminPermissions = await permissionService.findMany({
    where: {
      role: {
        id: superAdminRole.id,
      },
    },
  });

  const newSuperAdminPermissions = await addAllVariationsToPermissions(superAdminPermissions);

  await roleService.assignPermissions(superAdminRole.id, newSuperAdminPermissions);
};

const registerPersonalizationActions = async () => {
  const { actionProvider } = strapi.admin.services.permission;

  await actionProvider.registerMany(actions);
};

const registerPersonalizationActionsHooks = () => {
  const { actionProvider } = strapi.admin.services.permission;
  const { hooks } = strapi.admin.services.role;

  actionProvider.hooks.appliesPropertyToSubject.register(shouldApplyVariationsPropertyToSubject);
  hooks.willResetSuperAdminPermissions.register(addAllVariationsToPermissions);
};

const updateActionsProperties = () => {
  const { actionProvider } = strapi.admin.services.permission;

  // Register the transformation for every new action
  actionProvider.hooks.willRegister.register(addVariationsPropertyIfNeeded);

  // Handle already registered actions
  actionProvider.values().forEach(action => addVariationsPropertyIfNeeded({ value: action }));
};

module.exports = {
  actions,
  registerPersonalizationActions,
  registerPersonalizationActionsHooks,
  updateActionsProperties,
  syncSuperAdminPermissionsWithVariations,
};
