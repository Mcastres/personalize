'use strict';

const {
  assignDefaultVariation,
  syncPersonalizations,
  syncNonPersonalizedAttributes,
} = require('../personalizations')();

const variations = require('../variations')();
const contentTypes = require('../content-types')();

const model = {
  uid: 'test-model',
  pluginOptions: {
    personalization: {
      personalized: true,
    },
  },
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
  },
};

const allPersonalizedModel = {
  uid: 'test-model',
  pluginOptions: {
    personalization: {
      personalized: true,
    },
  },
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
      pluginOptions: {
        personalization: {
          personalized: true,
        },
      },
    },
  },
};

const setGlobalStrapi = () => {
  global.strapi = {
    plugins: {
      personalization: {
        services: {
          variations,
          'content-types': contentTypes,
        },
      },
    },
  };
};

describe('personalizations service', () => {
  describe('assignDefaultVariation', () => {
    test('Does not change the input if variation is already defined', async () => {
      setGlobalStrapi();
      const input = { variation: 'myVariation' };
      await assignDefaultVariation(input);

      expect(input).toStrictEqual({ variation: 'myVariation' });
    });

    test('Use default variation to set the locale on the input data', async () => {
      setGlobalStrapi();

      const getDefaultVariationMock = jest.fn(() => 'defaultLocale');

      global.strapi.plugins.personalization.services.variations.getDefaultVariation = getDefaultLocaleMock;

      const input = {};
      await assignDefaultVariation(input);

      expect(input).toStrictEqual({ variation: 'defaultVariation' });
      expect(getDefaultVariationMock).toHaveBeenCalled();
    });
  });

  describe('syncPersonalizations', () => {
    test('Updates every other personalizations with correct ids', async () => {
      setGlobalStrapi();

      const update = jest.fn();
      global.strapi.query = () => {
        return { update };
      };

      const personalizations = [{ id: 2 }, { id: 3 }];
      const entry = { id: 1, variation: 'test', personalizations };

      await syncPersonalizations(entry, { model });

      expect(update).toHaveBeenCalledTimes(personalizations.length);
      expect(update).toHaveBeenNthCalledWith(1, {
        where: { id: 2 },
        data: { personalizations: [1, 3] },
      });

      expect(update).toHaveBeenNthCalledWith(2, {
        where: { id: 3 },
        data: { personalizations: [1, 2] },
      });
    });
  });

  describe('syncNonPersonalizedAttributes', () => {
    test('Does nothing if no personalizations set', async () => {
      setGlobalStrapi();

      const update = jest.fn();
      global.strapi.query = () => {
        return { update };
      };

      const entry = { id: 1, variation: 'test' };

      await syncNonPersonalizedAttributes(entry, { model });

      expect(update).not.toHaveBeenCalled();
    });

    test('Does not update the current variation', async () => {
      setGlobalStrapi();

      const update = jest.fn();
      global.strapi.query = () => {
        return { update };
      };

      const entry = { id: 1, variation: 'test', personalizations: [] };

      await syncNonPersonalizedAttributes(entry, { model });

      expect(update).not.toHaveBeenCalled();
    });

    test('Does not update if all the fields are personalized', async () => {
      setGlobalStrapi();

      const update = jest.fn();
      global.strapi.query = () => {
        return { update };
      };

      const entry = { id: 1, variation: 'test', personalizations: [] };

      await syncNonPersonalizedAttributes(entry, { model: allLocalizedModel });

      expect(update).not.toHaveBeenCalled();
    });

    test('Updates variations with non personalized fields only', async () => {
      setGlobalStrapi();

      const update = jest.fn();
      global.strapi.entityService = { update };

      const entry = {
        id: 1,
        variation: 'test',
        title: 'Personalized',
        stars: 1,
        personalizations: [{ id: 2, variation: 'fr' }],
      };

      await syncNonPersonalizedAttributes(entry, { model });

      expect(update).toHaveBeenCalledTimes(1);
      expect(update).toHaveBeenCalledWith(model.uid, 2, { data: { stars: 1 } });
    });
  });
});
