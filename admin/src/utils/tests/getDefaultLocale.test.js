import getDefaultVariation from '../getDefaultVariation';

describe('getDefaultVariation', () => {
  it('gives fr-FR when it s the default variation and that it has read access to it', () => {
    const variations = [
      {
        id: 1,
        name: 'English',
        code: 'en',
        createdAt: '2021-03-09T14:57:03.016Z',
        updatedAt: '2021-03-09T14:57:03.016Z',
        isDefault: false,
      },
      {
        id: 2,
        name: 'French (France) (fr-FR)',
        code: 'fr-FR',
        createdAt: '2021-03-09T15:03:06.992Z',
        updatedAt: '2021-03-17T13:01:03.569Z',
        isDefault: true,
      },
    ];

    const ctPermissions = {
      'plugin::content-manager.explorer.create': [
        {
          id: 1325,
          action: 'plugin::content-manager.explorer.create',
          subject: 'api::address.address',
          properties: {
            fields: [
              'postal_coder',
              'categories',
              'cover',
              'images',
              'city',
              'likes',
              'json',
              'slug',
            ],
            variations: [],
          },
          conditions: [],
        },
      ],
      'plugin::content-manager.explorer.read': [
        {
          id: 1326,
          action: 'plugin::content-manager.explorer.read',
          subject: 'api::address.address',
          properties: {
            fields: [],
            variations: ['en', 'fr-FR'],
          },
          conditions: [],
        },
      ],
    };

    const expected = 'fr-FR';
    const actual = getDefaultVariation(ctPermissions, variations);

    expect(actual).toEqual(expected);
  });

  it('gives fr-FR when it s the default variation and that it has create access to it', () => {
    const variations = [
      {
        id: 1,
        name: 'English',
        code: 'en',
        createdAt: '2021-03-09T14:57:03.016Z',
        updatedAt: '2021-03-09T14:57:03.016Z',
        isDefault: false,
      },
      {
        id: 2,
        name: 'French (France) (fr-FR)',
        code: 'fr-FR',
        createdAt: '2021-03-09T15:03:06.992Z',
        updatedAt: '2021-03-17T13:01:03.569Z',
        isDefault: true,
      },
    ];

    const ctPermissions = {
      'plugin::content-manager.explorer.create': [
        {
          id: 1325,
          action: 'plugin::content-manager.explorer.create',
          subject: 'api::address.address',
          properties: {
            fields: [
              'postal_coder',
              'categories',
              'cover',
              'images',
              'city',
              'likes',
              'json',
              'slug',
            ],
            variations: ['fr-FR'],
          },
          conditions: [],
        },
      ],
      'plugin::content-manager.explorer.read': [
        {
          id: 1326,
          action: 'plugin::content-manager.explorer.read',
          subject: 'api::address.address',
          properties: {
            fields: [],
            variations: ['en'],
          },
          conditions: [],
        },
      ],
    };

    const expected = 'fr-FR';
    const actual = getDefaultVariation(ctPermissions, variations);

    expect(actual).toEqual(expected);
  });

  it('gives gives the first variation with read permission ("en") when the locale is allowed', () => {
    const variations = [
      {
        id: 1,
        name: 'English',
        code: 'en',
        createdAt: '2021-03-09T14:57:03.016Z',
        updatedAt: '2021-03-09T14:57:03.016Z',
        isDefault: false,
      },
      {
        id: 2,
        name: 'French (France) (fr-FR)',
        code: 'fr-FR',
        createdAt: '2021-03-09T15:03:06.992Z',
        updatedAt: '2021-03-17T13:01:03.569Z',
        isDefault: true,
      },
      {
        id: 3,
        name: 'Another lang',
        code: 'de',
        createdAt: '2021-03-09T15:03:06.992Z',
        updatedAt: '2021-03-17T13:01:03.569Z',
        isDefault: false,
      },
    ];

    const ctPermissions = {
      'plugin::content-manager.explorer.create': [
        {
          id: 1325,
          action: 'plugin::content-manager.explorer.create',
          subject: 'api::address.address',
          properties: {
            fields: [
              'postal_coder',
              'categories',
              'cover',
              'images',
              'city',
              'likes',
              'json',
              'slug',
            ],
            variations: [],
          },
          conditions: [],
        },
      ],
      'plugin::content-manager.explorer.read': [
        {
          id: 1326,
          action: 'plugin::content-manager.explorer.read',
          subject: 'api::address.address',
          properties: {
            fields: [],
            variations: ['en', 'de'],
          },
          conditions: [],
        },
      ],
    };

    const expected = 'en';
    const actual = getDefaultVariation(ctPermissions, variations);

    expect(actual).toEqual(expected);
  });

  it('gives gives the first variation with create permission ("en") when the locale is allowed', () => {
    const variations = [
      {
        id: 1,
        name: 'English',
        code: 'en',
        createdAt: '2021-03-09T14:57:03.016Z',
        updatedAt: '2021-03-09T14:57:03.016Z',
        isDefault: false,
      },
      {
        id: 2,
        name: 'French (France) (fr-FR)',
        code: 'fr-FR',
        createdAt: '2021-03-09T15:03:06.992Z',
        updatedAt: '2021-03-17T13:01:03.569Z',
        isDefault: true,
      },
      {
        id: 3,
        name: 'Another lang',
        code: 'de',
        createdAt: '2021-03-09T15:03:06.992Z',
        updatedAt: '2021-03-17T13:01:03.569Z',
        isDefault: false,
      },
    ];

    const ctPermissions = {
      'plugin::content-manager.explorer.create': [
        {
          id: 1325,
          action: 'plugin::content-manager.explorer.create',
          subject: 'api::address.address',
          properties: {
            fields: [
              'postal_coder',
              'categories',
              'cover',
              'images',
              'city',
              'likes',
              'json',
              'slug',
            ],
            variations: ['en', 'de'],
          },
          conditions: [],
        },
      ],
      'plugin::content-manager.explorer.read': [
        {
          id: 1326,
          action: 'plugin::content-manager.explorer.read',
          subject: 'api::address.address',
          properties: {
            fields: [],
            variations: [],
          },
          conditions: [],
        },
      ],
    };

    const expected = 'en';
    const actual = getDefaultVariation(ctPermissions, variations);

    expect(actual).toEqual(expected);
  });

  it('gives null when the user has no permission on any variation', () => {
    const variations = [
      {
        id: 1,
        name: 'English',
        code: 'en',
        createdAt: '2021-03-09T14:57:03.016Z',
        updatedAt: '2021-03-09T14:57:03.016Z',
        isDefault: false,
      },
      {
        id: 2,
        name: 'French (France) (fr-FR)',
        code: 'fr-FR',
        createdAt: '2021-03-09T15:03:06.992Z',
        updatedAt: '2021-03-17T13:01:03.569Z',
        isDefault: true,
      },
      {
        id: 3,
        name: 'Another lang',
        code: 'de',
        createdAt: '2021-03-09T15:03:06.992Z',
        updatedAt: '2021-03-17T13:01:03.569Z',
        isDefault: false,
      },
    ];

    const ctPermissions = {
      'plugin::content-manager.explorer.create': [
        {
          id: 1325,
          action: 'plugin::content-manager.explorer.create',
          subject: 'api::address.address',
          properties: {
            fields: [
              'postal_coder',
              'categories',
              'cover',
              'images',
              'city',
              'likes',
              'json',
              'slug',
            ],
            variations: [],
          },
          conditions: [],
        },
      ],
      'plugin::content-manager.explorer.read': [
        {
          id: 1326,
          action: 'plugin::content-manager.explorer.read',
          subject: 'api::address.address',
          properties: {
            fields: [],
            variations: [],
          },
          conditions: [],
        },
      ],
    };

    const expected = null;
    const actual = getDefaultVariation(ctPermissions, variations);

    expect(actual).toEqual(expected);
  });
});
