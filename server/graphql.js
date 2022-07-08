'use strict';

const { prop, propEq, identity, merge } = require('lodash/fp');
const { ValidationError } = require('@strapi/utils').errors;

const { getService } = require("./utils");

const VARIATION_SCALAR_TYPENAME = 'PersonalizationVariationCode';
const VARIATION_ARG_PLUGIN_NAME = 'PersonalizationVariationArg';

const getPersonalizedTypesFromRegistry = ({ strapi, typeRegistry }) => {
  const { KINDS } = strapi.plugin('graphql').service('constants');
  const { isPersonalizedContentType } = strapi.plugin('personalization').service('content-types');

  return typeRegistry.where(
    ({ config }) => config.kind === KINDS.type && isPersonalizedContentType(config.contentType)
  );
};

module.exports = ({ strapi }) => ({
  register() {
    const { service: getGraphQLService } = strapi.plugin('graphql');
    const { service: getPersonalizationService } = strapi.plugin('personalization');

    const { isPersonalizedContentType } = getPersonalizationService('content-types');

    const extensionService = getGraphQLService('extension');

    const getCreatePersonalizationMutationType = contentType => {
      const { getTypeName } = getGraphQLService('utils').naming;

      return `create${getTypeName(contentType)}Personalization`;
    };

    extensionService.shadowCRUD('plugin::personalization.variation').disableMutations();

    // Disable unwanted fields for personalized content types
    Object.entries(strapi.contentTypes).forEach(([uid, ct]) => {
      if (isPersonalizedContentType(ct)) {
        // Disable variation field in personalized inputs
        extensionService
          .shadowCRUD(uid)
          .field('variation')
          .disableInput();

        // Disable personalizations field in personalized inputs
        extensionService
          .shadowCRUD(uid)
          .field('personalizations')
          .disableInput();
      }
    });

    extensionService.use(({ nexus, typeRegistry }) => {
      const personalizationVariationArgPlugin = getPersonalizationVariationArgPlugin({ nexus, typeRegistry });
      const personalizationVariationScalar = getVariationScalar({ nexus });
      const {
        mutations: createPersonalizationMutations,
        resolversConfig: createPersonalizationResolversConfig,
      } = getCreatePersonalizationMutations({ nexus, typeRegistry });

      return {
        plugins: [personalizationVariationArgPlugin],
        types: [personalizationVariationScalar, createPersonalizationMutations],

        resolversConfig: {
          // Auth for createPersonalization mutations
          ...createPersonalizationResolversConfig,
          // variation arg transformation for personalized createEntity mutations
          ...getPersonalizedCreateMutationsResolversConfigs({ typeRegistry }),
        },
      };
    });

    const getVariationScalar = async ({ nexus }) => {
      const variationsService = getService("variations");
      const variations = await variationsService.find();

      return nexus.scalarType({
        name: VARIATION_SCALAR_TYPENAME,

        description: 'A string used to identify an personalization variation',

        serialize: identity,
        parseValue: identity,

        parseLiteral(ast) {
          if (ast.kind !== 'StringValue') {
            throw new ValidationError('Variation cannot represent non string type');
          }

          const isValidVariation = ast.value === 'all' || variations.find(propEq('slug', ast.value));

          if (!isValidVariation) {
            throw new ValidationError('Unknown variation supplied');
          }

          return ast.value;
        },
      });
    };

    const getCreatePersonalizationMutations = ({ nexus, typeRegistry }) => {
      const personalizedContentTypes = getPersonalizedTypesFromRegistry({ strapi, typeRegistry }).map(
        prop('config.contentType')
      );

      const createPersonalizationComponents = personalizedContentTypes.map(ct =>
        getCreatePersonalizationComponents(ct, { nexus })
      );

      // Extract & merge each resolverConfig into a single object
      const resolversConfig = createPersonalizationComponents
        .map(prop('resolverConfig'))
        .reduce(merge, {});

      const mutations = createPersonalizationComponents.map(prop('mutation'));

      return { mutations, resolversConfig };
    };

    const getCreatePersonalizationComponents = (contentType, { nexus }) => {
      const { getEntityResponseName, getContentTypeInputName } = getGraphQLService('utils').naming;
      const { createCreatePersonalizationHandler } = getPersonalizationService('core-api');

      const responseType = getEntityResponseName(contentType);
      const mutationName = getCreatePersonalizationMutationType(contentType);

      const resolverHandler = createCreatePersonalizationHandler(contentType);

      const mutation = nexus.extendType({
        type: 'Mutation',

        definition(t) {
          t.field(mutationName, {
            type: responseType,

            // The variation arg will be automatically added through the personalization graphql extension
            args: {
              id: 'ID',
              data: getContentTypeInputName(contentType),
            },

            async resolve(parent, args) {
              const { id, variation, data } = args;

              const ctx = {
                id,
                data: { ...data, variation },
              };

              const value = await resolverHandler(ctx);

              return { value, info: { args, resourceUID: contentType.uid } };
            },
          });
        },
      });

      const resolverConfig = {
        [`Mutation.${mutationName}`]: {
          auth: {
            scope: [`${contentType.uid}.createPersonalization`],
          },
        },
      };

      return { mutation, resolverConfig };
    };

    const getPersonalizedCreateMutationsResolversConfigs = ({ typeRegistry }) => {
      const personalizedCreateMutationsNames = getPersonalizedTypesFromRegistry({
        strapi,
        typeRegistry,
      })
        .map(prop('config.contentType'))
        .map(getGraphQLService('utils').naming.getCreateMutationTypeName);

      return personalizedCreateMutationsNames.reduce(
        (acc, mutationName) => ({
          ...acc,

          [`Mutation.${mutationName}`]: {
            middlewares: [
              // Set data's variation using args' variation
              (resolve, parent, args, context, info) => {
                args.data.variation = args.variation;

                return resolve(parent, args, context, info);
              },
            ],
          },
        }),
        {}
      );
    };

    const getPersonalizationVariationArgPlugin = ({ nexus, typeRegistry }) => {
      const { isPersonalizedContentType } = getPersonalizationService('content-types');

      const addVariationArg = config => {
        const { parentType } = config;

        // Only target queries or mutations
        if (parentType !== 'Query' && parentType !== 'Mutation') {
          return;
        }

        const registryType = typeRegistry.get(config.type);

        if (!registryType) {
          return;
        }

        const contentType = registryType.config.contentType;

        // Ignore non-personalized content types
        if (!isPersonalizedContentType(contentType)) {
          return;
        }

        config.args.variation = nexus.arg({ type: VARIATION_SCALAR_TYPENAME });
      };

      return nexus.plugin({
        name: VARIATION_ARG_PLUGIN_NAME,

        onAddOutputField(config) {
          // Add the variation arg to the queries on personalized CTs
          addVariationArg(config);
        },
      });
    };
  },
});
