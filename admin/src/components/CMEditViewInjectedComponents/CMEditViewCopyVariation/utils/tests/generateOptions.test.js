import generateOptions from '../generateOptions';

const appVariations = [
  { code: 'en', name: 'English' },
  { code: 'fr', name: 'French' },
  { code: 'it', name: 'Italian' },
];

describe('Personalization | Components | CMEditViewCopyVariation | utils', () => {
  describe('generateOptions', () => {
    it('should return an array', () => {
      expect(generateOptions([])).toEqual([]);
    });

    it('should remove the current variation from the array', () => {
      const permissions = [
        { properties: { variations: [] } },
        { properties: { variations: ['en', 'fr', 'it'] } },
      ];
      const currentVariation = 'en';
      const personalizations = [
        { publishedAt: 'test', variation: 'en', id: 1 },
        { publishedAt: 'test', variation: 'fr', id: 2 },
        { publishedAt: 'test', variation: 'it', id: 3 },
      ];

      const expected = [
        { label: 'French', value: 2 },
        { label: 'Italian', value: 3 },
      ];

      expect(generateOptions(appVariations, currentVariation, personalizations, permissions)).toEqual(
        expected
      );
    });

    it('should remove the variations that are not contained in the personalizations array', () => {
      const permissions = [
        { properties: { variations: [] } },
        { properties: { variations: ['en', 'fr', 'it'] } },
      ];
      const personalizations = [
        { publishedAt: 'test', variation: 'en', id: 1 },
        { publishedAt: 'test', variation: 'fr', id: 2 },
      ];

      const expected = [
        { label: 'English', value: 1 },
        { label: 'French', value: 2 },
      ];
      const currentVariation = 'test';
      expect(generateOptions(appVariations, currentVariation, personalizations, permissions)).toEqual(
        expected
      );
    });

    it('should remove the variations when the user does not have the permission to read', () => {
      const permissions = [
        { properties: { variations: ['en'] } },
        { properties: { variations: ['it'] } },
      ];
      const currentVariation = 'test';
      const personalizations = [
        { publishedAt: 'test', variation: 'en', id: 1 },
        { publishedAt: 'test', variation: 'fr', id: 2 },
        { publishedAt: 'test', variation: 'it', id: 3 },
      ];

      const expected = [
        { label: 'English', value: 1 },
        { label: 'Italian', value: 3 },
      ];

      expect(generateOptions(appVariations, currentVariation, personalizations, permissions)).toEqual(
        expected
      );
    });
  });
});
