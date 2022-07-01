/* eslint-disable react/prop-types */

import React from 'react';
// import { createStore, combineReducers } from 'redux';
// import { Provider } from 'react-redux';
import { request, useRBAC } from '@strapi/helper-plugin';
// import { fireEvent, render, screen, within, waitFor } from '@testing-library/react';
// import { ThemeProvider } from 'styled-components';
// import { QueryClient, QueryClientProvider } from 'react-query';
// import VariationSettingsPage from '..';
// eslint-disable-next-line import/extensions
import '@fortawesome/fontawesome-free/js/all.min.js';
// TODO: move to @strapi/helper-plugin
// import themes from '../../../../../../../core/admin/admin/src/themes';
// import personalizationReducers, { initialState } from '../../../hooks/reducers';
// import pluginId from '../../../pluginId';

// const TestWrapper = ({ children }) => {
//   const queryClient = new QueryClient();

//   const rootReducer = combineReducers(personalizationReducers);
//   const store = createStore(rootReducer, { [`${pluginId}_variations`]: initialState });

//   return (
//     <Provider store={store}>
//       <QueryClientProvider client={queryClient}>
//         <ThemeProvider theme={themes}>{children}</ThemeProvider>
//       </QueryClientProvider>
//     </Provider>
//   );
// };

const toggleNotificationMock = jest.fn();

// TODO: we should not be forced to mock this module
// but it bugs somehow when run with jest
jest.mock('@strapi/helper-plugin', () => ({
  EmptyState: ({ title, description }) => (
    <div data-testid="empty-list">
      <p>{title}</p>
      <p>{description}</p>
    </div>
  ),
  BaselineAlignment: () => <div />,
  ModalConfirm: ({ onConfirm, isOpen }) =>
    isOpen ? (
      <div role="dialog">
        <button onClick={onConfirm} type="button">
          Confirm
        </button>
      </div>
    ) : null,

  Modal: ({ isOpen, children }) => isOpen && <div role="dialog">{children}</div>,
  ModalHeader: ({ children }) => <div>{children}</div>,
  ModalSection: ({ children }) => <div>{children}</div>,
  ModalFooter: ({ children }) => <div>{children}</div>,
  HeaderModal: ({ children }) => <div>{children}</div>,
  HeaderModalTitle: ({ children }) => <div>{children}</div>,
  ModalForm: ({ children }) => <div>{children}</div>,
  ListButton: () => <div />,
  Tabs: ({ children }) => <div>{children}</div>,
  TabsNav: ({ children }) => <div>{children}</div>,
  Tab: ({ children }) => <div>{children}</div>,
  TabsPanel: ({ children }) => <div>{children}</div>,
  TabPanel: ({ children }) => <div>{children}</div>,
  useRBAC: jest.fn(),
  request: jest.fn(),
  selectStyles: () => ({ control: () => ({}), indicatorsContainer: () => ({}) }),
  useRBACProvider: () => ({ refetchPermissions: jest.fn() }),
  useNotification: () => toggleNotificationMock,
}));

jest.mock('../../../utils', () => ({
  getTrad: x => x,
}));

jest.mock('react-intl', () => ({
  useIntl: () => ({
    formatMessage: ({ id }) => id,
  }),
}));

describe('personalization settings page', () => {
  beforeEach(() => {
    request.mockImplementation(() =>
      Promise.resolve([
        {
          id: 1,
          name: 'French',
          code: 'fr-FR',
          isDefault: false,
        },
        {
          id: 2,
          name: 'English',
          code: 'en-US',
          isDefault: true,
        },
      ])
    );

    useRBAC.mockImplementation(() => ({
      isLoading: false,
      allowedActions: { canRead: true, canUpdate: true, canCreate: true, canDelete: true },
    }));
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('initial state', () => {
    test.todo('shows default EN variation with edit button but no delete button');

    // it('shows default EN variation with edit button but no delete button', async () => {
    //   render(
    //     <TestWrapper>
    //       <VariationSettingsPage />
    //     </TestWrapper>
    //   );

    //   const row = await waitFor(() => screen.getByText('English').closest('tr'));
    //   const rowUtils = within(row);

    //   expect(rowUtils.queryByLabelText('Settings.list.actions.delete')).toBeFalsy();
    //   expect(rowUtils.getByLabelText('Settings.list.actions.edit')).toBeVisible();
    //   expect(rowUtils.getByText('Settings.variations.row.default-locale')).toBeVisible();
    //   expect(rowUtils.getByText('en-US')).toBeVisible();
    // });

    test.todo('shows FR variation with edit button and delete button');
    // it('shows FR variation with edit button and delete button', async () => {
    //   render(
    //     <TestWrapper>
    //       <VariationSettingsPage />
    //     </TestWrapper>
    //   );

    //   const row = await waitFor(() => screen.getByText('French').closest('tr'));
    //   const rowUtils = within(row);

    //   expect(rowUtils.getByLabelText('Settings.list.actions.delete')).toBeVisible();
    //   expect(rowUtils.getByLabelText('Settings.list.actions.edit')).toBeVisible();
    //   expect(rowUtils.getByText('fr-FR')).toBeVisible();
    // });
  });

  describe('delete', () => {
    test.todo('removes the variation when clicking the confirmation button');
    // it('removes the variation when clicking the confirmation button', async () => {
    //   request.mockImplementation((_, opts) =>
    //     opts.method === 'DELETE'
    //       ? Promise.resolve({ id: 1 })
    //       : Promise.resolve([
    //           {
    //             id: 1,
    //             name: 'French',
    //             code: 'fr-FR',
    //             isDefault: false,
    //           },
    //           {
    //             id: 2,
    //             name: 'English',
    //             code: 'en-US',
    //             isDefault: true,
    //           },
    //         ])
    //   );

    //   render(
    //     <TestWrapper>
    //       <VariationSettingsPage />
    //     </TestWrapper>
    //   );

    //   const row = await waitFor(() => screen.getByText('French').closest('tr'));
    //   const rowUtils = within(row);

    //   fireEvent.click(rowUtils.getByLabelText('Settings.list.actions.delete'));
    //   fireEvent.click(screen.getByText('Confirm'));

    //   await waitFor(() =>
    //     expect(toggleNotificationMock).toBeCalledWith({
    //       type: 'success',
    //       message: { id: 'Settings.variations.modal.delete.success' },
    //     })
    //   );
    // });

    test.todo('shows an error when something went wrong when deleting');
    //   it('shows an error when something went wrong when deleting', async () => {
    //     request.mockImplementation((_, opts) =>
    //       opts.method === 'DELETE'
    //         ? Promise.reject(new Error('An error'))
    //         : Promise.resolve([
    //             {
    //               id: 1,
    //               name: 'French',
    //               code: 'fr-FR',
    //               isDefault: false,
    //             },
    //             {
    //               id: 2,
    //               name: 'English',
    //               code: 'en-US',
    //               isDefault: true,
    //             },
    //           ])
    //     );

    //     render(
    //       <TestWrapper>
    //         <VariationSettingsPage />
    //       </TestWrapper>
    //     );

    //     const row = await waitFor(() => screen.getByText('French').closest('tr'));
    //     const rowUtils = within(row);

    //     fireEvent.click(rowUtils.getByLabelText('Settings.list.actions.delete'));
    //     fireEvent.click(screen.getByText('Confirm'));

    //     await waitFor(() =>
    //       expect(toggleNotificationMock).toBeCalledWith({
    //         type: 'warning',
    //         message: { id: 'notification.error' },
    //       })
    //     );
    //   });
  });

  describe('edit', () => {
    test.todo('shows the default edit modal layout with disabled value');
    // it('shows the default edit modal layout with disabled value', async () => {
    //   render(
    //     <TestWrapper>
    //       <VariationSettingsPage />
    //     </TestWrapper>
    //   );

    //   const row = await waitFor(() => screen.getByText('English').closest('tr'));
    //   const rowUtils = within(row);

    //   fireEvent.click(rowUtils.getByLabelText('Settings.list.actions.edit'));

    //   expect(screen.getByText(`Settings.variations.modal.edit.confirmation`)).toBeVisible();
    //   expect(screen.getByLabelText(`Settings.variations.modal.edit.variations.label`)).toBeDisabled();
    // });

    test.todo(
      'shows a warning and disabled the confirmation button when display name length is over 50'
    );
    // it('shows a warning and disabled the confirmation button when display name length is over 50', async () => {
    //   render(
    //     <TestWrapper>
    //       <VariationSettingsPage />
    //     </TestWrapper>
    //   );

    //   const row = await waitFor(() => screen.getByText('English').closest('tr'));
    //   const rowUtils = within(row);

    //   fireEvent.click(rowUtils.getByLabelText('Settings.list.actions.edit'));
    //   fireEvent.change(screen.getByLabelText('Settings.variations.modal.variations.displayName'), {
    //     target: {
    //       value:
    //         'a very very very very long string that has more than fifty characters in order to show a warning',
    //     },
    //   });
    //   fireEvent.blur(screen.getByLabelText('Settings.variations.modal.variations.displayName'));

    //   await waitFor(() =>
    //     expect(screen.getByText('Settings.variations.modal.edit.confirmation')).toBeDisabled()
    //   );
    //   expect(screen.getByText(`Settings.variations.modal.variations.displayName.error`)).toBeVisible();
    // });

    // it('closes the edit modal when clicking on cancel', async () => {
    //   render(
    //     <TestWrapper>
    //       <VariationSettingsPage />
    //     </TestWrapper>
    //   );

    //   const row = await waitFor(() => screen.getByText('English').closest('tr'));
    //   const rowUtils = within(row);

    //   fireEvent.click(rowUtils.getByLabelText('Settings.list.actions.edit'));
    //   fireEvent.click(screen.getByText('app.components.Button.cancel'));

    //   expect(screen.queryByText(`Settings.list.actions.edit`)).toBeFalsy();
    // });

    test.todo('shows an error when something went wrong when editing');
    // it('shows an error when something went wrong when editing', async () => {
    //   const requestGetResponse = [
    //     {
    //       id: 1,
    //       name: 'French',
    //       code: 'fr-FR',
    //       isDefault: false,
    //     },
    //     {
    //       id: 2,
    //       name: 'English',
    //       code: 'en-US',
    //       isDefault: true,
    //     },
    //   ];

    //   request.mockImplementation((_, opts) =>
    //     opts.method === 'PUT'
    //       ? Promise.reject(new Error('Something wrong occured'))
    //       : Promise.resolve(requestGetResponse)
    //   );

    //   render(
    //     <TestWrapper>
    //       <VariationSettingsPage />
    //     </TestWrapper>
    //   );

    //   const row = await waitFor(() => screen.getByText('English').closest('tr'));
    //   const rowUtils = within(row);

    //   fireEvent.click(rowUtils.getByLabelText('Settings.list.actions.edit'));
    //   fireEvent.click(screen.getByText('Settings.variations.modal.edit.confirmation'));

    //   await waitFor(() =>
    //     expect(toggleNotificationMock).toBeCalledWith({
    //       type: 'warning',
    //       message: { id: 'notification.error' },
    //     })
    //   );
  });

  test.todo('shows a success message when editing succeeds');
  // it('shows a success message when editing succeeds', async () => {
  //   const requestGetResponse = [
  //     {
  //       id: 1,
  //       name: 'French',
  //       code: 'fr-FR',
  //       isDefault: false,
  //     },
  //     {
  //       id: 2,
  //       name: 'English',
  //       code: 'en-US',
  //       isDefault: true,
  //     },
  //   ];

  //   request.mockImplementation((_, opts) =>
  //     opts.method === 'PUT'
  //       ? Promise.resolve({
  //           id: 2,
  //           name: 'Frenchie',
  //           code: 'fr-FR',
  //           isDefault: false,
  //         })
  //       : Promise.resolve(requestGetResponse)
  //   );

  //   render(
  //     <TestWrapper>
  //       <VariationSettingsPage />
  //     </TestWrapper>
  //   );

  //   const row = await waitFor(() => screen.getByText('English').closest('tr'));
  //   const rowUtils = within(row);

  //   fireEvent.click(rowUtils.getByLabelText('Settings.list.actions.edit'));
  //   fireEvent.click(screen.getByText('Settings.variations.modal.edit.confirmation'));

  //   await waitFor(() =>
  //     expect(toggleNotificationMock).toBeCalledWith({
  //       type: 'success',
  //       message: { id: 'Settings.variations.modal.edit.success' },
  //     })
  //   );

  //   expect(request).toBeCalledWith('/personalization/variations/2', {
  //     method: 'PUT',
  //     body: { name: 'English', isDefault: true },
  //   });
  // });

  test.todo('shows edits the variation with code as displayName when displayName is empty');
  //   it('shows edits the variation with code as displayName when displayName is empty', async () => {
  //     const requestGetResponse = [
  //       {
  //         id: 1,
  //         name: 'French',
  //         code: 'fr-FR',
  //         isDefault: false,
  //       },
  //       {
  //         id: 2,
  //         name: 'English',
  //         code: 'en-US',
  //         isDefault: true,
  //       },
  //     ];

  //     request.mockImplementation((_, opts) =>
  //       opts.method === 'PUT'
  //         ? Promise.resolve({
  //             id: 2,
  //             name: 'Frenchie',
  //             code: 'fr-FR',
  //             isDefault: false,
  //           })
  //         : Promise.resolve(requestGetResponse)
  //     );

  //     render(
  //       <TestWrapper>
  //         <VariationSettingsPage />
  //       </TestWrapper>
  //     );

  //     const row = await waitFor(() => screen.getByText('English').closest('tr'));
  //     const rowUtils = within(row);

  //     fireEvent.click(rowUtils.getByLabelText('Settings.list.actions.edit'));

  //     fireEvent.change(screen.getByLabelText('Settings.variations.modal.variations.displayName'), {
  //       target: {
  //         value: '',
  //       },
  //     });

  //     fireEvent.click(screen.getByText('Settings.variations.modal.edit.confirmation'));

  //     await waitFor(() =>
  //       expect(toggleNotificationMock).toBeCalledWith({
  //         type: 'success',
  //         message: { id: 'Settings.variations.modal.edit.success' },
  //       })
  //     );

  //     expect(request).toBeCalledWith('/personalization/variations/2', {
  //       method: 'PUT',
  //       body: { name: 'en-US', isDefault: true },
  //     });
  //   });
  // });

  describe('retrieve', () => {
    test.todo('shows an error when something went wrong when fetching');
    // it('shows an error when something went wrong when fetching', async () => {
    //   request.mockImplementation(() =>
    //     Promise.reject(new Error('Something went wrong on the server'))
    //   );

    //   render(
    //     <TestWrapper>
    //       <VariationSettingsPage />
    //     </TestWrapper>
    //   );

    //   await waitFor(() =>
    //     expect(toggleNotificationMock).toBeCalledWith({
    //       type: 'warning',
    //       message: { id: 'notification.error' },
    //     })
    //   );
    // });

    test.todo('shows an empty state when the array of variation is empty');
    // it('shows an empty state when the array of variation is empty', async () => {
    //   request.mockImplementation(() => Promise.resolve([]));

    //   render(
    //     <TestWrapper>
    //       <VariationSettingsPage />
    //     </TestWrapper>
    //   );

    //   await waitFor(() => expect(screen.getByTestId('empty-list')).toBeVisible());
    // });
  });

  describe('permissions', () => {
    test.todo('shows a loading information when resolving the permissions');
    // it('shows a loading information when resolving the permissions', () => {
    //   useRBAC.mockImplementation(() => ({
    //     isLoading: true,
    //     allowedActions: { canRead: false, canUpdate: true, canCreate: true, canDelete: true },
    //   }));

    //   render(
    //     <TestWrapper>
    //       <VariationSettingsPage />
    //     </TestWrapper>
    //   );

    //   expect(screen.getByText(`Settings.permissions.loading`));
    // });
    test.todo("shows nothing when the user doesn't have read permission");

    // it("shows nothing when the user doesn't have read permission", () => {
    //   const canRead = false;

    //   useRBAC.mockImplementation(() => ({
    //     isLoading: false,
    //     allowedActions: { canRead, canUpdate: true, canCreate: true, canDelete: true },
    //   }));

    //   const { container } = render(
    //     <TestWrapper>
    //       <VariationSettingsPage />
    //     </TestWrapper>
    //   );

    //   expect(container).toMatchSnapshot();
    // });

    test.todo('hides "Add variation" buttons when the user is not allowed to create a locale');

    // it('hides "Add variation" buttons when the user is not allowed to create a locale', async () => {
    //   const canCreate = false;

    //   request.mockImplementation(() => Promise.resolve([]));
    //   useRBAC.mockImplementation(() => ({
    //     isLoading: false,
    //     allowedActions: { canRead: true, canUpdate: true, canCreate, canDelete: true },
    //   }));

    //   render(
    //     <TestWrapper>
    //       <VariationSettingsPage />
    //     </TestWrapper>
    //   );

    //   await waitFor(() =>
    //     expect(screen.queryAllByText(`Settings.list.actions.add`).length).toBe(0)
    //   );
    // });

    test.todo(
      'hides the "Edit variation" button (pencil) when the user is not allowed to update a locale'
    );
    // it('hides the "Edit variation" button (pencil) when the user is not allowed to update a locale', async () => {
    //   const canUpdate = false;

    //   useRBAC.mockImplementation(() => ({
    //     isLoading: false,
    //     allowedActions: { canRead: true, canUpdate, canCreate: true, canDelete: true },
    //   }));

    //   render(
    //     <TestWrapper>
    //       <VariationSettingsPage />
    //     </TestWrapper>
    //   );

    //   await waitFor(() => expect(screen.getByText('English')).toBeVisible());
    //   expect(screen.queryAllByLabelText(`Settings.list.actions.edit`).length).toBe(0);
    // });
    test.todo(
      'hides the "Delete variation" button (garbage) when the user is not allowed to delete a locale'
    );
    // it('hides the "Delete variation" button (garbage) when the user is not allowed to delete a locale', async () => {
    //   const canDelete = false;

    //   useRBAC.mockImplementation(() => ({
    //     isLoading: false,
    //     allowedActions: { canRead: true, canUpdate: false, canCreate: true, canDelete },
    //   }));

    //   render(
    //     <TestWrapper>
    //       <VariationSettingsPage />
    //     </TestWrapper>
    //   );

    //   await waitFor(() => expect(screen.getByText('English')).toBeVisible());
    //   expect(screen.queryAllByLabelText(`Settings.list.actions.delete`).length).toBe(0);
    // });
  });

  describe('create', () => {
    beforeEach(() => {
      request.mockImplementation(url =>
        url.includes('/personalization/variations')
          ? Promise.resolve([])
          : Promise.resolve([
              { code: 'fr-FR', name: 'Francais' },
              { code: 'en-EN', name: 'English' },
            ])
      );
    });
    test.todo('shows the default create modal layout');
    // it('shows the default create modal layout', async () => {
    //   render(
    //     <TestWrapper>
    //       <VariationSettingsPage />
    //     </TestWrapper>
    //   );

    //   fireEvent.click(screen.getByText('Settings.list.actions.add'));

    //   expect(
    //     screen.getByText(`Settings.variations.modal.create.defaultVariations.loading`)
    //   ).toBeVisible();

    //   await waitFor(() =>
    //     expect(screen.getByText(`Settings.variations.modal.create.confirmation`)).toBeVisible()
    //   );

    //   expect(screen.getByText(`fr-FR`)).toBeVisible();
    //   expect(screen.getByLabelText('Settings.variations.modal.variations.displayName')).toHaveValue(
    //     'Francais'
    //   );
    // });
    test.todo('closes the create modal when clicking on cancel');
    // it('closes the create modal when clicking on cancel', async () => {
    //   render(
    //     <TestWrapper>
    //       <VariationSettingsPage />
    //     </TestWrapper>
    //   );

    //   fireEvent.click(screen.getByText('Settings.list.actions.add'));

    //   await waitFor(() =>
    //     expect(screen.getByText(`Settings.variations.modal.create.confirmation`)).toBeVisible()
    //   );

    //   fireEvent.click(screen.getByText('app.components.Button.cancel'));

    //   expect(screen.queryByText(`Settings.variations.modal.create.confirmation`)).toBeFalsy();
    // });
    test.todo(
      'shows a warning and disabled the confirmation button when display name length is over 50'
    );
    // it('shows a warning and disabled the confirmation button when display name length is over 50', async () => {
    //   render(
    //     <TestWrapper>
    //       <VariationSettingsPage />
    //     </TestWrapper>
    //   );

    //   fireEvent.click(screen.getByText('Settings.list.actions.add'));

    //   await waitFor(() =>
    //     expect(screen.getByText(`Settings.variations.modal.create.confirmation`)).toBeVisible()
    //   );

    //   fireEvent.change(screen.getByLabelText('Settings.variations.modal.variations.displayName'), {
    //     target: {
    //       value:
    //         'a very very very very long string that has more than fifty characters in order to show a warning',
    //     },
    //   });

    //   fireEvent.blur(screen.getByLabelText('Settings.variations.modal.variations.displayName'));

    //   await waitFor(() =>
    //     expect(screen.getByText(`Settings.variations.modal.variations.displayName.error`)).toBeVisible()
    //   );
    // });
    test.todo('sync the select and the text input');
    // it('sync the select and the text input', async () => {
    //   render(
    //     <TestWrapper>
    //       <VariationSettingsPage />
    //     </TestWrapper>
    //   );

    //   fireEvent.click(screen.getByText('Settings.list.actions.add'));

    //   await waitFor(() =>
    //     expect(screen.getByText(`Settings.variations.modal.create.confirmation`)).toBeVisible()
    //   );

    //   // Put some data in the input in order to make sure it resets well when changing variation
    //   fireEvent.change(screen.getByLabelText('Settings.variations.modal.variations.displayName'), {
    //     target: {
    //       value:
    //         'a very very very very long string that has more than fifty characters in order to show a warning',
    //     },
    //   });

    //   const DOWN_ARROW = { keyCode: 40 };
    //   fireEvent.keyDown(screen.getByLabelText('Settings.variations.modal.variations.label'), DOWN_ARROW);

    //   fireEvent.click(screen.getByText('en-EN'));

    //   expect(screen.getByLabelText('Settings.variations.modal.variations.displayName')).toHaveValue(
    //     'English'
    //   );
    // });

    test.todo('shows an error when something went wrong when adding a variation');
    // it('shows an error when something went wrong when adding a variation', async () => {
    //   request.mockImplementation((url, opts) => {
    //     if (opts.method === 'POST') {
    //       return Promise.reject(new Error('Something went wrong when adding a variation'));
    //     }
    //     if (url.includes('/personalization/variations')) return Promise.resolve([]);

    //     return Promise.resolve([
    //       { code: 'fr-FR', name: 'Francais' },
    //       { code: 'en-EN', name: 'English' },
    //     ]);
    //   });

    //   render(
    //     <TestWrapper>
    //       <VariationSettingsPage />
    //     </TestWrapper>
    //   );

    //   fireEvent.click(screen.getByText('Settings.list.actions.add'));

    //   const confirmationButton = await waitFor(() =>
    //     screen.getByText(`Settings.variations.modal.create.confirmation`)
    //   );

    //   fireEvent.click(confirmationButton);

    //   await waitFor(() =>
    //     expect(toggleNotificationMock).toBeCalledWith({
    //       type: 'warning',
    //       message: { id: 'notification.error' },
    //     })
    //   );
    // });
    test.todo('shows an success toast when adding a variation is successful');
    // it('shows an success toast when adding a variation is successful', async () => {
    //   request.mockImplementation((url, opts) => {
    //     if (opts.method === 'POST') {
    //       return Promise.resolve({ id: 3, code: 'en-CA', name: 'Canadien' });
    //     }
    //     if (url.includes('/personalization/variations')) return Promise.resolve([]);

    //     return Promise.resolve([
    //       { code: 'fr-FR', name: 'Francais' },
    //       { code: 'en-EN', name: 'English' },
    //     ]);
    //   });

    //   render(
    //     <TestWrapper>
    //       <VariationSettingsPage />
    //     </TestWrapper>
    //   );

    //   fireEvent.click(screen.getByText('Settings.list.actions.add'));

    //   const confirmationButton = await waitFor(() =>
    //     screen.getByText(`Settings.variations.modal.create.confirmation`)
    //   );

    //   fireEvent.click(confirmationButton);

    //   await waitFor(() =>
    //     expect(toggleNotificationMock).toBeCalledWith({
    //       type: 'success',
    //       message: { id: 'Settings.variations.modal.create.success' },
    //     })
    //   );
    // });
  });
});
