import type { BaseSyntheticEvent } from 'react';
import React, { useEffect } from 'react';
import type { ILanguage, ISchemaState } from '../../types';
import { PropertyItem } from './PropertyItem';
import {
  addProperty,
  deleteProperty,
  setPropertyName,
  setType,
} from '../../features/editor/schemaEditorSlice';
import { useDispatch, useSelector } from 'react-redux';
import { getTranslation } from '../../utils/language';
import type { UiSchemaNode, FieldType } from '@altinn/schema-model';
import { getChildNodesByPointer, getNameFromPointer } from '@altinn/schema-model';
import classes from './ItemFieldsTab.module.css';
import { usePrevious } from '../../hooks/usePrevious';
import { Button, ButtonColor, ButtonVariant } from '@digdir/design-system-react';
import { getDomFriendlyID } from '../../utils/ui-schema-utils';
import { Add } from '@navikt/ds-icons';

export interface ItemFieldsTabProps {
  selectedItem: UiSchemaNode;
  language: ILanguage;
}

export const ItemFieldsTab = ({ selectedItem, language }: ItemFieldsTabProps) => {
  const readonly = selectedItem.reference !== undefined;
  const dispatch = useDispatch();

  const fieldNodes = useSelector((state: ISchemaState) =>
    getChildNodesByPointer(state.uiSchema, selectedItem.pointer).map((node) => ({
      ...node,
      domId: getDomFriendlyID(node.pointer),
    }))
  );

  const numberOfChildNodes = fieldNodes.length;
  const prevNumberOfChildNodes = usePrevious<number>(numberOfChildNodes) ?? 0;

  useEffect(() => {
    // If the number of fields has increased, a new field has been added and should get focus
    if (numberOfChildNodes > prevNumberOfChildNodes) {
      const newNodeId = fieldNodes[fieldNodes.length - 1].domId;
      const newNodeInput = document.getElementById(newNodeId) as HTMLInputElement;
      newNodeInput?.focus();
      newNodeInput?.select();
    }
  }, [numberOfChildNodes, prevNumberOfChildNodes, fieldNodes]);

  const onChangePropertyName = (path: string, value: string) =>
    dispatch(
      setPropertyName({
        path,
        name: value,
      })
    );

  const onChangeType = (path: string, type: FieldType) => dispatch(setType({ path, type }));

  const onDeleteObjectClick = (path: string) => dispatch(deleteProperty({ path }));

  const dispatchAddProperty = () =>
    dispatch(
      addProperty({
        pointer: selectedItem.pointer,
        keepSelection: true,
        props: {},
      })
    );

  const onAddPropertyClicked = (event: BaseSyntheticEvent) => {
    event.preventDefault();
    dispatchAddProperty();
  };

  const t = (key: string) => getTranslation(key, language);

  return (
    <div className={classes.root}>
      {fieldNodes.length > 0 && (
        <>
          <div>{t('field_name')}</div>
          <div>{t('type')}</div>
          <div>{t('required')}</div>
          <div>{t('delete')}</div>
        </>
      )}
      {fieldNodes.map((fieldNode) => (
        <PropertyItem
          fullPath={fieldNode.pointer}
          inputId={fieldNode.domId}
          key={fieldNode.pointer}
          language={language}
          onChangeType={onChangeType}
          onChangeValue={onChangePropertyName}
          onDeleteField={onDeleteObjectClick}
          onEnterKeyPress={dispatchAddProperty}
          readOnly={readonly}
          required={fieldNode.isRequired}
          type={fieldNode.fieldType as FieldType}
          value={getNameFromPointer(fieldNode)}
        />
      ))}
      {!readonly && (
        <div className={classes.addButtonCell}>
          <Button
            color={ButtonColor.Secondary}
            icon={<Add />}
            onClick={onAddPropertyClicked}
            variant={ButtonVariant.Outline}
          >
            {t('add_property')}
          </Button>
        </div>
      )}
    </div>
  );
};
