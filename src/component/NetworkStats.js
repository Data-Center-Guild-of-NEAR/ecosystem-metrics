/* eslint-disable import/no-anonymous-default-export */
import React, { useState, useEffect, useCallback } from "react";
import BN from "bn.js";

import StatsApi from "../explorer-api/stats";
import {nearRpc} from "../api-js/connect";
import { NEAR_NOMINATION } from "near-api-js/lib/utils/format";

import {TERA_GAS_UNIT, INITIAL_SUPPLY} from "../utils/const";
import Tooltip from "../utils/Tooltip";
import {term} from "../utils/term";
import {formatWithCommas} from "../utils/convert";

export default () => {
  const [gdp, setGDP] = useState(null);
  const [gasFee, setFee] = useState(null);
  const [depositAmount, setDeposit] = useState(null);
  const [stakeReward, setStaking] = useState(null);

  const Subscription = useCallback(async () => {
    let totalGas = await new StatsApi().teraGasAggregatedByDate()
    let block = await nearRpc.sendJsonRpc("block",{
      "finality": "final"
    })
    let totalDeposit = await new StatsApi().totalDeposit()
    let gasPrice = block.header.gas_price
    let totalSupply = block.header.total_supply
    let gdp = new BN(totalSupply).sub(new BN(INITIAL_SUPPLY)).div(new BN(NEAR_NOMINATION))
    let fee = new BN(totalGas).mul(new BN(TERA_GAS_UNIT)).mul(new BN(gasPrice)).div(new BN(NEAR_NOMINATION))
    setGDP(gdp.toString())
    setFee(fee.toString())
    setDeposit(new BN(totalDeposit).div(new BN(NEAR_NOMINATION)).toString())
    setStaking(gdp.add(fee).toString())
  }, []);

  useEffect(() => Subscription(), [Subscription]);

  return <div>
          <div>Network GDP <Tooltip text={term.network_gdp} /> : <strong className="green">{formatWithCommas(gdp)} Ⓝ</strong></div>
          <div>Total staking rewards<Tooltip text={term.total_staking_rewards} /> : <strong className="green">{formatWithCommas(stakeReward)} Ⓝ</strong> </div>
          <div>Inception to date of Gas Fee <Tooltip text={term.gas_fee} /> : <strong className="green">{formatWithCommas(gasFee)} Ⓝ </strong></div>
          <div>Total amount from transactions <Tooltip text={term.total_deposit} /> : <strong className="green">{formatWithCommas(depositAmount)} Ⓝ </strong></div>
        </div>
}