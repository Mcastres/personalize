import React from "react";
import PropTypes from "prop-types";
import get from "lodash/get";
import { Box } from "@strapi/design-system/Box";
import { Divider } from "@strapi/design-system/Divider";
import { Select, Option } from "@strapi/design-system/Select";
import { Typography } from "@strapi/design-system/Typography";
import { Stack } from "@strapi/design-system/Stack";
import { useIntl } from "react-intl";
import { useHistory } from "react-router-dom";
import { stringify } from "qs";
import { getTrad } from "../../../utils";
import { createVariationsOption } from "./utils";
import CMEditViewCopyVariation from "../CMEditViewCopyVariation";
import Bullet from "./Bullet";

import { has } from "lodash"

import useGetExistingVariation from "../../../hooks/useGetExistingVariation";

const CMEditViewVariationPicker = ({
  appVariations,
  createPermissions,
  currentEntityId,
  currentVariationStatus,
  hasDraftAndPublishEnabled,
  isSingleType,
  personalizations,
  query,
  readPermissions,
  setQuery,
  slug,
}) => {
  const { formatMessage } = useIntl();

  const currentVariation = get(
    query,
    "plugins.personalization.variation",
    false
  );

  const { push } = useHistory();

  const handleChange = (useGetExistingVariation) => async (value) => {
    if (value === currentVariation) {
      return;
    }

    const nextVariation = options.find((option) => {
      return option.value === value;
    });

    const { status, id } = nextVariation;

    let defaultParams = {
      plugins: {
        ...query.plugins,
        personalization: { ...query.plugins.personalization, variation: value },
      },
    };

    if (currentEntityId) {
      defaultParams.plugins.personalization.relatedEntityId = currentEntityId;
    }

    // If i18n is enabled
    if (has(defaultParams.plugins, "i18n")) {
      delete defaultParams.plugins.i18n.relatedEntityId;
    }

    if (
      status !== "published" &&
      status !== "draft" &&
      has(defaultParams.plugins, "i18n")
    ) {
      const existingLocalizedVariation = await useGetExistingVariation(
        slug,
        defaultParams?.plugins.i18n.locale,
        value
      );

      const { total } = existingLocalizedVariation?.pagination;
      const entry = existingLocalizedVariation?.results[0];

      if (total > 0) {
        if (entry?.localizations.length > 0) {
          defaultParams.plugins.i18n.relatedEntityId = entry.id;
          delete defaultParams.plugins.personalization.relatedEntityId;
        } else {
          defaultParams.plugins.personalization.relatedEntityId = entry.id;
          delete defaultParams.plugins.i18n.relatedEntityId;
        }

        push({
          pathname: `/content-manager/collectionType/${slug}/${entry.id}`,
          search: stringify(defaultParams, { encode: false }),
        });

        return;
      }
    }

    if (isSingleType) {
      setQuery(defaultParams);

      return;
    }

    if (status === "did-not-create-variation") {
      push({
        pathname: `/content-manager/collectionType/${slug}/create`,
        search: stringify(defaultParams, { encode: false }),
      });

      return;
    }

    push({
      pathname: `/content-manager/collectionType/${slug}/${id}`,
      search: stringify(defaultParams, { encode: false }),
    });
  };

  const options = createVariationsOption(
    appVariations,
    personalizations
  ).filter(({ status, value }) => {
    if (status === "did-not-create-variation") {
      return createPermissions.find(({ properties }) =>
        get(properties, "variations", []).includes(value)
      );
    }

    return readPermissions.find(({ properties }) =>
      get(properties, "variations", []).includes(value)
    );
  });

  const filteredOptions = options.filter(
    ({ value }) => value !== currentVariation
  );
  const currentVariationObject = appVariations.find(
    ({ slug }) => slug === currentVariation
  );

  const value = options.find(({ value }) => {
    return value === currentVariation;
  }) || {
    value: currentVariationObject.slug,
    label: currentVariationObject.name,
  };

  if (!currentVariation) {
    return null;
  }

  return (
    <Box paddingTop={6}>
      <Typography variant="sigma" textColor="neutral600">
        {formatMessage({
          id: getTrad("plugin.name"),
          defaultMessage: "Personalization",
        })}
      </Typography>
      <Box paddingTop={2} paddingBottom={6}>
        <Divider />
      </Box>
      <Stack spacing={2}>
        <Box>
          <Select
            label={formatMessage({
              id: getTrad("Settings.variations.modal.variations.label"),
            })}
            onChange={handleChange(useGetExistingVariation)}
            value={value?.value}
          >
            <Option
              value={value?.value}
              disabled
              startIcon={
                hasDraftAndPublishEnabled ? (
                  <Bullet status={currentVariationStatus} />
                ) : null
              }
            >
              {value?.label}
            </Option>
            {filteredOptions.map((option) => {
              return (
                <Option
                  key={option.value}
                  value={option.value}
                  startIcon={
                    hasDraftAndPublishEnabled ? (
                      <Bullet status={option.status} />
                    ) : null
                  }
                >
                  {option.label}
                </Option>
              );
            })}
          </Select>
        </Box>
        <Box>
          <CMEditViewCopyVariation
            appVariations={appVariations}
            currentVariation={currentVariation}
            personalizations={personalizations}
            readPermissions={readPermissions}
          />
        </Box>
      </Stack>
    </Box>
  );
};

CMEditViewVariationPicker.defaultProps = {
  createPermissions: [],
  currentEntityId: null,
  currentVariationStatus: "did-not-create-variation",
  isSingleType: false,
  personalizations: [],
  query: {},
  readPermissions: [],
};

CMEditViewVariationPicker.propTypes = {
  appVariations: PropTypes.array.isRequired,
  createPermissions: PropTypes.array,
  currentEntityId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  currentVariationStatus: PropTypes.string,
  hasDraftAndPublishEnabled: PropTypes.bool.isRequired,
  isSingleType: PropTypes.bool,
  personalizations: PropTypes.array,
  query: PropTypes.object,
  readPermissions: PropTypes.array,
  setQuery: PropTypes.func.isRequired,
  slug: PropTypes.string.isRequired,
};

export default CMEditViewVariationPicker;
