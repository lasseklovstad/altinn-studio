import { IComponentProps } from '../index';
import * as React from 'react';
import {
  Accordion,
  TableCell,
  TableRow,
  useMediaQuery,
  RadioGroup,
  FormControlLabel,
  AccordionSummary,
  AccordionDetails,
} from '@material-ui/core';
import { useAppSelector } from '../../common/hooks';
import {
  AltinnTable,
  AltinnTableBody,
  AltinnTableHeader,
  AltinnTableRow,
} from 'altinn-shared/components';
import { StyledRadio } from './RadioButtonsContainerComponent';
import { useState, useEffect } from 'react';
import { renderValidationMessagesForComponent } from '../../utils/render';

interface ILikertComponentProps extends IComponentProps {
  componentValidations?: any;
  optionsId: string;
  preselectedOptionIndex: number;
}

export const LikertComponent = (props: ILikertComponentProps) => {
  const {
    text,
    optionsId,
    id,
    dataModelBindings,
    formData,
    componentValidations,
    getTextResource
  } = props;
  const apiOptions = useAppSelector(
    (state) => state.optionState.options[optionsId],
  );
  const options = apiOptions || [];
  const rows = Object.keys(formData)
    .filter((key) => key.includes((dataModelBindings as any).likert.question))
    .map((key) => ({ label: formData[key] }));

  const mobileView = useMediaQuery('(max-width:992px)'); // breakpoint on altinn-modal
  const [expandedRows, setExpandedRows] = useState([0]);
  const [invalidatedRows, setInvalidatedRows] = useState([]);
  useEffect(() => {
    if (componentValidations && Object.keys(componentValidations).length > 0) {
      const invalidatedRows = Object.keys(componentValidations).map(key =>
        parseInt(new RegExp(`${(dataModelBindings as any).likert.list}\\[(\\d+).*`).exec(key)[1]));
      setExpandedRows(invalidatedRows);
      setInvalidatedRows(invalidatedRows);
    }
  }, [componentValidations]);

  const [selected, setSelected] = React.useState<string[]>(rows.map(() => ''));

  React.useEffect(() => {
    returnSelected();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options]);

  React.useEffect(() => {
    returnSelected();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.formData?.likertBinding]);

  const returnSelected = () => {
    const answers = Object.keys(formData)
      .filter((key) => key.includes((dataModelBindings as any).likert.answer))
      .map((key) => formData[key]);
    setSelected(answers);
  };

  const onDataChange = (optionValue: string, rowIndex: number) => {
    setExpandedRows(
      expandedRows.filter((value) => value != rowIndex).concat([rowIndex + 1]),
    );
    setInvalidatedRows(invalidatedRows.filter((row) => row != rowIndex));
    props.handleFocusUpdate(props.id);
    props.handleDataChange(optionValue, 'likert', rowIndex);
    setSelected(
      selected.map((currentOption, currentRowIndex) => {
        return currentRowIndex === rowIndex ? optionValue : currentOption;
      }),
    );
  };

  return (
    <>
      {!mobileView && (
        <React.Fragment>
        <AltinnTable id={id} tableLayout='auto' wordBreak='normal'>
          <AltinnTableHeader id={`likert-table-header-${id}`}>
            <AltinnTableRow>
              <TableCell />
              {options.map((option, index) => {
                const colLabelId = `col-label-${index}`;
                return (
                  <TableCell key={option.value} id={colLabelId} align='center'>
                    {getTextResource(option.label)}
                  </TableCell>
                );
              })}
            </AltinnTableRow>
          </AltinnTableHeader>
          <AltinnTableBody id={`likert-table-body-${id}`}>
            {rows.map((row, rowIndex) => {
              const rowLabelId = `row-label-${rowIndex}`;
              return (
                <TableRow key={row.label} role={'radiogroup'}>
                  <TableCell
                    scope='row'
                    id={rowLabelId}
                    style={{ whiteSpace: 'normal' }}
                  >
                    {getTextResource(row.label)}
                  </TableCell>
                  {options.map((option, colIndex) => {
                    const colLabelId = `col-label-${colIndex}`;
                    const inputId = `input-${rowIndex}-${colIndex}`;
                    return (
                      <TableCell key={option.value}>
                        <label
                          htmlFor={inputId}
                          style={{
                            width: '100%',
                            display: 'flex',
                            justifyContent: 'center',
                          }}
                        >
                          <StyledRadio
                            inputProps={{
                              'aria-labelledby': `${rowLabelId} ${colLabelId}`,
                              id: inputId,
                              role: 'radio',
                              name: rowLabelId,
                            }}
                            checked={selected[rowIndex] === option.value}
                            onChange={() =>
                              onDataChange(option.value as string, rowIndex)
                            }
                            value={option.value}
                          />
                        </label>
                      </TableCell>
                    );
                  })}
                </TableRow>
              );
            })}
          </AltinnTableBody>
        </AltinnTable>
        {invalidatedRows.length > 0 &&  renderValidationMessagesForComponent(
                  {errors: ['HEIHEIHEI, ro ned nå! Tror du virkelig at du har fylt ut alt nå???'], warnings: []},
                  `${id}-error`,
                )}
        </React.Fragment>
      )}
      {mobileView && (
        <div id='yolo-accordiong'>
          {rows.map((row, rowIndex) => {
            const radioButtonGroup = (
              <React.Fragment key={rowIndex}>
                <Accordion
                  key={rowIndex}
                  expanded={expandedRows.includes(rowIndex)}
                  onChange={() => {
                    if (expandedRows.includes(rowIndex))
                      setExpandedRows(
                        expandedRows.filter((value) => value != rowIndex),
                      );
                    else setExpandedRows([...expandedRows, rowIndex]);
                  }}
                >
                  <AccordionSummary>{getTextResource(row.label)}</AccordionSummary>
                  <AccordionDetails>
                    <RadioGroup
                      aria-labelledby={`${id}-label-${rowIndex}`}
                      name={`${id}-${rowIndex}`}
                      value={selected[rowIndex]}
                      onBlur={null}
                      onChange={(ev) =>
                        onDataChange(ev.target.value as string, rowIndex)
                      }
                      row={false}
                      id={id}
                    >
                      {options.map((option: any, index: number) => (
                        <React.Fragment key={index}>
                          <FormControlLabel
                            control={<StyledRadio autoFocus={false} />}
                            label={getTextResource(option.label)}
                            value={option.value}
                            classes={null}
                          />
                        </React.Fragment>
                      ))}
                    </RadioGroup>
                  </AccordionDetails>
                </Accordion>
                {invalidatedRows.includes(rowIndex) &&  renderValidationMessagesForComponent(
                  {errors: ['heihei, dette er feil'], warnings: []},
                  `${rowIndex}`,
                )}
              </React.Fragment>
            );

            return radioButtonGroup;
          })}
        </div>
      )}
    </>
  );
};
