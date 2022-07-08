'use strict';

const { getInitVariation } = require('../');

describe('Personalization default variation', () => {
  describe('getInitVariation', () => {
    test('The init variation is english by default', () => {
      expect(getInitVariation()).toStrictEqual({
        slug: 'default',
        name: 'Default',
      });
    });
  });
});
