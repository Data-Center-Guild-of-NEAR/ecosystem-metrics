import { nearRpc } from '../api-js/connect';
import * as nearApi from 'near-api-js';
import BN from 'bn.js';

const DELAY_AFTER_FAILED_REQUEST = 3000;

export const formatWithCommas = (value) => {
  const pattern = /(-?\d+)(\d{3})/;
  while (pattern.test(value)) {
    value = value.toString().replace(pattern, '$1,$2');
  }
  return value;
};

export const cumulativeSumArray = (array) =>
  array.reduce((r, a) => {
    if (r.length > 0) a += r[r.length - 1];
    r.push(a);
    return r;
  }, []);

const saturatingSub = (a, b) => {
  let res = a.sub(b);
  return res.gte(new BN(0)) ? res : new BN(0);
};

const isAccountBroken = async (blockHeight, accountId) => {
  while (true) {
    try {
      const account = await nearRpc.sendJsonRpc('query', {
        request_type: 'view_account',
        block_id: blockHeight,
        account_id: accountId,
      });
      return (
        account.code_hash === '3kVY9qcVRoW3B5498SMX6R3rtSLiCdmBzKs7zcnzDJ7Q'
      );
    } catch (error) {
      console.log(`Retrying to fetch ${accountId} code version...`, error);
      await new Promise((r) => setTimeout(r, DELAY_AFTER_FAILED_REQUEST));
    }
  }
};

export const getLockedTokenAmount = async (
  lockupState,
  accountId,
  blockInfo
) => {
  const phase2Time = new BN('1602614338293769340');
  let now = new BN((new Date().getTime() * 1000000).toString());
  if (now.lte(phase2Time)) {
    return saturatingSub(
      lockupState.lockupAmount,
      lockupState.terminationWithdrawnTokens
    );
  }

  let lockupTimestamp = BN.max(
    phase2Time.add(lockupState.lockupDuration),
    lockupState.lockupTimestamp
  );
  let blockTimestamp = new BN(blockInfo.header.timestamp_nanosec); // !!! Never take `timestamp`, it is rounded
  if (blockTimestamp.lt(lockupTimestamp)) {
    return saturatingSub(
      lockupState.lockupAmount,
      lockupState.terminationWithdrawnTokens
    );
  }

  let unreleasedAmount;
  if (lockupState.releaseDuration) {
    let startTimestamp = (await isAccountBroken(
      blockInfo.header.height,
      accountId
    ))
      ? phase2Time
      : lockupTimestamp;
    let endTimestamp = startTimestamp.add(lockupState.releaseDuration);
    if (endTimestamp.lt(blockTimestamp)) {
      unreleasedAmount = new BN(0);
    } else {
      let timeLeft = endTimestamp.sub(blockTimestamp);
      unreleasedAmount = lockupState.lockupAmount
        .mul(timeLeft)
        .div(lockupState.releaseDuration);
    }
  } else {
    unreleasedAmount = new BN(0);
  }

  let unvestedAmount;
  if (lockupState.vestingInformation) {
    if (lockupState.vestingInformation.unvestedAmount) {
      // was terminated
      unvestedAmount = lockupState.vestingInformation.unvestedAmount;
    } else if (lockupState.vestingInformation.start) {
      // we have schedule
      if (blockTimestamp.lt(lockupState.vestingInformation.cliff)) {
        unvestedAmount = lockupState.lockupAmount;
      } else if (blockTimestamp.gte(lockupState.vestingInformation.end)) {
        unvestedAmount = new BN(0);
      } else {
        let timeLeft = lockupState.vestingInformation.end.sub(blockTimestamp);
        let totalTime = lockupState.vestingInformation.end.sub(
          lockupState.vestingInformation.start
        );
        unvestedAmount = lockupState.lockupAmount.mul(timeLeft).div(totalTime);
      }
    }
  }
  if (unvestedAmount === undefined) {
    unvestedAmount = new BN(0);
  }

  return BN.max(
    saturatingSub(unreleasedAmount, lockupState.terminationWithdrawnTokens),
    unvestedAmount
  );
};

const readOption = (reader, f, defaultValue) => {
  let x = reader.readU8();
  return x === 1 ? f() : defaultValue;
};

export const viewLockupState = async (contractId, blockHeight) => {
  while (true) {
    try {
      const result = await nearRpc.sendJsonRpc('query', {
        request_type: 'view_state',
        block_id: blockHeight,
        account_id: contractId,
        prefix_base64: '',
      });
      if (result.values.length === 0) {
        console.log(`Unable to get account info for account ${contractId}`);
        return;
      } else {
        let value = Buffer.from(result.values[0].value, 'base64');
        let reader = new nearApi.utils.serialize.BinaryReader(value);
        let owner = reader.readString();
        let lockupAmount = reader.readU128();
        let terminationWithdrawnTokens = reader.readU128();
        let lockupDuration = reader.readU64();

        let releaseDuration = readOption(
          reader,
          () => reader.readU64(),
          new BN(0)
        );
        let lockupTimestamp = readOption(
          reader,
          () => reader.readU64(),
          new BN(0)
        );

        let tiType = reader.readU8();
        let transferInformation;
        if (tiType === 0) {
          let transfersTimestamp = reader.readU64();
          transferInformation = { transfersTimestamp };
        } else {
          let transferPollAccountId = reader.readString();
          transferInformation = { transferPollAccountId };
        }

        let vestingType = reader.readU8();
        let vestingInformation;
        if (vestingType === 1) {
          let vestingHash = reader.readArray(() => reader.readU8());
          vestingInformation = { vestingHash };
        } else if (vestingType === 2) {
          let start = reader.readU64();
          let cliff = reader.readU64();
          let end = reader.readU64();
          vestingInformation = { start, cliff, end };
        } else if (vestingType === 3) {
          let unvestedAmount = reader.readU128();
          let terminationStatus = reader.readU8();
          vestingInformation = { unvestedAmount, terminationStatus };
        }
        return {
          owner,
          lockupAmount,
          terminationWithdrawnTokens,
          lockupDuration,
          releaseDuration,
          lockupTimestamp,
          transferInformation,
          vestingInformation,
        };
      }
    } catch (error) {
      console.log(
        `Retry viewLockupState for account ${contractId} because error`,
        error
      );
      await new Promise((r) => setTimeout(r, DELAY_AFTER_FAILED_REQUEST));
    }
  }
};

export const getFoundationAmount = async (blockHeight) => {
  const accountsToGetBalancesForSubtraction = [
    'contributors.near',
    'foundation.near',
    'illia.near',
    'near',
    'nfvalidator1.near',
    'nfvalidator2.near',
    'nfvalidator3.near',
    'nfvalidator4.near',
    'treasury.near',
    'bridge.near',
    'yes.near',
    'nfendowment22.near',
    'nfendowment27.near',
    'nfendowment49.near',
    'nfendowment32.near',
    'nfendowment35.near',
    'nfendowment01.near',
    'nfendowment06.near',
    'nfendowment24.near',
    'nfendowment15.near',
    'nfendowment33.near',
    'nfendowment29.near',
    'nfendowment53.near',
    'opgran01.near',
    'opgran07.near',
    'opgran43.near',
    'nfendowment14.near',
    'nfendowment03.near',
    'nfendowment13.near',
    'nfendowment16.near',
    'nfendowment23.near',
    'nfendowment07.near',
    'opgran06.near',
    'opgran13.near',
    'opgran15.near',
    'opgran32.near',
    'opgran22.near',
    'opgran42.near',
    'cgran07.near',
    'cgran52.near',
    'nfendowment04.near',
    'nfendowment37.near',
    'nfendowment17.near',
    'nfendowment50.near',
    'opgran08.near',
    'opgran05.near',
    'opgran10.near',
    'opgran47.near',
    'opgran57.near',
    'opgran40.near',
    'nfeco02.near',
    'lockup.near',
    'nfendowment02.near',
    'nfendowment21.near',
    'nfendowment45.near',
    'opgran02.near',
    'opgran09.near',
    'opgran17.near',
    'opgran38.near',
    'nfendowment51.near',
    'opgran12.near',
    'opgran24.near',
    'opgran33.near',
    'opgran30.near',
    'opgran41.near',
    'opgran48.near',
    'opgran34.near',
    'nfendowment12.near',
    'nfendowment10.near',
    'nfendowment08.near',
    'nfendowment42.near',
    'nfendowment38.near',
    'nfendowment48.near',
    'opgran23.near',
    'opgran29.near',
    'opgran37.near',
    'opgran21.near',
    'nfendowment19.near',
    'nfendowment18.near',
    'nfendowment41.near',
    'nfendowment30.near',
    'nfendowment54.near',
    'nfendowment39.near',
    'nfendowment52.near',
    'opgran04.near',
    'opgran16.near',
    'opgran25.near',
    'opgran39.near',
    'opgran59.near',
    'nfeco04.near',
    'cgran03.near',
    'cgran11.near',
    'cgran06.near',
    'cgran21.near',
    'cgran32.near',
    'cgran31.near',
    'cgran57.near',
    'cgran23.near',
    'nfendowment28.near',
    'nfendowment09.near',
    'nfendowment36.near',
    'nfendowment25.near',
    'nfendowment05.near',
    'nfendowment43.near',
    'opgran26.near',
    'opgran44.near',
    'opgran36.near',
    'nfendowment34.near',
    'nfendowment26.near',
    'nfendowment31.near',
    'nfendowment55.near',
    'opgran03.near',
    'opgran20.near',
    'opgran31.near',
    'opgran14.near',
    'opgran18.near',
    'opgran56.near',
    'opgran58.near',
    'opgran49.near',
    'cgran05.near',
    'cgran22.near',
    'cgran12.near',
    'cgran33.near',
    'cgran42.near',
    'cgran36.near',
    'cgran53.near',
    'cgran41.near',
    'opgran19.near',
    'opgran35.near',
    'cgran30.near',
    'cgran25.near',
    'cgran28.near',
    'cgran34.near',
    'cgran45.near',
    'cgran37.near',
    'cgran46.near',
    'cgran49.near',
    'cgran51.near',
    'opgran51.near',
    'opgran11.near',
    'opgran50.near',
    'opgran52.near',
    'cgran17.near',
    'cgran14.near',
    'cgran19.near',
    'cgran39.near',
    'cgran48.near',
    'cgran15.near',
    'cgran38.near',
    'cgran56.near',
    'cgran59.near',
    'opgran60.near',
    'nfeco08.near',
    'cgran04.near',
    'cgran10.near',
    'cgran08.near',
    'cgran24.near',
    'cgran54.near',
    'cgran50.near',
    'cgran47.near',
    'nfeco07.near',
    'nfeco06.near',
    'nfeco05.near',
    'cgran09.near',
    'cgran13.near',
    'cgran27.near',
    'cgran60.near',
    'cgran58.near',
    'nfeco01.near',
    'nfeco03.near',
    'cgran18.near',
    'cgran16.near',
    'cgran29.near',
    'cgran20.near',
    'cgran44.near',
    'cgran01.near',
    'cgran02.near',
    'cgran26.near',
    'cgran35.near',
    'cgran43.near',
    'cgran55.near',
    'f1117.bridge.near',
    'nearshop.near',
    'nfendowment00.near',
    'nfendowment20.near',
    'nfendowment47.near',
    'nfendowment40.near',
    'nfendowment11.near',
    'nfendowment44.near',
    'nfendowment46.near',
    'opgran27.near',
    'f1125.bridge.near',
    'opgran53.near',
    'cgran40.near',
    'opgran54.near',
    'opgran45.near',
    'f1124.bridge.near',
    'nf-finance.near',
    'opgran46.near',
    'opgran55.near',
    'opgran28.near',
  ];

  const balances = await Promise.all(
    accountsToGetBalancesForSubtraction.map(async (accountId) => {
      while (true) {
        try {
          const account = await nearRpc.sendJsonRpc('query', {
            request_type: 'view_account',
            block_id: blockHeight,
            account_id: accountId,
          });
          console.log(account);
          return new BN(account.amount);
        } catch (error) {
          console.log(`Retrying to fetch ${accountId} balance...`, error);
          await new Promise((r) => setTimeout(r, DELAY_AFTER_FAILED_REQUEST));
        }
      }
    })
  );
  return balances.reduce((acc, current) => acc.add(current), new BN(0));
};
