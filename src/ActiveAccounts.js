/* eslint-disable import/no-anonymous-default-export */
import React, { useState, useEffect } from "react";

import StatsApi from "./explorer-api/stats";

export default () => {
  const [activeAccountsByDate, setAccounts] = useState(null);

  useEffect(() => {
    new StatsApi().activeAccountsCountAggregatedByDate().then((accounts) => {
      if (accounts) {
        setAccounts(accounts[accounts.length -1].accountsCount);
      }
    });
  }, []);

  return <>{activeAccountsByDate}</>
}