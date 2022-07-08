import React from 'react';
import { useIntl } from 'react-intl';
import { Typography } from '@strapi/design-system/Typography';
import { getTrad } from '../../../utils';
import useHasPersonalization from "../../../hooks/useHasPersonalization";

const DeleteModalAdditionalInfos = () => {
  const hasPersonalizationEnabled = useHasPersonalization();
  const { formatMessage } = useIntl();

  if (!hasPersonalizationEnabled) {
    return null;
  }

  return (
    <Typography textColor="danger500">
      {formatMessage(
        {
          id: getTrad('Settings.list.actions.deleteAdditionalInfos'),
          defaultMessage:
            'This will delete the active variation versions <em>(from Personalization)</em>',
        },
        {
          em: chunks => (
            <Typography fontWeight="semiBold" textColor="danger500">
              {chunks}
            </Typography>
          ),
        }
      )}
    </Typography>
  );
};

export default DeleteModalAdditionalInfos;
