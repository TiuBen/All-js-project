import { useContext } from 'react';
import {DialogContext  } from '../context/DialogContext';

const useDialog = () => {
  return useContext(DialogContext);
};

export default useDialog;