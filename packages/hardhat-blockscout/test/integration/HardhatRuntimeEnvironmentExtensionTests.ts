import { assert } from "chai";

import { useEnvironment } from "../helpers";

describe("hardhat-etherscan configuration extension", function () {
  useEnvironment("hardhat-project-defined-config", "hardhat");

  it("the blockscout field should be present", function () {
    assert.isDefined(this.env.config.etherscan);
  });

  it("the blockscout token should have value from hardhat.env.config.js", function () {
    const { etherscan } = this.env.config;

    assert.equal(etherscan.apiKey, "testtoken");
  });
});

describe("hardhat-etherscan configuration defaults in an empty project", function () {
  useEnvironment("hardhat-project-undefined-config", "hardhat");

  it("the blockscout field should be present", function () {
    assert.isDefined(this.env.config.etherscan);
  });
});
