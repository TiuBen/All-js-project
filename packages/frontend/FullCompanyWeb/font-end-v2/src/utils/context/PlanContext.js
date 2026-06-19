import { createContext } from 'react';
import {plans} from '../../data/index.js';


export const PlanContext = createContext(plans);