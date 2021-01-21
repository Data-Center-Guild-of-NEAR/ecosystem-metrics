import { ExplorerApi } from ".";

export default class StatsApi extends ExplorerApi {
  async activeAccountsCountAggregatedByDate() {
    return await this.call(
      "active-accounts-count-aggregated-by-date"
    );
  }
  
  fetchNodeInfo(nodes) {
    return nodes[0]
  } 

  activeValidators() {
    return this.subscribe("node-stats", this.fetchNodeInfo)
  }
}