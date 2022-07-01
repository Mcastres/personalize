'use strict';

const { after } = require('../field');

describe('personalization - Migration - disable personalization on a field', () => {
  describe('after', () => {
    describe('Should not migrate', () => {
      test("Doesn't migrate if model isn't personalized", async () => {
        const find = jest.fn();
        global.strapi = {
          query() {
            find;
          },
          plugins: {
            personalization: {
              services: {
                'content-types': {
                  isPersonalizedContentType: () => false,
                },
              },
            },
          },
        };

        const model = {};
        const previousDefinition = {};

        await after({ model, definition: model, previousDefinition });
        expect(find).not.toHaveBeenCalled();
      });

      test("Doesn't migrate if no attribute changed (without personalization)", async () => {
        const find = jest.fn();
        const getPersonalizedAttributes = jest.fn(() => []);

        global.strapi = {
          query() {
            find;
          },
          plugins: {
            personalization: {
              services: {
                'content-types': {
                  isPersonalizedContentType: () => true,
                  getPersonalizedAttributes,
                },
              },
            },
          },
        };

        const model = { attributes: { name: {} } };
        const previousDefinition = { attributes: { name: {} } };

        await after({ model, definition: model, previousDefinition });
        expect(getPersonalizedAttributes).toHaveBeenCalledTimes(2);
        expect(find).not.toHaveBeenCalled();
      });

      test("Doesn't migrate if no attribute changed (with personalization)", async () => {
        const find = jest.fn();
        const getPersonalizedAttributes = jest.fn(() => ['name']);
        global.strapi = {
          query() {
            find;
          },
          plugins: {
            personalization: {
              services: {
                'content-types': {
                  isPersonalizedContentType: () => true,
                  getPersonalizedAttributes,
                },
              },
            },
          },
        };

        const model = { attributes: { name: {} } };
        const previousDefinition = { attributes: { name: {} } };

        await after({ model, definition: model, previousDefinition });
        expect(getPersonalizedAttributes).toHaveBeenCalledTimes(2);
        expect(find).not.toHaveBeenCalled();
      });

      test("Doesn't migrate if field become personalized", async () => {
        const find = jest.fn();
        const getPersonalizedAttributes = jest
          .fn()
          .mockReturnValueOnce(['name'])
          .mockReturnValueOnce([]);

        global.strapi = {
          query() {
            find;
          },
          plugins: {
            personalization: {
              services: {
                'content-types': {
                  isPersonalizedContentType: () => true,
                  getPersonalizedAttributes,
                },
              },
            },
          },
        };

        const model = { attributes: { name: {} } };
        const previousDefinition = { attributes: { name: {} } };

        await after({ model, definition: model, previousDefinition });
        expect(getPersonalizedAttributes).toHaveBeenCalledTimes(2);
        expect(find).not.toHaveBeenCalled();
      });

      test("Doesn't migrate if field is deleted", async () => {
        const find = jest.fn();
        const getPersonalizedAttributes = jest
          .fn()
          .mockReturnValueOnce([])
          .mockReturnValueOnce(['name']);

        global.strapi = {
          query() {
            find;
          },
          plugins: {
            personalization: {
              services: {
                'content-types': {
                  isPersonalizedContentType: () => true,
                  getPersonalizedAttributes,
                },
              },
            },
          },
        };

        const model = { attributes: {} };
        const previousDefinition = { attributes: { name: {} } };

        await after({ model, definition: model, previousDefinition });
        expect(getPersonalizedAttributes).toHaveBeenCalledTimes(2);
        expect(find).not.toHaveBeenCalled();
      });
    });
  });
});
