'use strict';

const personalizationActionsService = require('./permissions/actions');
const sectionsBuilderService = require('./permissions/sections-builder');
const engineService = require('./permissions/engine');

module.exports = () => ({
  actions: personalizationActionsService,
  sectionsBuilder: sectionsBuilderService,
  engine: engineService,
});
