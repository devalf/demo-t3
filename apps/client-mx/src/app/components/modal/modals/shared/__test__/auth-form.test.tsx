import { renderApp } from '@demo-t3/utils-ui';
import { Container } from 'inversify';
import { FC, PropsWithChildren } from 'react';
import { fireEvent, waitFor } from '@testing-library/react';

import { AuthForm } from '../auth-form';
import {
  createTestContainer,
  createInversifyProviderMock,
} from '../../../../../bootstrap/ioc/test.helpers';
import { DependencyType } from '../../../../../bootstrap/ioc/dependency-type';

describe('Testing AuthForm', () => {
  let inversifyContainer: Container;
  let InversifyProviderMock: FC<PropsWithChildren>;

  beforeEach(() => {
    inversifyContainer = createTestContainer();
    InversifyProviderMock = createInversifyProviderMock(inversifyContainer);
  });

  it('should render form with title and button text', () => {
    const { getByText, getByTestId } = renderApp(
      <AuthForm
        title="Login"
        buttonText="Sign In"
        onSubmit={jest.fn()}
        testIdPrefix="login"
      />,
      {
        wrapper: InversifyProviderMock,
      }
    );

    expect(getByText('Login')).toBeTruthy();
    expect(getByText('Sign In')).toBeTruthy();
    expect(getByTestId('login_email_input')).toBeTruthy();
    expect(getByTestId('login_password_input')).toBeTruthy();
  });

  it('should render name field when showNameField is true', () => {
    const { getByTestId } = renderApp(
      <AuthForm
        title="Sign Up"
        buttonText="Create Account"
        onSubmit={jest.fn()}
        testIdPrefix="signup"
        showNameField={true}
      />,
      {
        wrapper: InversifyProviderMock,
      }
    );

    expect(getByTestId('signup_name_input')).toBeTruthy();
  });

  it('should not render name field when showNameField is false', () => {
    const { queryByTestId } = renderApp(
      <AuthForm
        title="Login"
        buttonText="Sign In"
        onSubmit={jest.fn()}
        testIdPrefix="login"
        showNameField={false}
      />,
      {
        wrapper: InversifyProviderMock,
      }
    );

    expect(queryByTestId('login_name_input')).toBeNull();
  });

  it('should show validation error for invalid email', async () => {
    const { getByTestId, getByText } = renderApp(
      <AuthForm
        title="Login"
        buttonText="Sign In"
        onSubmit={jest.fn()}
        testIdPrefix="login"
      />,
      {
        wrapper: InversifyProviderMock,
      }
    );

    const emailInput = getByTestId('login_email_input').querySelector('input');

    expect(emailInput).not.toBeNull();

    if (!emailInput) return;

    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.blur(emailInput);

    await waitFor(() => {
      expect(getByText('Invalid email format')).toBeTruthy();
    });
  });

  it('should show validation error for empty email', async () => {
    const { getByTestId, getByText } = renderApp(
      <AuthForm
        title="Login"
        buttonText="Sign In"
        onSubmit={jest.fn()}
        testIdPrefix="login"
      />,
      {
        wrapper: InversifyProviderMock,
      }
    );

    const emailInput = getByTestId('login_email_input').querySelector('input');

    expect(emailInput).not.toBeNull();

    if (!emailInput) return;

    fireEvent.focus(emailInput);
    fireEvent.blur(emailInput);

    await waitFor(() => {
      expect(getByText('Email is required')).toBeTruthy();
    });
  });

  it('should show validation error for short password', async () => {
    const { getByTestId, getByText } = renderApp(
      <AuthForm
        title="Login"
        buttonText="Sign In"
        onSubmit={jest.fn()}
        testIdPrefix="login"
      />,
      {
        wrapper: InversifyProviderMock,
      }
    );

    const passwordInput = getByTestId('login_password_input').querySelector(
      'input'
    );

    expect(passwordInput).not.toBeNull();

    if (!passwordInput) return;

    fireEvent.change(passwordInput, { target: { value: 'short' } });
    fireEvent.blur(passwordInput);

    await waitFor(() => {
      expect(getByText('Password must be at least 8 characters')).toBeTruthy();
    });
  });

  it('should show validation error for empty password', async () => {
    const { getByTestId, getByText } = renderApp(
      <AuthForm
        title="Login"
        buttonText="Sign In"
        onSubmit={jest.fn()}
        testIdPrefix="login"
      />,
      {
        wrapper: InversifyProviderMock,
      }
    );

    const passwordInput = getByTestId('login_password_input').querySelector(
      'input'
    );

    expect(passwordInput).not.toBeNull();

    if (!passwordInput) return;

    fireEvent.focus(passwordInput);
    fireEvent.blur(passwordInput);

    await waitFor(() => {
      expect(getByText('Password is required')).toBeTruthy();
    });
  });

  it('should call onSubmit with email and password when form is valid', async () => {
    const onSubmitMock = jest.fn().mockResolvedValue(undefined);

    const { getByTestId } = renderApp(
      <AuthForm
        title="Login"
        buttonText="Sign In"
        onSubmit={onSubmitMock}
        testIdPrefix="login"
      />,
      {
        wrapper: InversifyProviderMock,
      }
    );

    const emailInput = getByTestId('login_email_input').querySelector('input');
    const passwordInput = getByTestId('login_password_input').querySelector(
      'input'
    );
    const submitButton = getByTestId('login_submit_button');

    expect(emailInput).not.toBeNull();
    expect(passwordInput).not.toBeNull();

    if (!emailInput || !passwordInput) return;

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(onSubmitMock).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });
  });

  it('should call onSubmit with name when showNameField is true and name is provided', async () => {
    const onSubmitMock = jest.fn().mockResolvedValue(undefined);

    const { getByTestId } = renderApp(
      <AuthForm
        title="Sign Up"
        buttonText="Create Account"
        onSubmit={onSubmitMock}
        testIdPrefix="signup"
        showNameField={true}
      />,
      {
        wrapper: InversifyProviderMock,
      }
    );

    const emailInput = getByTestId('signup_email_input').querySelector('input');
    const nameInput = getByTestId('signup_name_input').querySelector('input');
    const passwordInput = getByTestId('signup_password_input').querySelector(
      'input'
    );
    const submitButton = getByTestId('login_submit_button');

    expect(emailInput).not.toBeNull();
    expect(nameInput).not.toBeNull();
    expect(passwordInput).not.toBeNull();

    if (!emailInput || !nameInput || !passwordInput) return;

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(onSubmitMock).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
        name: 'John Doe',
      });
    });
  });

  it('should not include name in onSubmit when showNameField is true but name is empty', async () => {
    const onSubmitMock = jest.fn().mockResolvedValue(undefined);

    const { getByTestId } = renderApp(
      <AuthForm
        title="Sign Up"
        buttonText="Create Account"
        onSubmit={onSubmitMock}
        testIdPrefix="signup"
        showNameField={true}
      />,
      {
        wrapper: InversifyProviderMock,
      }
    );

    const emailInput = getByTestId('signup_email_input').querySelector('input');
    const passwordInput = getByTestId('signup_password_input').querySelector(
      'input'
    );
    const submitButton = getByTestId('login_submit_button');

    expect(emailInput).not.toBeNull();
    expect(passwordInput).not.toBeNull();

    if (!emailInput || !passwordInput) return;

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(onSubmitMock).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });
  });

  it('should show toast error when onSubmit throws an error', async () => {
    const showToastMock = jest.fn();
    const errorMessage = 'Login failed';

    inversifyContainer.rebind(DependencyType.ToastManager).toConstantValue({
      showToast: showToastMock,
    });

    const onSubmitMock = jest.fn().mockRejectedValue(new Error(errorMessage));

    const { getByTestId } = renderApp(
      <AuthForm
        title="Login"
        buttonText="Sign In"
        onSubmit={onSubmitMock}
        testIdPrefix="login"
      />,
      {
        wrapper: InversifyProviderMock,
      }
    );

    const emailInput = getByTestId('login_email_input').querySelector('input');
    const passwordInput = getByTestId('login_password_input').querySelector(
      'input'
    );
    const submitButton = getByTestId('login_submit_button');

    expect(emailInput).not.toBeNull();
    expect(passwordInput).not.toBeNull();

    if (!emailInput || !passwordInput) return;

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(showToastMock).toHaveBeenCalledWith({
        message: errorMessage,
        variant: 'error',
      });
    });
  });

  it('should not call onSubmit when form is invalid', async () => {
    const onSubmitMock = jest.fn();

    const { getByTestId } = renderApp(
      <AuthForm
        title="Login"
        buttonText="Sign In"
        onSubmit={onSubmitMock}
        testIdPrefix="login"
      />,
      {
        wrapper: InversifyProviderMock,
      }
    );

    const submitButton = getByTestId('login_submit_button');

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(onSubmitMock).not.toHaveBeenCalled();
    });
  });

  it('should update email field value on change', () => {
    const { getByTestId } = renderApp(
      <AuthForm
        title="Login"
        buttonText="Sign In"
        onSubmit={jest.fn()}
        testIdPrefix="login"
      />,
      {
        wrapper: InversifyProviderMock,
      }
    );

    const emailInput = getByTestId('login_email_input').querySelector('input');

    expect(emailInput).not.toBeNull();

    if (!emailInput) return;

    fireEvent.change(emailInput, { target: { value: 'new@email.com' } });

    expect(emailInput.value).toBe('new@email.com');
  });

  it('should update password field value on change', () => {
    const { getByTestId } = renderApp(
      <AuthForm
        title="Login"
        buttonText="Sign In"
        onSubmit={jest.fn()}
        testIdPrefix="login"
      />,
      {
        wrapper: InversifyProviderMock,
      }
    );

    const passwordInput = getByTestId('login_password_input').querySelector(
      'input'
    );

    expect(passwordInput).not.toBeNull();

    if (!passwordInput) return;

    fireEvent.change(passwordInput, { target: { value: 'newpassword' } });

    expect(passwordInput.value).toBe('newpassword');
  });
});
