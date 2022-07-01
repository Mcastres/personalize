'use strict';

const { shouldBeProcessed, getUpdatesInfo } = require('../utils');

describe('personalization - migration utils', () => {
  describe('shouldBeProcessed', () => {
    const testData = [
      [[], [], false],
      [['en'], [], false],
      [['en', 'fr'], [], false],
      [['en', 'fr'], [{ variation: 'en' }], false],
      [['en', 'fr'], [{ variation: 'fr' }], false],
      [['en'], [{ variation: 'fr' }, { locale: 'en' }], false],
      [['en', 'fr'], [{ variation: 'fr' }, { locale: 'en' }], false],
      [[], [{ variation: 'en' }], true],
      [['en'], [{ variation: 'fr' }], true],
      [['en', 'fr'], [{ variation: 'it' }], true],
    ];

    test.each(testData)('%p %j : %p', (processedVariationCodes, personalizations, expectedResult) => {
      const result = shouldBeProcessed(processedVariationCodes)({ personalizations });

      expect(result).toBe(expectedResult);
    });
  });

  describe('getUpdatesInfo', () => {
    const testData = [
      [
        [{ name: 'Name', nickname: 'Nickname', personalizations: [{ id: 1 }, { id: 2 }] }],
        ['name'],
        [{ entriesIdsToUpdate: [1, 2], attributesValues: { name: 'Name' } }],
      ],
      [
        [
          { name: 'Name 1', nickname: 'Nickname 1', personalizations: [{ id: 1 }, { id: 2 }] },
          { name: 'Name 2', nickname: 'Nickname 2', personalizations: [{ id: 3 }, { id: 4 }] },
        ],
        ['name'],
        [
          { entriesIdsToUpdate: [1, 2], attributesValues: { name: 'Name 1' } },
          { entriesIdsToUpdate: [3, 4], attributesValues: { name: 'Name 2' } },
        ],
      ],
    ];

    test.each(testData)('%j', (entriesToProcess, attributesToMigrate, expectedResult) => {
      const result = getUpdatesInfo({ entriesToProcess, attributesToMigrate });

      expect(result).toEqual(expectedResult);
    });
  });
});
