import { fixtures } from '../../../../../../admin-test-utils';
import addCommonFieldsToInitialDataMiddleware from '../addCommonFieldsToInitialDataMiddleware';

jest.mock('@strapi/helper-plugin', () => ({
  request: () => ({
    nonPersonalizedFields: { common: 'test' },
    personalizations: ['test'],
  }),
  formatContentTypeData: data => data,
  contentManagementUtilRemoveFieldsFromData: data => data,
}));

describe('personalization | middlewares | addCommonFieldsToInitialDataMiddleware', () => {
  let getState;
  const dispatch = jest.fn();

  beforeEach(() => {
    const store = {
      ...fixtures.store.state,
      'content-manager_editViewCrudReducer': {
        contentTypeDataStructure: { name: 'test', common: 'common default value' },
      },
      'content-manager_editViewLayoutManager': {
        currentLayout: {
          components: {},
          contentType: {
            uid: 'article',
            attributes: {
              name: { type: 'string' },
              common: { type: 'string' },
            },
          },
        },
      },
    };

    getState = () => store;
  });

  it('should forward the action when the type is undefined', () => {
    const action = { test: true, type: undefined };

    const next = jest.fn();
    const middleware = addCommonFieldsToInitialDataMiddleware()({ getState, dispatch });

    middleware(next)(action);

    expect(next).toBeCalledWith(action);
  });

  it('should forward the action when the rawQuery is empty', () => {
    const action = { type: 'ContentManager/CrudReducer/INIT_FORM', rawQuery: '' };

    const next = jest.fn();
    const middleware = addCommonFieldsToInitialDataMiddleware()({ getState, dispatch });

    middleware(next)(action);

    expect(next).toBeCalledWith(action);
  });

  it('should forward the action when the relatedEntityId is not defined', () => {
    const action = {
      type: 'ContentManager/CrudReducer/INIT_FORM',
      rawQuery: '?plugins[personalization][variation]=en',
    };

    const next = jest.fn();
    const middleware = addCommonFieldsToInitialDataMiddleware()({ getState, dispatch });

    middleware(next)(action);

    expect(next).toBeCalledWith(action);
  });

  it('should makes a request to retrieve the common field when the relatedEntityId is defined', async () => {
    const action = {
      type: 'ContentManager/CrudReducer/INIT_FORM',
      rawQuery: '?plugins[personalization][relatedEntityId]=1',
    };

    const next = jest.fn(x => x);
    const middleware = addCommonFieldsToInitialDataMiddleware()({ getState, dispatch });

    const nextAction = await middleware(next)(action);

    expect(dispatch).toHaveBeenCalledWith({ type: 'ContentManager/CrudReducer/GET_DATA' });

    expect(nextAction).toEqual({
      type: 'ContentManager/CrudReducer/INIT_FORM',
      rawQuery: '?plugins[personalization][relatedEntityId]=1',
      data: {
        name: 'test',
        personalizations: ['test'],
        common: 'test',
      },
    });
  });
});
