import { NomicLabsHardhatPluginError } from "hardhat/plugins";
import type { Response } from "node-fetch";

import { pluginName } from "../constants";

import {
  BlockscoutCheckStatusRequest,
  BlockscoutVerifyRequest,
} from "./BlockscoutVerifyContractRequest";

export async function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Used for polling the result of the contract verification.
const verificationIntervalMs = 3000;

export async function verifyContract(
  url: string,
  req: BlockscoutVerifyRequest
): Promise<BlockscoutResponse> {
  const { default: fetch } = await import("node-fetch");
  const parameters = new URLSearchParams({ ...req });
  const requestDetails = {
    method: "post",
    body: parameters,
  };

  let response: Response;
  try {
    response = await fetch(url, requestDetails);
  } catch (error) {
    throw new NomicLabsHardhatPluginError(
      pluginName,
      `Failed to send contract verification request.
Endpoint URL: ${url}
Reason: ${error.message}`,
      error
    );
  }

  if (!response.ok) {
    // This could be always interpreted as JSON if there were any such guarantee in the Etherscan API.
    const responseText = await response.text();
    throw new NomicLabsHardhatPluginError(
      pluginName,
      `Failed to send contract verification request.
Endpoint URL: ${url}
The HTTP server response is not ok. Status code: ${response.status} Response text: ${responseText}`
    );
  }

  const blockscoutResponse = new BlockscoutResponse(await response.json());

  if (blockscoutResponse.isBytecodeMissingInNetworkError()) {
    throw new NomicLabsHardhatPluginError(
      pluginName,
      `Failed to send contract verification request.
Endpoint URL: ${url}
Reason: The Etherscan API responded that the address ${req.contractaddress} does not have bytecode.
This can happen if the contract was recently deployed and this fact hasn't propagated to the backend yet.
Try waiting for a minute before verifying your contract. If you are invoking this from a script,
try to wait for five confirmations of your contract deployment transaction before running the verification subtask.`
    );
  }

  if (!blockscoutResponse.isOk()) {
    throw new NomicLabsHardhatPluginError(
      pluginName,
      blockscoutResponse.message
    );
  }

  return blockscoutResponse;
}

export async function getVerificationStatus(
  url: string,
  req: BlockscoutCheckStatusRequest
): Promise<BlockscoutResponse> {
  const parameters = new URLSearchParams({ ...req });
  const urlWithQuery = new URL(url);
  urlWithQuery.search = parameters.toString();

  const { default: fetch } = await import("node-fetch");
  let response;
  try {
    response = await fetch(urlWithQuery);

    if (!response.ok) {
      // This could be always interpreted as JSON if there were any such guarantee in the Etherscan API.
      const responseText = await response.text();
      const message = `The HTTP server response is not ok. Status code: ${response.status} Response text: ${responseText}`;

      throw new NomicLabsHardhatPluginError(pluginName, message);
    }
  } catch (error) {
    throw new NomicLabsHardhatPluginError(
      pluginName,
      `Failure during etherscan status polling. The verification may still succeed but
should be checked manually.
Endpoint URL: ${urlWithQuery}
Reason: ${error.message}`,
      error
    );
  }

  const blockscoutResponse = new BlockscoutResponse(await response.json());

  if (blockscoutResponse.isPending()) {
    await delay(verificationIntervalMs);

    return getVerificationStatus(url, req);
  }

  if (blockscoutResponse.isVerificationFailure()) {
    return blockscoutResponse;
  }

  if (!blockscoutResponse.isOk()) {
    throw new NomicLabsHardhatPluginError(
      pluginName,
      `The Etherscan API responded with a failure status.
The verification may still succeed but should be checked manually.
Reason: ${blockscoutResponse.message}`
    );
  }

  return blockscoutResponse;
}

export default class BlockscoutResponse {
  public readonly status: number;

  public readonly message: string;

  constructor(response: any) {
    this.status = parseInt(response.status, 10);
    this.message = response.result;
  }

  public isPending() {
    return this.message === "Pending in queue";
  }

  public isVerificationFailure() {
    return this.message === "Fail - Unable to verify";
  }

  public isVerificationSuccess() {
    return this.message === "Pass - Verified";
  }

  public isBytecodeMissingInNetworkError() {
    return this.message.startsWith("Unable to locate ContractCode at");
  }

  public isOk() {
    return this.status === 1;
  }
}
