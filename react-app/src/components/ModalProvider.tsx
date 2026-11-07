import React from 'react';
import { ModalContextProvider } from '../context/ModalContext';
import ServiceModal from './ServiceModal';

export const ModalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ModalContextProvider>
      {children}
      <ServiceModal />
    </ModalContextProvider>
  );
};

export default ModalProvider;
