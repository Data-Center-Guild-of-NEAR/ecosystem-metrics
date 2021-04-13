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

export default () => {
  const [gdp, setGDP] = useState('');
  const [gdpWeekAgo, setGDPWeekAgo] = useState('')

  const [gasFee, setFee] = useState('');
  const [gasFeeWeekAgo, setFeeWeekAgo] = useState('');

  const [stakeReward, setStaking] = useState('');
  const [stakeRewardWeekAgo, setStakeWeekAgo] = useState('')

  const [totalDeposit, setDeposit] = useState('')
  const [totalDepositWeekAgo, setDepositWeekAgo] = useState('')

  const Subscription = useCallback(async () => {
    let { totalGas, weekAgoGas } = await new StatsApi().teraGasAggregatedByDate()
    // total inflation
    let block = await nearRpc.sendJsonRpc("block",{"finality": "final"})
    let gasPrice = block.header.gas_price
    let totalSupply = block.header.total_supply
    let gdp = new BN(totalSupply).sub(new BN(INITIAL_SUPPLY)).div(new BN(NEAR_NOMINATION))
    let height = block.header.height - 604800
    let prevTotalSupply = await new StatsApi().getTotalSupply(height)
    let preGdp = new BN(prevTotalSupply).sub(new BN(INITIAL_SUPPLY)).div(new BN(NEAR_NOMINATION))
    console.log(preGdp.toString())
    console.log(gdp.toString())
    //fee
    let fee = new BN(totalGas).mul(new BN(TERA_GAS_UNIT)).mul(new BN(gasPrice)).div(new BN(NEAR_NOMINATION))
    let weekAgoFee = new BN(weekAgoGas).mul(new BN(TERA_GAS_UNIT)).mul(new BN(gasPrice)).div(new BN(NEAR_NOMINATION))

    //total deposit
    let depositList = await new StatsApi().depositAmountAggregatedByDate()
    let totalDeposit = depositList.map(
      (account) => new BN(account.depositAmount).div(new BN(NEAR_NOMINATION))
    ).reduce((deposit, current) => current.add(deposit), new BN(0))
    let weekAgoDeposit = depositList.slice(0, depositList.length - 7).map(
      (account) => new BN(account.depositAmount).div(new BN(NEAR_NOMINATION))
    ).reduce((deposit, current) => current.add(deposit), new BN(0))


    setGDP(gdp)
    setGDPWeekAgo(preGdp)

    setFee(fee)
    setFeeWeekAgo(weekAgoFee)

    setStaking(gdp.add(fee))
    setStakeWeekAgo(preGdp.add(weekAgoFee))

    setDeposit(totalDeposit)
    setDepositWeekAgo(weekAgoDeposit)
  }, []);

  useEffect(() => Subscription(), [Subscription]);

  return <div style={{textAlign: "left"}}>
          <h4>Network Situation</h4>
          <div>Total Inflation <Tooltip text={term.network_gdp} /> : <strong className="green">{formatWithCommas(gdp.toString())} Ⓝ</strong>
              {gdpWeekAgo && <Diff current={gdp} prev={gdpWeekAgo} />}</div>
          <div>Total staking rewards <Tooltip text={term.total_staking_rewards} /> : <strong className="green">{formatWithCommas(stakeReward.toString())} Ⓝ</strong>
              {stakeRewardWeekAgo && <Diff current={stakeReward} prev={stakeRewardWeekAgo} />}</div>
          <div>Inception to date of Gas Fee <Tooltip text={term.gas_fee} /> : <strong className="green">{formatWithCommas(gasFee)} Ⓝ </strong>
              {gasFeeWeekAgo && <Diff current={gasFee} prev={gasFeeWeekAgo} />}</div>
          <div>Total token volume transacted:  <Tooltip text={term.total_deposit} /> : <strong className="green">{formatWithCommas(totalDeposit.toString())} Ⓝ</strong>
              {totalDepositWeekAgo && <Diff current={totalDeposit} prev={totalDepositWeekAgo} />}</div>
        </div>
}

const Diff = ({current, prev}) => {
  console.log(current.toString(), prev.toString())
  let diff = ((current.sub(prev).muln(1000000).div(prev).toNumber())/10000).toFixed(2)
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
