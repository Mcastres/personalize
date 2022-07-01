import { useState } from 'react';
import { request, useNotification } from '@strapi/helper-plugin';
import { useDispatch } from 'react-redux';
import { getTrad } from '../../utils';
import { UPDATE_VARIATION } from '../constants';

const editVariation = async (id, payload, toggleNotification) => {
  try {
    const data = await request(`/personalization/variations/${id}`, {
      method: 'PUT',
      body: payload,
    });

    toggleNotification({
      type: 'success',
      message: { id: getTrad('Settings.variations.modal.edit.success') },
    });

    return data;
  } catch {
    toggleNotification({
      type: 'warning',
      message: { id: 'notification.error' },
    });

    return null;
  }
};

const useEditVariation = () => {
  const [isLoading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const toggleNotification = useNotification();

  const modifyVariation = async (id, payload) => {
    setLoading(true);

    const editedVariation = await editVariation(
      id,
      payload,
      toggleNotification
    );

    dispatch({ type: UPDATE_VARIATION, editedVariation });
    setLoading(false);
  };

  return { isEditing: isLoading, editVariation: modifyVariation };
};

export default useEditVariation;
