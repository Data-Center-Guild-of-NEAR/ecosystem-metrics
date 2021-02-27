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
  const [diff, setDiff] = useState(null);

  const Subscription = useCallback(async () => {
    let { totalGas, weekAgoGas } = await new StatsApi().teraGasAggregatedByDate()
    let block = await nearRpc.sendJsonRpc("block",{"finality": "final"})
    let gasPrice = block.header.gas_price
    let totalSupply = block.header.total_supply
    let gdp = new BN(totalSupply).sub(new BN(INITIAL_SUPPLY)).div(new BN(NEAR_NOMINATION))
    //fee
    let fee = new BN(totalGas).mul(new BN(TERA_GAS_UNIT)).mul(new BN(gasPrice)).div(new BN(NEAR_NOMINATION))
    let weekAgoFee = new BN(weekAgoGas).mul(new BN(TERA_GAS_UNIT)).mul(new BN(gasPrice)).div(new BN(NEAR_NOMINATION))
    let diff = ((fee.toNumber() - weekAgoFee.toNumber())/ weekAgoFee.toNumber() * 100).toFixed(4)
    setDiff(diff + "%")
    //total deposit
    let totalDeposit = await new StatsApi().totalDeposit()

    setGDP(gdp.toString())
    setFee(fee.toString())
    setDeposit(new BN(totalDeposit).div(new BN(NEAR_NOMINATION)).toString())
    setStaking(gdp.add(fee).toString())
  }, []);

  useEffect(() => Subscription(), [Subscription]);

  return <div style={{textAlign: "left"}}>
          <h4>Network Situation</h4>
          <div>Total Inflation <Tooltip text={term.network_gdp} /> : <strong className="green">{formatWithCommas(gdp)} Ⓝ</strong></div>
          <div>Total staking rewards <Tooltip text={term.total_staking_rewards} /> : <strong className="green">{formatWithCommas(stakeReward)} Ⓝ</strong> </div>
          <div>Inception to date of Gas Fee <Tooltip text={term.gas_fee} /> : <strong className="green">{formatWithCommas(gasFee)} Ⓝ <Diff number={diff} /></strong></div>
          <div>Total volume transacted <Tooltip text={term.total_deposit} /> : <strong className="green">{formatWithCommas(depositAmount)} Ⓝ </strong></div>
        </div>
}

const Diff = ({number}) => (
  <span 
    style={{
      background: "#C2FCE0",
      borderRadius: "4px",
      color: "#008D6A",
      marginLeft: "5px",
      paddingLeft: "3px"
    }}
  >
    {number}
  </span>
)