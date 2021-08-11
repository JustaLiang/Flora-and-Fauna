// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../interfaces/ArmyInterface.sol";

contract Battlefield {
    uint public fieldSize;
    mapping (uint => uint[]) public field;
    mapping (uint => bool) public fieldIsGreen;
    ArmyInterface public greenArmy;
    ArmyInterface public redArmy;
    int public refStrength;

    constructor(address greenAddr, address redAddr) {
        fieldSize = 100;
        refStrength = 1000;
        greenArmy = ArmyInterface(greenAddr);
        redArmy = ArmyInterface(redAddr);
    }

    function greenConquer(uint fieldID, uint[] calldata squad) external {
        require(fieldID < fieldSize);
        for(uint i = 0; i < squad.length; i++) {
            require(greenArmy.ownerOf(squad[i]) == msg.sender);
        }
        uint[] memory quater;
        require(squad.length == quater.length ||
                squad.length == quater.length + 1);
        if (quater.length != 0) {
            require(!fieldIsGreen[fieldID]);
            if (squad.length == quater.length) {
                for (uint i = 0; i < quater.length; i++) {
                    (address gAddr,bool gArmed,,int gStrength) = greenArmy.getMinionInfo(squad[i]);
                    (address rAddr,bool rArmed,,int rStrength) = redArmy.getMinionInfo(squad[i]);
                    require(!rArmed || (gArmed && gAddr == rAddr && gStrength > rStrength));
                }
            }
            else {
                (address extraAddr,bool extraArmed,,int extraStrength) = greenArmy.getMinionInfo(squad[squad.length-1]);
                require(extraArmed);
                for (uint i = 0; i < quater.length; i++) {
                    (address gAddr,bool gArmed,,int gStrength) = greenArmy.getMinionInfo(squad[i]);
                    (address rAddr,bool rArmed,,int rStrength) = redArmy.getMinionInfo(squad[i]);                    
                    require(!rArmed || (gArmed && gAddr == rAddr && extraAddr != rAddr &&
                        gStrength*extraStrength/refStrength > rStrength));
                }
            }
        }
        field[fieldID] = squad;
        fieldIsGreen[fieldID] = true;
    }

    function redConquer(uint fieldID, uint[] calldata squad) external {
        require(fieldID < fieldSize);
        for(uint i = 0; i < squad.length; i++) {
            require(redArmy.ownerOf(squad[i]) == msg.sender);
        }
        uint[] memory quater;
        require(squad.length == quater.length ||
                squad.length == quater.length + 1);
        if (quater.length != 0) {
            require(fieldIsGreen[fieldID]);
            if (squad.length == quater.length) {
                for (uint i = 0; i < quater.length; i++) {
                    (address rAddr,bool rArmed,,int rStrength) = redArmy.getMinionInfo(squad[i]);
                    (address gAddr,bool gArmed,,int gStrength) = greenArmy.getMinionInfo(squad[i]);
                    require(!gArmed || (rArmed && rAddr == gAddr && rStrength > gStrength));
                }
            }
            else {
                (address extraAddr,bool extraArmed,,int extraStrength) = redArmy.getMinionInfo(squad[squad.length-1]);
                require(extraArmed);
                for (uint i = 0; i < quater.length; i++) {
                    (address rAddr,bool rArmed,,int rStrength) = redArmy.getMinionInfo(squad[i]);
                    (address gAddr,bool gArmed,,int gStrength) = greenArmy.getMinionInfo(squad[i]);                    
                    require(!gArmed || (rArmed && rAddr == gAddr && extraAddr != gAddr &&
                        rStrength*extraStrength/refStrength > gStrength));
                }
            }
        }
        field[fieldID] = squad;
        fieldIsGreen[fieldID] = false;
    }
}