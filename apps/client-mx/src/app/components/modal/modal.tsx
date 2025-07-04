import React, { FC } from 'react';
import { observer } from 'mobx-react-lite';
import { useInjection } from 'inversify-react';

import { IModalManager } from '../../store/interfaces';
import { DependencyType } from '../../bootstrap/ioc/dependency-type';

import { ModalContainer } from './modal-container';
import { LoginInModal, SignUpModal } from './modals';

type ModalComponentProps = {
  payload?: unknown;
  onClose: () => void;
};

export type ModalID = 'LOGIN_MODAL' | 'SIGNUP_MODAL';

const MODAL_TEMPLATES: Record<ModalID, FC<ModalComponentProps>> = {
  LOGIN_MODAL: LoginInModal,
  SIGNUP_MODAL: SignUpModal,
};

export const Modal = observer(() => {
  const { isOpen, modalProps, closeModal, modalTemplate } =
    useInjection<IModalManager>(DependencyType.ModalManager);

  if (!isOpen || modalTemplate === null) {
    return null;
  }

  const TemplateComponent = MODAL_TEMPLATES[modalTemplate];

  if (!TemplateComponent) {
    console.warn(`No modal template found for template name: ${modalTemplate}`);

    return null;
  }

  return (
    <ModalContainer>
      <TemplateComponent payload={modalProps.payload} onClose={closeModal} />
    </ModalContainer>
  );
});
