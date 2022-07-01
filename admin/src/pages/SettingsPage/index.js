import React from 'react';
import { useRBAC } from '@strapi/helper-plugin';
import VariationSettingsPage from './VariationSettingsPage';
import personalizationPermissions from '../../permissions';

const ProtectedVariationSettingsPage = () => {
  const {
    isLoading,
    allowedActions: { canRead, canUpdate, canCreate, canDelete },
  } = useRBAC(personalizationPermissions);

  if (isLoading) {
    return null;
  }

  return (
    <VariationSettingsPage
      canReadVariation={canRead}
      canCreateVariation={canCreate}
      canUpdateVariation={canUpdate}
      canDeleteVariation={canDelete}
    />
  );
};

export default ProtectedVariationSettingsPage;
