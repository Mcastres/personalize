import addVariationToLinksSearch from '../addVariationToLinksSearch';

describe('personalization | contentManagerHooks | utils | addVariationToLinksSearch', () => {
  it('should return an array', () => {
    expect(addVariationToLinksSearch([])).toEqual([]);
  });

  it('should not modify the links when personalization is not enabled on a content type', () => {
    const links = [{ uid: 'test', to: 'cm/collectionType/test' }];
    const schemas = [{ uid: 'test', pluginOptions: { personalization: { personalized: false } } }];

    expect(addVariationToLinksSearch(links, 'collectionType', schemas)).toEqual(links);
  });

  it('should set the isDisplayed key to false when the user does not have the permission to read or create a variation on a collection type', () => {
    const links = [
      { uid: 'foo', to: 'cm/collectionType/foo', isDisplayed: true },
      { uid: 'bar', to: 'cm/collectionType/bar', isDisplayed: true },
    ];
    const schemas = [
      { uid: 'foo', pluginOptions: { personalization: { personalized: true } } },
      { uid: 'bar', pluginOptions: { personalization: { personalized: true } } },
    ];
    const permissions = {
      foo: {
        'plugin::content-manager.explorer.create': [
          {
            properties: {
              fields: ['name'],
            },
          },
        ],
        'plugin::content-manager.explorer.read': [
          {
            properties: {
              fields: ['name'],
            },
          },
        ],
      },
      bar: {
        'plugin::content-manager.explorer.create': [
          {
            properties: {
              fields: ['name'],
              variations: [],
            },
          },
        ],
        'plugin::content-manager.explorer.read': [
          {
            properties: {
              fields: ['name'],
              variations: [],
            },
          },
        ],
      },
    };
    const expected = [
      { uid: 'foo', to: 'cm/collectionType/foo', isDisplayed: false },
      { uid: 'bar', to: 'cm/collectionType/bar', isDisplayed: false },
    ];
    const variations = [{ code: 'en', isDefault: true }, { code: 'fr' }];

    expect(addVariationToLinksSearch(links, 'collectionType', schemas, variations, permissions)).toEqual(
      expected
    );
  });

  it('should add the variation to a link search', () => {
    const links = [
      { uid: 'foo', to: 'cm/collectionType/foo', isDisplayed: true, search: 'page=1' },
      { uid: 'bar', to: 'cm/collectionType/bar', isDisplayed: true },
    ];
    const schemas = [
      { uid: 'foo', pluginOptions: { personalization: { personalized: true } } },
      { uid: 'bar', pluginOptions: { personalization: { personalized: true } } },
    ];
    const permissions = {
      foo: {
        'plugin::content-manager.explorer.create': [
          {
            properties: {
              fields: ['name'],
              variations: ['fr'],
            },
          },
        ],
        'plugin::content-manager.explorer.read': [
          {
            properties: {
              fields: ['name'],
            },
          },
        ],
      },
      bar: {
        'plugin::content-manager.explorer.create': [
          {
            properties: {
              fields: ['name'],
              variations: ['fr'],
            },
          },
        ],
        'plugin::content-manager.explorer.read': [
          {
            properties: {
              fields: ['name'],
              variations: ['en'],
            },
          },
        ],
      },
    };
    const expected = [
      {
        uid: 'foo',
        to: 'cm/collectionType/foo',
        isDisplayed: true,
        search: 'page=1&plugins[personalization][variation]=fr',
      },
      {
        uid: 'bar',
        to: 'cm/collectionType/bar',
        isDisplayed: true,
        search: 'plugins[personalization][variation]=en',
      },
    ];
    const variations = [{ code: 'en', isDefault: true }, { code: 'fr' }];

    expect(addVariationToLinksSearch(links, 'collectionType', schemas, variations, permissions)).toEqual(
      expected
    );
  });
});
