'use strict';

const { ApplicationError } = require('@strapi/utils').errors;
const {
  isPersonalizedContentType,
  getValidVariation,
  getNewPersonalizationsFrom,
  getAndValidateRelatedEntity,
  getNonPersonalizedAttributes,
  copyNonPersonalizedAttributes,
  fillNonPersonalizedAttributes,
  getNestedPopulateOfNonPersonalizedAttributes,
} = require('../content-types')();

describe('content-types service', () => {
  describe('isPersonalizedContentType', () => {
    test('Checks for the i18N option', () => {
      expect(isPersonalizedContentType({ pluginOptions: { personalization: { personalized: false } } })).toBe(false);
      expect(isPersonalizedContentType({ pluginOptions: { personalization: { personalized: true } } })).toBe(true);
    });

    test('Defaults to false', () => {
      expect(isPersonalizedContentType({})).toBe(false);
      expect(isPersonalizedContentType({ pluginOptions: {} })).toBe(false);
      expect(isPersonalizedContentType({ pluginOptions: { personalization: {} } })).toBe(false);
    });
  });

  describe('getNonPersonalizedAttributes', () => {
    test('Uses the pluginOptions to detect non personalized fields', () => {
      expect(
        getNonPersonalizedAttributes({
          uid: 'test-model',
          attributes: {
            title: {
              type: 'string',
              pluginOptions: {
                personalization: {
                  personalized: true,
                },
              },
            },
            stars: {
              type: 'integer',
            },
            price: {
              type: 'integer',
            },
          },
        })
      ).toEqual(['stars', 'price']);
    });

    test('Consider relations to be always personalized', () => {
      expect(
        getNonPersonalizedAttributes({
          uid: 'test-model',
          attributes: {
            title: {
              type: 'string',
              pluginOptions: {
                personalization: {
                  personalized: true,
                },
              },
            },
            stars: {
              type: 'integer',
            },
            price: {
              type: 'integer',
            },
            relation: {
              type: 'relation',
              relation: 'oneToOne',
              target: 'user',
            },
            secondRelation: {
              type: 'relation',
              relation: 'oneToMany',
              target: 'user',
            },
          },
        })
      ).toEqual(['stars', 'price']);
    });

    test('Consider variation, personalizations & publishedAt as personalized', () => {
      expect(
        getNonPersonalizedAttributes({
          uid: 'test-model',
          attributes: {
            title: {
              type: 'string',
              pluginOptions: {
                personalization: {
                  personalized: true,
                },
              },
            },
            stars: {
              type: 'integer',
            },
            price: {
              type: 'integer',
            },
            variation: {
              type: 'string',
              visible: false,
            },
            personalizations: {
              type: 'relation',
              relation: 'oneToMany',
              target: 'test-model',
              visible: false,
            },
            publishedAt: {
              type: 'datetime',
              visible: false,
            },
          },
        })
      ).toEqual(['stars', 'price']);
    });

    test('Consider uid to always be personalized', () => {
      expect(
        getNonPersonalizedAttributes({
          attributes: {
            price: {
              type: 'integer',
            },
            slug: {
              type: 'uid',
            },
          },
        })
      ).toEqual(['price']);
    });
  });

  describe('getValidVariation', () => {
    test('set default variation if the provided one is nil', async () => {
      const getDefaultVariation = jest.fn(() => Promise.resolve('en'));
      global.strapi = {
        plugins: {
          personalization: {
            services: {
              variations: {
                getDefaultVariation,
              },
            },
          },
        },
      };
      const variation = await getValidVariation(null);

      expect(variation).toBe('en');
    });

    test('set variation to the provided one if it exists', async () => {
      const findByCode = jest.fn(() => Promise.resolve('en'));
      global.strapi = {
        plugins: {
          personalization: {
            services: {
              variations: {
                findByCode,
              },
            },
          },
        },
      };
      const variation = await getValidVariation('en');

      expect(variation).toBe('en');
    });

    test("throw if provided variation doesn't exist", async () => {
      const findByCode = jest.fn(() => Promise.resolve(undefined));
      global.strapi = {
        plugins: {
          personalization: {
            services: {
              variations: {
                findByCode,
              },
            },
          },
        },
      };
      try {
        await getValidVariation('en');
      } catch (e) {
        expect(e instanceof ApplicationError).toBe(true);
        expect(e.message).toBe('Variation not found');
      }

      expect(findByCode).toHaveBeenCalledWith('en');
      expect.assertions(3);
    });
  });

  describe.each([['singleType'], ['collectionType']])('getAndValidateRelatedEntity - %s', kind => {
    test("Throw if relatedEntity is provided but doesn't exist", async () => {
      const findOne = jest.fn(() => Promise.resolve(undefined));
      const relatedEntityId = 1;
      const model = 'api::country.country';
      const variation = 'fr';

      global.strapi = {
        query: () => ({
          findOne,
        }),
        getModel: () => ({ kind }),
      };

      try {
        await getAndValidateRelatedEntity(relatedEntityId, model, variation);
      } catch (e) {
        expect(e instanceof ApplicationError).toBe(true);
        expect(e.message).toBe("The related entity doesn't exist");
      }

      expect(findOne).toHaveBeenCalledWith(
        kind === 'singleType'
          ? { populate: ['personalizations'] }
          : { where: { id: relatedEntityId }, populate: ['personalizations'] }
      );
      expect.assertions(3);
    });

    test('Throw if variation already exists (1/2)', async () => {
      const relatedEntityId = 1;
      const relatedEntity = {
        id: relatedEntityId,
        variation: 'en',
        personalizations: [],
      };
      const findOne = jest.fn(() => Promise.resolve(relatedEntity));
      const model = 'api::country.country';
      const variation = 'en';

      global.strapi = {
        query: () => ({
          findOne,
        }),
        getModel: () => ({ kind }),
      };

      try {
        await getAndValidateRelatedEntity(relatedEntityId, model, variation);
      } catch (e) {
        expect(e instanceof ApplicationError).toBe(true);
        expect(e.message).toBe('The entity already exists in this variation');
      }

      expect(findOne).toHaveBeenCalledWith(
        kind === 'singleType'
          ? { populate: ['personalizations'] }
          : { where: { id: relatedEntityId }, populate: ['personalizations'] }
      );
      expect.assertions(3);
    });

    test('Throw if variation already exists (2/2)', async () => {
      const relatedEntityId = 1;
      const relatedEntity = {
        id: relatedEntityId,
        variation: 'fr',
        personalizations: [
          {
            id: 2,
            variation: 'en',
          },
        ],
      };
      const findOne = jest.fn(() => Promise.resolve(relatedEntity));
      const model = 'api::country.country';
      const variation = 'en';

      global.strapi = {
        query: () => ({
          findOne,
        }),
        getModel: () => ({ kind }),
      };

      try {
        await getAndValidateRelatedEntity(relatedEntityId, model, variation);
      } catch (e) {
        expect(e instanceof ApplicationError).toBe(true);
        expect(e.message).toBe('The entity already exists in this variation');
      }

      expect(findOne).toHaveBeenCalledWith(
        kind === 'singleType'
          ? { populate: ['personalizations'] }
          : { where: { id: relatedEntityId }, populate: ['personalizations'] }
      );
      expect.assertions(3);
    });

    test('get related entity', async () => {
      const relatedEntityId = 1;
      const relatedEntity = {
        id: relatedEntityId,
        variation: 'fr',
        personalizations: [
          {
            id: 2,
            variation: 'en',
          },
        ],
      };
      const findOne = jest.fn(() => Promise.resolve(relatedEntity));
      const model = 'api::country.country';
      const variation = 'it';

      global.strapi = {
        query: () => ({
          findOne,
        }),
        getModel: () => ({ kind }),
      };

      const foundEntity = await getAndValidateRelatedEntity(relatedEntityId, model, variation);

      expect(foundEntity).toEqual(relatedEntity);
      expect(findOne).toHaveBeenCalledWith(
        kind === 'singleType'
          ? { populate: ['personalizations'] }
          : { where: { id: relatedEntityId }, populate: ['personalizations'] }
      );
      expect.assertions(2);
    });
  });

  describe('getNewPersonalizationsFrom', () => {
    test('Can get personalizations', async () => {
      const relatedEntity = {
        id: 1,
        variation: 'fr',
        personalizations: [
          {
            id: 2,
            variation: 'en',
          },
          {
            id: 3,
            variation: 'it',
          },
        ],
      };

      const personalizations = await getNewPersonalizationsFrom(relatedEntity);

      expect(personalizations).toEqual([1, 2, 3]);
    });

    test('Add empty personalizations if none exist (CT)', async () => {
      const personalizations = await getNewPersonalizationsFrom(undefined);

      expect(personalizations).toEqual([]);
    });
  });

  describe('copyNonPersonalizedAttributes', () => {
    test('Does not copy variation, personalizations & publishedAt', () => {
      const model = {
        attributes: {
          title: {
            type: 'string',
            pluginOptions: {
              personalization: { personalized: true },
            },
          },
          price: {
            type: 'integer',
          },
          relation: {
            type: 'relation',
          },
          description: {
            type: 'string',
          },
          variation: {
            type: 'string',
            visible: false,
          },
          personalizations: {
            collection: 'test-model',
            visible: false,
          },
          publishedAt: {
            type: 'datetime',
            visible: false,
          },
        },
      };

      const input = {
        id: 1,
        title: 'My custom title',
        price: 25,
        relation: 1,
        description: 'My super description',
        variation: 'en',
        personalizations: [1, 2, 3],
        publishedAt: '2021-03-18T09:47:37.557Z',
      };

      const result = copyNonPersonalizedAttributes(model, input);
      expect(result).toStrictEqual({
        price: input.price,
        description: input.description,
      });
    });

    test('picks only non personalized attributes', () => {
      const model = {
        attributes: {
          title: {
            type: 'string',
            pluginOptions: {
              personalization: { personalized: true },
            },
          },
          price: {
            type: 'integer',
          },
          relation: {
            type: 'relation',
          },
          description: {
            type: 'string',
          },
        },
      };

      const input = {
        id: 1,
        title: 'My custom title',
        price: 25,
        relation: 1,
        description: 'My super description',
      };

      const result = copyNonPersonalizedAttributes(model, input);
      expect(result).toStrictEqual({
        price: input.price,
        description: input.description,
      });
    });

    test('Removes ids', () => {
      const compoModel = {
        attributes: {
          name: { type: 'string' },
        },
      };

      global.strapi = {
        components: {
          compo: compoModel,
        },
      };

      const model = {
        attributes: {
          title: {
            type: 'string',
            pluginOptions: {
              personalization: { personalized: true },
            },
          },
          price: {
            type: 'integer',
          },
          relation: {
            type: 'relation',
          },
          component: {
            type: 'component',
            component: 'compo',
          },
        },
      };

      const input = {
        id: 1,
        title: 'My custom title',
        price: 25,
        relation: 1,
        component: {
          id: 2,
          name: 'Hello',
        },
      };

      const result = copyNonPersonalizedAttributes(model, input);
      expect(result).toEqual({
        price: 25,
        component: {
          name: 'Hello',
        },
      });
    });
  });

  describe('fillNonPersonalizedAttributes', () => {
    test('fill non personalized attributes', () => {
      const entry = {
        a: 'a',
        b: undefined,
        c: null,
        d: 1,
        e: {},
        la: 'a',
        lb: undefined,
        lc: null,
        ld: 1,
        le: {},
      };

      const relatedEntry = {
        a: 'a',
        b: 'b',
        c: 'c',
        d: 'd',
        e: 'e',
        la: 'la',
        lb: 'lb',
        lc: 'lc',
        ld: 'ld',
        le: 'le',
      };

      const modelDef = {
        attributes: {
          a: {},
          b: {},
          c: {},
          d: {},
          e: {},
          la: { pluginOptions: { personalization: { personalized: true } } },
          lb: { pluginOptions: { personalization: { personalized: true } } },
          lc: { pluginOptions: { personalization: { personalized: true } } },
          ld: { pluginOptions: { personalization: { personalized: true } } },
          le: { pluginOptions: { personalization: { personalized: true } } },
        },
      };

      const getModel = jest.fn(() => modelDef);
      global.strapi = { getModel };

      fillNonPersonalizedAttributes(entry, relatedEntry, { model: 'model' });

      expect(entry).toEqual({
        a: 'a',
        b: 'b',
        c: 'c',
        d: 1,
        e: {},
        la: 'a',
        lb: undefined,
        lc: null,
        ld: 1,
        le: {},
      });
    });
  });

  describe('getNestedPopulateOfNonPersonalizedAttributes', () => {
    beforeAll(() => {
      const getModel = model =>
        ({
          'api::country.country': {
            attributes: {
              name: {
                type: 'string',
              },
              nonPersonalizedName: {
                type: 'string',
                pluginOptions: {
                  personalization: {
                    personalized: false,
                  },
                },
              },
              comp: {
                type: 'component',
                repeatable: false,
                component: 'basic.mycompo',
                pluginOptions: {
                  personalization: {
                    personalized: false,
                  },
                },
              },
              dz: {
                type: 'dynamiczone',
                components: ['basic.mycompo', 'default.mydz'],
                pluginOptions: {
                  personalization: {
                    personalized: false,
                  },
                },
              },
              myrelation: {
                type: 'relation',
                relation: 'manyToMany',
                target: 'api::category.category',
                inversedBy: 'addresses',
              },
            },
          },
          'basic.mycompo': {
            attributes: {
              title: {
                type: 'string',
              },
              image: {
                allowedTypes: ['images', 'files', 'videos'],
                type: 'media',
                multiple: false,
              },
            },
          },
          'default.mydz': {
            attributes: {
              name: {
                type: 'string',
              },
              picture: {
                type: 'media',
              },
            },
          },
        }[model]);

      global.strapi = { getModel };
    });

    test('Populate component, dz and media and not relations', () => {
      const result = getNestedPopulateOfNonPersonalizedAttributes('api::country.country');

      expect(result).toEqual(['comp', 'dz', 'comp.image', 'dz.image', 'dz.picture']);
    });
  });
});
