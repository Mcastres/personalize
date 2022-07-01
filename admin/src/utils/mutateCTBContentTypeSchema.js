import { has, get, omit } from 'lodash';
import PERSONALIZED_FIELDS from './personalizedFields';

const personalizedPath = ['pluginOptions', 'personalization', 'personalized'];

const addPersonalizationToFields = attributes =>
  Object.keys(attributes).reduce((acc, current) => {
    const currentAttribute = attributes[current];

    if (PERSONALIZED_FIELDS.includes(currentAttribute.type)) {
      const personalization = { personalized: true };

      const pluginOptions = currentAttribute.pluginOptions
        ? { ...currentAttribute.pluginOptions, personalization }
        : { personalization };

      acc[current] = { ...currentAttribute, pluginOptions };

      return acc;
    }

    acc[current] = currentAttribute;

    return acc;
  }, {});

const disableAttributesPersonalization = attributes =>
  Object.keys(attributes).reduce((acc, current) => {
    acc[current] = omit(attributes[current], 'pluginOptions.personalization');

    return acc;
  }, {});

const mutateCTBContentTypeSchema = (nextSchema, prevSchema) => {
  // Don't perform mutations components
  if (!has(nextSchema, personalizedPath)) {
    return nextSchema;
  }

  const isNextSchemaPersonalized = get(nextSchema, personalizedPath, false);
  const isPrevSchemaPersonalized = get(prevSchema, ['schema', ...personalizedPath], false);

  // No need to perform modification on the schema, if the personalization feature was not changed
  // at the ct level
  if (isNextSchemaPersonalized && isPrevSchemaPersonalized) {
    return nextSchema;
  }

  if (isNextSchemaPersonalized) {
    const attributes = addPersonalizationToFields(nextSchema.attributes);

    return { ...nextSchema, attributes };
  }

  // Remove the personalization object from the pluginOptions
  if (!isNextSchemaPersonalized) {
    const pluginOptions = omit(nextSchema.pluginOptions, 'personalization');
    const attributes = disableAttributesPersonalization(nextSchema.attributes);

    return { ...nextSchema, pluginOptions, attributes };
  }

  return nextSchema;
};
export default mutateCTBContentTypeSchema;
export { addPersonalizationToFields, disableAttributesPersonalization };
