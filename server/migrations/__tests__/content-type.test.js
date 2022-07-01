'use strict';

const enable = require('../content-type/enable');
const disable = require('../content-type/disable');
const ctService = require('../../services/content-types')();

const createQueryBuilderMock = () => {
  const obj = {
    delete: jest.fn(() => obj),
    update: jest.fn(() => obj),
    where: jest.fn(() => obj),
    execute() {},
  };

  return jest.fn(() => obj);
};

describe('personalization - Migration - enable/disable personalization on a CT', () => {
  beforeAll(() => {
    global.strapi = {
      db: {},
      plugins: {
        personalization: {
          services: {
            'content-types': ctService,
            variations: {
              getDefaultVariation: jest.fn(() => 'default-variation'),
            },
          },
        },
      },
    };
  });

  describe('enable personalization on a CT', () => {
    describe('Should not migrate', () => {
      test('non personalization => non i18n', async () => {
        strapi.db.queryBuilder = createQueryBuilderMock();

        const previousDefinition = {};
        const definition = {};

        await enable({
          oldContentTypes: { test: previousDefinition },
          contentTypes: { test: definition },
        });

        expect(strapi.db.queryBuilder).not.toHaveBeenCalled();
      });

      test('personalization => non i18n', async () => {
        strapi.db.queryBuilder = createQueryBuilderMock();

        const previousDefinition = { pluginOptions: { personalization: { personalized: true } } };
        const definition = {};

        await enable({
          oldContentTypes: { test: previousDefinition },
          contentTypes: { test: definition },
        });

        expect(strapi.db.queryBuilder).not.toHaveBeenCalled();
      });

      test('personalization => i18n', async () => {
        strapi.db.queryBuilder = createQueryBuilderMock();

        const previousDefinition = { pluginOptions: { personalization: { personalized: true } } };
        const definition = { pluginOptions: { personalization: { personalized: true } } };

        await enable({
          oldContentTypes: { test: previousDefinition },
          contentTypes: { test: definition },
        });

        expect(strapi.db.queryBuilder).not.toHaveBeenCalled();
      });
    });

    describe('Should migrate', () => {
      test('non personalization => i18n ', async () => {
        strapi.db.queryBuilder = createQueryBuilderMock();

        const previousDefinition = {};
        const definition = { pluginOptions: { personalization: { personalized: true } } };

        await enable({
          oldContentTypes: { test: previousDefinition },
          contentTypes: { test: definition },
        });

        expect(strapi.plugins.personalization.services.variations.getDefaultVariation).toHaveBeenCalled();
        expect(strapi.db.queryBuilder).toHaveBeenCalled();
      });
    });
  });

  describe('disable personalization on a CT', () => {
    describe('Should not migrate', () => {
      test('non personalization => non i18n', async () => {
        strapi.db.queryBuilder = createQueryBuilderMock();

        const previousDefinition = {};
        const definition = {};

        await disable({
          oldContentTypes: { test: previousDefinition },
          contentTypes: { test: definition },
        });
        expect(strapi.db.queryBuilder).not.toHaveBeenCalled();
      });

      test('non personalization => i18n', async () => {
        strapi.db.queryBuilder = createQueryBuilderMock();

        const previousDefinition = {};
        const definition = { pluginOptions: { personalization: { personalized: true } } };

        await disable({
          oldContentTypes: { test: previousDefinition },
          contentTypes: { test: definition },
        });
        expect(strapi.db.queryBuilder).not.toHaveBeenCalled();
      });

      test('personalization => i18n', async () => {
        strapi.db.queryBuilder = createQueryBuilderMock();

        const previousDefinition = { pluginOptions: { personalization: { personalized: true } } };
        const definition = { pluginOptions: { personalization: { personalized: true } } };

        await disable({
          oldContentTypes: { test: previousDefinition },
          contentTypes: { test: definition },
        });
        expect(strapi.db.queryBuilder).not.toHaveBeenCalled();
      });
    });

    describe('Should migrate', () => {
      test('personalization => non i18n - pg', async () => {
        const previousDefinition = {
          pluginOptions: { personalization: { personalized: true } },
        };
        const definition = {};

        await disable({
          oldContentTypes: { test: previousDefinition },
          contentTypes: { test: definition },
        });

        expect(strapi.plugins.personalization.services.variations.getDefaultVariation).toHaveBeenCalled();
        expect(strapi.db.queryBuilder).toHaveBeenCalled();
      });
    });
  });
});
