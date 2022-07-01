import { useState } from 'react';
import { request, useNotification } from '@strapi/helper-plugin';
import { useDispatch } from 'react-redux';
import get from 'lodash/get';
import { getTrad } from '../../utils';
import { ADD_VARIATION } from '../constants';

const addVariation = async ({ name, slug }, toggleNotification) => {
  const data = await request(`/personalization/variations`, {
    method: 'POST',
    body: {
      name,
      slug,
    },
  });

  toggleNotification({
    type: 'success',
    message: { id: getTrad('Settings.variations.modal.create.success') },
  });

  return data;
};

const useAddVariation = () => {
  const [isLoading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const toggleNotification = useNotification();

  const persistVariation = async variation => {
    setLoading(true);

    try {
      const newVariation = await addVariation(variation, toggleNotification);
      dispatch({ type: ADD_VARIATION, newVariation });
    } catch (e) {
      const message = get(e, 'response.payload.message', null);

      if (message && message.includes('already exists')) {
        toggleNotification({
          type: 'warning',
          message: { id: getTrad('Settings.variations.modal.create.alreadyExist') },
        });
      } else {
        toggleNotification({
          type: 'warning',
          message: { id: 'notification.error' },
        });
      }

      throw e;
    } finally {
      setLoading(false);
    }
  };

  return { isAdding: isLoading, addVariation: persistVariation };
};

export default useAddVariation;
