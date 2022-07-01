"use strict";

const utils = require("@strapi/utils");
const { pick } = require("lodash/fp");
const { getService } = require("../utils");
const {
  validateCreateVariationInput,
  validateUpdateVariationInput,
} = require("../validation/variations");
const { formatVariation } = require("../domain/variation");

const { setCreatorFields, sanitize } = utils;
const { ApplicationError } = utils.errors;

const sanitizeVariation = (variation) => {
  const model = strapi.getModel("plugin::personalization.variation");

  return sanitize.contentAPI.output(variation, model);
};

module.exports = {
  async listVariations(ctx) {
    const variationsService = getService("variations");

    const variations = await variationsService.find();
    const sanitizedVariations = await sanitizeVariation(variations);

    ctx.body = await variationsService.setIsDefault(sanitizedVariations);
  },

  async createVariation(ctx) {
    const { user } = ctx.state;
    const { body } = ctx.request;
    let { isDefault, ...variationToCreate } = body;

    await validateCreateVariationInput(body);

    const variationsService = getService("variations");

    const existingVariation = await variationsService.findBySlug(body.slug);
    if (existingVariation) {
      throw new ApplicationError("This variation already exists");
    }

    variationToCreate = formatVariation(variationToCreate);
    variationToCreate = setCreatorFields({ user })(variationToCreate);

    const variation = await variationsService.create(variationToCreate);

    if (isDefault) {
      await variationsService.setDefaultVariation(variation);
    }

    const sanitizedVariation = await sanitizeVariation(variation);

    ctx.body = await variationsService.setIsDefault(sanitizedVariation);
  },

  async updateVariation(ctx) {
    const { user } = ctx.state;
    const { id } = ctx.params;
    const { body } = ctx.request;
    let { ...updates } = body;

    await validateUpdateVariationInput(body);

    const variationsService = getService("variations");

    const existingVariation = await variationsService.findById(id);
    if (!existingVariation) {
      return ctx.notFound("variation.notFound");
    }

    const allowedParams = ["slug", "name"];
    const cleanUpdates = setCreatorFields({ user, isEdition: true })(
      pick(allowedParams, updates)
    );

    const updatedVariation = await variationsService.update({ id }, cleanUpdates);

    const sanitizedVariation = await sanitizeVariation(updatedVariation);

    ctx.body = await variationsService.setIsDefault(sanitizedVariation);
  },

  async deleteVariation(ctx) {
    const { id } = ctx.params;

    const variationsService = getService("variations");

    const existingVariation = await variationsService.findById(id);
    if (!existingVariation) {
      return ctx.notFound("variation.notFound");
    }

    await variationsService.delete({ id });

    const sanitizedVariation = await sanitizeVariation(existingVariation);

    ctx.body = await variationsService.setIsDefault(sanitizedVariation);
  },
};
