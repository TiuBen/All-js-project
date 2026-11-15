import { useContext } from 'react';
import {PageContext  } from '../context/PageContext';

const usePage = () => {
  return useContext(PageContext);
};

export default usePage;