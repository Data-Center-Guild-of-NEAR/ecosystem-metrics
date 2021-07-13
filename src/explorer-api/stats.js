import { ExplorerApi } from '.';

export default class StatsApi extends ExplorerApi {
  async activeAccountsCountAggregatedByDate() {
    return await this.call('active-accounts-count-aggregated-by-date');
  }

  async activeAccountsCountAggregatedByWeek() {
    return await this.call('active-accounts-count-aggregated-by-week');
  }

  async teraGasAggregatedByDate() {
    let gasList = await this.call('teragas-used-aggregated-by-date');
    if (gasList) {
      let weekAgoGas = gasList
        .slice(0, gasList.length - 7)
        .map((gas) => Number(gas.teragasUsed))
        .reduce((gas, current) => gas + current);
      let totalGas = gasList
        .map((gas) => Number(gas.teragasUsed))
        .reduce((gas, current) => gas + current);
      return { totalGas, weekAgoGas };
    }
    return;
  }

  async depositAmountAggregatedByDate() {
    return await this.call('deposit-amount-aggregated-by-date');
  }

  async getTotalSupply(height) {
    let result = await this.call('select:INDEXER_BACKEND', [
      `select total_supply from blocks where block_height = :height`,
      { height },
    ]);
    return result[0].total_supply;
  }

  async transactionsAggregatedByDate() {
    return await this.call('transactions-count-aggregated-by-date');
  }

  async newAccountsCountAggregatedByDate() {
    return await this.call('new-accounts-count-aggregated-by-date');
  }

  async queryActiveAccountsCountAggregatedByMonth() {
    return await this.call('select:INDEXER_BACKEND', [
      `SELECT
      DATE_TRUNC('month', TO_TIMESTAMP(DIV(transactions.block_timestamp, 1000*1000*1000))) AS date,
      COUNT(DISTINCT transactions.signer_account_id) AS active_accounts_count_by_month
    FROM transactions
    JOIN execution_outcomes ON execution_outcomes.receipt_id = transactions.converted_into_receipt_id
    WHERE execution_outcomes.status IN ('SUCCESS_VALUE', 'SUCCESS_RECEIPT_ID')
    AND transactions.block_timestamp < ((CAST(EXTRACT(EPOCH FROM DATE_TRUNC('week', NOW())) AS bigint)) * 1000 * 1000 * 1000)
    GROUP BY date
    ORDER BY date`,
    ]);
  }

  async getLockupAccountIds(blockHeight) {
    return await this.call('select:INDEXER_BACKEND', [
      `SELECT accounts.account_id
      FROM accounts
               LEFT JOIN receipts AS receipts_start ON accounts.created_by_receipt_id = receipts_start.receipt_id
               LEFT JOIN blocks AS blocks_start ON receipts_start.included_in_block_hash = blocks_start.block_hash
               LEFT JOIN receipts AS receipts_end ON accounts.deleted_by_receipt_id = receipts_end.receipt_id
               LEFT JOIN blocks AS blocks_end ON receipts_end.included_in_block_hash = blocks_end.block_hash
      WHERE accounts.account_id like '%.lockup.near'
        AND (blocks_start.block_height IS NULL OR blocks_start.block_height <= ${blockHeight})
        AND (blocks_end.block_height IS NULL OR blocks_end.block_height >= ${blockHeight});`,
    ]);
  }

  async getLatestCirculatingSupply() {
    return await this.call('get-latest-circulating-supply');
  }
}
