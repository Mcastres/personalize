import React from 'react';
import PropTypes from 'prop-types';
import { ConfirmDialog } from '@strapi/helper-plugin';
import useDeleteVariation from '../../hooks/useDeleteVariation';

const ModalDelete = ({ variationToDelete, onClose }) => {
  const { isDeleting, deleteVariation } = useDeleteVariation();
  const isOpened = Boolean(variationToDelete);

  const handleDelete = () => deleteVariation(variationToDelete.id).then(onClose);

  return (
    <ConfirmDialog
      isConfirmButtonLoading={isDeleting}
      onConfirm={handleDelete}
      onToggleDialog={onClose}
      isOpen={isOpened}
    />
  );
};

ModalDelete.defaultProps = {
  variationToDelete: undefined,
};

ModalDelete.propTypes = {
  variationToDelete: PropTypes.shape({
    id: PropTypes.number.isRequired,
  }),
  onClose: PropTypes.func.isRequired,
};

export default ModalDelete;
