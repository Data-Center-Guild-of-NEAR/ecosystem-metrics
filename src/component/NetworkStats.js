/* eslint-disable import/no-anonymous-default-export */
import React, { useState, useEffect, useCallback } from "react";
import BN from "bn.js";

import StatsApi from "../explorer-api/stats";
import {nearRpc} from "../api-js/connect";
import {TERA_GAS_UNIT, INITIAL_SUPPLY, INITIAL_SUPPLY_CONVERT_TO_NEAR} from "../utils/const";
import { NEAR_NOMINATION } from "near-api-js/lib/utils/format";

import Tooltip from "../utils/Tooltip";
import {term} from "../utils/term";

export default () => {
  const [gdp, setGDP] = useState(null);
  const [gasFee, setFee] = useState(null);

  const Subscription = useCallback(async () => {
    let totalGas = await new StatsApi().teraGasAggregatedByDate()
    let block = await nearRpc.sendJsonRpc("block",{
      "finality": "final"
    })
    let gasPrice = block.header.gas_price
    let totalSupply = block.header.total_supply
    setGDP(new BN(totalSupply).sub(new BN(INITIAL_SUPPLY)).div(new BN(NEAR_NOMINATION)).toString())
    setFee(new BN(totalGas).mul(new BN(TERA_GAS_UNIT)).mul(new BN(gasPrice)).div(new BN(NEAR_NOMINATION)).toString())
  }, []);

  useEffect(() => Subscription(), [Subscription]);

  return <div>
          <div>Network GDP <Tooltip text={term.network_gdp} /> : <strong className="green">{gdp} Ⓝ</strong></div>
          <div>Inflation rate <Tooltip text={term.inflation_rate} /> : <strong className="green">{Number(gdp*100/INITIAL_SUPPLY_CONVERT_TO_NEAR).toFixed(4)} %</strong></div>
          <div>Inception to date of Gas Fee <Tooltip text={term.gas_fee} /> : <strong className="green">{gasFee} Ⓝ </strong></div>
        </div>
}