'use strict';

const { yup, validateYupSchema } = require('@strapi/utils');

const createLocaleSchema = yup
  .object()
  .shape({
    name: yup.string().max(50),
    slug: yup.string().max(50),
  })
  .noUnknown();

const updateLocaleSchema = yup
  .object()
  .shape({
    name: yup.string().max(50),
    slug: yup.string().max(50),
  })
  .noUnknown();

module.exports = {
  validateCreateLocaleInput: validateYupSchema(createLocaleSchema),
  validateUpdateLocaleInput: validateYupSchema(updateLocaleSchema),
};
