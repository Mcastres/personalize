import { object, string } from 'yup';
import { translatedErrors as errorsTrads } from '@strapi/helper-plugin';

const variationFormSchema = object().shape({
  name: string()
    .max(50, "Settings.variations.modal.variations.displayName.error")
    .required(errorsTrads.required),
  // slug: string()
  //   .max(50, "Settings.variations.modal.variations.displayName.error")
  //   .required(errorsTrads.required),
});

export default variationFormSchema;
