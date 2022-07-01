import React, { useState, useRef } from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import { useIntl } from "react-intl";
import { useSelector } from "react-redux";
import { Flex } from "@strapi/design-system/Flex";
import { Box } from "@strapi/design-system/Box";
import { Tooltip } from "@strapi/design-system/Tooltip";
import { Typography } from "@strapi/design-system/Typography";
import { Popover } from "@strapi/design-system/Popover";
import { SortIcon, stopPropagation } from "@strapi/helper-plugin";
import get from "lodash/get";
import selectPersonalizationVariations from "../../selectors/selectPersonalizationVariations";
import { getTrad } from "../../utils";

const Button = styled.button`
  svg {
    > g,
    path {
      fill: ${({ theme }) => theme.colors.neutral500};
    }
  }
  &:hover {
    svg {
      > g,
      path {
        fill: ${({ theme }) => theme.colors.neutral600};
      }
    }
  }
  &:active {
    svg {
      > g,
      path {
        fill: ${({ theme }) => theme.colors.neutral400};
      }
    }
  }
`;

const ActionWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: ${32 / 16}rem;
  width: ${32 / 16}rem;
  svg {
    height: ${4 / 16}rem;
  }
`;

const mapToVariationName = (variations, VariationSlug) =>
  get(
    variations.find(({ slug }) => slug === VariationSlug),
    "name",
    VariationSlug
  );

const VariationListCell = ({
  personalizations,
  variation: currentVariationSlug,
  id,
}) => {
  const variations = useSelector(selectPersonalizationVariations);
  const allPersonalizations = [
    { variation: currentVariationSlug },
    ...personalizations,
  ];
  const variationNames = allPersonalizations.map(
    (variation) => variation.variation
  );
  const defaultVariation = variations.find((variation) => variation.isDefault);
  const hasDefaultVariation = variationNames.includes(defaultVariation.slug);
  const [visible, setVisible] = useState(false);
  const buttonRef = useRef();

  const { formatMessage } = useIntl();

  let variationsArray = [];

  if (hasDefaultVariation) {
    const ctVariationsWithoutDefault = variationNames.filter(
      (variation) => variation !== defaultVariation.slug
    );
    const ctVariationsNamesWithoutDefault = ctVariationsWithoutDefault.map(
      (variation) => mapToVariationName(variations, variation)
    );

    ctVariationsNamesWithoutDefault.sort();

    const ctVariationsNamesWithDefault = [
      `${defaultVariation.name} (default)`,
      ...ctVariationsNamesWithoutDefault,
    ];

    variationsArray = ctVariationsNamesWithDefault;
  } else {
    const ctVariations = variationNames.map((variation) =>
      mapToVariationName(variations, variation)
    );
    ctVariations.sort();

    variationsArray = ctVariations;
  }

  const handleTogglePopover = () => setVisible((prev) => !prev);

  const elId = `entry-${id}__variation`;
  const variationsNames = variationsArray.join(", ");

  return (
    <Flex {...stopPropagation}>
      <Tooltip
        label={formatMessage({
          id: getTrad("CMListView.popover.display-variations.label"),
          defaultMessage: "Display translated variations",
        })}
      >
        <Button type="button" onClick={handleTogglePopover} ref={buttonRef}>
          <Flex>
            <Typography
              style={{ maxWidth: "252px", cursor: "pointer" }}
              data-for={elId}
              data-tip={variationsNames}
              textColor="neutral800"
              ellipsis
            >
              {variationsNames}
            </Typography>
            <ActionWrapper>
              <SortIcon />

              {visible && (
                <Popover source={buttonRef} spacing={16} centered>
                  <ul>
                    {variationsArray.map((name) => (
                      <Box key={name} padding={3} as="li">
                        <Typography>{name}</Typography>
                      </Box>
                    ))}
                  </ul>
                </Popover>
              )}
            </ActionWrapper>
          </Flex>
        </Button>
      </Tooltip>
    </Flex>
  );
};

VariationListCell.propTypes = {
  id: PropTypes.number.isRequired,
  personalizations: PropTypes.arrayOf(
    PropTypes.shape({
      variation: PropTypes.string.isRequired,
    })
  ).isRequired,
  variation: PropTypes.string.isRequired,
};

export default VariationListCell;
