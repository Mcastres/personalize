'use strict';

const { getIsoVariations } = require('../iso-variations')();

describe('ISO variations', () => {
  test('getIsoVariations', () => {
    const variations = getIsoVariations();

    expect(variations).toMatchSnapshot();
  });
});
