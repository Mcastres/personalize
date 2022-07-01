'use strict';

jest.mock('../personalizations', () => {
  return () => ({
    syncPersonalizations: jest.fn(async () => {}),
    syncNonPersonalizedAttributes: jest.fn(async () => {}),
  });
});

const { decorator } = require('../entity-service-decorator')();
const personalizations = require('../localizations')();
const variations = require('../variations')();
const contentTypes = require('../content-types')();

const { syncPersonalizations, syncNonPersonalizedAttributes } = personalizations;

const model = {
  pluginOptions: {
    personalization: {
      personalized: true,
    },
  },
};

const nonPersonalizedModel = {
  pluginOptions: {
    personalization: {
      personalized: false,
    },
  },
};

const models = {
  'test-model': model,
  'non-personalized-model': nonPersonalizedModel,
};

describe('Entity service decorator', () => {
  beforeAll(() => {
    global.strapi = {
      plugins: {
        personalization: {
          services: {
            variations,
            'content-types': contentTypes,
            personalizations,
          },
        },
      },
      query() {
        return {
          create() {},
          update() {},
        };
      },
      getModel(uid) {
        return models[uid || 'test-model'];
      },
      store: () => ({ get: () => 'en' }),
    };
  });

  beforeEach(() => {
    syncPersonalizations.mockClear();
    syncNonPersonalizedAttributes.mockClear();
  });

  describe('wrapParams', () => {
    test('Calls original wrapParams', async () => {
      const defaultService = {
        wrapParams: jest.fn(() => Promise.resolve('li')),
      };

      const service = decorator(defaultService);

      const input = { populate: ['test'] };
      await service.wrapParams(input, { uid: 'test-model' });

      expect(defaultService.wrapParams).toHaveBeenCalledWith(input, { uid: 'test-model' });
    });

    test('Does not wrap options if model is not personalized', async () => {
      const defaultService = {
        wrapParams: jest.fn(opts => Promise.resolve(opts)),
      };
      const service = decorator(defaultService);

      const input = { populate: ['test'] };
      const output = await service.wrapParams(input, { uid: 'non-personalized-model' });

      expect(output).toStrictEqual(input);
    });

    test('does not change non params options', async () => {
      const defaultService = {
        wrapParams: jest.fn(opts => Promise.resolve(opts)),
      };
      const service = decorator(defaultService);

      const input = { populate: ['test'] };
      const output = await service.wrapParams(input, { uid: 'test-model' });

      expect(output.populate).toStrictEqual(input.populate);
    });

    test('Adds variation param', async () => {
      const defaultService = {
        wrapParams: jest.fn(opts => Promise.resolve(opts)),
      };
      const service = decorator(defaultService);

      const input = { populate: ['test'] };
      const output = await service.wrapParams(input, { uid: 'test-model' });

      expect(output).toMatchObject({ filters: { $and: [{ variation: 'en' }] } });
    });

    const testData = [
      ['findOne', { filters: { id: 1 } }],
      ['update', { filters: { id: 1 } }],
      ['delete', { filters: { id: 1 } }],
      ['delete', { filters: { id: { $in: [1] } } }],
      ['findOne', { filters: [{ id: 1 }] }],
      ['update', { filters: [{ id: 1 }] }],
      ['delete', { filters: [{ id: 1 }] }],
      ['delete', { filters: [{ id: { $in: [1] } }] }],
    ];

    test.each(testData)(
      "Doesn't add variation param when the params contain id or id_in - %s",
      async (action, params) => {
        const defaultService = {
          wrapParams: jest.fn(opts => Promise.resolve(opts)),
        };
        const service = decorator(defaultService);

        const input = Object.assign({ populate: ['test'], ...params });
        const output = await service.wrapParams(input, { uid: 'test-model', action });

        expect(output).toEqual({ populate: ['test'], ...params });
      }
    );

    test('Replaces variation param', async () => {
      const defaultService = {
        wrapParams: jest.fn(opts => Promise.resolve(opts)),
      };
      const service = decorator(defaultService);

      const input = {
        variation: 'fr',
        populate: ['test'],
      };
      const output = await service.wrapParams(input, { uid: 'test-model' });

      expect(output).toMatchObject({ filters: { $and: [{ variation: 'fr' }] } });
    });
  });

  describe('create', () => {
    test('Calls original create', async () => {
      const entry = {
        id: 1,
      };

      const defaultService = {
        create: jest.fn(() => Promise.resolve(entry)),
      };

      const service = decorator(defaultService);

      const input = { data: { title: 'title ' } };
      await service.create('test-model', input);

      expect(defaultService.create).toHaveBeenCalledWith('test-model', input);
    });

    test('Calls syncPersonalizations if model is personalized', async () => {
      const entry = {
        id: 1,
        personalizations: [{ id: 2 }],
      };

      const defaultService = {
        create: jest.fn(() => Promise.resolve(entry)),
      };

      const service = decorator(defaultService);

      const input = { data: { title: 'title ' } };
      await service.create('test-model', input);

      expect(defaultService.create).toHaveBeenCalledWith('test-model', input);
      expect(syncPersonalizations).toHaveBeenCalledWith(entry, { model });
    });

    test('Skip processing if model is not personalized', async () => {
      const entry = {
        id: 1,
        personalizations: [{ id: 2 }],
      };

      const defaultService = {
        create: jest.fn(() => Promise.resolve(entry)),
      };

      const service = decorator(defaultService);

      const input = { data: { title: 'title ' } };
      const output = await service.create('non-personalized-model', input);

      expect(defaultService.create).toHaveBeenCalledWith('non-personalized-model', input);
      expect(syncPersonalizations).not.toHaveBeenCalled();
      expect(output).toStrictEqual(entry);
    });
  });

  describe('update', () => {
    test('Calls original update', async () => {
      const entry = {
        id: 1,
      };

      const defaultService = {
        update: jest.fn(() => Promise.resolve(entry)),
      };

      const service = decorator(defaultService);

      const input = { data: { title: 'title ' } };
      await service.update('test-model', 1, input);

      expect(defaultService.update).toHaveBeenCalledWith('test-model', 1, input);
    });

    test('Calls syncNonPersonalizedAttributes if model is personalized', async () => {
      const entry = {
        id: 1,
        personalizations: [{ id: 2 }],
      };

      const defaultService = {
        update: jest.fn(() => Promise.resolve(entry)),
      };

      const service = decorator(defaultService);

      const input = { data: { title: 'title ' } };
      const output = await service.update('test-model', 1, input);

      expect(defaultService.update).toHaveBeenCalledWith('test-model', 1, input);
      expect(syncNonPersonalizedAttributes).toHaveBeenCalledWith(entry, { model });
      expect(output).toStrictEqual(entry);
    });

    test('Skip processing if model is not personalized', async () => {
      const entry = {
        id: 1,
        personalizations: [{ id: 2 }],
      };

      const defaultService = {
        update: jest.fn(() => Promise.resolve(entry)),
      };

      const service = decorator(defaultService);

      const input = { data: { title: 'title ' } };
      await service.update('non-personalized-model', 1, input);

      expect(defaultService.update).toHaveBeenCalledWith('non-personalized-model', 1, input);
      expect(syncNonPersonalizedAttributes).not.toHaveBeenCalled();
    });
  });
});
