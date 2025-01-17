import React from 'react';
import { act, screen, waitFor, waitForElementToBeRemoved } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { handlers, renderWithProviders, rest, setupServer } from '../../dashboardTestUtils';

import { SelectedContextType } from 'app-shared/navigation/main-header/Header';
import { CreateService } from './CreateService';
import { orgsListPath, createRepoPath } from 'app-shared/api-paths';

const server = setupServer(...handlers);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const render = () => {
  renderWithProviders(<CreateService />, {
    preloadedState: {
      language: {
        language: {},
      },
      dashboard: {
        services: [],
        selectedContext: SelectedContextType.Self,
        repoRowsPerPage: 5,
        user: {
          id: 1,
          avatar_url: 'avatar_url',
          email: 'email',
          full_name: 'user_full_name',
          login: 'user_login',
        },
      },
    },
  });
};

describe('CreateService', () => {
  it('should show error messages when clicking create and no owner or name is filled in', async () => {
    const user = userEvent.setup();
    render();

    await waitForElementToBeRemoved(() => screen.getByText('dashboard.loading'));
    const createBtn = await screen.findByText('dashboard.create_service_btn');
    await act(() => user.click(createBtn));

    const emptyFieldErrors = await screen.findAllByText('dashboard.field_cannot_be_empty');
    expect(emptyFieldErrors.length).toBe(2);
  });

  it('should prefill owner when there are no available orgs, and the only available user is the logged in user', async () => {
    server.use(
      rest.get(orgsListPath(), async (req, res, ctx) => {
        return res(ctx.json([]));
      })
    );

    render();

    await waitForElementToBeRemoved(() => screen.getByText('dashboard.loading'));

    await waitFor(() => {
      expect(screen.getByRole('combobox')).toBeInTheDocument();
      expect(screen.getByRole('combobox')).toBeDisabled();
      expect(screen.getByRole('combobox')).toHaveTextContent('user_full_name');
    });
  });

  it('should show error message that app name is too long when it exceeds max length', async () => {
    const user = userEvent.setup();
    render();

    await waitForElementToBeRemoved(() => screen.getByText('dashboard.loading'));

    await act(() => user.click(screen.getByRole('option', { name: /user_full_name/i })));
    await act(() => user.type(screen.getByRole('textbox'), 'this-app-name-is-longer-than-max'));

    const createBtn = await screen.findByText('dashboard.create_service_btn');
    await act(() => user.click(createBtn));

    const emptyFieldErrors = await screen.findAllByText('dashboard.service_name_is_too_long');
    expect(emptyFieldErrors.length).toBe(1);
  });

  it('should show error message that app name is invalid when it contains invalid characters', async () => {
    const user = userEvent.setup();
    render();

    await waitForElementToBeRemoved(() => screen.getByText('dashboard.loading'));

    await act(() => user.click(screen.getByRole('option', { name: /user_full_name/i })));
    await act(() => user.type(screen.getByRole('textbox'), 'datamodels'));

    const createBtn = await screen.findByText('dashboard.create_service_btn');
    await act(() => user.click(createBtn));

    const emptyFieldErrors = await screen.findAllByText(
      'dashboard.service_name_has_illegal_characters'
    );
    expect(emptyFieldErrors.length).toBe(1);
  });

  it('should show error message that app already exists when trying to create an app with a name that already exists', async () => {
    const user = userEvent.setup();
    server.use(
      rest.post(createRepoPath(), async (req, res, ctx) => {
        const org = req.url.searchParams.get('user_login')
        const repoName = req.url.searchParams.get('this-app-name-exists')
        return res(ctx.status(409), ctx.json({ org, repoName }));
      })
    );

    render();

    await waitForElementToBeRemoved(() => screen.getByText('dashboard.loading'));

    await act(() => user.click(screen.getByRole('option', { name: /user_full_name/i })));
    await act(() => user.type(screen.getByRole('textbox'), 'this-app-name-exists'));

    const createBtn = await screen.findByText('dashboard.create_service_btn');
    await act(() => user.click(createBtn));

    const emptyFieldErrors = await screen.findAllByText('dashboard.app_already_exist');
    expect(emptyFieldErrors.length).toBe(1);
  });

  it('should show generic error message that app already exists when trying to create an app and something unknown went wrong', async () => {
    const user = userEvent.setup();
    server.use(
      rest.post(createRepoPath(), async (req, res, ctx) => {
        const org = req.url.searchParams.get('user_login')
        const repoName = req.url.searchParams.get('new-app')
        return res(ctx.status(500), ctx.json({ org, repoName }));
      })
    );

    render();

    await waitForElementToBeRemoved(() => screen.getByText('dashboard.loading'));

    await act(() => user.click(screen.getByRole('option', { name: /user_full_name/i })));
    await act(() => user.type(screen.getByRole('textbox'), 'new-app'));

    const createBtn = await screen.findByText('dashboard.create_service_btn');
    await act(() => user.click(createBtn));

    const emptyFieldErrors = await screen.findAllByText('dashboard.error_when_creating_app');
    expect(emptyFieldErrors.length).toBe(1);
  });
});
