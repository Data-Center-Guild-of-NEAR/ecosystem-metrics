import { ExplorerApi } from ".";

export default class StatsApi extends ExplorerApi {
  async activeAccountsCountAggregatedByDate() {
    return await this.call("active-accounts-count-aggregated-by-date");    
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