import React from 'react';
import { act, screen } from '@testing-library/react';
import type { IPropertyItemProps } from './PropertyItem';
import { PropertyItem } from './PropertyItem';
import { renderWithRedux } from '../../../test/renderWithRedux';
import { FieldType } from '@altinn/schema-model';

// Test data:
const textDeleteField = 'Slett felt';
const textFieldName = 'Navn på felt';
const textRequired = 'Påkrevd';
const textType = 'Type';
const fullPath = 'test';
const inputId = 'some-random-id';
const type = FieldType.String;
const value = '';
const fieldTypeNames = {
  [FieldType.Boolean]: 'Ja/nei',
  [FieldType.Integer]: 'Helt tall',
  [FieldType.Number]: 'Desimaltall',
  [FieldType.Object]: 'Objekt',
  [FieldType.String]: 'Tekst',
};
const mockLanguage = {
  'schema_editor.delete_field': textDeleteField,
  'schema_editor.field_name': textFieldName,
  'schema_editor.required': textRequired,
  'schema_editor.type': textType,
  'schema.editor.number': fieldTypeNames[FieldType.Number],
  'schema_editor.boolean': fieldTypeNames[FieldType.Boolean],
  'schema_editor.integer': fieldTypeNames[FieldType.Integer],
  'schema_editor.object': fieldTypeNames[FieldType.Object],
  'schema_editor.string': fieldTypeNames[FieldType.String],
};
const defaultProps: IPropertyItemProps = {
  fullPath,
  inputId,
  language: mockLanguage,
  onChangeType: jest.fn(),
  onChangeValue: jest.fn(),
  onDeleteField: jest.fn(),
  onEnterKeyPress: jest.fn(),
  type,
  value,
};

const renderPropertyItem = (props?: Partial<IPropertyItemProps>) =>
  renderWithRedux(<PropertyItem {...defaultProps} {...props} />);

test('Text input field appears', () => {
  renderPropertyItem();
  expect(screen.getByRole('textbox')).toBeDefined();
});

test('Text input field has the value given in the "value" prop', () => {
  const inputValue = 'Lorem ipsum';
  renderPropertyItem({ value: inputValue });
  expect(screen.getByRole('textbox')).toHaveValue(inputValue);
});

test('Text input field is not disabled by default', () => {
  renderPropertyItem();
  expect(screen.getByRole('textbox')).not.toBeDisabled();
});

test('Text input field is disabled when the "readOnly" prop is true', () => {
  renderPropertyItem({ readOnly: true });
  expect(screen.getByRole('textbox')).toBeDisabled();
});

test('Text input field is not disabled when the "readOnly" prop is false', () => {
  renderPropertyItem({ readOnly: false });
  expect(screen.getByRole('textbox')).not.toBeDisabled();
});

test('Text input field is correctly labelled', () => {
  renderPropertyItem();
  expect(screen.getByRole('textbox')).toHaveAccessibleName(textFieldName);
});

test('onChangeValue is called on blur when text changes', async () => {
  const onChangeValue = jest.fn();
  const { user } = renderPropertyItem({ onChangeValue });
  await act(() => user.type(screen.getByRole('textbox'), 'test'));
  await act(() => user.tab());
  expect(onChangeValue).toHaveBeenCalledTimes(1);
});

test('onChangeValue is not called when there is no change', async () => {
  const onChangeValue = jest.fn();
  const { user } = renderPropertyItem({ onChangeValue });
  await act(() => user.click(screen.getByRole('textbox')));
  await act(() => user.tab());
  expect(onChangeValue).not.toHaveBeenCalled();
});

test('onEnterKeyPress is called when the Enter key is pressed in the input field', async () => {
  const onEnterKeyPress = jest.fn();
  const { user } = renderPropertyItem({ onEnterKeyPress });
  const textbox = screen.getByRole('textbox');
  await act(() => user.click(textbox));
  await act(() => user.keyboard('{Enter}'));
  expect(onEnterKeyPress).toHaveBeenCalled();
});

test('onEnterKeyPress is not called when another key but Enter is pressed in the input field', async () => {
  const onEnterKeyPress = jest.fn();
  const { user } = renderPropertyItem({ onEnterKeyPress });
  const textbox = screen.getByRole('textbox');
  await act(() => user.click(textbox));
  await act(() => user.keyboard('a'));
  expect(onEnterKeyPress).not.toHaveBeenCalled();
});

test('Name input field has given id', async () => {
  const { container } = renderPropertyItem().renderResult;
  expect(container.querySelector(`#${inputId}`)).toBeDefined();
});

test('Given type is selected', async () => {
  renderPropertyItem();
  expect(screen.getByRole('combobox')).toHaveValue(type);
});

test('onChangeType is called with correct parameters when type changes', async () => {
  const onChangeType = jest.fn();
  const { user } = renderPropertyItem({ onChangeType });
  const newType = FieldType.Integer;
  await act(() => user.click(screen.getByRole('combobox')));
  await act(() => user.click(screen.getByRole('option', { name: fieldTypeNames[newType] })));
  expect(onChangeType).toHaveBeenCalledTimes(1);
  expect(onChangeType).toHaveBeenCalledWith(fullPath, newType);
});

test('"Type" select box is correctly labelled', async () => {
  renderPropertyItem();
  expect(screen.getByRole('combobox')).toHaveAccessibleName(textType);
});

test('"Required" checkbox appears', () => {
  renderPropertyItem();
  expect(screen.getByRole('checkbox')).toBeDefined();
});

test('"Required" checkbox is not checked by default', () => {
  renderPropertyItem();
  expect(screen.getByRole('checkbox')).not.toBeChecked();
});

test('"Required" checkbox is checked when "required" prop is true', () => {
  renderPropertyItem({ required: true });
  expect(screen.getByRole('checkbox')).toBeChecked();
});

test('"Required" checkbox is not checked when "required" prop is false', () => {
  renderPropertyItem({ required: false });
  expect(screen.getByRole('checkbox')).not.toBeChecked();
});

test('"Required" checkbox is enabled by default', () => {
  renderPropertyItem();
  expect(screen.getByRole('checkbox')).toBeEnabled();
});

test('"Required" checkbox is disabled if the "readOnly" prop is true', () => {
  renderPropertyItem({ readOnly: true });
  expect(screen.getByRole('checkbox')).toBeDisabled();
});

test('"Required" checkbox is enabled if the "readOnly" prop is false', () => {
  renderPropertyItem({ readOnly: false });
  expect(screen.getByRole('checkbox')).toBeEnabled();
});

test('"Required" checkbox is correctly labelled', async () => {
  renderPropertyItem();
  expect(screen.queryByText(textRequired)).toBeFalsy();
  expect(screen.getByRole('checkbox')).toHaveAccessibleName(textRequired);
});

test('Delete button appears', () => {
  renderPropertyItem();
  expect(screen.getByRole('button')).toBeDefined();
});

test('onDeleteField is called when the delete button is clicked', async () => {
  const onDeleteField = jest.fn();
  const { user } = renderPropertyItem({ onDeleteField });
  await act(() => user.click(screen.getByRole('button')));
  expect(onDeleteField).toHaveBeenCalledTimes(1);
});

test('Delete button is labelled with the delete text', async () => {
  renderPropertyItem();
  expect(screen.getByRole('button')).toHaveAccessibleName(textDeleteField);
});
