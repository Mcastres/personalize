import { useState } from 'react';
import { request, useNotification } from '@strapi/helper-plugin';
import { useDispatch } from 'react-redux';
import { getTrad } from '../../utils';
import { DELETE_VARIATION } from '../constants';

const deleteVariation = async (id, toggleNotification) => {
  try {
    const data = await request(`/personalization/variations/${id}`, {
      method: 'DELETE',
    });

    toggleNotification({
      type: 'success',
      message: { id: getTrad('Settings.variations.modal.delete.success') },
    });

    return data;
  } catch (e) {
    toggleNotification({
      type: 'warning',
      message: { id: 'notification.error' },
    });

    return e;
  }
};

const useDeleteVariation = () => {
  const [isLoading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const toggleNotification = useNotification();

  const removeVariation = async id => {
    setLoading(true);

    await deleteVariation(id, toggleNotification);

    dispatch({ type: DELETE_VARIATION, id });
    setLoading(false);
  };

  return { isDeleting: isLoading, deleteVariation: removeVariation };
};

export default useDeleteVariation;
