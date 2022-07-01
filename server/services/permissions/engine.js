'use strict';

const { getService } = require('../../utils');

/**
 * @typedef {object} WillRegisterPermissionContext
 * @property {Permission} permission
 * @property {object} user
 * @property {object} condition
 */

/**
 * Variations property handler for the permission engine
 * Add the has-variation-access condition if the variations property is defined
 * @param {WillRegisterPermissionContext} context
 */
const willRegisterPermission = context => {
  const { permission, condition, user } = context;
  const { subject, properties } = permission;

  const isSuperAdmin = strapi.admin.services.role.hasSuperAdminRole(user);

  if (isSuperAdmin) {
    return;
  }

  const { variations } = properties || {};
  const { isPersonalizedContentType } = getService('content-types');

  // If there is no subject defined, ignore the permission
  if (!subject) {
    return;
  }

  const ct = strapi.contentTypes[subject];

  // If the subject exists but isn't personalized, ignore the permission
  if (!isPersonalizedContentType(ct)) {
    return;
  }

  // If the subject is personalized but the variations property is null (access to all variations), ignore the permission
  if (variations === null) {
    return;
  }

  condition.and({
    variation: {
      $in: variations || [],
    },
  });
};

const registerPersonalizationPermissionsHandlers = () => {
  const { engine } = strapi.admin.services.permission;

  engine.hooks.willRegisterPermission.register(willRegisterPermission);
};

module.exports = {
  willRegisterPermission,
  registerPersonalizationPermissionsHandlers,
};
