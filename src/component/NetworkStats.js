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
import { total_lockup } from '../history/index';
import { getFoundationAmount, getLockupToken } from '../utils/lockup';

export default () => {
  const [gdp, setGDP] = useState('');
  const [gdpWeekAgo, setGDPWeekAgo] = useState('');

  const [gasFee, setFee] = useState('');
  const [gasFeeWeekAgo, setFeeWeekAgo] = useState('');

  const [stakeReward, setStaking] = useState('');
  const [stakeRewardWeekAgo, setStakeWeekAgo] = useState('');

  const [totalDeposit, setDeposit] = useState('');
  const [totalDepositWeekAgo, setDepositWeekAgo] = useState('');

  const [totalSupply, setTS] = useState('');
  const [tsWeekAgo, setTSWeekAgo] = useState('');

  const [stake, setStake] = useState('');
  const [circulatingSupply, setCS] = useState('');
  const [lockup, setLockup] = useState('');
  const [foundation, setFoundation] = useState('');
  const [intersection, setIntersection] = useState('');

  const Subscription = useCallback(async () => {
    let { totalGas, weekAgoGas } =
      await new StatsApi().teraGasAggregatedByDate();
    // block info
    let block = await nearRpc.sendJsonRpc('block', { finality: 'final' });
    // let currentHeight = block.header.height;
    let height = block.header.height - 604800;
    let gasPrice = block.header.gas_price;
    let totalSupply = block.header.total_supply;

    //total inflation
    let gdp = new BN(totalSupply)
      .sub(new BN(INITIAL_SUPPLY))
      .div(new BN(NEAR_NOMINATION));

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

    // circulating supply
    const circulatingSupply = await new StatsApi().getLatestCirculatingSupply();
    setCS(circulatingSupply.circulating_supply_in_yoctonear);

    // foundations
    const foundationAmount = await getFoundationAmount();

    // settings
    setGDP(gdp);
    setGDPWeekAgo(preGdp);

    setFee(fee);
    setFeeWeekAgo(weekAgoFee);

    setStaking(gdp.muln(0.95));
    setStakeWeekAgo(preGdp.muln(0.95));

    setDeposit(totalDeposit);
    setDepositWeekAgo(weekAgoDeposit);

    setTS(new BN(totalSupply).div(new BN(NEAR_NOMINATION)));
    setTSWeekAgo(new BN(prevTotalSupply).div(new BN(NEAR_NOMINATION)));

    setStake(stake);

    setLockup(total_lockup['2021-07-14']);
    setFoundation(foundationAmount);
    setIntersection(
      new BN(totalSupply).sub(stake).sub(new BN(total_lockup['2021-07-14']))
    );
  }, []);

  useEffect(() => Subscription(), [Subscription]);

  useEffect(() => {
    async function getLockup() {
      const lockup = await getLockupToken();
      console.log(lockup);
      setLockup(lockup);
    }
    getLockup();
  }, []);

  return (
    <div style={{ textAlign: 'left' }}>
      <h4>Network Situation</h4>
      <div>
        <strong>Total supply </strong> <Tooltip text={term.total_supply} /> :{' '}
        {totalSupply === '' ? (
          <span>Loading...</span>
        ) : (
          <strong className="green">
            {formatWithCommas(totalSupply.toString())} Ⓝ
          </strong>
        )}
        {tsWeekAgo && <Diff current={totalSupply} prev={tsWeekAgo} />}
      </div>
      <div>
        <strong>Circulating Supply </strong>{' '}
        <Tooltip text={term.circulating_supply} /> :{' '}
        {circulatingSupply === '' ? (
          <span>Loading...</span>
        ) : (
          <strong className="green">
            {formatNearAmount(circulatingSupply, 0)} Ⓝ
          </strong>
        )}
      </div>
      <div>
        <strong>Total stake </strong> <Tooltip text={term.total_stake} /> :{' '}
        {stake === '' ? (
          <span>Loading...</span>
        ) : (
          <strong className="green">
            {formatNearAmount(stake.toString(), 0)} Ⓝ
          </strong>
        )}
      </div>
      <div>
        <strong>Total Lockedup Amount </strong>{' '}
        <Tooltip text={term.total_lockup} /> :{' '}
        {lockup === '' ? (
          <span>Loading...</span>
        ) : (
          <strong className="green">{formatNearAmount(lockup, 0)} Ⓝ</strong>
        )}
      </div>
      <div>
        <strong>Foundation Fund </strong> <Tooltip text={term.foundation} /> :{' '}
        {foundation === '' ? (
          <p>Loading...</p>
        ) : (
          <strong className="green">{formatNearAmount(foundation, 0)} Ⓝ</strong>
        )}
      </div>
      <div>
        <strong>Tokens that are not locked and not staked</strong>{' '}
        <Tooltip text={term.intersection} /> :{' '}
        {intersection === '' ? (
          <span>Loading...</span>
        ) : (
          <strong className="green">
            {formatNearAmount(intersection.toString(), 0)} Ⓝ
          </strong>
        )}
      </div>
      <div>
        Total Inflation <Tooltip text={term.network_gdp} /> :{' '}
        {gdp === '' ? (
          <span>Loading...</span>
        ) : (
          <strong className="green">
            {formatWithCommas(gdp.toString())} Ⓝ
          </strong>
        )}
        {gdpWeekAgo && <Diff current={gdp} prev={gdpWeekAgo} />}
      </div>
      <div>
        Total staking rewards <Tooltip text={term.total_staking_rewards} /> :{' '}
        {stakeReward === '' ? (
          <span>Loading...</span>
        ) : (
          <strong className="green">
            {formatWithCommas(stakeReward.toString())} Ⓝ
          </strong>
        )}
        {stakeRewardWeekAgo && (
          <Diff current={stakeReward} prev={stakeRewardWeekAgo} />
        )}
      </div>
      <div>
        Inception to date of Gas Fee <Tooltip text={term.gas_fee} /> :{' '}
        {gasFee === '' ? (
          <span>Loading...</span>
        ) : (
          <strong className="green">{formatWithCommas(gasFee)} Ⓝ </strong>
        )}
        {gasFeeWeekAgo && <Diff current={gasFee} prev={gasFeeWeekAgo} />}
      </div>
      <div>
        Total token volume transacted: <Tooltip text={term.total_deposit} /> :{' '}
        {totalDeposit === '' ? (
          <span>Loading...</span>
        ) : (
          <strong className="green">
            {formatWithCommas(totalDeposit.toString())} Ⓝ
          </strong>
        )}
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
