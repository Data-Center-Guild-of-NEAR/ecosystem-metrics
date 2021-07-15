import * as nearApi from 'near-api-js';
import BN from 'bn.js';
import { nearRpc } from '../api-js/connect';
import StatsApi from '../explorer-api/stats';

const DELAY_AFTER_FAILED_REQUEST = 3000;

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

const getLockedTokenAmount = async (lockupState, accountId, blockInfo) => {
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

const viewLockupState = async (contractId, blockHeight) => {
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

// lockup
export const getLockupToken = async () => {
  let block = await nearRpc.sendJsonRpc('block', { finality: 'final' });
  let currentHeight = block.header.height;
  const lockupAccountIds = await new StatsApi().getLockupAccountIds(
    currentHeight
  );
  console.log('get all lockup Accounts', lockupAccountIds.length);
  let allLockupTokenAmounts = [];
  for (let account of lockupAccountIds) {
    const lockupState = await viewLockupState(
      account.account_id,
      currentHeight
    );
    if (lockupState) {
      let amount = await getLockedTokenAmount(
        lockupState,
        account.account_id,
        block
      );
      allLockupTokenAmounts.push(amount);
    }
  }
  const lockedTokens = allLockupTokenAmounts.reduce(
    (acc, current) => acc.add(current),
    new BN(0)
  );
  return lockedTokens.toString();
};

// foundations
export const getFoundationAmount = async () => {
  const accountsToGetBalancesForSubtraction = [
    'cgran01.near',
    'cgran02.near',
    'cgran03.near',
    'cgran04.near',
    'cgran05.near',
    'cgran06.near',
    'cgran07.near',
    'cgran08.near',
    'cgran09.near',
    'cgran10.near',
    'cgran11.near',
    'cgran12.near',
    'cgran13.near',
    'cgran14.near',
    'cgran15.near',
    'cgran16.near',
    'cgran17.near',
    'cgran18.near',
    'cgran19.near',
    'cgran20.near',
    'cgran21.near',
    'cgran22.near',
    'cgran23.near',
    'cgran24.near',
    'cgran25.near',
    'cgran26.near',
    'cgran27.near',
    'cgran28.near',
    'cgran29.near',
    'cgran30.near',
    'cgran31.near',
    'cgran32.near',
    'cgran33.near',
    'cgran34.near',
    'cgran35.near',
    'cgran36.near',
    'cgran37.near',
    'cgran38.near',
    'cgran39.near',
    'cgran40.near',
    'cgran41.near',
    'cgran42.near',
    'cgran43.near',
    'cgran44.near',
    'cgran45.near',
    'cgran46.near',
    'cgran47.near',
    'cgran48.near',
    'cgran49.near',
    'cgran50.near',
    'cgran51.near',
    'cgran52.near',
    'cgran53.near',
    'cgran54.near',
    'cgran55.near',
    'cgran56.near',
    'cgran57.near',
    'cgran58.near',
    'cgran59.near',
    'cgran60.near',
    'nfeco01.near',
    'nfeco02.near',
    'nfeco03.near',
    'nfeco04.near',
    'nfeco05.near',
    'nfeco06.near',
    'nfeco07.near',
    'nfeco08.near',
    'opgran01.near',
    'opgran02.near',
    'opgran03.near',
    'opgran04.near',
    'opgran05.near',
    'opgran06.near',
    'opgran07.near',
    'opgran08.near',
    'opgran09.near',
    'opgran10.near',
    'opgran11.near',
    'opgran12.near',
    'opgran13.near',
    'opgran14.near',
    'opgran15.near',
    'opgran16.near',
    'opgran17.near',
    'opgran18.near',
    'opgran19.near',
    'opgran20.near',
    'opgran21.near',
    'opgran22.near',
    'opgran23.near',
    'opgran24.near',
    'opgran25.near',
    'opgran26.near',
    'opgran27.near',
    'opgran28.near',
    'opgran29.near',
    'opgran30.near',
    'opgran31.near',
    'opgran32.near',
    'opgran33.near',
    'opgran34.near',
    'opgran35.near',
    'opgran36.near',
    'opgran37.near',
    'opgran38.near',
    'opgran39.near',
    'opgran40.near',
    'opgran41.near',
    'opgran42.near',
    'opgran43.near',
    'opgran44.near',
    'opgran45.near',
    'opgran46.near',
    'opgran47.near',
    'opgran48.near',
    'opgran49.near',
    'opgran50.near',
    'opgran51.near',
    'opgran52.near',
    'opgran53.near',
    'opgran54.near',
    'opgran55.near',
    'opgran56.near',
    'opgran57.near',
    'opgran58.near',
    'opgran59.near',
    'opgran60.near',
    'illia.near',
    'nearshop.near',
    'nf-finance.near',
    'nfendowment00.near',
    'nfendowment01.near',
    'nfendowment02.near',
    'nfendowment03.near',
    'nfendowment04.near',
    'nfendowment05.near',
    'nfendowment06.near',
    'nfendowment07.near',
    'nfendowment08.near',
    'nfendowment09.near',
    'nfendowment10.near',
    'nfendowment11.near',
    'nfendowment12.near',
    'nfendowment13.near',
    'nfendowment14.near',
    'nfendowment15.near',
    'nfendowment16.near',
    'nfendowment17.near',
    'nfendowment18.near',
    'nfendowment19.near',
    'nfendowment20.near',
    'nfendowment21.near',
    'nfendowment22.near',
    'nfendowment23.near',
    'nfendowment24.near',
    'nfendowment25.near',
    'nfendowment26.near',
    'nfendowment27.near',
    'nfendowment28.near',
    'nfendowment29.near',
    'nfendowment30.near',
    'nfendowment31.near',
    'nfendowment32.near',
    'nfendowment33.near',
    'nfendowment34.near',
    'nfendowment35.near',
    'nfendowment36.near',
    'nfendowment37.near',
    'nfendowment38.near',
    'nfendowment39.near',
    'nfendowment40.near',
    'nfendowment41.near',
    'nfendowment42.near',
    'nfendowment43.near',
    'nfendowment44.near',
    'nfendowment45.near',
    'nfendowment46.near',
    'nfendowment47.near',
    'nfendowment48.near',
    'nfendowment49.near',
    'nfendowment50.near',
    'nfendowment51.near',
    'nfendowment52.near',
    'nfendowment53.near',
    'nfendowment54.near',
    'nfendowment55.near',
    'nfvalidator1.near',
    'nfvalidator2.near',
    'nfvalidator3.near',
    'nfvalidator4.near',
    'treasury.near',
    'yes.near',
    'contributors.near',
    'foundation.near',
    'lockup.near',
    'near',
  ];

  let block = await nearRpc.sendJsonRpc('block', { finality: 'final' });
  let blockHeight = block.header.height;
  const balances = await Promise.all(
    accountsToGetBalancesForSubtraction.map(async (accountId) => {
      while (true) {
        try {
          const account = await nearRpc.sendJsonRpc('query', {
            request_type: 'view_account',
            block_id: blockHeight,
            account_id: accountId,
          });
          return new BN(account.amount);
        } catch (error) {
          console.log(`Retrying to fetch ${accountId} balance...`, error);
          await new Promise((r) => setTimeout(r, DELAY_AFTER_FAILED_REQUEST));
        }
      }
    })
  );
  const amount = balances.reduce((acc, current) => acc.add(current), new BN(0));
  return amount.toString();
};
