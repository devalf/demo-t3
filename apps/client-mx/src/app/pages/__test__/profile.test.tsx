import { renderApp } from '@demo-t3/utils-ui';
import { generateApiUserData } from '@demo-t3/utils';
import { Container } from 'inversify';
import { FC, PropsWithChildren } from 'react';

import Profile from '../profile';
import {
  createTestContainer,
  createInversifyProviderMock,
} from '../../bootstrap/ioc/test.helpers';
import { DependencyType } from '../../bootstrap/ioc/dependency-type';

describe('Testing Profile', () => {
  let inversifyContainer: Container;
  let InversifyProviderMock: FC<PropsWithChildren>;

  beforeEach(() => {
    inversifyContainer = createTestContainer();
    InversifyProviderMock = createInversifyProviderMock(inversifyContainer);
  });

  it('should render profile page with title', () => {
    inversifyContainer.bind(DependencyType.UserManager).toConstantValue({
      userData: null,
    });

    const { getByText } = renderApp(<Profile />, {
      wrapper: InversifyProviderMock,
    });

    expect(getByText('Profile')).toBeTruthy();
    expect(getByText('Readonly on this development iteration')).toBeTruthy();
  });

  it('should display user data when available', () => {
    const userData = generateApiUserData({ name: 'John Doe', role: 'admin' });

    inversifyContainer.bind(DependencyType.UserManager).toConstantValue({
      userData,
    });

    const { getByDisplayValue, getByText, getByRole } = renderApp(<Profile />, {
      wrapper: InversifyProviderMock,
    });

    expect(getByDisplayValue('John Doe')).toBeTruthy();
    expect(getByDisplayValue('test@example.com')).toBeTruthy();
    expect(getByText('Role: admin')).toBeTruthy();

    const checkbox = getByRole('checkbox') as HTMLInputElement;

    expect(checkbox.checked).toBe(true);
  });

  it('should display empty fields when user data is not available', () => {
    inversifyContainer.bind(DependencyType.UserManager).toConstantValue({
      userData: null,
    });

    const { container, getByText } = renderApp(<Profile />, {
      wrapper: InversifyProviderMock,
    });

    const nameInput = container.querySelector('input[value=""]');

    expect(nameInput).toBeTruthy();
    expect(getByText('Role:')).toBeTruthy();
  });

  it('should show unchecked checkbox when email is not verified', () => {
    const userData = generateApiUserData({ email_verified: false });

    inversifyContainer.bind(DependencyType.UserManager).toConstantValue({
      userData,
    });

    const { getByRole } = renderApp(<Profile />, {
      wrapper: InversifyProviderMock,
    });

    const checkbox = getByRole('checkbox') as HTMLInputElement;

    expect(checkbox.checked).toBe(false);
  });

  it('should have all fields disabled', () => {
    const userData = generateApiUserData();

    inversifyContainer.bind(DependencyType.UserManager).toConstantValue({
      userData,
    });

    const { getByDisplayValue, getByRole } = renderApp(<Profile />, {
      wrapper: InversifyProviderMock,
    });

    const nameInput = getByDisplayValue('Test User') as HTMLInputElement;
    const emailInput = getByDisplayValue(
      'test@example.com'
    ) as HTMLInputElement;
    const checkbox = getByRole('checkbox') as HTMLInputElement;

    expect(nameInput.disabled).toBe(true);
    expect(emailInput.disabled).toBe(true);
    expect(checkbox.disabled).toBe(true);
  });

  it('should display empty name when user name is empty string', () => {
    const userData = generateApiUserData({ name: '' });

    inversifyContainer.bind(DependencyType.UserManager).toConstantValue({
      userData,
    });

    const { container } = renderApp(<Profile />, {
      wrapper: InversifyProviderMock,
    });

    const inputs = container.querySelectorAll('input[type="text"]');
    const nameInput = Array.from(inputs).find(
      (input) => input.getAttribute('value') === ''
    );
    expect(nameInput).toBeTruthy();
  });

  it('should render Email verified label', () => {
    inversifyContainer.bind(DependencyType.UserManager).toConstantValue({
      userData: generateApiUserData({ name: 'Test', email_verified: false }),
    });

    const { getByText } = renderApp(<Profile />, {
      wrapper: InversifyProviderMock,
    });

    expect(getByText('Email verified')).toBeTruthy();
  });
});
