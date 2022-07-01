'use strict';

const { yup, validateYupSchema } = require('@strapi/utils');

const createVariationSchema = yup
  .object()
  .shape({
    name: yup.string().max(50),
    slug: yup.string().max(50),
  })
  .noUnknown();

const updateVariationSchema = yup
  .object()
  .shape({
    name: yup.string().max(50),
    slug: yup.string().max(50),
  })
  .noUnknown();

module.exports = {
  validateCreateVariationInput: validateYupSchema(createVariationSchema),
  validateUpdateVariationInput: validateYupSchema(updateVariationSchema),
};
