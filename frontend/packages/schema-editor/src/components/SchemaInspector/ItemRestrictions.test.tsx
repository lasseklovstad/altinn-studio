import React from 'react';
import { act, screen } from '@testing-library/react';
import { renderWithRedux } from '../../../test/renderWithRedux';
import type { ItemRestrictionsProps } from './ItemRestrictions';
import { ItemRestrictions } from './ItemRestrictions';
import type { UiSchemaNode } from '@altinn/schema-model';
import {
  CombinationKind,
  createNodeBase,
  FieldType,
  Keywords,
  ObjectKind,
} from '@altinn/schema-model';

// Test data:
const mockLanguage = {
  'schema_editor.enum_legend': 'Liste med gyldige verdier',
};
const mockSelectedNode = createNodeBase(Keywords.Properties, 'test');
const defaultProps: ItemRestrictionsProps = {
  language: mockLanguage,
  ...mockSelectedNode,
};

test('item restrictions require checkbox to work', async () => {
  const selectedNode = createNode({ fieldType: FieldType.String });
  const { user, store } = renderItemRestrictions(selectedNode);
  await act(() => user.click(screen.getByRole('checkbox')));
  const action = store.getActions().pop();
  expect(action.type).toBe('schemaEditor/setRequired');
  expect(action.payload.required).toBeTruthy();
});

test('item restrictions tab require checkbox to decheck', async () => {
  const selectedNode = createNode({ fieldType: FieldType.String, isRequired: true });
  const { user, store } = renderItemRestrictions(selectedNode);
  await act(() => user.click(screen.getByRole('checkbox')));
  const action = store.getActions().pop();
  expect(action.type).toBe('schemaEditor/setRequired');
  expect(action.payload.required).toBeFalsy();
});

test('Enum list should only appear for strings and numbers, as well as arrays of those', () => {
  (Object.values(FieldType) as (FieldType | CombinationKind)[])
    .concat(Object.values(CombinationKind))
    .forEach((fieldType) => {
      const primitiveProps = { ...createNode({ fieldType }) };
      const arrayProps = {
        ...createNode({
          isArray: true,
          fieldType,
          objectKind: ObjectKind.Field,
          pointer: 'arraytest',
        }),
      };
      for (const props of [primitiveProps, arrayProps]) {
        const { renderResult } = renderItemRestrictions(props);
        switch (fieldType) {
          case FieldType.String:
          case FieldType.Number:
          case FieldType.Integer:
            expect(screen.getByText(mockLanguage['schema_editor.enum_legend'])).toBeDefined();
            break;
          default:
            expect(screen.queryByText(mockLanguage['schema_editor.enum_legend'])).toBeFalsy();
        }
        renderResult.unmount();
      }
    });
});

const renderItemRestrictions = (props?: Partial<ItemRestrictionsProps>) =>
  renderWithRedux(<ItemRestrictions {...defaultProps} {...props} />);

const createNode = (props: Partial<UiSchemaNode>): UiSchemaNode => ({
  ...mockSelectedNode,
  ...props,
});
