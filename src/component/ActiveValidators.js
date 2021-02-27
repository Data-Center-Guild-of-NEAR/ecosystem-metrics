/* eslint-disable import/no-anonymous-default-export */
import React, { useState, useEffect, useCallback } from "react";

import {nearRpc} from "../api-js/connect";
import Tooltip from "../utils/Tooltip";
import {term} from "../utils/term";

export default () => {
  const [validators, setValidators] = useState(null);
  const [proposals, setProposals] = useState(null);
  const [nextValidators, setNext] = useState(null)

  const Subscription = useCallback(() => {
    nearRpc.sendJsonRpc("validators", [null]).then((nodes) => {
      setValidators(nodes.current_validators.length)
      setProposals(nodes.current_proposals.length)
      setNext(nodes.next_validators.length)
    })
  }, []);

  useEffect(() => Subscription(), [Subscription]);

  return <div style={{textAlign: "left"}}>
          <h4>Stake Situation</h4>
          <div>Current Validators <Tooltip text={term.current_validators} /> : <strong className="green">{validators}</strong></div>
          <div>Current Proposals <Tooltip text={term.current_proposals} /> : <strong className="green">{proposals}</strong></div>
          <div>Next Validators <Tooltip text={term.next_validators} /> : <strong className="green">{nextValidators}</strong></div>
        </div>
}