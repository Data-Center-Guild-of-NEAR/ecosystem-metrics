import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

import WeeklyActiveDevCount from "./WeeklyActiveDevCount";
import MonthlyActiveDevCount from "./MonthlyActiveDevCount";
import ActiveAccounts from "./ActiveAccounts";
import ActiveValidators from "./ActiveValidators"

ReactDOM.render(
  <React.StrictMode>
    <WeeklyActiveDevCount />
    <MonthlyActiveDevCount />
    <ActiveAccounts />
    <ActiveValidators />
  </React.StrictMode>,
  document.getElementById('root')
);
