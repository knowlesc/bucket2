var app = angular.module('app', []);

app.factory('data', function() {
    
    var fac = {}
    
    fac.teamNumbers = [1, 2, 3, 4, 5, 6, 7, 8];
    
    fac.colors = [
        "",
        "red",
        "blue",
        "green",
        "yellow", 
        "turquoise", 
        "purple", 
        "hotpink",
        "lightgreen",
        "darkblue"
        ];
        
    fac.nhlTeams = [
        "Anaheim Ducks",
        "Arizona Coyotes",
        "Boston Bruins",
        "Buffalo Sabres",
        "Calgary Flames",
        "Carolina Hurricanes",
        "Chicago Blackhawks",
        "Colorado Avalanche",
        "Columbus Blue Jackets",
        "Dallas Stars",
        "Detroit Red Wings",
        "Edmonton Oilers",
        "Florida Panthers",
        "Los Angeles Kings",
        "Minnesota Wild",
        "Montreal Canadiens",
        "Nashville Predators",
        "New Jersey Devils",
        "New York Islanders",
        "New York Rangers",
        "Ottawa Senators",
        "Philadelphia Flyers",
        "Pittsburgh Penguins",
        "San Jose Sharks",
        "St. Louis Blues",
        "Tampa Bay Lightning",
        "Toronto Maple Leafs",
        "Vancouver Canucks",
        "Washington Capitals",
        "Winnipeg Jets"
    ];
        
    return fac;
});
            
app.controller('controller', function ($scope, data) {

    $scope.alerts = [];
    
    $scope.teamNumbers = data.teamNumbers;
    $scope.colors = data.colors;
    $scope.nhlTeams = data.nhlTeams;
    
    $scope.players = [];
    $scope.nextPlayerId = 0;
    
    $scope.draftOrder = [];
    $scope.draftResults = [];
    $scope.draftResultsLastRound = [];
    
    $scope.manualDraftResults = [];         
    $scope.inManualDraft = false;

    $scope.unusedNhlTeams = $scope.nhlTeams.slice();
    
    $scope.home = {team1: 1, team2: 1};
    
    function addAlert(message) {
        if ($scope.alerts.indexOf(message) < 0) {
            $scope.alerts.push(message);
        }
    }
    
    $scope.addPlayer = function() {
        $scope.players.push({id:$scope.nextPlayerId, name:"", team:1});
        $scope.nextPlayerId ++;
        
        resetDraftResults();
    }
    
    $scope.deletePlayer = function(id) {
        for(var i = 0; i < $scope.players.length; i++) {
            if ($scope.players[i].id === id) {
                $scope.players.splice(i, 1);
            }
        }
        
        resetDraftResults();
    }
    
    $scope.drawHome = function() {
    
        $scope.home.team1 = parseInt($scope.home.team1);
        $scope.home.team2 = parseInt($scope.home.team2);
    
        var winningTeam = (Math.floor(Math.random() * 2) == 0) ? $scope.home.team1 : $scope.home.team2;
        var message = winningTeam + " (" + $scope.getPlayersOnTeam(winningTeam) + ")";
        alert(message);
    }
    
    $scope.randomizeTeams = function(numTeams) {
        
        resetDraftResults();
        
        var playerIndexes = [];
        
        for (var i = 0; i < $scope.players.length; i++) {
            playerIndexes.push(i);
        }
        
        shuffle(playerIndexes);

        for (var i = 0; i < playerIndexes.length; i ++)
        {
            $scope.players[playerIndexes[i]].team = (i % numTeams) + 1;
        }
        
    }
    
    function shuffle(array) {
        for (var i = array.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var temp = array[i];
            array[i] = array[j];
            array[j] = temp;
        }
        return array;
    }

    function resetDraftResults() {
        $scope.draftOrder = [];
        $scope.draftResults = [];
        $scope.draftResultsLastRound = [];
        $scope.manualDraftResults = [];
    }
    
    $scope.getDraftOrder = function() {
    
        $scope.draftOrder = [];
        
        var activeTeams = $scope.getActiveTeams().slice();
        
        while (activeTeams.length > 0) {
            var rand = getRandomIntInclusive(0, activeTeams.length - 1);
            $scope.draftOrder.push(activeTeams[rand]);
            activeTeams.splice(rand, 1);
        }
        
    }
    
    $scope.startManualDraft = function() {
        
        var activeTeams = $scope.getActiveTeams();
        
        if ($scope.unusedNhlTeams.length < activeTeams.length) return;
        
        $scope.inManualDraft = true;

        for (var i = 0; i < activeTeams.length; i++) {
            $scope.manualDraftResults.push({
                 team : $scope.draftOrder[i],
                 nhlTeam : ""
                 });
        }
    }
    
    $scope.finishManualDraft = function() {
        for (var i = 0; i < $scope.manualDraftResults.length; i++) {
            if ($scope.manualDraftResults[i].nhlTeam == "") {
                addAlert("You can't leave any manually drafted teams blank!");
                return;
            }
            
            for (var j = 0; j < $scope.manualDraftResults.length, j != i; j++) {
                if ($scope.manualDraftResults[i].nhlTeam === $scope.manualDraftResults[j].nhlTeam) {
                    addAlert("Duplicate teams!");
                    return;
                }
            }
        }
        
        resetLastDraftRoundResults();
        
        for (var i = 0; i < $scope.manualDraftResults.length; i++) {
            draftTeam($scope.manualDraftResults[i].team, $scope.manualDraftResults[i].nhlTeam);
        }

        $scope.manualDraftResults = [];
        $scope.inManualDraft = false;
    }
    
    $scope.cancelManualDraft = function() {
        $scope.manualDraftResults = [];
        $scope.inManualDraft = false;
    }
    
    $scope.autoDraftRound = function() {
        
        var activeTeams = $scope.getActiveTeams().slice();
        
        if ($scope.unusedNhlTeams.length < activeTeams.length) return;
    
        $scope.draftResultsLastRound = [];
        
        resetLastDraftRoundResults();
        
        for (var i = 0; i < activeTeams.length; i++) {
            var rand = getRandomIntInclusive(0, $scope.unusedNhlTeams.length - 1);
            draftTeam($scope.draftOrder[i], $scope.unusedNhlTeams[rand]);
        }
        
    }
    
    function resetLastDraftRoundResults() {
        $scope.draftResultsLastRound = [];
    }
    
    function draftTeam(team, nhlTeam) {
        $scope.draftResults.push({
                 team : team, 
                 nhlTeam : nhlTeam
                 });
         
         $scope.draftResultsLastRound.push({
                 team : team, 
                 nhlTeam : nhlTeam
                 });
                 
        $scope.unusedNhlTeams.splice($scope.unusedNhlTeams.indexOf(nhlTeam), 1);
    }
    
    $scope.getDraftResultsForTeam = function(team) {
    
        var nhlTeams = "";
        
        for(var i = 0; i < $scope.draftResults.length; i++) {
            if ($scope.draftResults[i].team === team) {
                nhlTeams += ($scope.draftResults[i].nhlTeam);
                nhlTeams += ", "
            }
        }
        
        return nhlTeams.replace(/, $/, "");
    }
    
    $scope.getDraftRound = function(index) {
        var teams = $scope.getActiveTeams().length;
        return Math.floor(index/teams) + 1;
    }
    
    function getRandomIntInclusive(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    
    $scope.getActiveTeams = function() {
    
        var activeTeams = [];
        
        for(var i = 0; i < $scope.players.length; i++) {
            if (!contains(activeTeams, $scope.players[i].team)) {
                activeTeams.push($scope.players[i].team);
            }
        }
        
        return activeTeams;
    }
    
    $scope.getPlayersOnTeam = function(team) {
    
        var players = "";
        
        for(var i = 0; i < $scope.players.length; i++) {
            if ($scope.players[i].team === team) {
                
                if ($scope.players[i].name === "") {
                    players += "[unnamed]";
                } else {
                    players += ($scope.players[i].name);
                }
                players += ", "
            }
        }
        
        return players.replace(/, $/, "");
        
    }
    
    function contains(a, obj) {
        for (var i = 0; i < a.length; i++) {
            if (a[i] === obj) {
                return true;
            }
        }
        return false;
    }
    
});
