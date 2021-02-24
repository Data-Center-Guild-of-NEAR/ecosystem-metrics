import { ExplorerApi } from ".";

export default class StatsApi extends ExplorerApi {
  async activeAccountsCountAggregatedByDate() {
    let accountCount = await this.call("active-accounts-count-aggregated-by-date");
    if(accountCount){
      let currentDayCount = accountCount[accountCount.length -1].accountsCount
      return currentDayCount
    }
    return
  }

  async teraGasAggregatedByDate() {
    let gasList = await this.call('teragas-used-aggregated-by-date');
    if(gasList){
      return gasList.map(gas => Number(gas.teragasUsed)).reduce((gas, current)=> gas + current)
    } 
    return
  }

  async totalDeposit() {
    let totalAmount = await this.call('total-deposit-amount')
    return totalAmount.totalDepositAmount
  }
}