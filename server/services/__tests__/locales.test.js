'use strict';

const variationsService = require('../variations')();

const fakeMetricsService = {
  sendDidInitializeEvent() {},
  sendDidUpdatePersonalizationVariationsEvent() {},
};

describe('Variations', () => {
  describe('setIsDefault', () => {
    test('Set isDefault to false', async () => {
      const get = jest.fn(() => Promise.resolve('en'));
      global.strapi = { store: () => ({ get }) };

      const variation = {
        code: 'fr',
        name: 'French',
      };

      const enrichedVariation = await variationsService.setIsDefault(locale);
      expect(enrichedVariation).toMatchObject({
        ...variation,
        isDefault: false,
      });
    });

    test('Set isDefault to true', async () => {
      const get = jest.fn(() => Promise.resolve('en'));
      global.strapi = { store: () => ({ get }) };

      const variation = {
        code: 'en',
        name: 'English',
      };

      const enrichedVariation = await variationsService.setIsDefault(locale);
      expect(enrichedVariation).toMatchObject({
        ...variation,
        isDefault: true,
      });
    });
  });

  describe('getDefaultVariation', () => {
    test('get default variation', async () => {
      const get = jest.fn(() => Promise.resolve('en'));
      global.strapi = { store: () => ({ get }) };

      const defaultVariationCode = await variationsService.getDefaultLocale();
      expect(defaultVariationCode).toBe('en');
    });
  });

  describe('setDefaultVariation', () => {
    test('set default variation', async () => {
      const set = jest.fn(() => Promise.resolve());
      global.strapi = { store: () => ({ set }) };

      await variationsService.setDefaultVariation({ code: 'fr-CA' });
      expect(set).toHaveBeenCalledWith({ key: 'default_variation', value: 'fr-CA' });
    });
  });

  describe('CRUD', () => {
    test('find', async () => {
      const variations = [{ name: 'French', code: 'fr' }];
      const findMany = jest.fn(() => Promise.resolve(variations));
      const query = jest.fn(() => ({ findMany }));
      global.strapi = { query };
      const params = { name: { $contains: 'en' } };

      const variationsFound = await variationsService.find(params);
      expect(query).toHaveBeenCalledWith('plugin::personalization.variation');
      expect(findMany).toHaveBeenCalledWith({ where: params });
      expect(variationsFound).toMatchObject(variations);
    });

    test('findById', async () => {
      const variation = { name: 'French', code: 'fr' };
      const findOne = jest.fn(() => Promise.resolve(variation));
      const query = jest.fn(() => ({ findOne }));
      global.strapi = { query };

      const variationFound = await variationsService.findById(1);
      expect(query).toHaveBeenCalledWith('plugin::personalization.variation');
      expect(findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(variationFound).toMatchObject(locale);
    });

    test('findByCode', async () => {
      const variation = { name: 'French', code: 'fr' };
      const findOne = jest.fn(() => Promise.resolve(variation));
      const query = jest.fn(() => ({ findOne }));
      global.strapi = { query };

      const variationFound = await variationsService.findByCode('fr');
      expect(query).toHaveBeenCalledWith('plugin::personalization.variation');
      expect(findOne).toHaveBeenCalledWith({ where: { code: 'fr' } });
      expect(variationFound).toMatchObject(locale);
    });

    test('create', async () => {
      const variation = { name: 'French', code: 'fr' };
      const create = jest.fn(() => variation);
      const query = jest.fn(() => ({ create }));
      global.strapi = {
        query,
        plugins: {
          personalization: {
            services: { metrics: fakeMetricsService },
          },
        },
      };

      const createdVariation = await variationsService.create(locale);
      expect(query).toHaveBeenCalledWith('plugin::personalization.variation');
      expect(create).toHaveBeenCalledWith({ data: variation });
      expect(createdVariation).toMatchObject(variation);
    });

    test('update', async () => {
      const variation = { name: 'French', code: 'fr' };
      const update = jest.fn(() => variation);
      const query = jest.fn(() => ({ update }));
      global.strapi = {
        query,
        plugins: {
          personalization: {
            services: { metrics: fakeMetricsService },
          },
        },
      };

      const updatedVariation = await variationsService.update({ code: 'fr' }, { name: 'French' });
      expect(query).toHaveBeenCalledWith('plugin::personalization.variation');
      expect(update).toHaveBeenCalledWith({ where: { code: 'fr' }, data: { name: 'French' } });
      expect(updatedVariation).toMatchObject(variation);
    });

    test('delete', async () => {
      const variation = { name: 'French', code: 'fr' };
      const deleteFn = jest.fn(() => variation);
      const deleteMany = jest.fn(() => []);
      const findOne = jest.fn(() => variation);
      const isPersonalizedContentType = jest.fn(() => true);
      const query = jest.fn(() => ({ delete: deleteFn, findOne, deleteMany }));
      global.strapi = {
        query,
        plugins: {
          personalization: {
            services: { metrics: fakeMetricsService, 'content-types': { isPersonalizedContentType } },
          },
        },
        contentTypes: { 'api::country.country': {} },
      };

      const deletedVariation = await variationsService.delete({ id: 1 });
      expect(query).toHaveBeenCalledWith('plugin::personalization.variation');
      expect(deleteFn).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(deletedVariation).toMatchObject(variation);
    });

    test('delete - not found', async () => {
      const variation = { name: 'French', code: 'fr' };
      const deleteFn = jest.fn(() => variation);
      const findOne = jest.fn(() => undefined);
      const query = jest.fn(() => ({ delete: deleteFn, findOne }));
      global.strapi = {
        query,
        plugins: {
          personalization: {
            services: { metrics: fakeMetricsService },
          },
        },
      };

      const deletedVariation = await variationsService.delete({ id: 1 });
      expect(query).toHaveBeenCalledWith('plugin::personalization.variation');
      expect(deleteFn).not.toHaveBeenCalled();
      expect(deletedVariation).toBeUndefined();
    });
  });

  describe('initDefaultVariation', () => {
    test('create default local if none exists', async () => {
      const count = jest.fn(() => Promise.resolve(0));
      const create = jest.fn(() => Promise.resolve());
      const set = jest.fn(() => Promise.resolve());

      global.strapi = {
        query: () => ({
          count,
          create,
        }),
        store: () => ({
          set,
        }),
        plugins: {
          personalization: {
            services: {
              metrics: fakeMetricsService,
            },
          },
        },
      };

      await variationsService.initDefaultVariation();
      expect(count).toHaveBeenCalledWith();
      expect(create).toHaveBeenCalledWith({
        data: {
          name: 'English (en)',
          code: 'en',
        },
      });
      expect(set).toHaveBeenCalledWith({ key: 'default_variation', value: 'en' });
    });

    test('does not create default local if one already exists', async () => {
      const count = jest.fn(() => Promise.resolve(1));
      const create = jest.fn(() => Promise.resolve());
      const set = jest.fn(() => Promise.resolve());

      global.strapi = {
        query: () => ({
          count,
          create,
        }),
        store: () => ({
          set,
        }),
      };

      await variationsService.initDefaultVariation();
      expect(count).toHaveBeenCalledWith();
      expect(create).not.toHaveBeenCalled();
      expect(set).not.toHaveBeenCalled();
    });
  });
});
