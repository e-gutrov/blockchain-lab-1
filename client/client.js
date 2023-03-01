const Web3 = require("web3");

// Loading the contract ABI
// (the results of a previous compilation step)
const fs = require("fs");
const { abi } = JSON.parse(fs.readFileSync("CHBSHToken.json"));

function assert(condition, message) {
    if (!condition) {
        throw message || "Assertion failed";
    }
}

async function main() {
    assert(process.argv.length >= 3, "Not enough arguments. Options: create, remove, events");

    // Configuring the connection to an Ethereum node
    const network = process.env.ETHEREUM_NETWORK;
    const web3 = new Web3(
      new Web3.providers.HttpProvider(
        `https://${network}.infura.io/v3/${process.env.INFURA_API_KEY}`
      )
    );
    // Creating a signing account from a private key
    const signer = web3.eth.accounts.privateKeyToAccount(
      process.env.SIGNER_PRIVATE_KEY
    );
    web3.eth.accounts.wallet.add(signer);
    // Creating a Contract instance
    const contract = new web3.eth.Contract(
      abi,
      process.env.CONTRACT
    );
    var tx;
    const method = process.argv[2];
    if (method == "create") {
        assert(process.argv.length == 5, "Invalid count of arguments. Usage: add NAME IS_REAL");
        tx = contract.methods.createCharacter(process.argv[3], Boolean(process.argv[4]));
    } else if (method == "remove") {
        assert(process.argv.length == 4, "Invalid count of arguments. Usage: remove ID");
        tx = contract.methods.removeCharacter(process.argv[3]);
    } else if (method == "events") {
        assert(
            process.argv.length == 4,
            "Invalid count of arguments. Usage: events TYPE (TYPE values: CharacterCreated, CharacterRemoved, allEvents)");
        console.log(await contract.getPastEvents(process.argv[3], {fromBlock: 0}));
        process.exit(0);
    }else {
        throw "Unsupported method";
    }

    const receipt = await tx
      .send({
        from: signer.address,
        gas: 2 * await tx.estimateGas(),
      })
      .once("transactionHash", (txhash) => {
        console.log(`Mining transaction ...`);
        console.log(`https://${network}.etherscan.io/tx/${txhash}`);
      });
    // The transaction is now on chain!
    console.log(`Mined in block ${receipt.blockNumber}`);
  }
  
  require("dotenv").config();
  main();