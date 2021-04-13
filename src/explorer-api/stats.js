import { ExplorerApi } from ".";

export default class StatsApi extends ExplorerApi {
  async activeAccountsCountAggregatedByDate() {
    return await this.call("active-accounts-count-aggregated-by-date");    
  }

  async activeAccountsCountAggregatedByWeek() {
    return await this.call("active-accounts-count-aggregated-by-week");    
  }

  async teraGasAggregatedByDate() {
    let gasList = await this.call('teragas-used-aggregated-by-date');
    if(gasList){
      let weekAgoGas = gasList.slice(0, gasList.length - 7).map(gas => Number(gas.teragasUsed)).reduce((gas, current)=> gas + current)
      let totalGas = gasList.map(gas => Number(gas.teragasUsed)).reduce((gas, current)=> gas + current)
      return { totalGas, weekAgoGas }
    } 
    return
  }

  async depositAmountAggregatedByDate() {
    return await this.call('deposit-amount-aggregated-by-date')
  }

  async getTotalSupply(height) {
    let result = await this.call("select:INDEXER_BACKEND",[
      `select total_supply from blocks where block_height = :height`,
      {height}
    ])
    return result[0].total_supply
  }
}