import React from "react";
import PropTypes from "prop-types";
import { useRBACProvider, Form } from "@strapi/helper-plugin";
import {
  ModalLayout,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@strapi/design-system/ModalLayout";
import {
  TabGroup,
  Tabs,
  Tab,
  TabPanels,
  TabPanel,
} from "@strapi/design-system/Tabs";
import { Button } from "@strapi/design-system/Button";
import { Typography } from "@strapi/design-system/Typography";
import { Divider } from "@strapi/design-system/Divider";
import { Box } from "@strapi/design-system/Box";
import { Flex } from "@strapi/design-system/Flex";
import Check from "@strapi/icons/Check";
import { useIntl } from "react-intl";
import { Formik } from "formik";
import localeFormSchema from "../../schemas";
import { getTrad } from "../../utils";
import useAddLocale from "../../hooks/useAddLocale";
import BaseForm from "./BaseForm";

import slugify from "@sindresorhus/slugify";

const initialFormValues = {
  name: "",
  slug: "",
};

const ModalCreate = ({ onClose }) => {
  const { isAdding, addLocale } = useAddLocale();
  const { formatMessage } = useIntl();
  const { refetchPermissions } = useRBACProvider();

  const handleLocaleAdd = async (values) => {
    await addLocale({
      name: values.name,
      slug: slugify(values.name),
    });

    await refetchPermissions();
  };

  return (
    <ModalLayout onClose={onClose} labelledBy="add-locale-title">
      <Formik
        initialValues={initialFormValues}
        onSubmit={handleLocaleAdd}
        validationSchema={localeFormSchema}
        validateOnChange={false}
      >
        <Form>
          <ModalHeader>
            <Typography
              fontWeight="bold"
              textColor="neutral800"
              as="h2"
              id="add-locale-title"
            >
              {formatMessage({
                id: getTrad("Settings.list.actions.add"),
                defaultMessage: "Add new locale",
              })}
            </Typography>
          </ModalHeader>
          <ModalBody>
            <TabGroup
              label={formatMessage({
                id: getTrad("Settings.locales.modal.title"),
                defaultMessage: "Configurations",
              })}
              id="tabs"
              variant="simple"
            >
              <Flex justifyContent="space-between">
                <Typography as="h2" variant="beta">
                  {formatMessage({
                    id: getTrad("Settings.locales.modal.title"),
                    defaultMessage: "Configurations",
                  })}
                </Typography>
                <Tabs>
                  <Tab>
                    {formatMessage({
                      id: getTrad("Settings.locales.modal.base"),
                      defaultMessage: "Base settings",
                    })}
                  </Tab>
                </Tabs>
              </Flex>

              <Divider />

              <Box paddingTop={7} paddingBottom={7}>
                <TabPanels>
                  <TabPanel>
                    <BaseForm />
                  </TabPanel>
                </TabPanels>
              </Box>
            </TabGroup>
          </ModalBody>
          <ModalFooter
            startActions={
              <Button variant="tertiary" onClick={onClose}>
                {formatMessage({
                  id: "app.components.Button.cancel",
                  defaultMessage: "Cancel",
                })}
              </Button>
            }
            endActions={
              <Button type="submit" startIcon={<Check />} disabled={isAdding}>
                {formatMessage({ id: "global.save", defaultMessage: "Save" })}
              </Button>
            }
          />
        </Form>
      </Formik>
    </ModalLayout>
  );
};

ModalCreate.propTypes = {
  onClose: PropTypes.func.isRequired,
};

export default ModalCreate;
