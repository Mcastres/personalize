import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { useDispatch } from 'react-redux';
import { useIntl } from 'react-intl';
import { Dialog, DialogBody, DialogFooter } from '@strapi/design-system/Dialog';
import { Select, Option } from '@strapi/design-system/Select';
import { Button } from '@strapi/design-system/Button';
import { Box } from '@strapi/design-system/Box';
import { Typography } from '@strapi/design-system/Typography';
import { Flex } from '@strapi/design-system/Flex';
import { Stack } from '@strapi/design-system/Stack';
import ExclamationMarkCircle from '@strapi/icons/ExclamationMarkCircle';
import Duplicate from '@strapi/icons/Duplicate';
import { useCMEditViewDataManager, useNotification } from '@strapi/helper-plugin';
import { axiosInstance, getTrad } from '../../../utils';
import { cleanData, generateOptions } from './utils';

const StyledTypography = styled(Typography)`
  svg {
    margin-right: ${({ theme }) => theme.spaces[2]};
    fill: none;
    > g,
    path {
      fill: ${({ theme }) => theme.colors.primary600};
    }
  }
`;

const CenteredTypography = styled(Typography)`
  text-align: center;
`;

const CMEditViewCopyVariation = props => {
  if (!props.personalizations.length) {
    return null;
  }

  return <Content {...props} />;
};

const Content = ({ appVariations, currentVariation, personalizations, readPermissions }) => {
  const options = generateOptions(appVariations, currentVariation, personalizations, readPermissions);

  const toggleNotification = useNotification();
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();
  const { allLayoutData, initialData, slug } = useCMEditViewDataManager();
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [value, setValue] = useState(options[0]?.value || '');

  const handleConfirmCopyVariation = async () => {
    if (!value) {
      handleToggle();

      return;
    }

    const requestURL = `/content-manager/collection-types/${slug}/${value}`;

    setIsLoading(true);
    try {
      const { data: response } = await axiosInstance.get(requestURL);

      const cleanedData = cleanData(response, allLayoutData, personalizations);
      ['createdBy', 'updatedBy', 'publishedAt', 'id', 'createdAt'].forEach(key => {
        if (!initialData[key]) return;
        cleanedData[key] = initialData[key];
      });

      dispatch({ type: 'ContentManager/CrudReducer/GET_DATA_SUCCEEDED', data: cleanedData });

      toggleNotification({
        type: 'success',
        message: {
          id: getTrad('CMEditViewCopyVariation.copy-success'),
          defaultMessage: 'Variation copied!',
        },
      });
    } catch (err) {
      console.error(err);

      toggleNotification({
        type: 'warning',
        message: {
          id: getTrad('CMEditViewCopyVariation.copy-failure'),
          defaultMessage: 'Failed to copy variation',
        },
      });
    } finally {
      setIsLoading(false);
      handleToggle();
    }
  };

  const handleChange = value => {
    setValue(value);
  };

  const handleToggle = () => {
    setIsOpen(prev => !prev);
  };

  return (
    <>
      <StyledTypography
        fontSize={2}
        textColor="primary600"
        as="button"
        type="button"
        onClick={handleToggle}
      >
        <Flex>
          <Duplicate width="12px" height="12px" />
          {formatMessage({
            id: getTrad('CMEditViewCopyVariation.copy-text'),
            defaultMessage: 'Fill in from another variation',
          })}
        </Flex>
      </StyledTypography>
      {isOpen && (
        <Dialog onClose={handleToggle} title="Confirmation" isOpen={isOpen}>
          <DialogBody icon={<ExclamationMarkCircle />}>
            <Stack spacing={2}>
              <Flex justifyContent="center">
                <CenteredTypography id="confirm-description">
                  {formatMessage({
                    id: getTrad('CMEditViewCopyVariation.ModalConfirm.content'),
                    defaultMessage:
                      'Your current content will be erased and filled by the content of the selected variation:',
                  })}
                </CenteredTypography>
              </Flex>
              <Box>
                <Select
                  label={formatMessage({
                    id: getTrad('Settings.variations.modal.variations.label'),
                  })}
                  onChange={handleChange}
                  value={value}
                >
                  {options.map(({ label, value }) => {
                    return (
                      <Option key={value} value={value}>
                        {label}
                      </Option>
                    );
                  })}
                </Select>
              </Box>
            </Stack>
          </DialogBody>
          <DialogFooter
            startAction={
              <Button onClick={handleToggle} variant="tertiary">
                {formatMessage({
                  id: 'popUpWarning.button.cancel',
                  defaultMessage: 'No, cancel',
                })}
              </Button>
            }
            endAction={
              <Button variant="success" onClick={handleConfirmCopyVariation} loading={isLoading}>
                {formatMessage({
                  id: getTrad('CMEditViewCopyVariation.submit-text'),
                  defaultMessage: 'Yes, fill in',
                })}
              </Button>
            }
          />
        </Dialog>
      )}
    </>
  );
};

CMEditViewCopyVariation.propTypes = {
  personalizations: PropTypes.array.isRequired,
};

Content.propTypes = {
  appVariations: PropTypes.arrayOf(
    PropTypes.shape({
      slug: PropTypes.string.isRequired,
      name: PropTypes.string,
    })
  ).isRequired,
  currentVariation: PropTypes.string.isRequired,
  personalizations: PropTypes.array.isRequired,
  readPermissions: PropTypes.array.isRequired,
};

export default CMEditViewCopyVariation;
