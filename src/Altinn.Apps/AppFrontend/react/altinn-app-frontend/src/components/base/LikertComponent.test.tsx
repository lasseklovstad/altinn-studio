import React from 'react';
import userEvent from '@testing-library/user-event';
import { screen, within } from '@testing-library/react';

import { renderWithProviders } from '../../../testUtils';

import { LikertComponent } from './LikertComponent';
import type { IComponentProps } from 'src/components';
import type { ILikertComponentProps } from './LikertComponent';

const render = (props: Partial<ILikertComponentProps> = {}) => {
  const allProps: ILikertComponentProps = {
    id: 'LikertID',
    optionsId: 'trivsel',
    preselectedOptionIndex: undefined,
    dataModelBindings: {
      likert: {
        list: 'LikertList',
        question: 'question',
        answer: 'answer',
      },
    },
    formData: {
      'LikertList[0].question': 'Hvordan trives du på skolen?',
      'LikertList[1].question': 'Har du det bra?',
      'LikertList[2].question': 'Hvor god er du i matte?',
      'LikertList[0].answer': '',
      'LikertList[1].answer': '',
      'LikertList[2].answer': '',
    },
    handleDataChange: jest.fn(),
    handleFocusUpdate: jest.fn(),
    getTextResource: (value) => value,
    ...({} as IComponentProps),
    ...props,
  };

  const trivsel = [
    {
      label: 'Bra',
      value: 'bra',
    },
    {
      label: 'Ok',
      value: 'ok',
    },
    {
      label: 'Dårlig',
      value: 'dårlig',
    },
  ];

  renderWithProviders(<LikertComponent {...allProps} />, {
    preloadedState: {
      optionState: {
        options: {
          trivsel: {
            id: 'trivsel',
            options: trivsel,
          },
        },
        error: {
          name: '',
          message: '',
        },
      },
    },
  });
};

describe('LikertComponent', () => {
  it('should render standard view and click radiobuttons', () => {
    const handleChange = jest.fn();
    render({
      handleDataChange: handleChange,
    });

    screen.getByRole('table');
    screen.getByRole('columnheader', {
      name: /Bra/i,
    });
    const rad1 = screen.getByRole('radiogroup', {
      name: /Hvordan trives du på skolen/i,
    });
    const btn1 = within(rad1).getByRole('radio', {
      name: /Bra/i,
    });

    const rad2 = screen.getByRole('radiogroup', {
      name: /Har du det bra/i,
    });

    const btn2 = within(rad2).getByRole('radio', {
      name: /Dårlig/i,
    });

    expect(btn1).not.toBeChecked();
    userEvent.click(btn1);
    expect(btn1).toBeChecked();

    expect(btn2).not.toBeChecked();
    userEvent.click(btn2);
    expect(btn2).toBeChecked();

    expect(handleChange).toHaveBeenCalled();
  });

  it('should render standard view and use keyboard to navigate', async () => {
    const handleChange = jest.fn();
    render({
      handleDataChange: handleChange,
    });

    userEvent.tab();
    userEvent.keyboard('[Space]');

    const rad1 = screen.getByRole('radiogroup', {
      name: /Hvordan trives du på skolen/i,
    });
    const btn1 = within(rad1).getByRole('radio', {
      name: /Bra/i,
    });
    expect(btn1).toBeChecked();
  });
});
