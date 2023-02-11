
const { ethers } = require("hardhat");

async function main() {
  const tokenAddress = "0xe903d1a813888dc81bb7715b05612dd313ad1c3e";
  const ownerAddress = "0x406b04beE15c6F0df9c0Ee404eDA683b36517290";
  const toMint = ethers.utils.parseEther("1000000");

  const factory = await ethers.getContractFactory("CHBSHToken");
  const CHBSHToken = await factory.attach(tokenAddress);
  await CHBSHToken.mint(ownerAddress, toMint);

  console.log("Done");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });