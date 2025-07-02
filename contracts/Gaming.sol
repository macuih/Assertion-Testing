pragma solidity 0.5.0;

contract Gaming {
    address owner;
    bool online;

    struct Player {
        address player;
        string playerName;
        uint playerBalance;
        uint wins;
        uint losses;
    }

    mapping(address => Player) public players;

    constructor() public payable {
        owner = msg.sender;
        online = true;
    }

    // Allow the contract to receive Ether directly
    function() external payable {}

    function mysteryNumber() internal view returns (uint) {
        uint randomNumber = uint(blockhash(block.number - 1)) % 10 + 1;
        return randomNumber;
    }

    function determineWinner(uint number, uint display, bool guess) public pure returns (bool) {
        if (guess == true) {
            if (number > display) {
                return true;
            }
        } else if (guess == false) {
            if (number > display) {
                return false;
            }
        }
        return false; // default fallback
    }

    function winOrLose(uint display, bool guess, uint wager) external payable returns (bool) {
        require(online == true, "Game must be online");
        require(msg.sender.balance >= msg.value, "Insufficient funds");
        require(msg.value == wager, "Wager and value sent must match");

        uint secret = mysteryNumber();
        bool win = determineWinner(secret, display, guess);

        // Initialize player if first time
        players[msg.sender].player = msg.sender;

        if (win) {
            players[msg.sender].wins += 1;
        } else {
            players[msg.sender].losses += 1;
        }

        return win;
    }

    function withdrawFunds() public {
        require(msg.sender == owner, "Only owner can withdraw");
        msg.sender.transfer(address(this).balance);
    }
}

