import getInitialVariation from '../getInitialVariation';

describe('getInitialVariation', () => {
  it('gives "fr-FR" when the query.plugins.variation is "fr-FR"', () => {
    const query = {
      page: '1',
      pageSize: '10',
      sort: 'Name:ASC',
      plugins: {
        personalization: { variation: 'fr-FR' },
      },
    };

    const variations = [
      {
        id: 1,
        name: 'English',
        code: 'en',
        createdAt: '2021-03-09T14:57:03.016Z',
        updatedAt: '2021-03-09T14:57:03.016Z',
        isDefault: true,
      },
      {
        id: 2,
        name: 'French (France) (fr-FR)',
        code: 'fr-FR',
        createdAt: '2021-03-09T15:03:06.992Z',
        updatedAt: '2021-03-09T15:03:06.996Z',
        isDefault: false,
      },
    ];

    const expected = {
      id: 2,
      name: 'French (France) (fr-FR)',
      code: 'fr-FR',
      createdAt: '2021-03-09T15:03:06.992Z',
      updatedAt: '2021-03-09T15:03:06.996Z',
      isDefault: false,
    };
    const actual = getInitialVariation(query, variations);

    expect(actual).toEqual(expected);
  });

  it('gives the default variation ("en") when there s no locale in the query', () => {
    const query = {
      page: '1',
      pageSize: '10',
      sort: 'Name:ASC',
      plugins: {
        something: 'great',
      },
    };

    const variations = [
      {
        id: 2,
        name: 'French (France) (fr-FR)',
        code: 'fr-FR',
        createdAt: '2021-03-09T15:03:06.992Z',
        updatedAt: '2021-03-09T15:03:06.996Z',
        isDefault: false,
      },
      {
        id: 1,
        name: 'English',
        code: 'en',
        createdAt: '2021-03-09T14:57:03.016Z',
        updatedAt: '2021-03-09T14:57:03.016Z',
        isDefault: true,
      },
    ];

    const expected = {
      id: 1,
      name: 'English',
      code: 'en',
      createdAt: '2021-03-09T14:57:03.016Z',
      updatedAt: '2021-03-09T14:57:03.016Z',
      isDefault: true,
    };

    const actual = getInitialVariation(query, variations);

    expect(actual).toEqual(expected);
  });

  it('gives "undefined" when theres no variation. IMPORTANT: such case should not exist since at least one locale is created on the backend when plug-in personalization', () => {
    const query = {
      page: '1',
      pageSize: '10',
      sort: 'Name:ASC',
      plugins: {
        something: 'great',
      },
    };

    const variations = [];

    const expected = undefined;
    const actual = getInitialVariation(query, variations);

    expect(actual).toEqual(expected);
  });
});
