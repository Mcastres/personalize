'use strict';

const { ApplicationError } = require('@strapi/utils').errors;
const { listVariations, createLocale, updateLocale, deleteLocale } = require('../variations');
const variationModel = require('../../content-types/locale');

const sanitizers = {
  get() {
    return [];
  },
};

describe('Variations', () => {
  describe('listVariations', () => {
    test('can get variations', async () => {
      const variations = [{ code: 'af', name: 'Afrikaans (af)' }];
      const expectedVariations = [{ code: 'af', name: 'Afrikaans (af)', isDefault: true }];
      const setIsDefault = jest.fn(() => expectedVariations);
      const find = jest.fn(() => variations);
      const getModel = jest.fn(() => variationModel.schema);
      global.strapi = {
        getModel,
        plugins: {
          personalization: {
            services: {
              variations: {
                find,
                setIsDefault,
              },
            },
          },
        },
        sanitizers,
      };

      const ctx = {};
      await listVariations(ctx);

      expect(setIsDefault).toHaveBeenCalledWith(variations);
      expect(find).toHaveBeenCalledWith();
      expect(ctx.body).toMatchObject(expectedVariations);
    });
  });

  describe('createVariation', () => {
    test('can create a variation (isDefault: true)', async () => {
      const variation = { code: 'af', name: 'Afrikaans (af)' };
      const expectedVariations = { code: 'af', name: 'Afrikaans (af)', isDefault: true };
      const getDefaultVariation = jest.fn(() => Promise.resolve('af'));
      const setDefaultVariation = jest.fn(() => Promise.resolve());

      const setIsDefault = jest.fn(() => expectedVariations);
      const findByCode = jest.fn(() => undefined);
      const create = jest.fn(() => Promise.resolve(variation));
      const getModel = jest.fn(() => variationModel.schema);
      global.strapi = {
        getModel,
        plugins: {
          personalization: {
            services: {
              variations: {
                findByCode,
                setIsDefault,
                getDefaultVariation,
                setDefaultVariation,
                create,
              },
            },
          },
        },
        sanitizers,
      };

      const ctx = { request: { body: { ...variation, isDefault: true } }, state: { user: { id: 1 } } };
      await createVariation(ctx);

      expect(setIsDefault).toHaveBeenCalledWith(variation);
      expect(setDefaultVariation).toHaveBeenCalledWith(variation);
      expect(findByCode).toHaveBeenCalledWith('af');
      expect(create).toHaveBeenCalledWith({ createdBy: 1, updatedBy: 1, ...variation });
      expect(ctx.body).toMatchObject(expectedVariations);
    });

    test('can create a variation (isDefault: false)', async () => {
      const variation = { code: 'af', name: 'Afrikaans (af)' };
      const expectedVariation = { code: 'af', name: 'Afrikaans (af)', isDefault: false };
      const getDefaultVariation = jest.fn(() => Promise.resolve('en'));

      const setIsDefault = jest.fn(() => expectedVariation);
      const findByCode = jest.fn(() => undefined);
      const create = jest.fn(() => Promise.resolve(variation));
      const getModel = jest.fn(() => variationModel.schema);
      global.strapi = {
        getModel,
        plugins: {
          personalization: {
            services: {
              variations: {
                findByCode,
                setIsDefault,
                getDefaultVariation,
                create,
              },
            },
          },
        },
        sanitizers,
      };

      const ctx = {
        request: { body: { ...variation, isDefault: false } },
        state: { user: { id: 1 } },
      };
      await createVariation(ctx);

      expect(setIsDefault).toHaveBeenCalledWith(variation);
      expect(findByCode).toHaveBeenCalledWith('af');
      expect(create).toHaveBeenCalledWith({ createdBy: 1, updatedBy: 1, ...variation });
      expect(ctx.body).toMatchObject(expectedVariation);
    });

    test('cannot create a variation that already exists', async () => {
      const variation = { code: 'af', name: 'Afrikaans (af)' };
      const expectedVariation = { code: 'af', name: 'Afrikaans (af)', isDefault: false };
      const getDefaultVariation = jest.fn(() => Promise.resolve('en'));

      const setIsDefault = jest.fn(() => expectedVariation);
      const findByCode = jest.fn(() => ({ name: 'other variation', code: 'af' }));
      const create = jest.fn(() => Promise.resolve(variation));
      const getModel = jest.fn(() => variationModel.schema);
      global.strapi = {
        getModel,
        plugins: {
          personalization: {
            services: {
              variations: {
                findByCode,
                setIsDefault,
                getDefaultVariation,
                create,
              },
            },
          },
        },
        sanitizers,
      };

      const ctx = {
        request: { body: { ...variation, isDefault: false } },
        state: { user: { id: 1 } },
      };

      expect.assertions(4);

      try {
        await createVariation(ctx);
      } catch (e) {
        expect(e instanceof ApplicationError).toBe(true);
        expect(e.message).toEqual('This variation already exists');
      }

      expect(findByCode).toHaveBeenCalledWith('af');
      expect(create).not.toHaveBeenCalled();
    });
  });

  describe('updateVariation', () => {
    test('can update a variation', async () => {
      const updatedVariation = { name: 'Afrikaans', code: 'af' };
      const existingVariation = { name: 'Afrikaans (af)', code: 'af' };
      const updates = { name: 'Afrikaans' };
      const expectedVariations = { code: 'af', name: 'Afrikaans', isDefault: true };
      const setDefaultVariation = jest.fn(() => Promise.resolve());

      const setIsDefault = jest.fn(() => expectedVariations);
      const findById = jest.fn(() => existingVariation);
      const update = jest.fn(() => Promise.resolve(updatedVariation));
      const getModel = jest.fn(() => variationModel.schema);
      global.strapi = {
        getModel,
        plugins: {
          personalization: {
            services: {
              variations: {
                findById,
                setIsDefault,
                setDefaultVariation,
                update,
              },
            },
          },
        },
        sanitizers,
      };

      const ctx = {
        params: { id: 1 },
        request: { body: { ...updates, isDefault: true } },
        state: { user: { id: 1 } },
      };
      await updateVariation(ctx);

      expect(setIsDefault).toHaveBeenCalledWith(updatedVariation);
      expect(setDefaultVariation).toHaveBeenCalledWith(updatedLocale);
      expect(findById).toHaveBeenCalledWith(1);
      expect(update).toHaveBeenCalledWith({ id: 1 }, { updatedBy: 1, ...updates });
      expect(ctx.body).toMatchObject(expectedVariations);
    });

    test('cannot update the code of a variation', async () => {
      const updatedVariation = { name: 'Afrikaans', code: 'af' };
      const existingVariation = { name: 'Afrikaans (af)', code: 'af' };
      const updates = { name: 'Afrikaans', code: 'fr' };
      const expectedVariations = { code: 'af', name: 'Afrikaans', isDefault: true };
      const setDefaultVariation = jest.fn(() => Promise.resolve());

      const setIsDefault = jest.fn(() => expectedVariations);
      const findById = jest.fn(() => existingVariation);
      const update = jest.fn(() => Promise.resolve(updatedVariation));
      const getModel = jest.fn(() => variationModel.schema);
      global.strapi = {
        getModel,
        plugins: {
          personalization: {
            services: {
              variations: {
                findById,
                setIsDefault,
                setDefaultVariation,
                update,
              },
            },
          },
        },
        sanitizers,
      };

      const ctx = {
        params: { id: 1 },
        request: { body: { ...updates, isDefault: true } },
        state: { user: { id: 1 } },
      };

      expect.assertions(6);

      try {
        await updateVariation(ctx);
      } catch (e) {
        expect(e instanceof ApplicationError).toBe(true);
        expect(e.message).toEqual('this field has unspecified keys: code');
      }

      expect(findById).not.toHaveBeenCalled();
      expect(update).not.toHaveBeenCalled();
      expect(setIsDefault).not.toHaveBeenCalled();
      expect(setDefaultVariation).not.toHaveBeenCalled();
    });
  });

  describe('deleteVariation', () => {
    test('can delete a variation', async () => {
      const variation = { code: 'af', name: 'Afrikaans (af)' };
      const expectedVariations = { code: 'af', name: 'Afrikaans (af)', isDefault: false };
      const getDefaultVariation = jest.fn(() => Promise.resolve('en'));

      const setIsDefault = jest.fn(() => expectedVariations);
      const findById = jest.fn(() => variation);
      const deleteFn = jest.fn();
      const getModel = jest.fn(() => variationModel.schema);
      global.strapi = {
        getModel,
        plugins: {
          personalization: {
            services: {
              variations: {
                findById,
                setIsDefault,
                getDefaultVariation,
                delete: deleteFn,
              },
            },
          },
        },
        sanitizers,
      };

      const ctx = { params: { id: 1 } };
      await deleteVariation(ctx);

      expect(setIsDefault).toHaveBeenCalledWith(variation);
      expect(findById).toHaveBeenCalledWith(1);
      expect(deleteFn).toHaveBeenCalledWith({ id: 1 });
      expect(ctx.body).toMatchObject(expectedVariations);
    });

    test('cannot delete the default variation', async () => {
      const variation = { code: 'af', name: 'Afrikaans (af)' };
      const expectedVariations = { code: 'af', name: 'Afrikaans (af)', isDefault: false };
      const getDefaultVariation = jest.fn(() => Promise.resolve('af'));

      const setIsDefault = jest.fn(() => Promise.resolve(expectedVariations));
      const findById = jest.fn(() => Promise.resolve(variation));
      const deleteFn = jest.fn();
      const getModel = jest.fn(() => variationModel.schema);
      global.strapi = {
        getModel,
        plugins: {
          personalization: {
            services: {
              variations: {
                findById,
                getDefaultVariation,
                delete: deleteFn,
              },
            },
          },
        },
        sanitizers,
      };

      const ctx = { params: { id: 1 } };

      expect.assertions(5);

      try {
        await deleteVariation(ctx);
      } catch (e) {
        expect(e instanceof ApplicationError).toBe(true);
        expect(e.message).toEqual('Cannot delete the default variation');
      }

      expect(findById).toHaveBeenCalledWith(1);
      expect(setIsDefault).not.toHaveBeenCalled();
      expect(deleteFn).not.toHaveBeenCalled();
    });
  });
});
