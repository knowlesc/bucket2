var playersFactory = angular.module('PlayersFactory', []);

playersFactory.factory('playersFactory', function() {
    var playersFactory = {};

    // Array of players - {id, name, team}
    playersFactory.players = []

    // The id of the player that will be created next
    playersFactory.nextPlayerId = 0;

    // Teams that players can be assigned to
    playersFactory.playerTeams = [
        1,
        2
    ];

    // Acceptable lengths for the playerTeams array
    playersFactory.allowedNumberOfTeams = [
        2,
        3,
        4,
        5,
        6,
        7,
        8
    ]

    // Pushes a player object to the players array
    playersFactory.addPlayer = function() {
        playersFactory.players.push({
            id : playersFactory.nextPlayerId, 
            name : "", 
            team : 1
        });

        playersFactory.nextPlayerId ++;
    }
    
    // Deletes a player (by id) from the players array
    playersFactory.deletePlayer = function(id) {
        for(var i = 0; i < playersFactory.players.length; i++) {
            if (playersFactory.players[i].id === id) {
                playersFactory.players.splice(i, 1);
            }
        }
    }

    // Assigns players randomly to one of the numbered teams defined in playerTeams
    playersFactory.randomizeTeams = function(numTeams) {
        var playerIndexes = [];
        
        for (var i = 0; i < playersFactory.players.length; i++) {
            playerIndexes.push(i);
        }
        
        shuffle(playerIndexes);

        for (var i = 0; i < playerIndexes.length; i ++)
        {
            playersFactory.players[playerIndexes[i]].team = (i % numTeams) + 1;
        }        
    }
    
    // Sets playerTeams to be an array of length newNum
    playersFactory.changeAllowedNumberOfTeams = function(newNum) {
        playersFactory.playerTeams = [];

        for (var i = 0; i < newNum; i++) {
            playersFactory.playerTeams.push(i + 1);
        }
    }

    // Returns an array of teams that have at least one player
    playersFactory.getActiveTeams = function() {
        var activeTeams = [];
        

        for(var i = 0; i < playersFactory.players.length; i++) {
            if (!contains(activeTeams, playersFactory.players[i].team)) {
                activeTeams.push(playersFactory.players[i].team);
            }
        }
        return activeTeams;
    }

    // Returns a string containing the names of players on a specified team
    playersFactory.getTeamPlayerNames = function(team) {
        var players = "";
        
        for(var i = 0; i < playersFactory.players.length; i++) {
            if (playersFactory.players[i].team === team) {
                
                if (playersFactory.players[i].name === "") {
                    players += "[unnamed]";
                } else {
                    players += (playersFactory.players[i].name);
                }
                players += ", "
            }
        }
        return players.replace(/, $/, "");
    }

    // Checks if an array contains something 
    function contains(a, obj) {
        for (var i = 0; i < a.length; i++) {
            if (a[i] === obj) {
                return true;
            }
        }
        return false;
    }

    // See here: http://stackoverflow.com/a/12646864
    function shuffle(array) {
        for (var i = array.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var temp = array[i];
            array[i] = array[j];
            array[j] = temp;
        }
        return array;
    }

    return playersFactory;
});