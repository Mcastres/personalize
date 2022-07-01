import { object, string } from 'yup';
import { translatedErrors as errorsTrads } from '@strapi/helper-plugin';

const localeFormSchema = object().shape({
  name: string()
    .max(50, "Settings.locales.modal.locales.displayName.error")
    .required(errorsTrads.required),
  // slug: string()
  //   .max(50, "Settings.locales.modal.locales.displayName.error")
  //   .required(errorsTrads.required),
});

export default localeFormSchema;
