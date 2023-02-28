// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract CHBSHToken is ERC20, Ownable {
    struct Character {
        address creator;
        uint id;
        string name;
        bool is_real;
    }

    event CharacterCreated(address creator, uint id, string name);
    event CharacterRemoved(address creator, uint id, string name);

    uint curId;
    mapping(uint => Character) public characters;

    function mint(address account, uint256 amount) public onlyOwner {
        _mint(account, amount);
    }

    function burn(address account, uint256 amount) public onlyOwner {
        _burn(account, amount);
    }

    constructor() ERC20("Cheburashka Token", "CHBSH") {
        mint(msg.sender, 1000000);
        curId = 0;
    }

    function createCharacter(string memory name, bool is_real) public {
        characters[curId] = Character(msg.sender, curId, name, is_real);
        curId += 1;

        emit CharacterCreated(msg.sender, curId - 1, name);
    }

    function removeCharacter(uint id) public {
        // Not sure if it should be storage (as it's stored
        // on blockchain) or memory (as we delete it)
        Character memory character = characters[id];
        require(msg.sender == character.creator, "You can only remove your characters");
        emit CharacterRemoved(msg.sender, id, character.name);

        delete characters[id];
    }
}
