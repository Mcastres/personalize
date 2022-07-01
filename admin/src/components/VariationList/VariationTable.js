import React from 'react';
import PropTypes from 'prop-types';
import { Typography } from '@strapi/design-system/Typography';
import { IconButton } from '@strapi/design-system/IconButton';
import { Stack } from '@strapi/design-system/Stack';
import { VisuallyHidden } from '@strapi/design-system/VisuallyHidden';
import { Table, Thead, Tr, Th, Td, Tbody } from '@strapi/design-system/Table';
import Pencil from '@strapi/icons/Pencil';
import Trash from '@strapi/icons/Trash';
import { useIntl } from 'react-intl';
import { stopPropagation, onRowClick } from '@strapi/helper-plugin';

import { getTrad } from '../../utils';

const VariationTable = ({ variations, onDeleteVariation, onEditVariation }) => {
  const { formatMessage } = useIntl();

  return (
    <Table colCount={4} rowCount={variations.length + 1}>
      <Thead>
        <Tr>
          <Th>
            <Typography variant="sigma" textColor="neutral600">
              {formatMessage({ id: getTrad("Settings.variations.row.id") })}
            </Typography>
          </Th>
          <Th>
            <Typography variant="sigma" textColor="neutral600">
              {formatMessage({
                id: getTrad("Settings.variations.row.displayName"),
              })}
            </Typography>
          </Th>
          <Th>
            <Typography variant="sigma" textColor="neutral600">
              {formatMessage({
                id: getTrad("Settings.variations.row.default-variation"),
              })}
            </Typography>
          </Th>
          <Th>
            <VisuallyHidden>Actions</VisuallyHidden>
          </Th>
        </Tr>
      </Thead>
      <Tbody>
        {variations.map((variation) => (
          <Tr
            key={variation.id}
            {...onRowClick({
              fn: () => variation.isDefault ? undefined : onEditVariation(variation),
              condition: onEditVariation,
            })}
          >
            <Td>
              <Typography textColor="neutral800">{variation.id}</Typography>
            </Td>
            <Td>
              <Typography textColor="neutral800">{variation.name}</Typography>
            </Td>
            <Td>
              <Typography textColor="neutral800">
                {variation.isDefault
                  ? formatMessage({ id: getTrad("Settings.variations.default") })
                  : null}
              </Typography>
            </Td>
            <Td>
              <Stack
                horizontal
                spacing={1}
                style={{ justifyContent: "flex-end" }}
                {...stopPropagation}
              >
                {onEditVariation && !variation.isDefault && (
                  <IconButton
                    onClick={() => onEditVariation(variation)}
                    label={formatMessage({
                      id: getTrad("Settings.list.actions.edit"),
                    })}
                    icon={<Pencil />}
                    noBorder
                  />
                )}
                {onDeleteVariation && !variation.isDefault && (
                  <IconButton
                    onClick={() => onDeleteVariation(variation)}
                    label={formatMessage({
                      id: getTrad("Settings.list.actions.delete"),
                    })}
                    icon={<Trash />}
                    noBorder
                  />
                )}
              </Stack>
            </Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  );
};

VariationTable.defaultProps = {
  variations: [],
  onDeleteVariation: undefined,
  onEditVariation: undefined,
};

VariationTable.propTypes = {
  variations: PropTypes.array,
  onDeleteVariation: PropTypes.func,
  onEditVariation: PropTypes.func,
};

export default VariationTable;
