import { fixtures } from '../../../../../../admin-test-utils';
import selectCollectionTypePermissions from '../selectCollectionTypesRelatedPermissions';
import selectPersonalizationVariations from '../selectPersonalizationVariations';

describe('personalization | selectors | selectCollectionTypePermissions', () => {
  let store;

  beforeEach(() => {
    store = { ...fixtures.store.state };
  });

  it('resolves the permissions key of the "rbacProvider.collectionTypesRelatedPermissions" store key', () => {
    const actual = selectCollectionTypePermissions(store);

    expect(actual).toBeDefined();
  });
});

describe('personalization | selectors | selectPersonalizationVariations', () => {
  let store;

  beforeEach(() => {
    store = { ...fixtures.store.state, personalization_variations: { isLoading: true, variations: [] } };
  });

  it('resolves the permissions key of the "personalization_variations" store key', () => {
    const actual = selectPersonalizationVariations(store);

    expect(actual).toBeDefined();
  });
});
