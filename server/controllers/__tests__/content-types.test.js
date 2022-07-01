'use strict';

const { ApplicationError } = require('@strapi/utils').errors;
const { getNonPersonalizedAttributes } = require('../content-types');
const ctService = require('../../services/content-types')();

describe('personalization - Controller - content-types', () => {
  describe('getNonPersonalizedAttributes', () => {
    beforeEach(() => {
      const contentType = () => ({});
      const getModel = () => ({});
      global.strapi = {
        contentType,
        getModel,
        plugins: { personalization: { services: { 'content-types': ctService } } },
        admin: { services: { constants: { READ_ACTION: 'read', CREATE_ACTION: 'create' } } },
      };
    });

    test('model not personalized', async () => {
      const badRequest = jest.fn();
      const ctx = {
        state: { user: {} },
        request: {
          body: {
            model: 'api::country.country',
            id: 1,
            variation: 'fr',
          },
        },
        badRequest,
      };

      expect.assertions(2);

      try {
        await getNonPersonalizedAttributes(ctx);
      } catch (e) {
        expect(e instanceof ApplicationError).toBe(true);
        expect(e.message).toEqual('model.not.personalized');
      }
    });

    test('entity not found', async () => {
      const notFound = jest.fn();
      const findOne = jest.fn(() => Promise.resolve(undefined));
      const contentType = jest.fn(() => ({ pluginOptions: { personalization: { personalized: true } } }));

      global.strapi.query = () => ({ findOne });
      global.strapi.contentType = contentType;
      const ctx = {
        state: { user: {} },
        request: {
          body: {
            model: 'api::country.country',
            id: 1,
            variation: 'fr',
          },
        },
        notFound,
      };
      await getNonPersonalizedAttributes(ctx);

      expect(notFound).toHaveBeenCalledWith();
    });

    test('returns nonPersonalizedFields', async () => {
      const model = {
        pluginOptions: { personalization: { personalized: true } },
        attributes: {
          name: { type: 'string' },
          averagePrice: { type: 'integer' },
          description: { type: 'string', pluginOptions: { personalization: { personalized: true } } },
        },
      };
      const entity = {
        id: 1,
        name: "Papailhau's Pizza",
        description: 'Best pizza restaurant of the town',
        variation: 'en',
        publishedAt: '2021-03-30T09:34:54.042Z',
        personalizations: [{ id: 2, variation: 'it', publishedAt: null }],
      };
      const permissions = [
        { properties: { fields: ['name', 'averagePrice'], variations: ['it'] } },
        { properties: { fields: ['name', 'description'], variations: ['fr'] } },
        { properties: { fields: ['name'], variations: ['fr'] } },
      ];

      const findOne = jest.fn(() => Promise.resolve(entity));
      const findMany = jest.fn(() => Promise.resolve(permissions));
      const contentType = jest.fn(() => model);

      global.strapi.query = () => ({ findOne });
      global.strapi.contentType = contentType;
      global.strapi.admin.services.permission = { findMany };
      const ctx = {
        state: { user: { roles: [{ id: 1 }, { id: 2 }] } },
        request: {
          body: {
            model: 'api::country.country',
            id: 1,
            variation: 'fr',
          },
        },
      };
      await getNonPersonalizedAttributes(ctx);
      expect(findMany).toHaveBeenCalledWith({
        where: {
          action: ['read', 'create'],
          subject: 'api::country.country',
          role: {
            id: [1, 2],
          },
        },
      });
      expect(ctx.body).toEqual({
        nonPersonalizedFields: { name: "Papailhau's Pizza" },
        personalizations: [
          { id: 2, variation: 'it', publishedAt: null },
          { id: 1, variation: 'en', publishedAt: '2021-03-30T09:34:54.042Z' },
        ],
      });
    });
  });
});
