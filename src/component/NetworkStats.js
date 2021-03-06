/* eslint-disable import/no-anonymous-default-export */
import React, { useState, useEffect, useCallback } from "react";
import BN from "bn.js";

import StatsApi from "../explorer-api/stats";
import { nearRpc } from "../api-js/connect";
import { NEAR_NOMINATION } from "near-api-js/lib/utils/format";

import { TERA_GAS_UNIT, INITIAL_SUPPLY } from "../utils/const";
import Tooltip from "../utils/Tooltip";
import { term } from "../utils/term";
import { formatWithCommas } from "../utils/convert";
import { total_inflation, total_staking_reward, total_volume_transacted} from "../history/index";

export default () => {
  const [gdp, setGDP] = useState('');
  const [gasFee, setFee] = useState('');
  const [gasFeeWeekAgo, setFeeWeekAgo] = useState('');
  const [depositAmount, setDeposit] = useState('');
  const [stakeReward, setStaking] = useState('');

  const Subscription = useCallback(async () => {
    let { totalGas, weekAgoGas } = await new StatsApi().teraGasAggregatedByDate()
    let block = await nearRpc.sendJsonRpc("block",{"finality": "final"})
    let gasPrice = block.header.gas_price
    let totalSupply = block.header.total_supply
    let gdp = new BN(totalSupply).sub(new BN(INITIAL_SUPPLY)).div(new BN(NEAR_NOMINATION))
    //fee
    let fee = new BN(totalGas).mul(new BN(TERA_GAS_UNIT)).mul(new BN(gasPrice)).div(new BN(NEAR_NOMINATION))
    let weekAgoFee = new BN(weekAgoGas).mul(new BN(TERA_GAS_UNIT)).mul(new BN(gasPrice)).div(new BN(NEAR_NOMINATION))
    //total deposit
    let totalDeposit = await new StatsApi().totalDeposit()

    setGDP(gdp)
    setFee(fee)
    setFeeWeekAgo(weekAgoFee)
    setDeposit(new BN(totalDeposit).div(new BN(NEAR_NOMINATION)))
    setStaking(gdp.add(fee))
  }, []);

  useEffect(() => Subscription(), [Subscription]);

  return <div style={{textAlign: "left"}}>
          <h4>Network Situation</h4>
          <div>Total Inflation <Tooltip text={term.network_gdp} /> : <strong className="green">{formatWithCommas(gdp.toString())} Ⓝ</strong>
              {gdp && <Diff current={gdp} prev={new BN(total_inflation["2021-02-22"])} />}</div>
          <div>Total staking rewards <Tooltip text={term.total_staking_rewards} /> : <strong className="green">{formatWithCommas(stakeReward.toString())} Ⓝ</strong>
              {stakeReward && <Diff current={stakeReward} prev={new BN(total_staking_reward["2021-02-22"])} />}</div>
          <div>Inception to date of Gas Fee <Tooltip text={term.gas_fee} /> : <strong className="green">{formatWithCommas(gasFee)} Ⓝ </strong>
              {gasFeeWeekAgo && <Diff current={gasFee} prev={gasFeeWeekAgo} />}</div>
          <div>Total volume transacted <Tooltip text={term.total_deposit} /> : <strong className="green">{formatWithCommas(depositAmount.toString())} Ⓝ </strong>
              {depositAmount && <Diff current={depositAmount} prev={new BN(total_volume_transacted["2021-02-22"])}/>}</div>
        </div>
}

const Diff = ({current, prev}) => {
  let diff = ((current.sub(prev).muln(1000000).div(prev).toNumber())/10000).toFixed(4)
  let signal = current.gt(prev) ? '+' : '-'
  return (
    <span 
      style={{
        background: "#C2FCE0",
        borderRadius: "4px",
        color: current.gt(prev) ? "#008D6A" : "#f5c7c1",
        marginLeft: "5px",
        paddingLeft: "3px"
      }}
    >
      {signal} {diff}%
    </span>
  )
}
