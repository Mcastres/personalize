'use strict';

const { listIsoVariations } = require('../iso-variations');

describe('ISO variations', () => {
  test('listIsoVariations', () => {
    const isoVariations = [{ code: 'af', name: 'Afrikaans (af)' }];
    const getIsoVariations = jest.fn(() => isoLocales);
    global.strapi = {
      plugins: {
        personalization: {
          services: {
            'iso-variations': {
              getIsoVariations,
            },
          },
        },
      },
    };

    const ctx = {};
    listIsoVariations(ctx);

    expect(ctx.body).toMatchObject(isoVariations);
  });
});
