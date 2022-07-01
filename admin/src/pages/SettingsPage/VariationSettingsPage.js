import React, { useState } from 'react';
import PropTypes from 'prop-types';
import VariationList from '../../components/VariationList';

const VariationSettingsPage = ({
  canReadVariation,
  canCreateVariation,
  canDeleteVariation,
  canUpdateVariation,
}) => {
  const [isOpenedCreateModal, setIsOpenedCreateModal] = useState(false);

  const handleToggleModalCreate = canCreateVariation
    ? () => setIsOpenedCreateModal(s => !s)
    : undefined;

  return canReadVariation ? (
    <VariationList
      canUpdateVariation={canUpdateVariation}
      canDeleteVariation={canDeleteVariation}
      onToggleCreateModal={handleToggleModalCreate}
      isCreating={isOpenedCreateModal}
    />
  ) : null;
};

VariationSettingsPage.propTypes = {
  canReadVariation: PropTypes.bool.isRequired,
  canCreateVariation: PropTypes.bool.isRequired,
  canUpdateVariation: PropTypes.bool.isRequired,
  canDeleteVariation: PropTypes.bool.isRequired,
};

export default VariationSettingsPage;
