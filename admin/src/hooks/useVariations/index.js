import { useEffect } from 'react';
import { request, useNotification } from '@strapi/helper-plugin';
import { useSelector, useDispatch } from 'react-redux';
import { RESOLVE_VARIATIONS } from '../constants';

const fetchVariationsList = async toggleNotification => {
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

    return e;
  }
};

const useVariations = () => {
  const dispatch = useDispatch();
  const toggleNotification = useNotification();
  const variations = useSelector(state => state.personalization_variations.variations);
  const isLoading = useSelector(state => state.personalization_variations.isLoading);

  useEffect(() => {
    fetchVariationsList(toggleNotification).then(variations =>
      dispatch({ type: RESOLVE_VARIATIONS, variations })
    );
  }, [dispatch, toggleNotification]);

  return { variations, isLoading };
};

export default useVariations;
