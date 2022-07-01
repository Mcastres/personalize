import React from 'react';
import PropTypes from 'prop-types';
import { Form, useRBACProvider } from '@strapi/helper-plugin';
import { useIntl } from 'react-intl';
import { Formik } from 'formik';
import Check from '@strapi/icons/Check';
import {
  ModalLayout,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from '@strapi/design-system/ModalLayout';
import { TabGroup, Tabs, Tab, TabPanels, TabPanel } from '@strapi/design-system/Tabs';
import { Flex } from '@strapi/design-system/Flex';
import { Box } from '@strapi/design-system/Box';
import { Button } from '@strapi/design-system/Button';
import { Divider } from '@strapi/design-system/Divider';
import { Typography } from '@strapi/design-system/Typography';
import variationFormSchema from '../../schemas';
import useEditVariation from '../../hooks/useEditVariation';
import { getTrad } from '../../utils';
import BaseForm from './BaseForm';

const ModalEdit = ({ variation, onClose }) => {
  const { refetchPermissions } = useRBACProvider();
  const { isEditing, editVariation } = useEditVariation();
  const { formatMessage } = useIntl();

  const handleSubmit = async ({ slug, name }) => {
    await editVariation(variation.id, { slug, name });
    await refetchPermissions();
  };

  return (
    <ModalLayout onClose={onClose} labelledBy="edit-variation-title">
      <Formik
        initialValues={{
          slug: variation?.slug,
          name: variation?.name
        }}
        onSubmit={handleSubmit}
        validationSchema={variationFormSchema}
      >
        <Form>
          <ModalHeader>
            <Typography fontWeight="bold" textColor="neutral800" as="h2" id="edit-variation-title">
              {formatMessage({
                id: getTrad('Settings.list.actions.edit'),
                defaultMessage: 'Edit a variation',
              })}
            </Typography>
          </ModalHeader>
          <ModalBody>
            <TabGroup
              label={formatMessage({
                id: getTrad('Settings.variations.modal.title'),
                defaultMessage: 'Configurations',
              })}
              id="tabs"
              variant="simple"
            >
              <Flex justifyContent="space-between">
                <Typography as="h2">
                  {formatMessage({
                    id: getTrad('Settings.variations.modal.title'),
                    defaultMessage: 'Configurations',
                  })}
                </Typography>
                <Tabs>
                  <Tab>
                    {formatMessage({
                      id: getTrad('Settings.variations.modal.base'),
                      defaultMessage: 'Base settings',
                    })}
                  </Tab>
                </Tabs>
              </Flex>

              <Divider />

              <Box paddingTop={7} paddingBottom={7}>
                <TabPanels>
                  <TabPanel>
                    <BaseForm variation={variation} />
                  </TabPanel>
                </TabPanels>
              </Box>
            </TabGroup>
          </ModalBody>

          <ModalFooter
            startActions={
              <Button variant="tertiary" onClick={onClose}>
                {formatMessage({ id: 'app.components.Button.cancel' })}
              </Button>
            }
            endActions={
              <Button type="submit" startIcon={<Check />} disabled={isEditing}>
                {formatMessage({ id: 'global.save' })}
              </Button>
            }
          />
        </Form>
      </Formik>
    </ModalLayout>
  );
};

ModalEdit.defaultProps = {
  variation: undefined,
};

ModalEdit.propTypes = {
  variation: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    slug: PropTypes.string.isRequired,
  }),
  onClose: PropTypes.func.isRequired,
};

export default ModalEdit;
