import {
  contentManagementUtilRemoveFieldsFromData,
  formatContentTypeData,
} from '@strapi/helper-plugin';
import removePasswordAndRelationsFieldFromData from './removePasswordAndRelationsFieldFromData';

const cleanData = (data, { contentType, components }, initialPersonalization) => {
  const dataWithoutPasswordsAndRelations = removePasswordAndRelationsFieldFromData(
    data,
    contentType,
    components
  );

  dataWithoutPasswordsAndRelations.personalization = initialPersonalization;

  const fieldsToRemove = ['createdBy', 'updatedBy', 'publishedAt', 'id', 'updatedAt', 'createdAt'];

  const cleanedClonedData = contentManagementUtilRemoveFieldsFromData(
    dataWithoutPasswordsAndRelations,
    contentType,
    components,
    fieldsToRemove
  );

  return formatContentTypeData(cleanedClonedData, contentType, components);
};

export default cleanData;
