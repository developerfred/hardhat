export interface BlockscoutRequest {
  apikey: string;
  module: "contract";
  action: string;
}

export interface BlockscoutVerifyRequest extends BlockscoutRequest {
  action: "verifysourcecode";
  contractaddress: string;
  sourceCode: string;
  codeformat: "solidity-standard-json-input";
  contractname: string;
  compilerversion: string;
  // This is misspelt in Etherscan's actual API parameters.
  // See: https://etherscan.io/apis#contracts
  constructorArguements: string;
}

export interface BlockscoutCheckStatusRequest extends BlockscoutRequest {
  action: "checkverifystatus";
  guid: string;
}

export function toVerifyRequest(params: {
  apiKey: string;
  contractAddress: string;
  sourceCode: string;
  sourceName: string;
  contractName: string;
  compilerVersion: string;
  constructorArguments: string;
}): BlockscoutVerifyRequest {
  return {
    apikey: params.apiKey,
    module: "contract",
    action: "verifysourcecode",
    contractaddress: params.contractAddress,
    sourceCode: params.sourceCode,
    codeformat: "solidity-standard-json-input",
    contractname: `${params.sourceName}:${params.contractName}`,
    compilerversion: params.compilerVersion,
    constructorArguements: params.constructorArguments,
  };
}

export function toCheckStatusRequest(params: {
  apiKey: string;
  guid: string;
}): BlockscoutCheckStatusRequest {
  return {
    apikey: params.apiKey,
    module: "contract",
    action: "checkverifystatus",
    guid: params.guid,
  };
}
