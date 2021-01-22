/* eslint-disable import/no-anonymous-default-export */
import React, { useState, useEffect } from "react";

import StatsApi from "../explorer-api/stats";
import Tooltip from "../utils/Tooltip";
import {term} from "../utils/term";

export default () => {
  const [activeCurrentAccounts, setAccounts] = useState(null);
  const [activeWeeklyAccounts, setWeeklyAccounts] = useState(null)

  useEffect(() => {
    new StatsApi().activeAccountsCountAggregatedByDate().then((count) => {
      if (count) {
        setAccounts(count.currentDayCount);
        setWeeklyAccounts(count.weeklyCount)
      }
    });
  }, []);

  return <div>
          <div>Current Active Accounts <Tooltip text={term.current_active_accounts} /> : <strong className="green">{activeCurrentAccounts}</strong></div>
          <div>Weekly Active Accounts <Tooltip text={term.weekly_active_accounts} />: <strong className="green">{activeWeeklyAccounts}</strong></div>
        </div>
}