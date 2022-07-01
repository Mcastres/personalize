'use strict';

const conditions = [
  {
    displayName: 'Has Variation Access',
    name: 'has-variation-access',
    plugin: 'personalization',
    handler(user, options) {
      const { variations } = options.permission.properties || {};
      const { superAdminCode } = strapi.admin.services.role.constants;

      const isSuperAdmin = user.roles.some(role => role.code === superAdminCode);

      if (isSuperAdmin) {
        return true;
      }

      return {
        variation: {
          $in: variations || [],
        },
      };
    },
  },
];

const registerPersonalizationConditions = async () => {
  const { conditionProvider } = strapi.admin.services.permission;

  await conditionProvider.registerMany(conditions);
};

module.exports = {
  conditions,
  registerPersonalizationConditions,
};
