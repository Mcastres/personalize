import { useQuery } from 'react-query';
import { request, useNotification } from '@strapi/helper-plugin';
import { useNotifyAT } from '@strapi/design-system/LiveRegions';
import { useIntl } from 'react-intl';
import { getTrad } from '../../utils';

const fetchDefaultVariationsList = async toggleNotification => {
  try {
    const data = await request('/personalization/variations', {
      method: 'GET',
    });

    return data;
  } catch (e) {
    toggleNotification({
      type: 'warning',
      message: { id: 'notification.error' },
    });

    return [];
  }
};

const useDefaultVariations = () => {
  const { formatMessage } = useIntl();
  const { notifyStatus } = useNotifyAT();
  const toggleNotification = useNotification();
  const { isLoading, data } = useQuery('default-variations', () =>
    fetchDefaultVariationsList(toggleNotification).then(data => {
      notifyStatus(
        formatMessage({
          id: getTrad('Settings.variations.modal.variations.loaded'),
          defaultMessage: 'The variations have been successfully loaded.',
        })
      );

      return data;
    })
  );

  return { defaultVariations: data, isLoading };
};

export default useDefaultVariations;
