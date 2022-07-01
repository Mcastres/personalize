import { fixtures } from '../../../../../../admin-test-utils/lib';
import addVariationToSingleTypesLinks from '../addVariationToSingleTypesLinks';

describe('personalization | contentManagerHooks | addVariationToSingleTypesLinks', () => {
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

  it('should forward when the stLinks array is empty', () => {
    const data = {
      stLinks: [],
      models: [],
    };

    const results = addVariationToSingleTypesLinks(data, store);

    expect(results).toEqual(data);
  });

  it('should not add the search key to a single type link when personalization is not enabled on the single type', () => {
    const data = {
      stLinks: [{ to: 'cm/singleType/test' }],
      models: [{ uid: 'test', pluginOptions: { personalization: { personalized: false } } }],
    };

    const results = addVariationToSingleTypesLinks(data, store);

    expect(results).toEqual(data);
  });

  it('should add a search key with the default variation when the user has the right to read it', () => {
    store.personalization_variations.variations = [{ code: 'en', isDefault: true }];
    store.rbacProvider.collectionTypesRelatedPermissions.test[
      'plugin::content-manager.explorer.read'
    ] = [{ properties: { variations: ['en'] } }];

    const data = {
      stLinks: [{ to: 'cm/singleType/test' }],
      models: [{ uid: 'test', pluginOptions: { personalization: { personalized: true } } }],
    };

    const results = addVariationToSingleTypesLinks(data, store);

    const expected = {
      stLinks: [{ to: 'cm/singleType/test', search: 'plugins[personalization][variation]=en' }],
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
      stLinks: [{ to: 'cm/singleType/test' }],
      models: [{ uid: 'test', pluginOptions: { personalization: { personalized: true } } }],
    };
    const results = addVariationToSingleTypesLinks(data, store);

    const expected = {
      stLinks: [{ to: 'cm/singleType/test', isDisplayed: false }],
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
      stLinks: [{ to: 'cm/singleType/test', search: 'plugins[plugin][test]=test' }],
      models: [{ uid: 'test', pluginOptions: { personalization: { personalized: true } } }],
    };
    const results = addVariationToSingleTypesLinks(data, store);

    const expected = {
      stLinks: [
        {
          to: 'cm/singleType/test',
          search: 'plugins[plugin][test]=test&plugins[personalization][variation]=en',
        },
      ],
      models: [{ uid: 'test', pluginOptions: { personalization: { personalized: true } } }],
    };

    expect(results).toEqual(expected);
  });
});
