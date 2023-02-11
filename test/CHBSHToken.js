const { expect } = require("chai");

const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

describe("Token contract", function () {
  // We define a fixture to reuse the same setup in every test. We use
  // loadFixture to run this setup once, snapshot that state, and reset Hardhat
  // Network to that snapshot in every test.
  async function deployTokenFixture() {
    const Token = await ethers.getContractFactory("CHBSHToken");
    const [owner, addr1, addr2] = await ethers.getSigners();

    const CHBSHToken = await Token.deploy();

    await CHBSHToken.deployed();

    return { Token, CHBSHToken, owner, addr1, addr2 };
  }

  // You can nest describe calls to create subsections.
  describe("Deployment", function () {
    it("Should have the correct name", async () => {
      const { CHBSHToken } = await loadFixture(deployTokenFixture);

      expect(await CHBSHToken.name()).to.equal("Cheburashka Token");
    });

    it("Should have the correct symbol", async () => {
      const { CHBSHToken } = await loadFixture(deployTokenFixture);

      expect(await CHBSHToken.symbol()).to.equal("CHBSH");
    });

    it("Should set the right owner", async function () {
      const { CHBSHToken, owner } = await loadFixture(deployTokenFixture);

      // This test expects the owner variable stored in the contract to be
      // equal to our Signer's owner.
      expect(await CHBSHToken.owner()).to.equal(owner.address);
    });

    it("Should assign the total supply of tokens to the owner", async function () {
      const { CHBSHToken, owner } = await loadFixture(deployTokenFixture);
      const ownerBalance = await CHBSHToken.balanceOf(owner.address);
      expect(await CHBSHToken.totalSupply()).to.equal(ownerBalance);
    });
  });

  describe("Transactions", function () {
    it("Should transfer tokens between accounts", async function () {
      const { CHBSHToken, owner, addr1, addr2 } = await loadFixture(
        deployTokenFixture
      );
      // Transfer 50 tokens from owner to addr1
      await expect(
        CHBSHToken.transfer(addr1.address, 50)
      ).to.changeTokenBalances(CHBSHToken, [owner, addr1], [-50, 50]);

      // We use .connect(signer) to send a transaction from another account
      await expect(
        CHBSHToken.connect(addr1).transfer(addr2.address, 50)
      ).to.changeTokenBalances(CHBSHToken, [addr1, addr2], [-50, 50]);
    });

    it("Should emit Transfer events", async function () {
      const { CHBSHToken, owner, addr1, addr2 } = await loadFixture(
        deployTokenFixture
      );

      await expect(CHBSHToken.transfer(addr1.address, 50))
        .to.emit(CHBSHToken, "Transfer")
        .withArgs(owner.address, addr1.address, 50);

      await expect(CHBSHToken.connect(addr1).transfer(addr2.address, 50))
        .to.emit(CHBSHToken, "Transfer")
        .withArgs(addr1.address, addr2.address, 50);
    });

    it("Should fail if sender doesn't have enough tokens", async function () {
      const { CHBSHToken, owner, addr1 } = await loadFixture(
        deployTokenFixture
      );
      const initialOwnerBalance = await CHBSHToken.balanceOf(owner.address);

      await expect(
        CHBSHToken.connect(addr1).transfer(owner.address, 1)
      ).to.be.revertedWith("ERC20: transfer amount exceeds balance");

      expect(await CHBSHToken.balanceOf(owner.address)).to.equal(
        initialOwnerBalance
      );
    });
  });

  describe("Minting/burning", function () {
    it("Minting to another user", async function () {
      const { CHBSHToken, owner, addr1 } = await loadFixture(
        deployTokenFixture
      );
      const ownerBalance = await CHBSHToken.balanceOf(owner.address);   
      const newTokens = 1337;
      await CHBSHToken.mint(addr1.address, newTokens);

      expect(await CHBSHToken.balanceOf(addr1.address)).to.equal(newTokens);
      expect(await CHBSHToken.totalSupply()).to.equal(ownerBalance.add(newTokens));
    });

    it("Burning tokens", async function () {
      const { CHBSHToken, owner } = await loadFixture(
        deployTokenFixture
      );
      const ownerBalance = await CHBSHToken.balanceOf(owner.address);
      expect(ownerBalance).to.greaterThan(0);

      await CHBSHToken.burn(owner.address, ownerBalance);
      expect(await CHBSHToken.balanceOf(owner.address)).to.equal(0);
      expect(await CHBSHToken.totalSupply()).to.equal(0);

      // owner balance is now 0
      await expect(
        CHBSHToken.burn(owner.address, 1)
      ).to.be.revertedWith("ERC20: burn amount exceeds balance");
    });
  })
});