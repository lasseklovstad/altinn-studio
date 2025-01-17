import { renderWithRedux } from '../../../test/renderWithRedux';
import type { IItemDataComponentProps } from './ItemDataComponent';
import { ItemDataComponent } from './ItemDataComponent';
import {
  CombinationKind,
  createChildNode,
  createNodeBase,
  FieldType,
  Keywords,
  ObjectKind,
} from '@altinn/schema-model';
import React from 'react';
import { act, screen } from '@testing-library/react';

const mockLanguage = {
  'schema_editor.description': 'Description',
  'schema_editor.descriptive_fields': 'Descriptive fields',
  'schema_editor.go_to_type': 'Go to type',
  'schema_editor.multiple_answers': 'Multiple answers',
  'schema_editor.name': 'Name',
  'schema_editor.nullable': 'Nullable',
  'schema_editor.reference_to': 'Reference to',
  'schema_editor.title': 'Title',
  'schema_editor.type': 'Type',
};

const parentNode = createNodeBase(Keywords.Properties, 'test');
parentNode.objectKind = ObjectKind.Combination;
parentNode.fieldType = CombinationKind.AnyOf;
const uiSchemaNodes = [parentNode];
['Donald', 'Dolly'].forEach((childNodeName) => {
  const childNode = createChildNode(parentNode, childNodeName, false);
  childNode.fieldType = FieldType.String;
  parentNode.children.push(childNode.pointer);
  uiSchemaNodes.push(childNode);
});
const anotherNode = createNodeBase(Keywords.Properties, 'can be toggled');
anotherNode.objectKind = ObjectKind.Field;
anotherNode.fieldType = FieldType.String;
uiSchemaNodes.push(anotherNode);
const renderItemDataComponent = (
  props?: Partial<IItemDataComponentProps>,
  selectedItemIndex?: number
) => {
  return renderWithRedux(
    <ItemDataComponent
      language={mockLanguage}
      {...uiSchemaNodes[selectedItemIndex ?? 0]}
      {...props}
    />,
    { uiSchema: uiSchemaNodes }
  );
};

test('"Multiple answers" checkbox should appear if selected item is field', () => {
  const { renderResult } = renderItemDataComponent({}, 1);
  expect(
    renderResult.container.querySelector('input[name="checkedMultipleAnswers"]')
  ).toBeDefined();
});

test('"Multiple answers" checkbox should not appear if selected item is combination', () => {
  const { renderResult } = renderItemDataComponent({}, 0);
  expect(renderResult.container.querySelector('input[name="checkedMultipleAnswers"]')).toBeNull();
});

test('setType is called when "multiple answers" checkbox is checked', async () => {
  const { store, user, renderResult } = renderItemDataComponent({}, 3);
  const checkbox = renderResult.container.querySelector('input[name="checkedMultipleAnswers"]');
  if (checkbox === null) fail();
  await act(() => user.click(checkbox));
  expect(
    store.getActions().some(({ type }) => type === 'schemaEditor/toggleArrayField')
  ).toBeTruthy();
});

test('"Nullable" checkbox should appear if selected item is combination', () => {
  const { renderResult } = renderItemDataComponent({}, 0);
  expect(renderResult.container.querySelector('input[name="checkedNullable"]')).toBeDefined();
});

test('"Nullable" checkbox should not appear if selected item is not combination', () => {
  const { renderResult } = renderItemDataComponent({}, 1);
  expect(renderResult.container.querySelector('input[name="checkedNullable"]')).toBeNull();
});

test('addCombinationItem is called when "nullable" checkbox is checked', async () => {
  const { store, user, renderResult } = renderItemDataComponent({}, 0);
  const checkbox = renderResult.container.querySelector('input[name="checkedNullable"]');
  if (checkbox === null) fail();
  await act(() => user.click(checkbox));
  expect(
    store.getActions().some(({ type }) => type === 'schemaEditor/addCombinationItem')
  ).toBeTruthy();
});

test('"Title" field appears', () => {
  renderItemDataComponent();
  expect(screen.getByLabelText(mockLanguage['schema_editor.title'])).toBeDefined();
});

test('setTitle action is called with correct payload when the "title" field loses focus', async () => {
  const { store, user } = renderItemDataComponent();
  const inputField = screen.getByLabelText(mockLanguage['schema_editor.title']);
  await act(() => user.type(inputField, 'Lorem ipsum'));
  await act(() => user.tab());
  const setTitleActions = store.getActions().filter(({ type }) => type === 'schemaEditor/setTitle');
  expect(setTitleActions).toHaveLength(1);
  expect(setTitleActions[0].payload.title).toEqual('Lorem ipsum');
});

test('"Description" text area appears', () => {
  renderItemDataComponent();
  expect(screen.getByLabelText(mockLanguage['schema_editor.description'])).toBeDefined();
});

test('setDescription action is called with correct payload when the "description" text area loses focus', async () => {
  const { store, user } = renderItemDataComponent();
  const textArea = screen.getByLabelText(mockLanguage['schema_editor.description']);
  await act(() => user.type(textArea, 'Lorem ipsum dolor sit amet.'));
  await act(() => user.tab());
  const setDescriptionActions = store
    .getActions()
    .filter(({ type }) => type === 'schemaEditor/setDescription');
  expect(setDescriptionActions).toHaveLength(1);
  expect(setDescriptionActions[0].payload.description).toEqual('Lorem ipsum dolor sit amet.');
});
