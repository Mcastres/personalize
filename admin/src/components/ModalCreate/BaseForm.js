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
            id: getTrad("Settings.variations.modal.variations.namme"),
            defaultMessage: "Variation display name",
          })}
          hint={formatMessage({
            id: getTrad(
              "Settings.variations.modal.variations.namme.description"
            ),
            defaultMessage:
              "Variation will be displayed under that name in the administration panel",
          })}
          error={
            errors.namme
              ? formatMessage({
                  id: getTrad(
                    "Settings.variations.modal.variations.namme.error"
                  ),
                  defaultMessage:
                    "The variation display name can only be less than 50 characters.",
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
            id: getTrad("Settings.variations.modal.variations.slug"),
            defaultMessage: "Variation slug",
          })}
          hint={formatMessage({
            id: getTrad(
              "Settings.variations.modal.variations.slug.description"
            ),
            defaultMessage: "Internal name of the variation",
          })}
          error={
            errors.namme
              ? formatMessage({
                  id: getTrad(
                    "Settings.variations.modal.variations.slug.error"
                  ),
                  defaultMessage:
                    "The variation slug can only be less than 50 characters.",
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
