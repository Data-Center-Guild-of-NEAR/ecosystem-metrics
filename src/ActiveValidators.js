/* eslint-disable import/no-anonymous-default-export */
import React, { useState, useEffect, useCallback } from "react";

import StatsApi from "./explorer-api/stats";

export default () => {
  const [activeValidators, setValidators] = useState(null);
  const [proposals, setProposals] = useState(null)

  const fetchNodeInfo = (nodes) => {
    let { validatorAmount, proposalAmount} = nodes[0];
    setValidators(validatorAmount)
    setProposals(proposalAmount)
  };

  const Subscription = useCallback(() => {
    new StatsApi().subscribe("node-stats", fetchNodeInfo);
  }, []);

  useEffect(() => Subscription(), [Subscription]);

  return <div>
          <p>{activeValidators}</p>
          <p>{proposals}</p>
        </div>
}