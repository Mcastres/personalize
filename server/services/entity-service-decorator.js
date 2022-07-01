'use strict';

const { has, get, omit, isArray } = require('lodash/fp');
const { ApplicationError } = require('@strapi/utils').errors;
const { getService } = require('../utils');

const VARIATION_QUERY_FILTER = 'variation';
const SINGLE_ENTRY_ACTIONS = ['findOne', 'update', 'delete'];
const BULK_ACTIONS = ['delete'];

const paramsContain = (key, params) => {
  return (
    has(key, params.filters) ||
    (isArray(params.filters) && params.filters.some(clause => has(key, clause))) ||
    (isArray(get('$and', params.filters)) && params.filters.$and.some(clause => has(key, clause)))
  );
};

/**
 * Adds default variation or replaces variation by variation in query params
 * @param {object} params - query params
 * @param {object} ctx
 */
const wrapParams = async (params = {}, ctx = {}) => {
  const { action } = ctx;

  if (has(VARIATION_QUERY_FILTER, params)) {
    if (params[VARIATION_QUERY_FILTER] === 'all') {
      return omit(VARIATION_QUERY_FILTER, params);
    }

    return {
      ...omit(VARIATION_QUERY_FILTER, params),
      filters: {
        $and: [{ variation: params[VARIATION_QUERY_FILTER] }].concat(params.filters || []),
      },
    };
  }

  const entityDefinedById = paramsContain('id', params) && SINGLE_ENTRY_ACTIONS.includes(action);
  const entitiesDefinedByIds = paramsContain('id.$in', params) && BULK_ACTIONS.includes(action);

  if (entityDefinedById || entitiesDefinedByIds) {
    return params;
  }

  const { getDefaultVariation } = getService('variations');

  return {
    ...params,
    filters: {
      $and: [{ variation: await getDefaultVariation() }].concat(params.filters || []),
    },
  };
};

/**
 * Assigns a valid variation or the default one if not define
 * @param {object} data
 */
const assignValidVariation = async data => {
  const { getValidVariation } = getService('content-types');

  if (!data) {
    return;
  }

  try {
    data.variation = await getValidVariation(data.variation);
  } catch (e) {
    throw new ApplicationError("This variation doesn't exist");
  }
};

/**
 * Decorates the entity service with Personalization business logic
 * @param {object} service - entity service
 */
const decorator = service => ({
  /**
   * Wraps query options. In particular will add default variation to query params
   * @param {object} opts - Query options object (params, data, files, populate)
   * @param {object} ctx - Query context
   * @param {object} ctx.model - Model that is being used
   */
  async wrapParams(params = {}, ctx = {}) {
    const wrappedParams = await service.wrapParams.call(this, params, ctx);

    const model = strapi.getModel(ctx.uid);

    const { isPersonalizedContentType } = getService('content-types');

    if (!isPersonalizedContentType(model)) {
      return wrappedParams;
    }

    return wrapParams(params, ctx);
  },

  /**
   * Creates an entry & make links between it and its related personalizations
   * @param {string} uid - Model uid
   * @param {object} opts - Query options object (params, data, files, populate)
   */
  async create(uid, opts = {}) {
    const model = strapi.getModel(uid);

    const { syncPersonalizations, syncNonPersonalizedAttributes } = getService('personalizations');
    const { isPersonalizedContentType } = getService('content-types');

    if (!isPersonalizedContentType(model)) {
      return service.create.call(this, uid, opts);
    }

    const { data } = opts;
    await assignValidVariation(data);

    const entry = await service.create.call(this, uid, opts);

    await syncPersonalizations(entry, { model });
    await syncNonPersonalizedAttributes(entry, { model });
    return entry;
  },

  /**
   * Updates an entry & update related personalizations fields
   * @param {string} uid
   * @param {string} entityId
   * @param {object} opts - Query options object (params, data, files, populate)
   */
  async update(uid, entityId, opts = {}) {
    const model = strapi.getModel(uid);

    const { syncNonPersonalizedAttributes } = getService('personalizations');
    const { isPersonalizedContentType } = getService('content-types');

    if (!isPersonalizedContentType(model)) {
      return service.update.call(this, uid, entityId, opts);
    }

    const { data, ...restOptions } = opts;

    const entry = await service.update.call(this, uid, entityId, {
      ...restOptions,
      data: omit(['variation', 'personalizations'], data),
    });

    await syncNonPersonalizedAttributes(entry, { model });
    return entry;
  },
});

module.exports = () => ({
  decorator,
  wrapParams,
});
