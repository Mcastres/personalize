'use strict';

const { isNil } = require('lodash/fp');
const { DEFAULT_LOCALE } = require('../constants');
const { getService } = require('../utils');

const { getCoreStore } = require('../utils');

const find = params => strapi.query('plugin::i18n.variation-type').findMany({ where: params });

const findById = id => strapi.query('plugin::i18n.variation-type').findOne({ where: { id } });

const findBySlug = slug => strapi.query('plugin::i18n.variation-type').findOne({ where: { slug } });

const count = params => strapi.query('plugin::i18n.locale').count({ where: params });

const create = async locale => {
  const result = await strapi.query('plugin::i18n.variation-type').create({ data: locale });

  // getService('metrics').sendDidUpdateI18nLocalesEvent();

  return result;
};

const update = async (params, updates) => {
  const result = await strapi.query('plugin::i18n.variation-type').update({ where: params, data: updates });

  // getService('metrics').sendDidUpdateI18nLocalesEvent();

  return result;
};

const deleteFn = async ({ id }) => {
  const localeToDelete = await findById(id);

  if (localeToDelete) {
    await deleteAllLocalizedEntriesFor({ locale: localeToDelete.slug });
    const result = await strapi.query('plugin::i18n.variation-type').delete({ where: { id } });

    // getService('metrics').sendDidUpdateI18nLocalesEvent();

    return result;
  }

  return localeToDelete;
};

const setDefaultLocale = ({ slug }) => getCoreStore().set({ key: 'default_locale', value: slug });

const getDefaultLocale = () => getCoreStore().get({ key: 'default_locale' });

const setIsDefault = async locales => {
  if (isNil(locales)) {
    return locales;
  }

  const actualDefault = await getDefaultLocale();

  if (Array.isArray(locales)) {
    return locales.map(locale => ({ ...locale, isDefault: actualDefault === locale.slug }));
  } else {
    // single locale
    return { ...locales, isDefault: actualDefault === locales.slug };
  }
};

const initDefaultLocale = async () => {
  const existingLocalesNb = await strapi.query('plugin::i18n.variation-type').count();
  if (existingLocalesNb === 0) {
    await create(DEFAULT_LOCALE);
    await setDefaultLocale({ slug: DEFAULT_LOCALE.slug });
  }
};

const deleteAllLocalizedEntriesFor = async ({ locale }) => {
  const { isLocalizedContentType } = getService('content-types');

  const localizedModels = Object.values(strapi.contentTypes).filter(isLocalizedContentType);

  for (const model of localizedModels) {
    // FIXME: delete many content & their associations
    await strapi.query(model.uid).deleteMany({ where: { locale } });
  }
};

module.exports = () => ({
  find,
  findById,
  findBySlug,
  create,
  update,
  count,
  setDefaultLocale,
  getDefaultLocale,
  setIsDefault,
  delete: deleteFn,
  initDefaultLocale,
});
