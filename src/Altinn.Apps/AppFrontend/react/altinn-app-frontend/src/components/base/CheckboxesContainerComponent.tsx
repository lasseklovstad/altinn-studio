import React from 'react';
import { FormControlLabel, FormGroup, FormLabel } from '@material-ui/core';
import Checkbox, { CheckboxProps } from '@material-ui/core/Checkbox';
import FormControl from '@material-ui/core/FormControl';
import { makeStyles } from '@material-ui/core/styles';
import cn from 'classnames';

import { renderValidationMessagesForComponent } from '../../utils/render';
import { useAppSelector } from 'src/common/hooks';
import { IComponentProps } from '..';

export interface ICheckboxContainerProps extends IComponentProps {
  validationMessages: any;
  options: any[];
  optionsId: string;
  preselectedOptionIndex?: number;
}

export interface IStyledCheckboxProps extends CheckboxProps {
  label: string;
}

const useStyles = makeStyles((theme) => ({
  root: {
    '&:hover': {
      backgroundColor: 'transparent',
    },
  },
  icon: {
    border: '2px solid #1EAEF7',
    width: 24,
    height: 24,
    backgroundColor: '#ffffff',
    '$root.Mui-focusVisible &': {
      outline: '2px solid #ff0000',
      outlineOffset: 0,
      outlineColor: theme.altinnPalette.primary.blueDark,
    },
    'input:hover ~ &': {
      borderColor: theme.altinnPalette.primary.blueDark,
    },
    'input:disabled ~ &': {
      boxShadow: 'none',
      background: 'rgba(206,217,224,.5)',
    },
  },
  checkedIcon: {
    backgroundColor: '#ffffff',
    '&:before': {
      display: 'block',
      width: 20,
      height: 20,

      backgroundImage:
        "url(\"data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 8'%3E%3Cpath fill='%23000000' d='M6.564.75l-3.59 3.612-1.538-1.55L0 4.26 2.974 7.25 8 2.193z'/%3E%3C/svg%3E\")",
      content: '""',
    },
    'input:hover ~ &': {
      borderColor: theme.altinnPalette.primary.blueDark,
    },
  },
  legend: {
    color: '#000000',
  },
  margin: {
    marginBottom: '1.2rem',
  },
}));

function usePrevious(value) {
  const ref = React.useRef();
  React.useEffect(() => {
    ref.current = value.slice();
  });

  return ref.current;
}

export const CheckboxContainerComponent = ({
  id,
  options,
  optionsId,
  formData,
  preselectedOptionIndex,
  handleDataChange,
  handleFocusUpdate,
  shouldFocus,
  legend,
  getTextResourceAsString,
  getTextResource,
  validationMessages,
}: ICheckboxContainerProps) => {
  const classes = useStyles();
  const apiOptions = useAppSelector(
    (state) => state.optionState.options[optionsId],
  );
  const calculatedOptions = apiOptions || options || [];
  const [selected, setSelected] = React.useState([]);
  const prevSelected: any = usePrevious(selected);
  const checkBoxesIsRow: boolean = calculatedOptions.length <= 2;

  React.useEffect(() => {
    returnState();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [calculatedOptions]);

  React.useEffect(() => {
    returnState();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData?.simpleBinding]);

  const returnState = () => {
    if (
      !formData?.simpleBinding &&
      preselectedOptionIndex >= 0 &&
      calculatedOptions &&
      preselectedOptionIndex < calculatedOptions.length
    ) {
      const preSelected: string[] = [];
      preSelected[preselectedOptionIndex] =
        calculatedOptions[preselectedOptionIndex].value;
      handleDataChange(preSelected[preselectedOptionIndex]);
      setSelected(preSelected);
    } else {
      setSelected(
        formData?.simpleBinding ? formData.simpleBinding.split(',') : [],
      );
    }
  };

  const onDataChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newSelected: any = selected.slice();
    const index = newSelected.indexOf(event.target.name);

    if (index >= 0) {
      newSelected[index] = '';
    } else {
      newSelected.push(event.target.name);
    }
    const filtered = newSelected.filter((element: string) => !!element);
    handleFocusUpdate(id);
    handleDataChange(selectedHasValues(filtered) ? filtered.join() : '');
  };

  const handleOnBlur = () => {
    handleDataChange(formData?.simpleBinding ?? '');
  };

  const selectedHasValues = (select: string[]): boolean => {
    return select.some((element) => element !== '');
  };

  const isOptionSelected = (option: string) => {
    return selected.indexOf(option) > -1;
  };

  const inFocus = (index: number) => {
    let changed: any;
    if (!prevSelected) {
      return false;
    }
    if (prevSelected.length === 0) {
      changed = selected.findIndex((x) => !!x && x !== '');
    } else {
      changed = selected.findIndex((x) => !prevSelected.includes(x));
    }
    if (changed === -1) {
      changed = prevSelected.findIndex((x) => !selected.includes(x));
    }

    if (changed === -1) {
      return false;
    }
    const should = shouldFocus && changed === index;
    return should;
  };

  const RenderLegend = legend;

  return (
    <FormControl key={`checkboxes_control_${id}`} component='fieldset'>
      <FormLabel component='legend' classes={{ root: cn(classes.legend) }}>
        <RenderLegend />
      </FormLabel>
      <FormGroup row={checkBoxesIsRow} id={id} key={`checkboxes_group_${id}`}>
        {calculatedOptions.map((option, index) => (
          <React.Fragment key={option.value}>
            <FormControlLabel
              key={option.value}
              classes={{ root: cn(classes.margin) }}
              control={
                <StyledCheckbox
                  checked={isOptionSelected(option.value)}
                  onChange={onDataChanged}
                  onBlur={handleOnBlur}
                  value={index}
                  key={option.value}
                  name={option.value}
                  autoFocus={inFocus(index)}
                  label={getTextResourceAsString(option.label)}
                />
              }
              label={getTextResource(option.label)}
            />
            {validationMessages &&
              isOptionSelected(option.value) &&
              renderValidationMessagesForComponent(
                validationMessages.simpleBinding,
                id,
              )}
          </React.Fragment>
        ))}
      </FormGroup>
    </FormControl>
  );
};

const StyledCheckbox = ({ label, ...rest }: IStyledCheckboxProps) => {
  const classes = useStyles();

  return (
    <Checkbox
      className={classes.root}
      disableRipple={true}
      color='default'
      checkedIcon={<span className={cn(classes.icon, classes.checkedIcon)} />}
      icon={<span className={classes.icon} />}
      inputProps={{ 'aria-label': label }}
      {...rest}
    />
  );
};
