import { ModalID } from '../../components/modal/modal';

export type ModalPayload = Record<string, unknown>;

export type ModalOptions = {
  payload?: ModalPayload;
  onClose?: () => void;
  onAccept?: (result?: unknown) => void;
  onReject?: (result?: unknown) => void;
};

export interface IModalManager {
  isOpen: boolean;
  modalTemplate: ModalID | null;
  modalProps: ModalOptions;
  showModal: (template: ModalID, options?: ModalOptions) => void;
  closeModal: () => void;
}
