import get from 'lodash/get';
import * as yup from 'yup';
import { prefixPluginTranslations } from '@strapi/helper-plugin';
import pluginPkg from '../../package.json';
import CheckboxConfirmation from './components/CheckboxConfirmation';
import CMEditViewInjectedComponents from './components/CMEditViewInjectedComponents';
import Initializer from './components/Initializer';
import VariationPicker from './components/VariationPicker';
import middlewares from './middlewares';
import pluginPermissions from './permissions';
import pluginId from './pluginId';
import { getTrad } from './utils';
import mutateCTBContentTypeSchema from './utils/mutateCTBContentTypeSchema';
import PERSONALIZED_FIELDS from './utils/personalizedFields';
import personalizationReducers from './hooks/reducers';
import DeleteModalAdditionalInfos from './components/CMListViewInjectedComponents/DeleteModalAdditionalInfos';
import addVariationToCollectionTypesLinksHook from './contentManagerHooks/addVariationToCollectionTypesLinks';
import addVariationToSingleTypesLinksHook from './contentManagerHooks/addVariationToSingleTypesLinks';
import addColumnToTableHook from './contentManagerHooks/addColumnToTable';
import mutateEditViewLayoutHook from './contentManagerHooks/mutateEditViewLayout';

const name = pluginPkg.strapi.name;

export default {
  register(app) {
    app.addMiddlewares(middlewares);

    app.addReducers(personalizationReducers);

    app.registerPlugin({
      id: pluginId,
      initializer: Initializer,
      isReady: false,
      name,
    });
  },
  bootstrap(app) {
    // Hooks that mutate the collection types links in order to add the variation filter
    app.registerHook(
      'Admin/CM/pages/App/mutate-collection-types-links',
      addVariationToCollectionTypesLinksHook
    );
    app.registerHook(
      'Admin/CM/pages/App/mutate-single-types-links',
      addVariationToSingleTypesLinksHook
    );
    // Hook that adds a column into the CM's LV table
    app.registerHook('Admin/CM/pages/ListView/inject-column-in-table', addColumnToTableHook);
    // Hooks that mutates the edit view layout
    app.registerHook('Admin/CM/pages/EditView/mutate-edit-view-layout', mutateEditViewLayoutHook);
    // Add the settings link
    app.addSettingsLink('global', {
      intlLabel: {
        id: getTrad('plugin.name'),
        defaultMessage: 'Personalization',
      },
      id: 'personalization',
      to: '/settings/personalization',

      Component: async () => {
        const component = await import(
          /* webpackChunkName: "personalization-settings-page" */ './pages/SettingsPage'
        );

        return component;
      },
      permissions: pluginPermissions.accessMain,
    });

    app.injectContentManagerComponent('editView', 'informations', {
      name: 'personalization-variation-filter-edit-view',
      Component: CMEditViewInjectedComponents,
    });

    app.injectContentManagerComponent('listView', 'actions', {
      name: 'personalization-variation-filter',
      Component: VariationPicker,
    });

    app.injectContentManagerComponent('listView', 'deleteModalAdditionalInfos', {
      name: 'personalization-delete-bullets-in-modal',
      Component: DeleteModalAdditionalInfos,
    });

    const ctbPlugin = app.getPlugin('content-type-builder');

    if (ctbPlugin) {
      const ctbFormsAPI = ctbPlugin.apis.forms;
      ctbFormsAPI.addContentTypeSchemaMutation(mutateCTBContentTypeSchema);
      ctbFormsAPI.components.add({ id: 'checkboxConfirmation', component: CheckboxConfirmation });

      ctbFormsAPI.extendContentType({
        validator: () => ({
          personalization: yup.object().shape({
            personalized: yup.bool(),
          }),
        }),
        form: {
          advanced() {
            return [
              {
                name: 'pluginOptions.personalization.personalized',
                description: {
                  id: getTrad('plugin.schema.personalization.personalized.description-content-type'),
                  defaultMessage: 'Allow you to have content in different variations',
                },
                type: 'checkboxConfirmation',
                intlLabel: {
                  id: getTrad('plugin.schema.personalization.personalized.label-content-type'),
                  defaultMessage: 'Enable personalization for this Content-Type',
                },
              },
            ];
          },
        },
      });

      ctbFormsAPI.extendFields(PERSONALIZED_FIELDS, {
        validator: args => ({
          personalization: yup.object().shape({
            personalized: yup.bool().test({
              name: 'ensure-unique-personalization',
              message: getTrad('plugin.schema.personalization.ensure-unique-personalization'),
              test(value) {
                if (value === undefined || value) {
                  return true;
                }

                const unique = get(args, ['3', 'modifiedData', 'unique'], null);

                // Unique fields must be personalized
                if (unique && !value) {
                  return false;
                }

                return true;
              },
            }),
          }),
        }),
        form: {
          advanced({ contentTypeSchema, forTarget, type, step }) {
            if (forTarget !== 'contentType') {
              return [];
            }

            const hasPersonalizationEnabled = get(
              contentTypeSchema,
              ['schema', 'pluginOptions', 'personalization', 'personalized'],
              false
            );

            if (!hasPersonalizationEnabled) {
              return [];
            }

            if (type === 'component' && step === '1') {
              return [];
            }

            return [
              {
                name: 'pluginOptions.personalization.personalized',
                description: {
                  id: getTrad('plugin.schema.personalization.personalized.description-field'),
                  defaultMessage: 'The field can have different values in each variation',
                },
                type: 'checkbox',
                intlLabel: {
                  id: getTrad('plugin.schema.personalization.personalized.label-field'),
                  defaultMessage: 'Enable personalization for this field',
                },
              },
            ];
          },
        },
      });
    }
  },
  async registerTrads({ locales }) {
    const importedTrads = await Promise.all(
      locales.map(locale => {
        return import(
          /* webpackChunkName: "personalization-translation-[request]" */ `./translations/${locale}.json`
        )
          .then(({ default: data }) => {
            return {
              data: prefixPluginTranslations(data, pluginId),
              locale,
            };
          })
          .catch(() => {
            return {
              data: {},
              locale,
            };
          });
      })
    );

    return Promise.resolve(importedTrads);
  },
};
