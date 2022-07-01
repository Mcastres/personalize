'use strict';

const metricsLoader = require('../metrics');
const { isPersonalizedContentType } = require('../content-types')();

describe('Metrics', () => {
  test('sendDidInitializeEvent', async () => {
    global.strapi = {
      contentTypes: {
        withPersonalization: {
          pluginOptions: {
            personalization: {
              personalized: true,
            },
          },
        },
        withoutPersonalization: {
          pluginOptions: {
            personalization: {
              personalized: false,
            },
          },
        },
        withNoOption: {
          pluginOptions: {},
        },
      },
      plugins: {
        personalization: {
          services: {
            ['content-types']: {
              isPersonalizedContentType,
            },
          },
        },
      },
      telemetry: {
        send: jest.fn(),
      },
    };

    const { sendDidInitializeEvent } = metricsLoader({ strapi });

    await sendDidInitializeEvent();

    expect(strapi.telemetry.send).toHaveBeenCalledWith('didInitializePersonalization', {
      numberOfContentTypes: 1,
    });
  });

  test('sendDidUpdatePersonalizationVariationsEvent', async () => {
    global.strapi = {
      contentTypes: {
        withPersonalization: {
          pluginOptions: {
            personalization: {
              personalized: true,
            },
          },
        },
        withoutPersonalization: {
          pluginOptions: {
            personalization: {
              personalized: false,
            },
          },
        },
        withNoOption: {
          pluginOptions: {},
        },
      },
      plugins: {
        personalization: {
          services: {
            variations: {
              count: jest.fn(() => 3),
            },
          },
        },
      },
      telemetry: {
        send: jest.fn(),
      },
    };

    const { sendDidUpdatePersonalizationVariationsEvent } = metricsLoader({ strapi });

    await sendDidUpdatePersonalizationVariationsEvent();

    expect(strapi.telemetry.send).toHaveBeenCalledWith('didUpdatePersonalizationVariations', {
      numberOfVariations: 3,
    });
  });
});
