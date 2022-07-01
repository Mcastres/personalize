import { fixtures } from '../../../../../../admin-test-utils/lib';
import addVariationToCollectionTypesLinksHook from '../addVariationToCollectionTypesLinks';

describe('personalization | contentManagerHooks | addVariationToCollectionTypesLinksHook', () => {
  let store;

  beforeEach(() => {
    store = {
      ...fixtures.store.state,
      personalization_variations: { variations: [] },
    };
    store.rbacProvider.allPermissions = [];

    store.rbacProvider.collectionTypesRelatedPermissions = {
      test: {
        'plugin::content-manager.explorer.read': [],
        'plugin::content-manager.explorer.create': [],
      },
    };
    store.getState = function() {
      return this;
    };
  });

  it('should return the initialValues when the ctLinks array is empty', () => {
    const data = {
      ctLinks: [],
      models: [],
    };

    const results = addVariationToCollectionTypesLinksHook(data, store);

    expect(results).toEqual(data);
  });

  it('should not add the search key to a collection type link when personalization is not enabled on the single type', () => {
    const data = {
      ctLinks: [{ to: 'cm/collectionType/test' }],
      models: [{ uid: 'test', pluginOptions: { personalization: { personalized: false } } }],
    };

    const results = addVariationToCollectionTypesLinksHook(data, store);

    expect(results).toEqual(data);
  });

  it('should add a search key with the default variation when the user has the right to read it', () => {
    store.personalization_variations = { variations: [{ code: 'en', isDefault: true }] };
    store.rbacProvider.collectionTypesRelatedPermissions.test[
      'plugin::content-manager.explorer.read'
    ] = [{ properties: { variations: ['en'] } }];

    const data = {
      ctLinks: [{ to: 'cm/collectionType/test', search: null }],
      models: [{ uid: 'test', pluginOptions: { personalization: { personalized: true } } }],
    };

    const results = addVariationToCollectionTypesLinksHook(data, store);

    const expected = {
      ctLinks: [{ to: 'cm/collectionType/test', search: 'plugins[personalization][variation]=en' }],
      models: [{ uid: 'test', pluginOptions: { personalization: { personalized: true } } }],
    };

    expect(results).toEqual(expected);
  });

  it('should set the isDisplayed key to false when the user does not have the right to read any variation', () => {
    store.personalization_variations.variations = [{ code: 'en', isDefault: true }];
    store.rbacProvider.collectionTypesRelatedPermissions.test[
      'plugin::content-manager.explorer.read'
    ] = [{ properties: { variations: [] } }];

    const data = {
      ctLinks: [{ to: 'cm/collectionType/test', search: 'page=1&pageSize=10' }],
      models: [{ uid: 'test', pluginOptions: { personalization: { personalized: true } } }],
    };

    const results = addVariationToCollectionTypesLinksHook(data, store);

    const expected = {
      ctLinks: [
        {
          to: 'cm/collectionType/test',
          isDisplayed: false,
          search: 'page=1&pageSize=10',
        },
      ],
      models: [{ uid: 'test', pluginOptions: { personalization: { personalized: true } } }],
    };

    expect(results).toEqual(expected);
  });

  it('should keep the previous search', () => {
    store.personalization_variations.variations = [{ code: 'en', isDefault: true }];
    store.rbacProvider.collectionTypesRelatedPermissions.test[
      'plugin::content-manager.explorer.read'
    ] = [{ properties: { variations: ['en'] } }];

    const data = {
      ctLinks: [{ to: 'cm/collectionType/test', search: 'plugins[plugin][test]=test' }],
      models: [{ uid: 'test', pluginOptions: { personalization: { personalized: true } } }],
    };

    const results = addVariationToCollectionTypesLinksHook(data, store);

    const expected = {
      ctLinks: [
        {
          to: 'cm/collectionType/test',
          search: 'plugins[plugin][test]=test&plugins[personalization][variation]=en',
        },
      ],
      models: [{ uid: 'test', pluginOptions: { personalization: { personalized: true } } }],
    };

    expect(results).toEqual(expected);
  });
});
