'use strict';

const { getService } = require('./utils');

module.exports = async ({ strapi }) => {
  const { sendDidInitializeEvent } = getService('metrics');
  const { decorator } = getService('entity-service-decorator');
  const { initDefaultVariation } = getService('variations');
  const { sectionsBuilder, actions, engine } = getService('permissions');

  // Entity Service
  strapi.entityService.decorate(decorator);

  // Data
  await initDefaultVariation();

  // Sections Builder
  sectionsBuilder.registerVariationsPropertyHandler();

  // Actions
  await actions.registerPersonalizationActions();
  actions.registerPersonalizationActionsHooks();
  actions.updateActionsProperties();

  // Engine/Permissions
  engine.registerPersonalizationPermissionsHandlers();

  // Hooks & Models
  registerModelsHooks();

  sendDidInitializeEvent();
};

const registerModelsHooks = () => {
  const personalizationModelUIDs = Object.values(strapi.contentTypes)
    .filter(contentType => getService('content-types').isPersonalizedContentType(contentType))
    .map(contentType => contentType.uid);

  if (personalizationModelUIDs.length > 0) {
    strapi.db.lifecycles.subscribe({
      models: personalizationModelUIDs,
      async beforeCreate(event) {
        await getService('personalizations').assignDefaultVariation(event.params.data);
      },
    });
  }

  strapi.db.lifecycles.subscribe({
    models: ['plugin::personalization.variation'],

    async afterCreate() {
      await getService('permissions').actions.syncSuperAdminPermissionsWithVariations();
    },

    async afterDelete() {
      await getService('permissions').actions.syncSuperAdminPermissionsWithVariations();
    },
  });
};
