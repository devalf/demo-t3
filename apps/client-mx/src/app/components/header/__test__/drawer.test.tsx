import { renderApp } from '@demo-t3/utils-ui';
import { generateApiUserData } from '@demo-t3/utils';
import { Container } from 'inversify';
import { FC, PropsWithChildren } from 'react';
import { fireEvent, waitFor } from '@testing-library/react';

import { Drawer } from '../drawer';
import {
  createTestContainer,
  createInversifyProviderMock,
} from '../../../bootstrap/ioc/test.helpers';
import { DependencyType } from '../../../bootstrap/ioc/dependency-type';
import { routes } from '../../../constants';

jest.mock('../../../common-hooks', () => ({
  useViewSize: () => ({ isSmall: true }),
}));

describe('Testing Drawer', () => {
  let inversifyContainer: Container;
  let InversifyProviderMock: FC<PropsWithChildren>;

  beforeEach(() => {
    inversifyContainer = createTestContainer();
    InversifyProviderMock = createInversifyProviderMock(inversifyContainer);
  });

  it('should render drawer when open is true', () => {
    const onCloseMock = jest.fn();

    inversifyContainer.bind(DependencyType.UserManager).toConstantValue({
      userData: null,
      logout: jest.fn(),
      isLoading: false,
    });

    inversifyContainer.bind(DependencyType.ModalManager).toConstantValue({
      showModal: jest.fn(),
    });

    const { getByTestId } = renderApp(
      <Drawer open={true} onClose={onCloseMock} />,
      {
        wrapper: InversifyProviderMock,
      }
    );

    expect(getByTestId('mobile_drawer')).toBeTruthy();
  });

  it('should call onClose when close button is clicked', () => {
    const onCloseMock = jest.fn();

    inversifyContainer.bind(DependencyType.UserManager).toConstantValue({
      userData: null,
      logout: jest.fn(),
      isLoading: false,
    });

    inversifyContainer.bind(DependencyType.ModalManager).toConstantValue({
      showModal: jest.fn(),
    });

    const { getByTestId } = renderApp(
      <Drawer open={true} onClose={onCloseMock} />,
      {
        wrapper: InversifyProviderMock,
      }
    );

    const closeButton = getByTestId('mobile_drawer_close_button');

    fireEvent.click(closeButton);

    expect(onCloseMock).toHaveBeenCalled();
  });

  it('should render AuthSection when user is not logged in', () => {
    const onCloseMock = jest.fn();

    inversifyContainer.bind(DependencyType.UserManager).toConstantValue({
      userData: null,
      logout: jest.fn(),
      isLoading: false,
    });

    inversifyContainer.bind(DependencyType.ModalManager).toConstantValue({
      showModal: jest.fn(),
    });

    const { getByTestId } = renderApp(
      <Drawer open={true} onClose={onCloseMock} />,
      {
        wrapper: InversifyProviderMock,
      }
    );

    expect(getByTestId('log_in_btn')).toBeTruthy();
    expect(getByTestId('sign_up_btn')).toBeTruthy();
  });

  it('should render user profile link and logout button when user is logged in', () => {
    const onCloseMock = jest.fn();

    inversifyContainer.bind(DependencyType.UserManager).toConstantValue({
      userData: generateApiUserData(),
      logout: jest.fn(),
    });

    const { getByTestId } = renderApp(
      <Drawer open={true} onClose={onCloseMock} />,
      {
        wrapper: InversifyProviderMock,
      }
    );

    expect(getByTestId('drawer_profile_link')).toBeTruthy();
    expect(getByTestId('drawer_logout_button')).toBeTruthy();
  });

  it('should display user name when available', () => {
    const onCloseMock = jest.fn();
    const userName = 'John Doe';

    inversifyContainer.bind(DependencyType.UserManager).toConstantValue({
      userData: generateApiUserData({
        email: 'john@example.com',
        name: userName,
      }),
      logout: jest.fn(),
    });

    const { getByText } = renderApp(
      <Drawer open={true} onClose={onCloseMock} />,
      {
        wrapper: InversifyProviderMock,
      }
    );

    expect(getByText(userName)).toBeTruthy();
  });

  it('should display "name not set" when user name is not available', () => {
    const onCloseMock = jest.fn();

    inversifyContainer.bind(DependencyType.UserManager).toConstantValue({
      userData: generateApiUserData({ name: '' }),
      logout: jest.fn(),
    });

    const { getByText } = renderApp(
      <Drawer open={true} onClose={onCloseMock} />,
      {
        wrapper: InversifyProviderMock,
      }
    );

    expect(getByText('name not set')).toBeTruthy();
  });

  it('should call logout and onClose when logout button is clicked', async () => {
    const onCloseMock = jest.fn();
    const logoutMock = jest.fn().mockResolvedValue(undefined);

    inversifyContainer.bind(DependencyType.UserManager).toConstantValue({
      userData: generateApiUserData(),
      logout: logoutMock,
    });

    const { getByTestId } = renderApp(
      <Drawer open={true} onClose={onCloseMock} />,
      {
        wrapper: InversifyProviderMock,
      }
    );

    const logoutButton = getByTestId('drawer_logout_button');

    fireEvent.click(logoutButton);

    await waitFor(() => {
      expect(logoutMock).toHaveBeenCalled();
      expect(onCloseMock).toHaveBeenCalled();
    });
  });

  it('should have correct link to profile page', () => {
    const onCloseMock = jest.fn();

    inversifyContainer.bind(DependencyType.UserManager).toConstantValue({
      userData: generateApiUserData(),
      logout: jest.fn(),
    });

    const { getByTestId } = renderApp(
      <Drawer open={true} onClose={onCloseMock} />,
      {
        wrapper: InversifyProviderMock,
      }
    );

    const profileLink = getByTestId('drawer_profile_link');

    expect(profileLink.getAttribute('href')).toBe(routes.profile);
  });

  it('should call onClose when profile link is clicked', () => {
    const onCloseMock = jest.fn();

    inversifyContainer.bind(DependencyType.UserManager).toConstantValue({
      userData: generateApiUserData(),
      logout: jest.fn(),
    });

    const { getByTestId } = renderApp(
      <Drawer open={true} onClose={onCloseMock} />,
      {
        wrapper: InversifyProviderMock,
      }
    );

    const profileLink = getByTestId('drawer_profile_link');

    fireEvent.click(profileLink);

    expect(onCloseMock).toHaveBeenCalled();
  });
});
