import React, { useState } from "react";
import { useIntl } from "react-intl";
import PropTypes from "prop-types";
import { Button } from "@strapi/design-system/Button";
import { Main } from "@strapi/design-system/Main";
import {
  ContentLayout,
  EmptyStateLayout,
  HeaderLayout,
} from "@strapi/design-system/Layout";
import { useFocusWhenNavigate } from "@strapi/helper-plugin";
import Plus from "@strapi/icons/Plus";
import EmptyDocuments from "@strapi/icons/EmptyDocuments";
import useVariations from "../../hooks/useVariations";
import { getTrad } from "../../utils";
import ModalEdit from "../ModalEdit";
import ModalDelete from "../ModalDelete";
import ModalCreate from "../ModalCreate";
import VariationTable from "./VariationTable";

const VariationList = ({
  canUpdateVariation,
  canDeleteVariation,
  onToggleCreateModal,
  isCreating,
}) => {
  const [variationToDelete, setVariationToDelete] = useState();
  const [variationToEdit, setVariationToEdit] = useState();
  const { variations } = useVariations();
  const { formatMessage } = useIntl();

  useFocusWhenNavigate();

  // Delete actions
  const closeModalToDelete = () => setVariationToDelete(undefined);
  const handleDeleteVariation = canDeleteVariation ? setVariationToDelete : undefined;

  // Edit actions
  const closeModalToEdit = () => setVariationToEdit(undefined);
  const handleEditVariation = canUpdateVariation ? setVariationToEdit : undefined;

  return (
    <Main tabIndex={-1}>
      <HeaderLayout
        primaryAction={
          <Button startIcon={<Plus />} onClick={onToggleCreateModal} size="L">
            {formatMessage({ id: getTrad("Settings.list.actions.add") })}
          </Button>
        }
        title={formatMessage({ id: getTrad("plugin.name") })}
        subtitle={formatMessage({ id: getTrad("Settings.list.description") })}
      />
      <ContentLayout>
        {variations?.length > 0 ? (
          <VariationTable
            variations={variations}
            onDeleteVariation={handleDeleteVariation}
            onEditVariation={handleEditVariation}
          />
        ) : (
          <EmptyStateLayout
            icon={<EmptyDocuments width={undefined} height={undefined} />}
            content={formatMessage({
              id: getTrad("Settings.list.empty.title"),
            })}
            action={
              onToggleCreateModal ? (
                <Button
                  variant="secondary"
                  startIcon={<Plus />}
                  onClick={onToggleCreateModal}
                >
                  {formatMessage({ id: getTrad("Settings.list.actions.add") })}
                </Button>
              ) : null
            }
          />
        )}
      </ContentLayout>

      {isCreating && <ModalCreate onClose={onToggleCreateModal} />}
      {variationToEdit && (
        <ModalEdit onClose={closeModalToEdit} variation={variationToEdit} />
      )}
      <ModalDelete
        variationToDelete={variationToDelete}
        onClose={closeModalToDelete}
      />
    </Main>
  );
};

VariationList.defaultProps = {
  onToggleCreateModal: undefined,
};

VariationList.propTypes = {
  canUpdateVariation: PropTypes.bool.isRequired,
  canDeleteVariation: PropTypes.bool.isRequired,
  onToggleCreateModal: PropTypes.func,
  isCreating: PropTypes.bool.isRequired,
};

export default VariationList;
