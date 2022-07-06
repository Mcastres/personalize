"use strict";

const _ = require("lodash");

const validateVariationCreation = require("./controllers/validate-variation-creation");
const { getService } = require("./utils");

const enableContentType = require("./migrations/content-type/enable");
const disableContentType = require("./migrations/content-type/disable");

module.exports = ({ strapi }) => {
  extendPersonalizedContentTypes(strapi);
  addContentManagerVariationMiddleware(strapi);
  addContentTypeSyncHooks(strapi);
};

/**
 * Adds middleware on CM creation routes to use personalization variation passed in a specific param
 * @param {Strapi} strapi
 */
const addContentManagerVariationMiddleware = (strapi) => {
  strapi.server.router.use(
    "/content-manager/collection-types/:model",
    (ctx, next) => {
      const isVariationAction = _.has(
        ctx.request.query,
        "plugins.personalization.relatedEntityId"
      );

      if (ctx.method === "POST" && isVariationAction) {
        console.log(
          "IN VARIATION MIDDLEWARE",
          ctx.request.query,
          isVariationAction
        );
        return validateVariationCreation(ctx, next);
      }

      return next();
    }
  );

  strapi.server.router.use(
    "/content-manager/single-types/:model",
    (ctx, next) => {
      if (ctx.method === "PUT" && isVariationAction) {
        return validateVariationCreation(ctx, next);
      }

      return next();
    }
  );
};

/**
 * Adds hooks to migration content types variations on enable/disable of Personalization
 * @param {Strapi} strapi
 */
const addContentTypeSyncHooks = (strapi) => {
  strapi.hook("strapi::content-types.beforeSync").register(disableContentType);
  strapi.hook("strapi::content-types.afterSync").register(enableContentType);
};

/**
 * Adds variation and personalization fields to personalized content types
 * @param {Strapi} strapi
 */
const extendPersonalizedContentTypes = (strapi) => {
  const contentTypeService = getService("content-types");
  const coreApiService = getService("core-api");

  Object.values(strapi.contentTypes).forEach((contentType) => {
    if (contentTypeService.isPersonalizedContentType(contentType)) {
      const { attributes } = contentType;

      _.set(attributes, "personalizations", {
        writable: true,
        private: false,
        configurable: false,
        visible: false,
        type: "relation",
        relation: "oneToMany",
        target: contentType.uid,
      });

      _.set(attributes, "variation", {
        writable: true,
        private: false,
        configurable: false,
        visible: false,
        type: "string",
      });

      coreApiService.addCreatePersonalizationAction(contentType);
    }
  });

  if (strapi.plugin("graphql")) {
    require("./graphql")({ strapi }).register();
  }
};
