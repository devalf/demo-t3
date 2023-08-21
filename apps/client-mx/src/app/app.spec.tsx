import { render } from '@testing-library/react';

import App from './app';

describe('App', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<App />);

    expect(baseElement).toBeTruthy();
  });

  it('should have a greeting as the title', () => {
    const { getByTestId } = render(<App />);

    const linkToHomeElement = getByTestId('link_to_home');

    expect(linkToHomeElement).toBeTruthy();
    expect(linkToHomeElement.textContent).toEqual('Home');
  });
});
