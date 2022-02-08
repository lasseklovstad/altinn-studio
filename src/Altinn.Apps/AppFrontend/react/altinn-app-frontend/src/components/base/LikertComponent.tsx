import {IComponentProps} from "../index";
import * as React from 'react';
import {Typography, TableCell, FormControl, TableContainer, Table, Grid, TableRow} from "@material-ui/core";
import {useAppSelector} from "../../common/hooks";
import {
  AltinnMobileTable,
  AltinnMobileTableItem,
  AltinnTable,
  AltinnTableBody,
  AltinnTableHeader,
  AltinnTableRow,
} from 'altinn-shared/components';
import {StyledRadio} from "./RadioButtonsContainerComponent";

interface ILikertComponentProps extends IComponentProps {
  optionsId: string;
  preselectedOptionIndex: number
}

export const LikertComponent = (props: ILikertComponentProps) => {
  const {text, optionsId, id, dataModelBindings, formData} = props;
  const apiOptions = useAppSelector(state => state.optionState.options[optionsId]);
  const options = apiOptions || [];
  const rows = Object.keys(formData).filter(key => key.includes((dataModelBindings as any).likert.question)).map(key => ({label: formData[key]}))

  const [selected, setSelected] = React.useState<string []>(rows.map(() => ""));

  React.useEffect(() => {
    returnSelected();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options]);

  React.useEffect(() => {
    returnSelected();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.formData?.likertBinding]);

  const returnSelected = () => {
    const answers = Object.keys(formData).filter(key => key.includes((dataModelBindings as any).likert.answer)).map(key => (formData[key]))
    setSelected(answers)
  };

  const onDataChange = (optionValue: string, rowIndex: number) => {
    props.handleFocusUpdate(props.id);
    props.handleDataChange(optionValue, "likert", rowIndex);
    setSelected(selected.map((currentOption, currentRowIndex) => {
      return currentRowIndex === rowIndex ? optionValue : currentOption
    }));
  };

  return <>
    <TableContainer component={Grid}>
      <Table>
        <AltinnTableHeader id={`likert-table-header-${id}`}>
          <AltinnTableRow>
            <TableCell/>
            {options.map((option, index) => {
              const colLabelId = `col-label-${index}`
              return <TableCell key={option.value} id={colLabelId}>{option.label}</TableCell>
            })}
          </AltinnTableRow>
        </AltinnTableHeader>
        <AltinnTableBody id={`likert-table-body-${id}`}>
          {rows.map((row, rowIndex) => {

            const rowLabelId = `row-label-${rowIndex}`
            return <TableRow
              key={row.label}
              role={"radiogroup"}
            >
              <TableCell scope="row" id={rowLabelId}>
                {row.label}
              </TableCell>
              {options.map((option, colIndex) => {
                const colLabelId = `col-label-${colIndex}`
                const inputId = `input-${rowIndex}-${colIndex}`
                return <TableCell key={option.value}>

                  <label htmlFor={inputId}>
                    <StyledRadio
                      inputProps={{
                        "aria-labelledby": `${rowLabelId} ${colLabelId}`,
                        id: inputId,
                        role: "radio",
                        name: rowLabelId
                      }}
                      checked={selected[rowIndex] === option.value}
                      onChange={() => onDataChange(option.value as string, rowIndex)}
                      value={option.value}/>
                  </label>

                </TableCell>
              })}
            </TableRow>

          })}
        </AltinnTableBody>
      </Table>
    </TableContainer>
  </>
}
