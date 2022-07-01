import React from "react";
import { Grid, GridItem } from "@strapi/design-system/Grid";
import { TextInput } from "@strapi/design-system/TextInput";
import { useIntl } from "react-intl";
import { useFormikContext } from "formik";
import { getTrad } from "../../utils";

import slugify from "@sindresorhus/slugify";

const BaseForm = () => {
  const { formatMessage } = useIntl();
  const { values, handleChange, errors } = useFormikContext();

  return (
    <Grid gap={4}>
      <GridItem col={6}>
        <TextInput
          name="name"
          label={formatMessage({
            id: getTrad("Settings.locales.modal.locales.namme"),
            defaultMessage: "Locale display name",
          })}
          hint={formatMessage({
            id: getTrad("Settings.locales.modal.locales.namme.description"),
            defaultMessage:
              "Locale will be displayed under that name in the administration panel",
          })}
          error={
            errors.namme
              ? formatMessage({
                  id: getTrad("Settings.locales.modal.locales.namme.error"),
                  defaultMessage:
                    "The locale display name can only be less than 50 characters.",
                })
              : undefined
          }
          value={values.name}
          onChange={handleChange}
        />
      </GridItem>
      <GridItem col={6}>
        <TextInput
          name="slug"
          label={formatMessage({
            id: getTrad("Settings.locales.modal.locales.name"),
            defaultMessage: "Locale display name",
          })}
          hint={formatMessage({
            id: getTrad("Settings.locales.modal.locales.namme.description"),
            defaultMessage:
              "Locale will be displayed under that name in the administration panel",
          })}
          error={
            errors.namme
              ? formatMessage({
                  id: getTrad("Settings.locales.modal.locales.namme.error"),
                  defaultMessage:
                    "The locale display name can only be less than 50 characters.",
                })
              : undefined
          }
          value={slugify(values.name)}
          onChange={handleChange}
          disabled
        />
      </GridItem>
    </Grid>
  );
};

export default BaseForm;
