import { useContext } from 'react';
import {OnDutyUserContext  } from '../context/OnDutyUserContext';

const useOnDutyUser = () => {
  return useContext(OnDutyUserContext);
};

export default useOnDutyUser;