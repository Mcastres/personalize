import React from 'react';
import Personalization from '@strapi/icons/Earth';
import StrikedWorld from '@strapi/icons/EarthStriked';
import LabelAction from '../../components/LabelAction';
import { getTrad } from '../../utils';
import mutateEditViewLayout, {
  enhanceComponentsLayout,
  enhanceEditLayout,
  enhanceRelationLayout,
} from '../mutateEditViewLayout';

const personalizedTrad = getTrad('Field.localized');
const personalizedTradDefaultMessage = 'This value is unique for the selected variation';
const notPersonalizedTrad = getTrad('Field.not-personalized');
const notPersonalizedTradDefaultMessage = 'This value is common to all variations';

describe('personalization | contentManagerHooks | mutateEditViewLayout', () => {
  it('should forward when personalization is not enabled on the content type', () => {
    const layout = {
      components: {},
      contentType: {
        uid: 'test',
        pluginOptions: { personalization: { personalized: false } },
        layouts: {
          edit: ['test'],
        },
      },
    };
    const data = {
      layout,
      query: null,
    };
    const results = mutateEditViewLayout(data);

    expect(results).toEqual(data);
  });

  it('should forward the action when personalization is enabled and the query.variation is not defined', () => {
    const layout = {
      contentType: {
        uid: 'test',
        pluginOptions: { personalization: { personalized: true } },
        layouts: {
          edit: [],
          editRelations: [
            {
              fieldSchema: {},
              metadatas: {},
              name: 'addresses',
              queryInfos: {},
              size: 6,
              targetModelPluginOptions: {},
            },
          ],
        },
      },
    };

    const data = {
      query: null,
      layout,
    };
    const results = mutateEditViewLayout(data);

    expect(results).toEqual(data);
  });

  it('should modify the editRelations layout when personalization is enabled and the query.variation is defined', () => {
    const layout = {
      contentType: {
        uid: 'test',
        pluginOptions: { personalization: { personalized: true } },
        layouts: {
          edit: [],
          editRelations: [
            {
              fieldSchema: {},
              metadatas: {},
              name: 'addresses',
              queryInfos: {
                test: true,
                defaultParams: {},
                paramsToKeep: ['plugins.personalization.variation'],
              },
              size: 6,
              targetModelPluginOptions: {},
            },
          ],
        },
      },
      components: {},
    };

    const data = {
      layout,
      query: { plugins: { personalization: { variation: 'en' } } },
    };
    const results = mutateEditViewLayout(data);

    expect(results).toEqual({
      ...data,
      layout: {
        ...layout,
        contentType: {
          ...layout.contentType,
          layouts: {
            edit: [],
            editRelations: [
              {
                fieldSchema: {},
                metadatas: {},
                name: 'addresses',
                queryInfos: {
                  test: true,
                  defaultParams: {},
                  paramsToKeep: ['plugins.personalization.variation'],
                },
                size: 6,
                targetModelPluginOptions: {},
                labelAction: (
                  <LabelAction
                    title={{ id: personalizedTrad, defaultMessage: localizedTradDefaultMessage }}
                    icon={<Personalization aria-hidden />}
                  />
                ),
              },
            ],
          },
        },
      },
    });
  });

  describe('enhanceComponentsLayout', () => {
    it('should not enhance the field when the type is not relation', () => {
      const components = {
        test: {
          test: true,
          layouts: {
            edit: [
              [
                {
                  name: 'title',
                  fieldSchema: { type: 'string' },
                },
                {
                  name: 'content',
                  fieldSchema: { type: 'string' },
                },
              ],
            ],
          },
        },
      };
      const expected = {
        test: {
          test: true,
          layouts: {
            edit: [
              [
                {
                  name: 'title',
                  fieldSchema: { type: 'string' },
                },
                {
                  name: 'content',
                  fieldSchema: { type: 'string' },
                },
              ],
            ],
          },
        },
      };

      expect(enhanceComponentsLayout(components)).toEqual(expected);
    });

    it('should not enhance the field when the type is relation and the targetModel.pluginOptions.i18.personalized is disabled', () => {
      const components = {
        test: {
          test: true,
          layouts: {
            edit: [
              [
                {
                  name: 'title',
                  fieldSchema: { type: 'relation' },
                  targetModelPluginOptions: { personalization: { personalized: false } },
                },
                {
                  name: 'content',
                  fieldSchema: { type: 'string' },
                },
              ],
            ],
          },
        },
      };
      const expected = {
        test: {
          test: true,
          layouts: {
            edit: [
              [
                {
                  name: 'title',
                  fieldSchema: { type: 'relation' },
                  targetModelPluginOptions: { personalization: { personalized: false } },
                },
                {
                  name: 'content',
                  fieldSchema: { type: 'string' },
                },
              ],
            ],
          },
        },
      };

      expect(enhanceComponentsLayout(components)).toEqual(expected);
    });

    it('should modify the relation field when the targetModelPluginOptions.personalization.personalized is enabled', () => {
      const components = {
        foo: {
          test: true,
          layouts: {
            edit: [
              [
                {
                  name: 'title',
                  fieldSchema: { type: 'relation' },
                  targetModelPluginOptions: { personalization: { personalized: true } },
                  queryInfos: {
                    defaultParams: { test: true },
                  },
                },
                {
                  name: 'content',
                  fieldSchema: { type: 'string' },
                },
              ],
            ],
          },
        },
        bar: {
          test: true,
          layouts: {
            edit: [
              [
                {
                  name: 'title',
                  fieldSchema: { type: 'relation' },
                  targetModelPluginOptions: { personalization: { personalized: true } },
                  queryInfos: {
                    defaultParams: { test: true },
                  },
                },
                {
                  name: 'content',
                  fieldSchema: { type: 'string' },
                },
              ],
            ],
          },
        },
      };
      const expected = {
        foo: {
          test: true,
          layouts: {
            edit: [
              [
                {
                  name: 'title',
                  fieldSchema: { type: 'relation' },
                  targetModelPluginOptions: { personalization: { personalized: true } },
                  queryInfos: {
                    defaultParams: { test: true, variation: 'en' },
                    paramsToKeep: ['plugins.personalization.variation'],
                  },
                },
                {
                  name: 'content',
                  fieldSchema: { type: 'string' },
                },
              ],
            ],
          },
        },
        bar: {
          test: true,
          layouts: {
            edit: [
              [
                {
                  name: 'title',
                  fieldSchema: { type: 'relation' },
                  targetModelPluginOptions: { personalization: { personalized: true } },
                  queryInfos: {
                    defaultParams: { test: true, variation: 'en' },
                    paramsToKeep: ['plugins.personalization.variation'],
                  },
                },
                {
                  name: 'content',
                  fieldSchema: { type: 'string' },
                },
              ],
            ],
          },
        },
      };

      expect(enhanceComponentsLayout(components, 'en')).toEqual(expected);
    });
  });

  describe('enhanceEditLayout', () => {
    it('should add the label icon to all fields with the personalized translation when personalization is enabled', () => {
      const edit = [
        [
          {
            name: 'name',
            size: 6,
            fieldSchema: {
              pluginOptions: { personalization: { personalized: true } },
              type: 'string',
            },
          },
        ],
        [
          {
            name: 'test',
            size: 6,
            fieldSchema: {
              pluginOptions: { personalization: { personalized: true } },
              type: 'string',
            },
          },
          {
            name: 'slug',
            size: 6,
            fieldSchema: {
              type: 'uid',
            },
          },
        ],
      ];
      const expected = [
        [
          {
            name: 'name',
            size: 6,
            fieldSchema: {
              pluginOptions: { personalization: { personalized: true } },
              type: 'string',
            },
            labelAction: (
              <LabelAction
                title={{ id: personalizedTrad, defaultMessage: localizedTradDefaultMessage }}
                icon={<Personalization aria-hidden />}
              />
            ),
          },
        ],
        [
          {
            name: 'test',
            size: 6,
            fieldSchema: {
              pluginOptions: { personalization: { personalized: true } },
              type: 'string',
            },
            labelAction: (
              <LabelAction
                title={{ id: personalizedTrad, defaultMessage: localizedTradDefaultMessage }}
                icon={<Personalization aria-hidden />}
              />
            ),
          },
          {
            name: 'slug',
            size: 6,
            fieldSchema: {
              type: 'uid',
            },
            labelAction: (
              <LabelAction
                title={{ id: personalizedTrad, defaultMessage: localizedTradDefaultMessage }}
                icon={<Personalization aria-hidden />}
              />
            ),
          },
        ],
      ];

      expect(enhanceEditLayout(edit)).toEqual(expected);
    });

    it('should add the label icon to all fields with the not personalized translation when personalization is disabled', () => {
      const edit = [
        [
          {
            name: 'name',
            size: 6,
            fieldSchema: {
              pluginOptions: { personalization: { personalized: true } },
              type: 'string',
            },
          },
        ],
        [
          {
            name: 'test',
            size: 6,
            fieldSchema: {
              pluginOptions: { personalization: { personalized: false } },
              type: 'string',
            },
          },
        ],
      ];
      const expected = [
        [
          {
            name: 'name',
            size: 6,
            fieldSchema: {
              pluginOptions: { personalization: { personalized: true } },
              type: 'string',
            },
            labelAction: (
              <LabelAction
                title={{ id: personalizedTrad, defaultMessage: localizedTradDefaultMessage }}
                icon={<Personalization aria-hidden />}
              />
            ),
          },
        ],
        [
          {
            name: 'test',
            size: 6,
            fieldSchema: {
              pluginOptions: { personalization: { personalized: false } },
              type: 'string',
            },
            labelAction: (
              <LabelAction
                title={{ id: notPersonalizedTrad, defaultMessage: notLocalizedTradDefaultMessage }}
                icon={<StrikedWorld aria-hidden />}
              />
            ),
          },
        ],
      ];

      expect(enhanceEditLayout(edit)).toEqual(expected);
    });
  });

  describe('enhanceRelationLayout', () => {
    it('should add the labelIcon key to all relations fields', () => {
      const editRelations = [
        {
          fieldSchema: {},
          metadatas: {},
          name: 'addresses',
          queryInfos: {},
          size: 6,
          targetModelPluginOptions: {},
        },
      ];
      const expected = [
        {
          fieldSchema: {},
          metadatas: {},
          name: 'addresses',
          queryInfos: {},
          size: 6,
          targetModelPluginOptions: {},
          labelAction: (
            <LabelAction
              title={{ id: personalizedTrad, defaultMessage: localizedTradDefaultMessage }}
              icon={<Personalization aria-hidden />}
            />
          ),
        },
      ];

      expect(enhanceRelationLayout(editRelations, 'en')).toEqual(expected);
    });

    it('should add the variation to the queryInfos.defaultParams when the targetModelPluginOptions.personalization.personalized is enabled', () => {
      const editRelations = [
        {
          fieldSchema: {},
          metadatas: {},
          name: 'addresses',
          queryInfos: {
            defaultParams: {
              test: true,
            },
          },
          size: 6,
          targetModelPluginOptions: {
            personalization: { personalized: true },
          },
        },
      ];
      const expected = [
        {
          fieldSchema: {},
          metadatas: {},
          name: 'addresses',
          queryInfos: {
            defaultParams: {
              test: true,
              variation: 'en',
            },
            paramsToKeep: ['plugins.personalization.variation'],
          },
          size: 6,
          targetModelPluginOptions: {
            personalization: { personalized: true },
          },
          labelAction: (
            <LabelAction
              title={{ id: personalizedTrad, defaultMessage: localizedTradDefaultMessage }}
              icon={<Personalization aria-hidden />}
            />
          ),
        },
      ];

      expect(enhanceRelationLayout(editRelations, 'en')).toEqual(expected);
    });
  });
});
