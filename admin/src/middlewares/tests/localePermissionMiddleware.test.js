import variationPermissionMiddleware from '../localePermissionMiddleware';

describe('variationPermissionMiddleware', () => {
  it('does not modify the action when the type is not "ContentManager/RBACManager/SET_PERMISSIONS"', () => {
    const nextFn = jest.fn(x => x);
    const action = {
      type: 'UNKNOWN_TYPE',
    };

    const nextAction = variationPermissionMiddleware()()(nextFn)(action);

    expect(nextAction).toBe(action);
  });

  it('does not modify the action when it the __meta__ key is not set', () => {
    const nextFn = jest.fn(x => x);
    const action = {
      type: 'ContentManager/RBACManager/SET_PERMISSIONS',
      __meta__: undefined,
    };

    const nextAction = variationPermissionMiddleware()()(nextFn)(action);

    expect(nextAction).toBe(action);
  });

  it('does not modify the action when it the __meta__.containerName is not "listView"', () => {
    const nextFn = jest.fn(x => x);
    const action = {
      type: 'ContentManager/RBACManager/SET_PERMISSIONS',
      __meta__: { containerName: undefined },
    };

    const nextAction = variationPermissionMiddleware()()(nextFn)(action);

    expect(nextAction).toBe(action);
  });

  it('does not modify the action when it the __meta__.plugins is not set', () => {
    const nextFn = jest.fn(x => x);
    const action = {
      type: 'ContentManager/RBACManager/SET_PERMISSIONS',
      __meta__: { containerName: 'listView' },
    };

    const nextAction = variationPermissionMiddleware()()(nextFn)(action);

    expect(nextAction).toBe(action);
  });

  it('does not modify the action when it the __meta__.plugins.personalization.variation is not set', () => {
    const nextFn = jest.fn(x => x);
    const action = {
      type: 'ContentManager/RBACManager/SET_PERMISSIONS',
      __meta__: {
        containerName: 'listView',
        plugins: {},
      },
    };

    const nextAction = variationPermissionMiddleware()()(nextFn)(action);

    expect(nextAction).toBe(action);
  });

  it('creates an empty permissions object from an empty array', () => {
    const nextFn = jest.fn(x => x);
    const action = {
      type: 'ContentManager/RBACManager/SET_PERMISSIONS',
      __meta__: {
        containerName: 'listView',
        plugins: {
          personalization: {
            variation: 'en',
          },
        },
      },
      permissions: {},
    };

    const nextAction = variationPermissionMiddleware()()(nextFn)(action);

    expect(nextAction).toEqual({
      type: 'ContentManager/RBACManager/SET_PERMISSIONS',
      __meta__: { containerName: 'listView', plugins: { personalization: { variation: 'en' } } },
      permissions: {},
    });
  });

  it('creates a valid permissions object from a filled array', () => {
    const nextFn = jest.fn(x => x);
    const action = {
      type: 'ContentManager/RBACManager/SET_PERMISSIONS',
      __meta__: {
        containerName: 'listView',
        plugins: {
          personalization: {
            variation: 'en',
          },
        },
      },
      permissions: {
        'plugin::content-manager.explorer.create': [
          {
            id: 459,
            action: 'plugin::content-manager.explorer.create',
            subject: 'api::article.article',
            properties: {
              fields: ['Name'],
              variations: ['en'],
            },
            conditions: [],
          },
          {
            id: 459,
            action: 'plugin::content-manager.explorer.create',
            subject: 'api::article.article',
            properties: {
              fields: ['test'],
              variations: ['it'],
            },
            conditions: [],
          },
        ],
      },
    };

    const nextAction = variationPermissionMiddleware()()(nextFn)(action);

    expect(nextAction).toEqual({
      type: 'ContentManager/RBACManager/SET_PERMISSIONS',
      __meta__: { containerName: 'listView', plugins: { personalization: { variation: 'en' } } },
      permissions: {
        'plugin::content-manager.explorer.create': [
          {
            id: 459,
            action: 'plugin::content-manager.explorer.create',
            subject: 'api::article.article',
            properties: {
              fields: ['Name'],
              variations: ['en'],
            },

            conditions: [],
          },
        ],
      },
    });
  });
});
