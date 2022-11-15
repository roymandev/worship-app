import { useState } from 'react';

const useModal = <T>(initialState = false, initialPayload?: T) => {
  const [isOpen, setIsOpen] = useState(initialState);
  const [payload, setPayload] = useState(initialPayload);

  const openModal = (payload?: T) => {
    setIsOpen(true);
    setPayload(payload);
  };

  const closeModal = () => {
    setIsOpen(false);
    setPayload(undefined);
  };

  return {
    isOpen,
    payload,
    openModal,
    closeModal,
  };
};

export default useModal;
