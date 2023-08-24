import React, { FC, PropsWithChildren } from 'react';
import { Container } from 'inversify';
import { Provider as InversifyReactProvider } from 'inversify-react';

export const InversifyContext = React.createContext<{
  container: Container | null;
}>({
  container: null,
});

type Props = {
  container: Container;
};

export const Provider: FC<PropsWithChildren<Props>> = (props) => {
  const { container, children } = props;

  return (
    <InversifyContext.Provider value={{ container }}>
      <InversifyReactProvider container={container}>
        {children}
      </InversifyReactProvider>
    </InversifyContext.Provider>
  );
};
