import * as nearApi from 'near-api-js';

const nearRpcUrl = "https://rpc.mainnet.near.org"

export const nearRpc = new nearApi.providers.JsonRpcProvider(nearRpcUrl)