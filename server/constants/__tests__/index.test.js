'use strict';

const { getInitVariation } = require('../');

describe('Personalization default variation', () => {
  describe('getInitVariation', () => {
    test('The init variation is english by default', () => {
      expect(getInitVariation()).toStrictEqual({
        code: 'en',
        name: 'English (en)',
      });
    });

    test('The init variation can be configured by an env var', () => {
      process.env.STRAPI_PLUGIN_Personalization_INIT_VARIATION_CODE = 'fr';
      expect(getInitVariation()).toStrictEqual({
        code: 'fr',
        name: 'French (fr)',
      });
    });

    test('Throws if env var code is unknown in iso list', () => {
      process.env.STRAPI_PLUGIN_Personalization_INIT_VARIATION_CODE = 'zzzzz';
      expect(() => getInitVariation()).toThrow();
    });
  });
});
