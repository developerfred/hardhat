import {
  HARDHAT_NETWORK_NAME,
  NomicLabsHardhatPluginError,
} from "hardhat/plugins";
import { EthereumProvider } from "hardhat/types";

import { pluginName } from "../constants";

export interface BlockscoutURLs {
  apiURL: string;
  browserURL: string;
}

type NetworkMap = {
  [networkID in NetworkID]: BlockscoutURLs;
};

// See https://github.com/ethereum/EIPs/blob/master/EIPS/eip-155.md#list-of-chain-ids
enum NetworkID {
  MAINNET = 1,
  ROPSTEN = 3,
  RINKEBY = 4,
  GOERLI = 5,
  KOVAN = 42,
  CALLISTO = 820,
  CALLISTO_TESTNET = 821,
  // Binance Smart Chain
  BSC = 56,
  BSC_TESTNET = 97,
  // Huobi ECO Chain
  HECO = 128,
  HECO_TESTNET = 256,
  // Fantom mainnet
  OPERA = 250,
  // Optimistim
  OPTIMISTIC_ETHEREUM = 10,
  OPTIMISTIC_KOVAN = 69,
  // Polygon
  POLYGON = 137,
  POLYGON_MUMBAI = 80001,
  // Arbitrum
  ARBITRUM_ONE = 42161,
  ARBITRUM_XDAI = 200,
  // Fuse
  FUSE = 122,
  // xDAI
  XDAI = 100,
  // RSK
  RSK_MAINNET = 30,
  RSK_TESTNET = 31,
  // POA
  SOKOL = 77,
  POA = 99
}

const networkIDtoEndpoints: NetworkMap = {
  [NetworkID.MAINNET]: {
    apiURL: "https://blockscout.com/eth/mainnet/api",
    browserURL: "https://blockscout.com/eth/mainnet",
  },
  [NetworkID.ROPSTEN]: {
    apiURL: "https://blockscout.com/eth/ropsten/api",
    browserURL: "https://blockscout.com/eth/ropsten",
  },
  [NetworkID.RINKEBY]: {
    apiURL: "https://blockscout.com/eth/rinkeby/api",
    browserURL: "https://blockscout.com/eth/rinkeby",
  },
  [NetworkID.GOERLI]: {
    apiURL: "https://blockscout.com/eth/goerli/api",
    browserURL: "https://blockscout.com/eth/goerli",
  },
  [NetworkID.KOVAN]: {
    apiURL: "https://blockscout.com/eth/kovan/api",
    browserURL: "https://blockscout.com/eth/kovan",
  },
  [NetworkID.CALLISTO]: {
    apiURL: "https://blockscout.com/callisto/mainnet/api",
    browserURL: "https://blockscout.com/callisto/mainnet",
  },
  [NetworkID.CALLISTO_TESTNET]: {
    apiURL: "https://blockscout.com/callisto/testnet/api",
    browserURL: "https://blockscout.com/callisto/testnet",
  },
  [NetworkID.BSC]: {
    apiURL: "https://api.bscscan.com/api",
    browserURL: "https://bscscan.com",
  },
  [NetworkID.BSC_TESTNET]: {
    apiURL: "https://api-testnet.bscscan.com/api",
    browserURL: "https://testnet.bscscan.com",
  },
  [NetworkID.HECO]: {
    apiURL: "https://api.hecoinfo.com/api",
    browserURL: "https://hecoinfo.com",
  },
  [NetworkID.HECO_TESTNET]: {
    apiURL: "https://api-testnet.hecoinfo.com/api",
    browserURL: "https://testnet.hecoinfo.com",
  },
  [NetworkID.OPERA]: {
    apiURL: "https://api.ftmscan.com/api",
    browserURL: "https://ftmscan.com",
  },
  [NetworkID.OPTIMISTIC_ETHEREUM]: {
    apiURL: "https://api-optimistic.etherscan.io/api",
    browserURL: "https://optimistic.etherscan.io/",
  },
  [NetworkID.OPTIMISTIC_KOVAN]: {
    apiURL: "https://api-kovan-optimistic.etherscan.io/api",
    browserURL: "https://kovan-optimistic.etherscan.io/",
  },
  [NetworkID.POLYGON]: {
    apiURL: "https://api.polygonscan.com/api",
    browserURL: "https://polygonscan.com",
  },
  [NetworkID.POLYGON_MUMBAI]: {
    apiURL: "https://api-testnet.polygonscan.com/api",
    browserURL: "https://mumbai.polygonscan.com/",
  },
  [NetworkID.ARBITRUM_ONE]: {
    apiURL: "https://api.arbiscan.io/api",
    browserURL: "https://arbiscan.io/",
  },
  [NetworkID.ARBITRUM_XDAI]: {
    apiURL: "https://blockscout.com/xdai/aox/api",
    browserURL: "https://blockscout.com/xdai/aox",
  },
  [NetworkID.FUSE]: {
    apiURL: "https://explorer.fuse.io/api",
    browserURL: "https://explorer.fuse.io/",
  },
  [NetworkID.XDAI]: {
    apiURL: "https://blockscout.com/xdai/mainnet/api",
    browserURL: "https://blockscout.com/xdai/mainnet",
  },
  [NetworkID.RSK_MAINNET]: {
    apiURL: "https://blockscout.com/rsk/mainnet/api",
    browserURL: "https://blockscout.com/rsk/mainnet",
  },
  [NetworkID.RSK_TESTNET]: {
    apiURL: "https://blockscout.com/rsk/testnet/api",
    browserURL: "https://blockscout.com/rsk/testnet",
  },
  [NetworkID.SOKOL]: {
    apiURL: "https://blockscout.com/poa/sokol/api",
    browserURL: "https://blockscout.com/poa/sokol",
  },
  [NetworkID.POA]: {
    apiURL: "https://blockscout.com/poa/core/api",
    browserURL: "https://blockscout.com/poa/core",
  },
};

export async function getEtherscanEndpoints(
  provider: EthereumProvider,
  networkName: string
): Promise<BlockscoutURLs> {
  if (networkName === HARDHAT_NETWORK_NAME) {
    throw new NomicLabsHardhatPluginError(
      pluginName,
      `The selected network is ${networkName}. Please select a network supported by Etherscan.`
    );
  }

  const chainID = parseInt(await provider.send("eth_chainId"), 16) as NetworkID;

  const endpoints = networkIDtoEndpoints[chainID];

  if (endpoints === undefined) {
    throw new NomicLabsHardhatPluginError(
      pluginName,
      `An etherscan endpoint could not be found for this network. ChainID: ${chainID}. The selected network is ${networkName}.

Possible causes are:
  - The selected network (${networkName}) is wrong.
  - Faulty hardhat network config.`
    );
  }

  return endpoints;
}

export async function retrieveContractBytecode(
  address: string,
  provider: EthereumProvider,
  networkName: string
): Promise<string> {
  const bytecodeString = (await provider.send("eth_getCode", [
    address,
    "latest",
  ])) as string;
  const deployedBytecode = bytecodeString.startsWith("0x")
    ? bytecodeString.slice(2)
    : bytecodeString;
  if (deployedBytecode.length === 0) {
    throw new NomicLabsHardhatPluginError(
      pluginName,
      `The address ${address} has no bytecode. Is the contract deployed to this network?
The selected network is ${networkName}.`
    );
  }
  return deployedBytecode;
}
