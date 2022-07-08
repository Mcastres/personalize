'use strict';

const permissions = require('./permissions');
const metrics = require('./metrics');
const personalizations = require('./personalizations');
const variations = require('./variations');
const entityServiceDecorator = require('./entity-service-decorator');
const coreApi = require('./core-api');
const contentTypes = require('./content-types');

module.exports = {
  permissions,
  metrics,
  personalizations,
  variations,
  'entity-service-decorator': entityServiceDecorator,
  'core-api': coreApi,
  'content-types': contentTypes,
};
