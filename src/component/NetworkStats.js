/* eslint-disable import/no-anonymous-default-export */
import React, { useState, useEffect, useCallback } from 'react';
import BN from 'bn.js';

import StatsApi from '../explorer-api/stats';
import { nearRpc } from '../api-js/connect';
import {
  NEAR_NOMINATION,
  formatNearAmount,
} from 'near-api-js/lib/utils/format';

import { TERA_GAS_UNIT, INITIAL_SUPPLY } from '../utils/const';
import Tooltip from '../utils/Tooltip';
import { term } from '../utils/term';
import { formatWithCommas } from '../utils/convert';

export default () => {
  const [gdp, setGDP] = useState('');
  const [gdpWeekAgo, setGDPWeekAgo] = useState('');

  const [gasFee, setFee] = useState('');
  const [gasFeeWeekAgo, setFeeWeekAgo] = useState('');

  const [stakeReward, setStaking] = useState('');
  const [stakeRewardWeekAgo, setStakeWeekAgo] = useState('');

  const [totalDeposit, setDeposit] = useState('');
  const [totalDepositWeekAgo, setDepositWeekAgo] = useState('');

  const [circulatedSupply, setCS] = useState('');
  const [csWeekAgo, setCSWeekAgo] = useState('');

  const [stake, setStake] = useState('');
  const [intersection, setIntersection] = useState('');

  const Subscription = useCallback(async () => {
    let { totalGas, weekAgoGas } =
      await new StatsApi().teraGasAggregatedByDate();
    // total inflation
    let block = await nearRpc.sendJsonRpc('block', { finality: 'final' });
    let gasPrice = block.header.gas_price;
    let totalSupply = block.header.total_supply;
    let gdp = new BN(totalSupply)
      .sub(new BN(INITIAL_SUPPLY))
      .div(new BN(NEAR_NOMINATION));
    let height = block.header.height - 604800;
    let prevTotalSupply = await new StatsApi().getTotalSupply(height);
    let preGdp = new BN(prevTotalSupply)
      .sub(new BN(INITIAL_SUPPLY))
      .div(new BN(NEAR_NOMINATION));
    //fee
    let fee = new BN(totalGas)
      .mul(new BN(TERA_GAS_UNIT))
      .mul(new BN(gasPrice))
      .div(new BN(NEAR_NOMINATION));
    let weekAgoFee = new BN(weekAgoGas)
      .mul(new BN(TERA_GAS_UNIT))
      .mul(new BN(gasPrice))
      .div(new BN(NEAR_NOMINATION));

    //total deposit
    let depositList = await new StatsApi().depositAmountAggregatedByDate();
    let totalDeposit = depositList
      .map((account) =>
        new BN(account.depositAmount).div(new BN(NEAR_NOMINATION))
      )
      .reduce((deposit, current) => current.add(deposit), new BN(0));
    let weekAgoDeposit = depositList
      .slice(0, depositList.length - 7)
      .map((account) =>
        new BN(account.depositAmount).div(new BN(NEAR_NOMINATION))
      )
      .reduce((deposit, current) => current.add(deposit), new BN(0));

    // stake
    let res = await nearRpc.sendJsonRpc('validators', [null]);
    let validators = res.current_validators;
    let stake = validators
      .map((va) => va.stake)
      .reduce((prev, curr) => new BN(prev).add(new BN(curr)), new BN('0'));
    console.log(stake.toString());
    // settings
    setGDP(gdp);
    setGDPWeekAgo(preGdp);

    setFee(fee);
    setFeeWeekAgo(weekAgoFee);

    setStaking(gdp.muln(0.95));
    setStakeWeekAgo(preGdp.muln(0.95));

    setDeposit(totalDeposit);
    setDepositWeekAgo(weekAgoDeposit);

    setCS(new BN(totalSupply).div(new BN(NEAR_NOMINATION)));
    setCSWeekAgo(new BN(prevTotalSupply).div(new BN(NEAR_NOMINATION)));

    setStake(stake);
    setIntersection(
      new BN(totalSupply).sub(stake).div(new BN(NEAR_NOMINATION))
    );
  }, []);

  useEffect(() => Subscription(), [Subscription]);

  return (
    <div style={{ textAlign: 'left' }}>
      <h4>Network Situation</h4>
      <div>
        <strong>Total circulating supply </strong>{' '}
        <Tooltip text={term.circulating_supply} /> :{' '}
        <strong className="green">
          {formatWithCommas(circulatedSupply.toString())} Ⓝ
        </strong>
        {csWeekAgo && <Diff current={circulatedSupply} prev={csWeekAgo} />}
      </div>
      <div>
        <strong>Total stake </strong> <Tooltip text={term.total_stake} /> :{' '}
        <strong className="green">
          {formatNearAmount(stake.toString(), 0)} Ⓝ
        </strong>
      </div>
      <div>
        <strong>
          Intersections between lockups/circulating supply and staking{' '}
        </strong>{' '}
        <Tooltip text={term.intersection} /> :{' '}
        <strong className="green">
          {formatWithCommas(intersection.toString())} Ⓝ
        </strong>
      </div>
      <div>
        Total Inflation <Tooltip text={term.network_gdp} /> :{' '}
        <strong className="green">{formatWithCommas(gdp.toString())} Ⓝ</strong>
        {gdpWeekAgo && <Diff current={gdp} prev={gdpWeekAgo} />}
      </div>
      <div>
        Total staking rewards <Tooltip text={term.total_staking_rewards} /> :{' '}
        <strong className="green">
          {formatWithCommas(stakeReward.toString())} Ⓝ
        </strong>
        {stakeRewardWeekAgo && (
          <Diff current={stakeReward} prev={stakeRewardWeekAgo} />
        )}
      </div>
      <div>
        Inception to date of Gas Fee <Tooltip text={term.gas_fee} /> :{' '}
        <strong className="green">{formatWithCommas(gasFee)} Ⓝ </strong>
        {gasFeeWeekAgo && <Diff current={gasFee} prev={gasFeeWeekAgo} />}
      </div>
      <div>
        Total token volume transacted: <Tooltip text={term.total_deposit} /> :{' '}
        <strong className="green">
          {formatWithCommas(totalDeposit.toString())} Ⓝ
        </strong>
        {totalDepositWeekAgo && (
          <Diff current={totalDeposit} prev={totalDepositWeekAgo} />
        )}
      </div>
    </div>
  );
};

const Diff = ({ current, prev }) => {
  let diff = (
    current.sub(prev).muln(1000000).div(prev).toNumber() / 10000
  ).toFixed(2);
  let signal = current.gt(prev) ? '+' : '-';
  return (
    <span
      style={{
        background: '#C2FCE0',
        borderRadius: '4px',
        color: current.gt(prev) ? '#008D6A' : '#f5c7c1',
        marginLeft: '5px',
        paddingLeft: '3px',
      }}
    >
      {signal} {diff}%
    </span>
  );
};
