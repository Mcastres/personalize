import reducers, { initialState } from '../reducers';
import { RESOLVE_VARIATIONS, ADD_VARIATION, DELETE_LOCALE, UPDATE_LOCALE } from '../constants';

describe('personalization reducer', () => {
  it('resolves the initial state when the action is not known', () => {
    const action = {
      type: 'UNKNWON_ACTION',
    };

    const actual = reducers.personalization_variations(initialState, action);
    const expected = initialState;

    expect(actual).toEqual(expected);
  });

  it('resolves a list of variations when triggering RESOLVE_VARIATIONS', () => {
    const action = {
      type: RESOLVE_VARIATIONS,
      variations: [{ id: 1, displayName: 'French', isDefault: false }],
    };

    const actual = reducers.personalization_variations(initialState, action);
    const expected = {
      isLoading: false,
      variations: [
        {
          displayName: 'French',
          id: 1,
          isDefault: false,
        },
      ],
    };

    expect(actual).toEqual(expected);
  });

  it('adds a variation when triggering ADD_VARIATION', () => {
    const action = {
      type: ADD_VARIATION,
      newVariation: { id: 1, displayName: 'French', isDefault: false },
    };

    const actual = reducers.personalization_variations(initialState, action);
    const expected = {
      isLoading: true,
      variations: [
        {
          displayName: 'French',
          id: 1,
          isDefault: false,
        },
      ],
    };

    expect(actual).toEqual(expected);
  });

  it('adds a variation when triggering ADD_VARIATION and set it to default', () => {
    const action = {
      type: ADD_VARIATION,
      newVariation: { id: 1, displayName: 'French', isDefault: true },
    };

    const variations = [
      {
        displayName: 'English',
        id: 2,
        isDefault: true,
      },
    ];

    const actual = reducers.personalization_variations({ ...initialState, variations }, action);
    const expected = {
      isLoading: true,
      variations: [
        {
          displayName: 'English',
          id: 2,
          isDefault: false,
        },
        {
          displayName: 'French',
          id: 1,
          isDefault: true,
        },
      ],
    };

    expect(actual).toEqual(expected);
  });

  it('removes a variation when triggering DELETE_VARIATION ', () => {
    const action = {
      type: DELETE_VARIATION,
      id: 2,
    };

    const variations = [
      {
        displayName: 'French',
        id: 1,
        isDefault: true,
      },
      {
        displayName: 'English',
        id: 2,
        isDefault: false,
      },
    ];

    const actual = reducers.personalization_variations({ ...initialState, variations }, action);
    const expected = {
      isLoading: true,
      variations: [
        {
          displayName: 'French',
          id: 1,
          isDefault: true,
        },
      ],
    };

    expect(actual).toEqual(expected);
  });

  it('updates a variation when triggering UPDATE_VARIATION', () => {
    const action = {
      type: UPDATE_VARIATION,
      editedVariation: { id: 1, displayName: 'Frenchie', isDefault: false },
    };

    const variations = [
      {
        displayName: 'English',
        id: 2,
        isDefault: true,
      },
      {
        displayName: 'French',
        id: 1,
        isDefault: false,
      },
    ];

    const actual = reducers.personalization_variations({ ...initialState, variations }, action);
    const expected = {
      isLoading: true,
      variations: [
        {
          displayName: 'English',
          id: 2,
          isDefault: true,
        },
        {
          displayName: 'Frenchie',
          id: 1,
          isDefault: false,
        },
      ],
    };

    expect(actual).toEqual(expected);
  });

  it('updates a variation when triggering UPDATE_VARIATION and set it to default', () => {
    const action = {
      type: UPDATE_VARIATION,
      editedVariation: { id: 1, displayName: 'Frenchie', isDefault: true },
    };

    const variations = [
      {
        displayName: 'English',
        id: 2,
        isDefault: true,
      },
      {
        displayName: 'French',
        id: 1,
        isDefault: false,
      },
    ];

    const actual = reducers.personalization_variations({ ...initialState, variations }, action);
    const expected = {
      isLoading: true,
      variations: [
        {
          displayName: 'English',
          id: 2,
          isDefault: false,
        },
        {
          displayName: 'Frenchie',
          id: 1,
          isDefault: true,
        },
      ],
    };

    expect(actual).toEqual(expected);
  });
});
