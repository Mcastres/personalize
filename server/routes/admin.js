'use strict';

module.exports = {
  type: "admin",
  routes: [
    {
      method: "GET",
      path: "/iso-variations",
      handler: "iso-variations.listIsoVariations",
      config: {
        policies: [
          "admin::isAuthenticatedAdmin",
          {
            name: "plugin::content-manager.hasPermissions",
            config: { actions: ["plugin::personalization.variation.read"] },
          },
        ],
      },
    },
    {
      method: "GET",
      path: "/variations",
      handler: "variations.listVariations",
      config: {
        policies: ["admin::isAuthenticatedAdmin"],
      },
    },
    {
      method: "POST",
      path: "/variations",
      handler: "variations.createVariation",
      config: {
        policies: [
          "admin::isAuthenticatedAdmin",
          {
            name: "plugin::content-manager.hasPermissions",
            config: { actions: ["plugin::personalization.variation.create"] },
          },
        ],
      },
    },
    {
      method: "PUT",
      path: "/variations/:id",
      handler: "variations.updateVariation",
      config: {
        policies: [
          "admin::isAuthenticatedAdmin",
          {
            name: "plugin::content-manager.hasPermissions",
            config: { actions: ["plugin::personalization.variation.update"] },
          },
        ],
      },
    },
    {
      method: "DELETE",
      path: "/variations/:id",
      handler: "variations.deleteVariation",
      config: {
        policies: [
          "admin::isAuthenticatedAdmin",
          {
            name: "plugin::content-manager.hasPermissions",
            config: { actions: ["plugin::personalization.variation.delete"] },
          },
        ],
      },
    },
    {
      method: "POST",
      path: "/content-manager/actions/get-non-personalized-fields",
      handler: "content-types.getNonPersonalizedAttributes",
      config: {
        policies: ["admin::isAuthenticatedAdmin"],
      },
    },
  ],
};
