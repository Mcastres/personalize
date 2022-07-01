import produce from 'immer';
import set from 'lodash/set';
import pluginId from '../pluginId';
import { RESOLVE_VARIATIONS, ADD_VARIATION, DELETE_VARIATION, UPDATE_VARIATION } from './constants';

export const initialState = {
  isLoading: true,
  variations: [],
};

const variationReducer = produce((draftState = initialState, action) => {
  switch (action.type) {
    case RESOLVE_VARIATIONS: {
      draftState.isLoading = false;
      draftState.variations = action.variations;
      break;
    }

    case ADD_VARIATION: {
      if (action.newVariation.isDefault) {
        draftState.variations.forEach(variation => {
          variation.isDefault = false;
        });
      }

      draftState.variations.push(action.newVariation);
      break;
    }

    case DELETE_VARIATION: {
      const variations = draftState.variations.filter(variation => variation.id !== action.id);

      set(draftState, 'variations', variations);
      break;
    }

    case UPDATE_VARIATION: {
      if (action.editedVariation.isDefault) {
        draftState.variations.forEach(variation => {
          variation.isDefault = false;
        });
      }

      const indexToEdit = draftState.variations.findIndex(
        variation => variation.id === action.editedVariation.id
      );

      set(draftState.variations, indexToEdit, action.editedVariation);
      break;
    }

    default:
      return draftState;
  }

  return draftState;
});

const reducers = {
  [`${pluginId}_variations`]: variationReducer,
};

export default reducers;
