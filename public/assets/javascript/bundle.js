var app = angular.module('app', [
    'ngRoute',
    'PlayerPicker',
    'BucketDraft',
    'SidePicker',
    'BucketHeader'    
]);

app.config(['$routeProvider', function($routeProvider) {
    $routeProvider
    .when('/Players', {
        templateUrl: 'partials/PlayerPicker.html',
    })
    .when('/Draft', {
        templateUrl: 'partials/Draft.html',
    })
    .when('/Sides', {
        templateUrl: 'partials/SidePicker.html',
    })
    .otherwise({
        redirectTo: '/Players',
    });
}]);

app.constant('colors', [
    '',
    '#2980b9',
    '#e67e22',
    '#8e44ad',
    '#27ae60', 
    '#ffffff', 
    '#2c3e50',
    '#c0392b',
    '#f1c40f'
]);

app.constant('nhlTeams' , [
    { abbr: 'ANA', name: 'Anaheim Ducks'},
    { abbr: 'ARI', name: 'Arizona Coyotes'},
    { abbr: 'BOS', name: 'Boston Bruins'},
    { abbr: 'BUF', name: 'Buffalo Sabres'},
    { abbr: 'CGY', name: 'Calgary Flames'},
    { abbr: 'CAR', name: 'Carolina Hurricanes'},
    { abbr: 'CHI', name: 'Chicago Blackhawks'},
    { abbr: 'COL', name: 'Colorado Avalanche'},
    { abbr: 'CBJ', name: 'Columbus Blue Jackets'},
    { abbr: 'DAL', name: 'Dallas Stars'},
    { abbr: 'DET', name: 'Detroit Red Wings'},
    { abbr: 'EDM', name: 'Edmonton Oilers'},
    { abbr: 'FLA', name: 'Florida Panthers'},
    { abbr: 'LAK', name: 'Los Angeles Kings'},
    { abbr: 'MIN', name: 'Minnesota Wild'},
    { abbr: 'MTL', name: 'Montreal Canadiens'},
    { abbr: 'NSH', name: 'Nashville Predators'},
    { abbr: 'NJD', name: 'New Jersey Devils'},
    { abbr: 'NYI', name: 'New York Islanders'},
    { abbr: 'NYR', name: 'New York Rangers'},
    { abbr: 'OTT', name: 'Ottawa Senators'},
    { abbr: 'PHI', name: 'Philadelphia Flyers'},
    { abbr: 'PIT', name: 'Pittsburgh Penguins'},
    { abbr: 'SJS', name: 'San Jose Sharks'},
    { abbr: 'STL', name: 'St. Louis Blues'},
    { abbr: 'TBL', name: 'Tampa Bay Lightning'},
    { abbr: 'TOR', name: 'Toronto Maple Leafs'},
    { abbr: 'VAN', name: 'Vancouver Canucks'},
    { abbr: 'WSH', name: 'Washington Capitals'},
    { abbr: 'WPG', name: 'Winnipeg Jets'}
]);
var buttonTile = angular.module('ButtonTile', ['ui.bootstrap']);

buttonTile.controller('ButtonTileCtrl', function() {
    this.getGlyphiconClass = function() {
        return 'glyphicon-' + this.glyphicon;
    }
});

buttonTile.directive('buttonTile', function() {
    return {
        restrict: 'AE',
        scope: {
            glyphicon: '=',
            label: '=',
            clickFunction : '&'
        },
        bindToController: true,
        controller: 'ButtonTileCtrl',
        controllerAs: 'ButtonTileCtrl',
        template: `
            <div class="tile tile-selectable">
                <button class="btn tile-button pull-right" 
                    ng-click="ButtonTileCtrl.clickFunction()">

                    <span class="glyphicon" 
                        ng-class="ButtonTileCtrl.getGlyphiconClass()">
                    </span>
                    <span ng-bind="ButtonTileCtrl.label"></span>

                </button>
            </div>
        `
    };
});
var bucketDraft = angular.module('BucketDraft', ['DraftTile', 'TeamTile', 'ButtonTile', 'DraftFactory', "PlayersFactory"]);

bucketDraft.directive('bucketDraft', function() {
    return {
        restrict: 'AE',
        controller: 'DraftCtrl',
        controllerAs: 'DraftCtrl',
        template: `
            <div class="draft-container">

                <div ng-if="!DraftCtrl.validatePlayers()">
                    Each player must have a name and assigned team!
                </div>

                <div ng-if="!DraftCtrl.validateTeams()">
                    There must be at least two active teams!
                </div>

                <div ng-if="DraftCtrl.validatePlayers() && DraftCtrl.validateTeams()">

                    <div class="round-heading">
                        Draft Order
                    </div>

                    <team-tile 
                        ng-repeat="team in DraftCtrl.draftOrder"
                        team="team"
                        position="{{$index + 1}}">
                    </team-tile>

                    <button-tile
                        glyphicon="'th-list'"
                        label="'Get Draft Order'"
                        click-function="DraftCtrl.getDraftOrder()">
                    </button-tile>

                    <button-tile
                        ng-if="DraftCtrl.draftOrder.length > 0 && DraftCtrl.autoDraftPossible()"
                        glyphicon="'play'"
                        label="'Draft NHL Teams'"
                        click-function="DraftCtrl.autoDraftRound()">
                    </button-tile>

                </div>

                <div ng-repeat="round in DraftCtrl.draftResults.slice().reverse()">

                    <div class="round-heading">
                        Round {{ DraftCtrl.draftResults.length - $index }}
                    </div>

                    <draft-tile 
                        ng-repeat="result in round"
                        nhl-team="result.nhlTeam"
                        team="result.team">
                    </draft-tile>

                </div>
            </div>
        `
    };
});

bucketDraft.controller('DraftCtrl', function(playersFactory, draftFactory, nhlTeams) {
    this.players = playersFactory.players;
    this.nhlTeams = nhlTeams.slice();
    this.draftOrder = [];
    this.draftResults = [];

    this.validateTeams = function() {
        if (playersFactory.getActiveTeams().length < 2) {
            return false
        }
        return true;  
    }

    this.validatePlayers = function() {
        if (this.players.some(player => !player.name || !player.team)) {
            return false
        } 
        return true;        
    }

    this.getDraftOrder = function() {
        this.draftResults = [];
        this.nhlTeams = nhlTeams.slice();
        this.draftOrder = draftFactory.getDraftOrder(playersFactory.getActiveTeams());
    }

    this.autoDraftRound = function() {
        var activeTeams = playersFactory.getActiveTeams();

        if (this.nhlTeams.length < activeTeams.length) { 
            return
        };

        var roundResults = draftFactory.autoDraftRound(this.draftOrder, activeTeams, this.nhlTeams);
        this.draftResults.push(roundResults);
    }

    this.autoDraftPossible = function() {
        var activeTeams = playersFactory.getActiveTeams();
        return (this.nhlTeams.length > activeTeams.length);
    }
});
var draftTile = angular.module('DraftTile', ['ui.bootstrap']);

draftTile.controller('DraftTileCtrl', function(colors) {
    this.colors = colors;
});

draftTile.directive('draftTile', function() {
    return {
        restrict: 'AE',
        scope: {
            team : '=',
            nhlTeam : '=',
        },
        bindToController: true,
        controller: 'DraftTileCtrl',
        controllerAs: 'DraftTileCtrl',
        template: `
            <div class="tile tile-default">

                <div class="input-group">

                    <span class="input-group-addon nhl-team-logo-container">
                        <img class="nhl-team-logo" 
                            ng-src="http://cdn.nhle.com/nhl/images/logos/teams/{{DraftTileCtrl.nhlTeam.abbr}}_logo.svgz?v=9.5">
                        </img>
                    </span>

                    <div class="input-group-non-input">
                        <div class="truncate" 
                            ng-bind="DraftTileCtrl.nhlTeam.name">
                        </div>
                    </div>

                </div>

                <div class="input-group">

                    <span class="input-group-addon">
                        <i class="glyphicon glyphicon-flag" 
                            ng-style="{'color': DraftTileCtrl.colors[DraftTileCtrl.team]}">
                        </i>
                    </span>

                    <div  
                        class="input-group-non-input" 
                        placeholder="Name" 
                        ng-bind="DraftTileCtrl.team" >
                    </div>

                </div>
            </div>
        `
    };
});
var bucketHeader = angular.module('BucketHeader', []);

bucketHeader.directive('bucketHeader', function() {
    return {
        restrict: 'AE',
        controller: 'HeaderCtrl',
        controllerAs: 'HeaderCtrl',
        template: `
            <div class="header">

                <a href="#/Players"
                    class="header-text" 
                    ng-class="HeaderCtrl.getClass('/Players')">
                    Players
                </a>

                <a href="#/Draft"
                    class="header-text" 
                    ng-class="HeaderCtrl.getClass('/Draft')">
                    Draft
                </a>

                <a href="#/Sides"
                    class="header-text" 
                    ng-class="HeaderCtrl.getClass('/Sides')">
                    Sides
                </a>

            </div>
        `
    };
});

bucketHeader.controller('HeaderCtrl', function($location) {
    this.getClass = function(path) {
        return $location.$$path == path ? 'active' : '';
    }
});

var playerPicker = angular.module('PlayerPicker', ['PlayerTile', 'PlayersFactory']);

playerPicker.directive('playerPicker', function() {
    return {
        restrict: 'AE',
        controller: 'PlayerPickerCtrl',
        controllerAs: 'PlayerPickerCtrl',
        template: `     
            <form novalidate> 

                <div class="team-sizer">

                    <div class="input-group">

                        <span class="input-group-addon">
                            Number of Teams
                        </span>

                        <select ng-model="PlayerPickerCtrl.numTeams" 
                            class="form-control" 
                            ng-change="PlayerPickerCtrl.updateAllowedNumberOfTeams()"
                            ng-options="size for size in PlayerPickerCtrl.allowedNumberOfTeams"
                            required >
                        </select>

                    </div>
                </div>

                <player-tile 
                    ng-repeat="player in PlayerPickerCtrl.players"
                    player="player" 
                    teams="PlayerPickerCtrl.playerTeams"
                    delete-player="PlayerPickerCtrl.deletePlayer(id)">
                </player-tile>

                <button-tile
                    glyphicon="'plus'"
                    label="'Add Player'"
                    click-function="PlayerPickerCtrl.addPlayer()">
                </button-tile>

                <button-tile
                    ng-if="PlayerPickerCtrl.players.length > 1"
                    glyphicon="'question-sign'"
                    label="'Randomize Teams'"
                    click-function="PlayerPickerCtrl.randomizeTeams()">
                </button-tile>

            </form>
        `
    };
});

playerPicker.controller('PlayerPickerCtrl', function(playersFactory) {
    this.players = playersFactory.players;
    this.playerTeams = playersFactory.playerTeams;
    this.numTeams = playersFactory.playerTeams.length;
    this.allowedNumberOfTeams = playersFactory.allowedNumberOfTeams;

    this.updateAllowedNumberOfTeams = function(value) {
        playersFactory.changeAllowedNumberOfTeams(this.numTeams);
        this.allowedNumberOfTeams = playersFactory.allowedNumberOfTeams;
        this.playerTeams = playersFactory.playerTeams;
    }

    this.randomizeTeams = function() {
        playersFactory.randomizeTeams(this.numTeams);
    }

    this.addPlayer = function() {
        playersFactory.addPlayer();
    }

    this.deletePlayer = function(id) {
        playersFactory.deletePlayer(id);
    } 
});

var playerTile = angular.module('PlayerTile', []);

playerTile.controller('PlayerTileCtrl', function(playersFactory, colors) {
    this.colors = colors;
});

playerTile.directive('playerTile', function() {
    return {
        restrict: 'AE',
        scope: {
            player : '=',
            teams : '=',
            deletePlayer : '&'
        },
        bindToController: true,
        controller: 'PlayerTileCtrl',
        controllerAs: 'PlayerTileCtrl',
        template: `
            <div class="tile tile-default">

                <button class="btn tile-delete-button" 
                    ng-click="PlayerTileCtrl.deletePlayer({id : PlayerTileCtrl.player.id})">
                    
                    <span class="glyphicon glyphicon-remove"></span>

                </button>

                <div class="input-group">

                    <span class="input-group-addon">
                        <i class="glyphicon glyphicon-user"></i>
                    </span>

                    <input type="text" 
                        class="form-control" 
                        placeholder="Name" 
                        ng-model="PlayerTileCtrl.player.name" 
                        required />
                </div>
                
                <div class="input-group">

                    <span class="input-group-addon">
                        <i class="glyphicon glyphicon-flag" 
                        ng-style="{'color': PlayerTileCtrl.colors[PlayerTileCtrl.player.team]}">
                        </i>
                    </span>

                    <select ng-model="PlayerTileCtrl.player.team" 
                        class="form-control" 
                        ng-options="team for team in PlayerTileCtrl.teams"
                        required >
                    </select>

                </div>
            </div>
        `
    };
});
var sidePicker = angular.module('SidePicker', ['DraftTile', 'SidePickerModal', 'PlayersFactory', 'ui.bootstrap']);

sidePicker.directive('sidePicker', function() {
    return {
        restrict: 'AE',
        controller: 'SidePickerCtrl',
        controllerAs: 'SidePickerCtrl',
        template: `
            <div class="draft-container">

                <div ng-if="!SidePickerCtrl.validatePlayers()">
                    Each player must have a name and assigned team!
                </div>

                <div ng-if="!SidePickerCtrl.validateTeams()">
                    There must be at least two active teams!
                </div>

                <div ng-if="SidePickerCtrl.validatePlayers() && SidePickerCtrl.validateTeams()">

                    <div class="round-heading">
                        Choose Two Teams
                    </div>

                    <team-tile 
                        ng-repeat="team in SidePickerCtrl.teams"
                        team="team"
                        selectable="true"
                        select-function="SidePickerCtrl.teamClicked(team, selected)">
                    </team-tile>

                    <button-tile
                        ng-if="SidePickerCtrl.selectedTeams.length === 2"
                        glyphicon="'tower'"
                        label="'Draw For Home'"
                        click-function="SidePickerCtrl.drawHome()">
                    </button-tile>

                </div>
            </div>
        `
    };
});

sidePicker.controller('SidePickerCtrl', function(playersFactory, $uibModal) {
    this.teams = playersFactory.getActiveTeams();
    this.selectedTeams = []
    this.players = playersFactory.players;

    this.validateTeams = function() {
        if (playersFactory.getActiveTeams().length < 2) {
            return false
        }
        return true;  
    }

    this.validatePlayers = function() {
        if (this.players.some(player => !player.name || !player.team)) {
            return false
        } 
        return true;        
    }

    this.teamClicked = function(team, selected) {
        var t = this.selectedTeams.indexOf(team);

        if ((selected === true) && (t === -1)) {
            this.selectedTeams.push(team);
        } 
        else if ((selected === false) && (t !== -1)) {
            this.selectedTeams.splice(t, 1);
        }
    }

    this.drawHome = function() {
        if (this.selectedTeams.length !== 2) {
            return;
        }
    
        var winningTeam = this.selectedTeams[(Math.floor(Math.random() * 2))];

        var modalInstance = $uibModal.open({
            templateUrl: 'partials/SidePickerModal.html',
            controller: 'SidePickerModalCtrl as SidePickerModalCtrl',
            resolve: {
                winningTeam: function () {
                    return winningTeam;
                }
            }
        });
    }
});

var sidePickerModal = angular.module('SidePickerModal', ['ui.bootstrap']);

sidePickerModal.directive('sidePickerModal', function() {
    return {
        // controller is set by the modal.open function, so not needed here
        restrict: 'AE',
        template: `
            <div class="side-picker-modal">
                <team-tile 
                    team="SidePickerModalCtrl.winningTeam">
                </team-tile>
            </div>
        `
    };
});

sidePickerModal.controller('SidePickerModalCtrl', function(winningTeam) {
    this.winningTeam = winningTeam;
});

var teamTile = angular.module('TeamTile', ['ui.bootstrap']);

teamTile.controller('TeamTileCtrl', function(playersFactory, colors) {
    this.colors = colors;
    this.playerNames = playersFactory.getTeamPlayerNames(this.team);
    this.selected = false;

    this.onSelect = function() {
        if (this.selectable !== true) return;
        this.selected = !this.selected;
        this.selectFunction({team: this.team, selected: this.selected});
    };
});

teamTile.directive('teamTile', function() {
    return {
        restrict: 'AE',
        scope: {
            team: '=',
            selectable: '=',
            selectFunction: '&'
        },
        bindToController: true,
        controller: 'TeamTileCtrl',
        controllerAs: 'TeamTileCtrl',
        template: `
            <div class="tile tile-default" 
                ng-class="{'tile-selectable': TeamTileCtrl.selectable === true}"
                ng-click="TeamTileCtrl.onSelect()">

                <div class="tile-selected-indicator" ng-if="TeamTileCtrl.selected">
                    <span class="glyphicon glyphicon-ok"></span>
                </div>

                <div class="input-group">

                    <span class="input-group-addon">
                        <i class="glyphicon glyphicon-user"></i>
                    </span>

                    <div class="input-group-non-input" 
                        tooltip-placement="right" 
                        uib-tooltip="{{TeamTileCtrl.playerNames}}" >

                        <div class="truncate" 
                            ng-bind="TeamTileCtrl.playerNames">
                        </div>

                    </div>
                </div>
                
                <div class="input-group">

                    <span class="input-group-addon">
                        <i class="glyphicon glyphicon-flag" 
                            ng-style="{'color': TeamTileCtrl.colors[TeamTileCtrl.team]}">
                        </i>
                    </span>

                    <div class="input-group-non-input" 
                        placeholder="Name" 
                        ng-bind="TeamTileCtrl.team" >
                    </div>

                </div>
            </div>
        `
    };
});
var draftFactory = angular.module('DraftFactory', []);

draftFactory.factory('draftFactory', function() {
    var draftFactory = {}

    // Returns a random order that teams can draft in
    draftFactory.getDraftOrder = function(activeTeamsOriginal) {
        var draftOrder = [];
        var activeTeams = activeTeamsOriginal.slice();
        
        while (activeTeams.length > 0) {
            var rand = getRandomIntInclusive(0, activeTeams.length - 1);
            draftOrder.push(activeTeams[rand]);
            activeTeams.splice(rand, 1);
        }
        return draftOrder;
    }

    // Performs a round of NHL team drafting based on a given draft order
    draftFactory.autoDraftRound = function(draftOrder, activeTeamsOriginal, nhlTeams) {
        var activeTeams = activeTeamsOriginal.slice();
        var draftRound = [];

        if (nhlTeams.length < activeTeams.length) {
            return;
        }
    
        for (var i = 0; i < activeTeams.length; i++) {
            var rand = getRandomIntInclusive(0, nhlTeams.length - 1);

            draftRound.push({
                 team : draftOrder[i], 
                 nhlTeam : nhlTeams[rand]
             });

            nhlTeams.splice(rand, 1);
        }
        return draftRound;
    }

    // Gets either 0 or 1 at random
    function getRandomIntInclusive(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    return draftFactory;
})
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyIsIm1vZHVsZXMvYnV0dG9uVGlsZS5qcyIsIm1vZHVsZXMvZHJhZnQuanMiLCJtb2R1bGVzL2RyYWZ0VGlsZS5qcyIsIm1vZHVsZXMvaGVhZGVyLmpzIiwibW9kdWxlcy9wbGF5ZXJQaWNrZXIuanMiLCJtb2R1bGVzL3BsYXllclRpbGUuanMiLCJtb2R1bGVzL3NpZGVQaWNrZXIuanMiLCJtb2R1bGVzL3NpZGVQaWNrZXJNb2RhbC5qcyIsIm1vZHVsZXMvdGVhbVRpbGUuanMiLCJzZXJ2aWNlcy9kcmFmdEZhY3RvcnkuanMiLCJzZXJ2aWNlcy9wbGF5ZXJGYWN0b3J5LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNuRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNqQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDeEdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3JEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN0Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDN0VBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMxREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDNUZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDcEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM5Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiYnVuZGxlLmpzIiwic291cmNlc0NvbnRlbnQiOlsidmFyIGFwcCA9IGFuZ3VsYXIubW9kdWxlKCdhcHAnLCBbXHJcbiAgICAnbmdSb3V0ZScsXHJcbiAgICAnUGxheWVyUGlja2VyJyxcclxuICAgICdCdWNrZXREcmFmdCcsXHJcbiAgICAnU2lkZVBpY2tlcicsXHJcbiAgICAnQnVja2V0SGVhZGVyJyAgICBcclxuXSk7XHJcblxyXG5hcHAuY29uZmlnKFsnJHJvdXRlUHJvdmlkZXInLCBmdW5jdGlvbigkcm91dGVQcm92aWRlcikge1xyXG4gICAgJHJvdXRlUHJvdmlkZXJcclxuICAgIC53aGVuKCcvUGxheWVycycsIHtcclxuICAgICAgICB0ZW1wbGF0ZVVybDogJ3BhcnRpYWxzL1BsYXllclBpY2tlci5odG1sJyxcclxuICAgIH0pXHJcbiAgICAud2hlbignL0RyYWZ0Jywge1xyXG4gICAgICAgIHRlbXBsYXRlVXJsOiAncGFydGlhbHMvRHJhZnQuaHRtbCcsXHJcbiAgICB9KVxyXG4gICAgLndoZW4oJy9TaWRlcycsIHtcclxuICAgICAgICB0ZW1wbGF0ZVVybDogJ3BhcnRpYWxzL1NpZGVQaWNrZXIuaHRtbCcsXHJcbiAgICB9KVxyXG4gICAgLm90aGVyd2lzZSh7XHJcbiAgICAgICAgcmVkaXJlY3RUbzogJy9QbGF5ZXJzJyxcclxuICAgIH0pO1xyXG59XSk7XHJcblxyXG5hcHAuY29uc3RhbnQoJ2NvbG9ycycsIFtcclxuICAgICcnLFxyXG4gICAgJyMyOTgwYjknLFxyXG4gICAgJyNlNjdlMjInLFxyXG4gICAgJyM4ZTQ0YWQnLFxyXG4gICAgJyMyN2FlNjAnLCBcclxuICAgICcjZmZmZmZmJywgXHJcbiAgICAnIzJjM2U1MCcsXHJcbiAgICAnI2MwMzkyYicsXHJcbiAgICAnI2YxYzQwZidcclxuXSk7XHJcblxyXG5hcHAuY29uc3RhbnQoJ25obFRlYW1zJyAsIFtcclxuICAgIHsgYWJicjogJ0FOQScsIG5hbWU6ICdBbmFoZWltIER1Y2tzJ30sXHJcbiAgICB7IGFiYnI6ICdBUkknLCBuYW1lOiAnQXJpem9uYSBDb3lvdGVzJ30sXHJcbiAgICB7IGFiYnI6ICdCT1MnLCBuYW1lOiAnQm9zdG9uIEJydWlucyd9LFxyXG4gICAgeyBhYmJyOiAnQlVGJywgbmFtZTogJ0J1ZmZhbG8gU2FicmVzJ30sXHJcbiAgICB7IGFiYnI6ICdDR1knLCBuYW1lOiAnQ2FsZ2FyeSBGbGFtZXMnfSxcclxuICAgIHsgYWJicjogJ0NBUicsIG5hbWU6ICdDYXJvbGluYSBIdXJyaWNhbmVzJ30sXHJcbiAgICB7IGFiYnI6ICdDSEknLCBuYW1lOiAnQ2hpY2FnbyBCbGFja2hhd2tzJ30sXHJcbiAgICB7IGFiYnI6ICdDT0wnLCBuYW1lOiAnQ29sb3JhZG8gQXZhbGFuY2hlJ30sXHJcbiAgICB7IGFiYnI6ICdDQkonLCBuYW1lOiAnQ29sdW1idXMgQmx1ZSBKYWNrZXRzJ30sXHJcbiAgICB7IGFiYnI6ICdEQUwnLCBuYW1lOiAnRGFsbGFzIFN0YXJzJ30sXHJcbiAgICB7IGFiYnI6ICdERVQnLCBuYW1lOiAnRGV0cm9pdCBSZWQgV2luZ3MnfSxcclxuICAgIHsgYWJicjogJ0VETScsIG5hbWU6ICdFZG1vbnRvbiBPaWxlcnMnfSxcclxuICAgIHsgYWJicjogJ0ZMQScsIG5hbWU6ICdGbG9yaWRhIFBhbnRoZXJzJ30sXHJcbiAgICB7IGFiYnI6ICdMQUsnLCBuYW1lOiAnTG9zIEFuZ2VsZXMgS2luZ3MnfSxcclxuICAgIHsgYWJicjogJ01JTicsIG5hbWU6ICdNaW5uZXNvdGEgV2lsZCd9LFxyXG4gICAgeyBhYmJyOiAnTVRMJywgbmFtZTogJ01vbnRyZWFsIENhbmFkaWVucyd9LFxyXG4gICAgeyBhYmJyOiAnTlNIJywgbmFtZTogJ05hc2h2aWxsZSBQcmVkYXRvcnMnfSxcclxuICAgIHsgYWJicjogJ05KRCcsIG5hbWU6ICdOZXcgSmVyc2V5IERldmlscyd9LFxyXG4gICAgeyBhYmJyOiAnTllJJywgbmFtZTogJ05ldyBZb3JrIElzbGFuZGVycyd9LFxyXG4gICAgeyBhYmJyOiAnTllSJywgbmFtZTogJ05ldyBZb3JrIFJhbmdlcnMnfSxcclxuICAgIHsgYWJicjogJ09UVCcsIG5hbWU6ICdPdHRhd2EgU2VuYXRvcnMnfSxcclxuICAgIHsgYWJicjogJ1BISScsIG5hbWU6ICdQaGlsYWRlbHBoaWEgRmx5ZXJzJ30sXHJcbiAgICB7IGFiYnI6ICdQSVQnLCBuYW1lOiAnUGl0dHNidXJnaCBQZW5ndWlucyd9LFxyXG4gICAgeyBhYmJyOiAnU0pTJywgbmFtZTogJ1NhbiBKb3NlIFNoYXJrcyd9LFxyXG4gICAgeyBhYmJyOiAnU1RMJywgbmFtZTogJ1N0LiBMb3VpcyBCbHVlcyd9LFxyXG4gICAgeyBhYmJyOiAnVEJMJywgbmFtZTogJ1RhbXBhIEJheSBMaWdodG5pbmcnfSxcclxuICAgIHsgYWJicjogJ1RPUicsIG5hbWU6ICdUb3JvbnRvIE1hcGxlIExlYWZzJ30sXHJcbiAgICB7IGFiYnI6ICdWQU4nLCBuYW1lOiAnVmFuY291dmVyIENhbnVja3MnfSxcclxuICAgIHsgYWJicjogJ1dTSCcsIG5hbWU6ICdXYXNoaW5ndG9uIENhcGl0YWxzJ30sXHJcbiAgICB7IGFiYnI6ICdXUEcnLCBuYW1lOiAnV2lubmlwZWcgSmV0cyd9XHJcbl0pOyIsInZhciBidXR0b25UaWxlID0gYW5ndWxhci5tb2R1bGUoJ0J1dHRvblRpbGUnLCBbJ3VpLmJvb3RzdHJhcCddKTtcclxuXHJcbmJ1dHRvblRpbGUuY29udHJvbGxlcignQnV0dG9uVGlsZUN0cmwnLCBmdW5jdGlvbigpIHtcclxuICAgIHRoaXMuZ2V0R2x5cGhpY29uQ2xhc3MgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICByZXR1cm4gJ2dseXBoaWNvbi0nICsgdGhpcy5nbHlwaGljb247XHJcbiAgICB9XHJcbn0pO1xyXG5cclxuYnV0dG9uVGlsZS5kaXJlY3RpdmUoJ2J1dHRvblRpbGUnLCBmdW5jdGlvbigpIHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgcmVzdHJpY3Q6ICdBRScsXHJcbiAgICAgICAgc2NvcGU6IHtcclxuICAgICAgICAgICAgZ2x5cGhpY29uOiAnPScsXHJcbiAgICAgICAgICAgIGxhYmVsOiAnPScsXHJcbiAgICAgICAgICAgIGNsaWNrRnVuY3Rpb24gOiAnJidcclxuICAgICAgICB9LFxyXG4gICAgICAgIGJpbmRUb0NvbnRyb2xsZXI6IHRydWUsXHJcbiAgICAgICAgY29udHJvbGxlcjogJ0J1dHRvblRpbGVDdHJsJyxcclxuICAgICAgICBjb250cm9sbGVyQXM6ICdCdXR0b25UaWxlQ3RybCcsXHJcbiAgICAgICAgdGVtcGxhdGU6IGBcclxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cInRpbGUgdGlsZS1zZWxlY3RhYmxlXCI+XHJcbiAgICAgICAgICAgICAgICA8YnV0dG9uIGNsYXNzPVwiYnRuIHRpbGUtYnV0dG9uIHB1bGwtcmlnaHRcIiBcclxuICAgICAgICAgICAgICAgICAgICBuZy1jbGljaz1cIkJ1dHRvblRpbGVDdHJsLmNsaWNrRnVuY3Rpb24oKVwiPlxyXG5cclxuICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cImdseXBoaWNvblwiIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBuZy1jbGFzcz1cIkJ1dHRvblRpbGVDdHJsLmdldEdseXBoaWNvbkNsYXNzKClcIj5cclxuICAgICAgICAgICAgICAgICAgICA8L3NwYW4+XHJcbiAgICAgICAgICAgICAgICAgICAgPHNwYW4gbmctYmluZD1cIkJ1dHRvblRpbGVDdHJsLmxhYmVsXCI+PC9zcGFuPlxyXG5cclxuICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxyXG4gICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICBgXHJcbiAgICB9O1xyXG59KTsiLCJ2YXIgYnVja2V0RHJhZnQgPSBhbmd1bGFyLm1vZHVsZSgnQnVja2V0RHJhZnQnLCBbJ0RyYWZ0VGlsZScsICdUZWFtVGlsZScsICdCdXR0b25UaWxlJywgJ0RyYWZ0RmFjdG9yeScsIFwiUGxheWVyc0ZhY3RvcnlcIl0pO1xyXG5cclxuYnVja2V0RHJhZnQuZGlyZWN0aXZlKCdidWNrZXREcmFmdCcsIGZ1bmN0aW9uKCkge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICByZXN0cmljdDogJ0FFJyxcclxuICAgICAgICBjb250cm9sbGVyOiAnRHJhZnRDdHJsJyxcclxuICAgICAgICBjb250cm9sbGVyQXM6ICdEcmFmdEN0cmwnLFxyXG4gICAgICAgIHRlbXBsYXRlOiBgXHJcbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJkcmFmdC1jb250YWluZXJcIj5cclxuXHJcbiAgICAgICAgICAgICAgICA8ZGl2IG5nLWlmPVwiIURyYWZ0Q3RybC52YWxpZGF0ZVBsYXllcnMoKVwiPlxyXG4gICAgICAgICAgICAgICAgICAgIEVhY2ggcGxheWVyIG11c3QgaGF2ZSBhIG5hbWUgYW5kIGFzc2lnbmVkIHRlYW0hXHJcbiAgICAgICAgICAgICAgICA8L2Rpdj5cclxuXHJcbiAgICAgICAgICAgICAgICA8ZGl2IG5nLWlmPVwiIURyYWZ0Q3RybC52YWxpZGF0ZVRlYW1zKClcIj5cclxuICAgICAgICAgICAgICAgICAgICBUaGVyZSBtdXN0IGJlIGF0IGxlYXN0IHR3byBhY3RpdmUgdGVhbXMhXHJcbiAgICAgICAgICAgICAgICA8L2Rpdj5cclxuXHJcbiAgICAgICAgICAgICAgICA8ZGl2IG5nLWlmPVwiRHJhZnRDdHJsLnZhbGlkYXRlUGxheWVycygpICYmIERyYWZ0Q3RybC52YWxpZGF0ZVRlYW1zKClcIj5cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInJvdW5kLWhlYWRpbmdcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgRHJhZnQgT3JkZXJcclxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgPHRlYW0tdGlsZSBcclxuICAgICAgICAgICAgICAgICAgICAgICAgbmctcmVwZWF0PVwidGVhbSBpbiBEcmFmdEN0cmwuZHJhZnRPcmRlclwiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRlYW09XCJ0ZWFtXCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgcG9zaXRpb249XCJ7eyRpbmRleCArIDF9fVwiPlxyXG4gICAgICAgICAgICAgICAgICAgIDwvdGVhbS10aWxlPlxyXG5cclxuICAgICAgICAgICAgICAgICAgICA8YnV0dG9uLXRpbGVcclxuICAgICAgICAgICAgICAgICAgICAgICAgZ2x5cGhpY29uPVwiJ3RoLWxpc3QnXCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw9XCInR2V0IERyYWZ0IE9yZGVyJ1wiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsaWNrLWZ1bmN0aW9uPVwiRHJhZnRDdHJsLmdldERyYWZ0T3JkZXIoKVwiPlxyXG4gICAgICAgICAgICAgICAgICAgIDwvYnV0dG9uLXRpbGU+XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIDxidXR0b24tdGlsZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBuZy1pZj1cIkRyYWZ0Q3RybC5kcmFmdE9yZGVyLmxlbmd0aCA+IDAgJiYgRHJhZnRDdHJsLmF1dG9EcmFmdFBvc3NpYmxlKClcIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBnbHlwaGljb249XCIncGxheSdcIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbD1cIidEcmFmdCBOSEwgVGVhbXMnXCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2xpY2stZnVuY3Rpb249XCJEcmFmdEN0cmwuYXV0b0RyYWZ0Um91bmQoKVwiPlxyXG4gICAgICAgICAgICAgICAgICAgIDwvYnV0dG9uLXRpbGU+XHJcblxyXG4gICAgICAgICAgICAgICAgPC9kaXY+XHJcblxyXG4gICAgICAgICAgICAgICAgPGRpdiBuZy1yZXBlYXQ9XCJyb3VuZCBpbiBEcmFmdEN0cmwuZHJhZnRSZXN1bHRzLnNsaWNlKCkucmV2ZXJzZSgpXCI+XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJyb3VuZC1oZWFkaW5nXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFJvdW5kIHt7IERyYWZ0Q3RybC5kcmFmdFJlc3VsdHMubGVuZ3RoIC0gJGluZGV4IH19XHJcbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIDxkcmFmdC10aWxlIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBuZy1yZXBlYXQ9XCJyZXN1bHQgaW4gcm91bmRcIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBuaGwtdGVhbT1cInJlc3VsdC5uaGxUZWFtXCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGVhbT1cInJlc3VsdC50ZWFtXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgPC9kcmFmdC10aWxlPlxyXG5cclxuICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICBgXHJcbiAgICB9O1xyXG59KTtcclxuXHJcbmJ1Y2tldERyYWZ0LmNvbnRyb2xsZXIoJ0RyYWZ0Q3RybCcsIGZ1bmN0aW9uKHBsYXllcnNGYWN0b3J5LCBkcmFmdEZhY3RvcnksIG5obFRlYW1zKSB7XHJcbiAgICB0aGlzLnBsYXllcnMgPSBwbGF5ZXJzRmFjdG9yeS5wbGF5ZXJzO1xyXG4gICAgdGhpcy5uaGxUZWFtcyA9IG5obFRlYW1zLnNsaWNlKCk7XHJcbiAgICB0aGlzLmRyYWZ0T3JkZXIgPSBbXTtcclxuICAgIHRoaXMuZHJhZnRSZXN1bHRzID0gW107XHJcblxyXG4gICAgdGhpcy52YWxpZGF0ZVRlYW1zID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgaWYgKHBsYXllcnNGYWN0b3J5LmdldEFjdGl2ZVRlYW1zKCkubGVuZ3RoIDwgMikge1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2VcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRydWU7ICBcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLnZhbGlkYXRlUGxheWVycyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGlmICh0aGlzLnBsYXllcnMuc29tZShwbGF5ZXIgPT4gIXBsYXllci5uYW1lIHx8ICFwbGF5ZXIudGVhbSkpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlXHJcbiAgICAgICAgfSBcclxuICAgICAgICByZXR1cm4gdHJ1ZTsgICAgICAgIFxyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuZ2V0RHJhZnRPcmRlciA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHRoaXMuZHJhZnRSZXN1bHRzID0gW107XHJcbiAgICAgICAgdGhpcy5uaGxUZWFtcyA9IG5obFRlYW1zLnNsaWNlKCk7XHJcbiAgICAgICAgdGhpcy5kcmFmdE9yZGVyID0gZHJhZnRGYWN0b3J5LmdldERyYWZ0T3JkZXIocGxheWVyc0ZhY3RvcnkuZ2V0QWN0aXZlVGVhbXMoKSk7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5hdXRvRHJhZnRSb3VuZCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciBhY3RpdmVUZWFtcyA9IHBsYXllcnNGYWN0b3J5LmdldEFjdGl2ZVRlYW1zKCk7XHJcblxyXG4gICAgICAgIGlmICh0aGlzLm5obFRlYW1zLmxlbmd0aCA8IGFjdGl2ZVRlYW1zLmxlbmd0aCkgeyBcclxuICAgICAgICAgICAgcmV0dXJuXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdmFyIHJvdW5kUmVzdWx0cyA9IGRyYWZ0RmFjdG9yeS5hdXRvRHJhZnRSb3VuZCh0aGlzLmRyYWZ0T3JkZXIsIGFjdGl2ZVRlYW1zLCB0aGlzLm5obFRlYW1zKTtcclxuICAgICAgICB0aGlzLmRyYWZ0UmVzdWx0cy5wdXNoKHJvdW5kUmVzdWx0cyk7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5hdXRvRHJhZnRQb3NzaWJsZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciBhY3RpdmVUZWFtcyA9IHBsYXllcnNGYWN0b3J5LmdldEFjdGl2ZVRlYW1zKCk7XHJcbiAgICAgICAgcmV0dXJuICh0aGlzLm5obFRlYW1zLmxlbmd0aCA+IGFjdGl2ZVRlYW1zLmxlbmd0aCk7XHJcbiAgICB9XHJcbn0pOyIsInZhciBkcmFmdFRpbGUgPSBhbmd1bGFyLm1vZHVsZSgnRHJhZnRUaWxlJywgWyd1aS5ib290c3RyYXAnXSk7XHJcblxyXG5kcmFmdFRpbGUuY29udHJvbGxlcignRHJhZnRUaWxlQ3RybCcsIGZ1bmN0aW9uKGNvbG9ycykge1xyXG4gICAgdGhpcy5jb2xvcnMgPSBjb2xvcnM7XHJcbn0pO1xyXG5cclxuZHJhZnRUaWxlLmRpcmVjdGl2ZSgnZHJhZnRUaWxlJywgZnVuY3Rpb24oKSB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIHJlc3RyaWN0OiAnQUUnLFxyXG4gICAgICAgIHNjb3BlOiB7XHJcbiAgICAgICAgICAgIHRlYW0gOiAnPScsXHJcbiAgICAgICAgICAgIG5obFRlYW0gOiAnPScsXHJcbiAgICAgICAgfSxcclxuICAgICAgICBiaW5kVG9Db250cm9sbGVyOiB0cnVlLFxyXG4gICAgICAgIGNvbnRyb2xsZXI6ICdEcmFmdFRpbGVDdHJsJyxcclxuICAgICAgICBjb250cm9sbGVyQXM6ICdEcmFmdFRpbGVDdHJsJyxcclxuICAgICAgICB0ZW1wbGF0ZTogYFxyXG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwidGlsZSB0aWxlLWRlZmF1bHRcIj5cclxuXHJcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiaW5wdXQtZ3JvdXBcIj5cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJpbnB1dC1ncm91cC1hZGRvbiBuaGwtdGVhbS1sb2dvLWNvbnRhaW5lclwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8aW1nIGNsYXNzPVwibmhsLXRlYW0tbG9nb1wiIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmctc3JjPVwiaHR0cDovL2Nkbi5uaGxlLmNvbS9uaGwvaW1hZ2VzL2xvZ29zL3RlYW1zL3t7RHJhZnRUaWxlQ3RybC5uaGxUZWFtLmFiYnJ9fV9sb2dvLnN2Z3o/dj05LjVcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPC9pbWc+XHJcbiAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxyXG5cclxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiaW5wdXQtZ3JvdXAtbm9uLWlucHV0XCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJ0cnVuY2F0ZVwiIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmctYmluZD1cIkRyYWZ0VGlsZUN0cmwubmhsVGVhbS5uYW1lXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG5cclxuICAgICAgICAgICAgICAgIDwvZGl2PlxyXG5cclxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJpbnB1dC1ncm91cFwiPlxyXG5cclxuICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cImlucHV0LWdyb3VwLWFkZG9uXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDxpIGNsYXNzPVwiZ2x5cGhpY29uIGdseXBoaWNvbi1mbGFnXCIgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZy1zdHlsZT1cInsnY29sb3InOiBEcmFmdFRpbGVDdHJsLmNvbG9yc1tEcmFmdFRpbGVDdHJsLnRlYW1dfVwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8L2k+XHJcbiAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxyXG5cclxuICAgICAgICAgICAgICAgICAgICA8ZGl2ICBcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3M9XCJpbnB1dC1ncm91cC1ub24taW5wdXRcIiBcclxuICAgICAgICAgICAgICAgICAgICAgICAgcGxhY2Vob2xkZXI9XCJOYW1lXCIgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG5nLWJpbmQ9XCJEcmFmdFRpbGVDdHJsLnRlYW1cIiA+XHJcbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcblxyXG4gICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgIGBcclxuICAgIH07XHJcbn0pOyIsInZhciBidWNrZXRIZWFkZXIgPSBhbmd1bGFyLm1vZHVsZSgnQnVja2V0SGVhZGVyJywgW10pO1xyXG5cclxuYnVja2V0SGVhZGVyLmRpcmVjdGl2ZSgnYnVja2V0SGVhZGVyJywgZnVuY3Rpb24oKSB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIHJlc3RyaWN0OiAnQUUnLFxyXG4gICAgICAgIGNvbnRyb2xsZXI6ICdIZWFkZXJDdHJsJyxcclxuICAgICAgICBjb250cm9sbGVyQXM6ICdIZWFkZXJDdHJsJyxcclxuICAgICAgICB0ZW1wbGF0ZTogYFxyXG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwiaGVhZGVyXCI+XHJcblxyXG4gICAgICAgICAgICAgICAgPGEgaHJlZj1cIiMvUGxheWVyc1wiXHJcbiAgICAgICAgICAgICAgICAgICAgY2xhc3M9XCJoZWFkZXItdGV4dFwiIFxyXG4gICAgICAgICAgICAgICAgICAgIG5nLWNsYXNzPVwiSGVhZGVyQ3RybC5nZXRDbGFzcygnL1BsYXllcnMnKVwiPlxyXG4gICAgICAgICAgICAgICAgICAgIFBsYXllcnNcclxuICAgICAgICAgICAgICAgIDwvYT5cclxuXHJcbiAgICAgICAgICAgICAgICA8YSBocmVmPVwiIy9EcmFmdFwiXHJcbiAgICAgICAgICAgICAgICAgICAgY2xhc3M9XCJoZWFkZXItdGV4dFwiIFxyXG4gICAgICAgICAgICAgICAgICAgIG5nLWNsYXNzPVwiSGVhZGVyQ3RybC5nZXRDbGFzcygnL0RyYWZ0JylcIj5cclxuICAgICAgICAgICAgICAgICAgICBEcmFmdFxyXG4gICAgICAgICAgICAgICAgPC9hPlxyXG5cclxuICAgICAgICAgICAgICAgIDxhIGhyZWY9XCIjL1NpZGVzXCJcclxuICAgICAgICAgICAgICAgICAgICBjbGFzcz1cImhlYWRlci10ZXh0XCIgXHJcbiAgICAgICAgICAgICAgICAgICAgbmctY2xhc3M9XCJIZWFkZXJDdHJsLmdldENsYXNzKCcvU2lkZXMnKVwiPlxyXG4gICAgICAgICAgICAgICAgICAgIFNpZGVzXHJcbiAgICAgICAgICAgICAgICA8L2E+XHJcblxyXG4gICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICBgXHJcbiAgICB9O1xyXG59KTtcclxuXHJcbmJ1Y2tldEhlYWRlci5jb250cm9sbGVyKCdIZWFkZXJDdHJsJywgZnVuY3Rpb24oJGxvY2F0aW9uKSB7XHJcbiAgICB0aGlzLmdldENsYXNzID0gZnVuY3Rpb24ocGF0aCkge1xyXG4gICAgICAgIHJldHVybiAkbG9jYXRpb24uJCRwYXRoID09IHBhdGggPyAnYWN0aXZlJyA6ICcnO1xyXG4gICAgfVxyXG59KTtcclxuIiwidmFyIHBsYXllclBpY2tlciA9IGFuZ3VsYXIubW9kdWxlKCdQbGF5ZXJQaWNrZXInLCBbJ1BsYXllclRpbGUnLCAnUGxheWVyc0ZhY3RvcnknXSk7XHJcblxyXG5wbGF5ZXJQaWNrZXIuZGlyZWN0aXZlKCdwbGF5ZXJQaWNrZXInLCBmdW5jdGlvbigpIHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgcmVzdHJpY3Q6ICdBRScsXHJcbiAgICAgICAgY29udHJvbGxlcjogJ1BsYXllclBpY2tlckN0cmwnLFxyXG4gICAgICAgIGNvbnRyb2xsZXJBczogJ1BsYXllclBpY2tlckN0cmwnLFxyXG4gICAgICAgIHRlbXBsYXRlOiBgICAgICBcclxuICAgICAgICAgICAgPGZvcm0gbm92YWxpZGF0ZT4gXHJcblxyXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInRlYW0tc2l6ZXJcIj5cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImlucHV0LWdyb3VwXCI+XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cImlucHV0LWdyb3VwLWFkZG9uXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBOdW1iZXIgb2YgVGVhbXNcclxuICAgICAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPHNlbGVjdCBuZy1tb2RlbD1cIlBsYXllclBpY2tlckN0cmwubnVtVGVhbXNcIiBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzPVwiZm9ybS1jb250cm9sXCIgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZy1jaGFuZ2U9XCJQbGF5ZXJQaWNrZXJDdHJsLnVwZGF0ZUFsbG93ZWROdW1iZXJPZlRlYW1zKClcIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmctb3B0aW9ucz1cInNpemUgZm9yIHNpemUgaW4gUGxheWVyUGlja2VyQ3RybC5hbGxvd2VkTnVtYmVyT2ZUZWFtc1wiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXF1aXJlZCA+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDwvc2VsZWN0PlxyXG5cclxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgIDwvZGl2PlxyXG5cclxuICAgICAgICAgICAgICAgIDxwbGF5ZXItdGlsZSBcclxuICAgICAgICAgICAgICAgICAgICBuZy1yZXBlYXQ9XCJwbGF5ZXIgaW4gUGxheWVyUGlja2VyQ3RybC5wbGF5ZXJzXCJcclxuICAgICAgICAgICAgICAgICAgICBwbGF5ZXI9XCJwbGF5ZXJcIiBcclxuICAgICAgICAgICAgICAgICAgICB0ZWFtcz1cIlBsYXllclBpY2tlckN0cmwucGxheWVyVGVhbXNcIlxyXG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZS1wbGF5ZXI9XCJQbGF5ZXJQaWNrZXJDdHJsLmRlbGV0ZVBsYXllcihpZClcIj5cclxuICAgICAgICAgICAgICAgIDwvcGxheWVyLXRpbGU+XHJcblxyXG4gICAgICAgICAgICAgICAgPGJ1dHRvbi10aWxlXHJcbiAgICAgICAgICAgICAgICAgICAgZ2x5cGhpY29uPVwiJ3BsdXMnXCJcclxuICAgICAgICAgICAgICAgICAgICBsYWJlbD1cIidBZGQgUGxheWVyJ1wiXHJcbiAgICAgICAgICAgICAgICAgICAgY2xpY2stZnVuY3Rpb249XCJQbGF5ZXJQaWNrZXJDdHJsLmFkZFBsYXllcigpXCI+XHJcbiAgICAgICAgICAgICAgICA8L2J1dHRvbi10aWxlPlxyXG5cclxuICAgICAgICAgICAgICAgIDxidXR0b24tdGlsZVxyXG4gICAgICAgICAgICAgICAgICAgIG5nLWlmPVwiUGxheWVyUGlja2VyQ3RybC5wbGF5ZXJzLmxlbmd0aCA+IDFcIlxyXG4gICAgICAgICAgICAgICAgICAgIGdseXBoaWNvbj1cIidxdWVzdGlvbi1zaWduJ1wiXHJcbiAgICAgICAgICAgICAgICAgICAgbGFiZWw9XCInUmFuZG9taXplIFRlYW1zJ1wiXHJcbiAgICAgICAgICAgICAgICAgICAgY2xpY2stZnVuY3Rpb249XCJQbGF5ZXJQaWNrZXJDdHJsLnJhbmRvbWl6ZVRlYW1zKClcIj5cclxuICAgICAgICAgICAgICAgIDwvYnV0dG9uLXRpbGU+XHJcblxyXG4gICAgICAgICAgICA8L2Zvcm0+XHJcbiAgICAgICAgYFxyXG4gICAgfTtcclxufSk7XHJcblxyXG5wbGF5ZXJQaWNrZXIuY29udHJvbGxlcignUGxheWVyUGlja2VyQ3RybCcsIGZ1bmN0aW9uKHBsYXllcnNGYWN0b3J5KSB7XHJcbiAgICB0aGlzLnBsYXllcnMgPSBwbGF5ZXJzRmFjdG9yeS5wbGF5ZXJzO1xyXG4gICAgdGhpcy5wbGF5ZXJUZWFtcyA9IHBsYXllcnNGYWN0b3J5LnBsYXllclRlYW1zO1xyXG4gICAgdGhpcy5udW1UZWFtcyA9IHBsYXllcnNGYWN0b3J5LnBsYXllclRlYW1zLmxlbmd0aDtcclxuICAgIHRoaXMuYWxsb3dlZE51bWJlck9mVGVhbXMgPSBwbGF5ZXJzRmFjdG9yeS5hbGxvd2VkTnVtYmVyT2ZUZWFtcztcclxuXHJcbiAgICB0aGlzLnVwZGF0ZUFsbG93ZWROdW1iZXJPZlRlYW1zID0gZnVuY3Rpb24odmFsdWUpIHtcclxuICAgICAgICBwbGF5ZXJzRmFjdG9yeS5jaGFuZ2VBbGxvd2VkTnVtYmVyT2ZUZWFtcyh0aGlzLm51bVRlYW1zKTtcclxuICAgICAgICB0aGlzLmFsbG93ZWROdW1iZXJPZlRlYW1zID0gcGxheWVyc0ZhY3RvcnkuYWxsb3dlZE51bWJlck9mVGVhbXM7XHJcbiAgICAgICAgdGhpcy5wbGF5ZXJUZWFtcyA9IHBsYXllcnNGYWN0b3J5LnBsYXllclRlYW1zO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMucmFuZG9taXplVGVhbXMgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICBwbGF5ZXJzRmFjdG9yeS5yYW5kb21pemVUZWFtcyh0aGlzLm51bVRlYW1zKTtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLmFkZFBsYXllciA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHBsYXllcnNGYWN0b3J5LmFkZFBsYXllcigpO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuZGVsZXRlUGxheWVyID0gZnVuY3Rpb24oaWQpIHtcclxuICAgICAgICBwbGF5ZXJzRmFjdG9yeS5kZWxldGVQbGF5ZXIoaWQpO1xyXG4gICAgfSBcclxufSk7XHJcbiIsInZhciBwbGF5ZXJUaWxlID0gYW5ndWxhci5tb2R1bGUoJ1BsYXllclRpbGUnLCBbXSk7XHJcblxyXG5wbGF5ZXJUaWxlLmNvbnRyb2xsZXIoJ1BsYXllclRpbGVDdHJsJywgZnVuY3Rpb24ocGxheWVyc0ZhY3RvcnksIGNvbG9ycykge1xyXG4gICAgdGhpcy5jb2xvcnMgPSBjb2xvcnM7XHJcbn0pO1xyXG5cclxucGxheWVyVGlsZS5kaXJlY3RpdmUoJ3BsYXllclRpbGUnLCBmdW5jdGlvbigpIHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgcmVzdHJpY3Q6ICdBRScsXHJcbiAgICAgICAgc2NvcGU6IHtcclxuICAgICAgICAgICAgcGxheWVyIDogJz0nLFxyXG4gICAgICAgICAgICB0ZWFtcyA6ICc9JyxcclxuICAgICAgICAgICAgZGVsZXRlUGxheWVyIDogJyYnXHJcbiAgICAgICAgfSxcclxuICAgICAgICBiaW5kVG9Db250cm9sbGVyOiB0cnVlLFxyXG4gICAgICAgIGNvbnRyb2xsZXI6ICdQbGF5ZXJUaWxlQ3RybCcsXHJcbiAgICAgICAgY29udHJvbGxlckFzOiAnUGxheWVyVGlsZUN0cmwnLFxyXG4gICAgICAgIHRlbXBsYXRlOiBgXHJcbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJ0aWxlIHRpbGUtZGVmYXVsdFwiPlxyXG5cclxuICAgICAgICAgICAgICAgIDxidXR0b24gY2xhc3M9XCJidG4gdGlsZS1kZWxldGUtYnV0dG9uXCIgXHJcbiAgICAgICAgICAgICAgICAgICAgbmctY2xpY2s9XCJQbGF5ZXJUaWxlQ3RybC5kZWxldGVQbGF5ZXIoe2lkIDogUGxheWVyVGlsZUN0cmwucGxheWVyLmlkfSlcIj5cclxuICAgICAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cImdseXBoaWNvbiBnbHlwaGljb24tcmVtb3ZlXCI+PC9zcGFuPlxyXG5cclxuICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxyXG5cclxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJpbnB1dC1ncm91cFwiPlxyXG5cclxuICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cImlucHV0LWdyb3VwLWFkZG9uXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDxpIGNsYXNzPVwiZ2x5cGhpY29uIGdseXBoaWNvbi11c2VyXCI+PC9pPlxyXG4gICAgICAgICAgICAgICAgICAgIDwvc3Bhbj5cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgPGlucHV0IHR5cGU9XCJ0ZXh0XCIgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzPVwiZm9ybS1jb250cm9sXCIgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBsYWNlaG9sZGVyPVwiTmFtZVwiIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBuZy1tb2RlbD1cIlBsYXllclRpbGVDdHJsLnBsYXllci5uYW1lXCIgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlcXVpcmVkIC8+XHJcbiAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImlucHV0LWdyb3VwXCI+XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwiaW5wdXQtZ3JvdXAtYWRkb25cIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPGkgY2xhc3M9XCJnbHlwaGljb24gZ2x5cGhpY29uLWZsYWdcIiBcclxuICAgICAgICAgICAgICAgICAgICAgICAgbmctc3R5bGU9XCJ7J2NvbG9yJzogUGxheWVyVGlsZUN0cmwuY29sb3JzW1BsYXllclRpbGVDdHJsLnBsYXllci50ZWFtXX1cIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPC9pPlxyXG4gICAgICAgICAgICAgICAgICAgIDwvc3Bhbj5cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgPHNlbGVjdCBuZy1tb2RlbD1cIlBsYXllclRpbGVDdHJsLnBsYXllci50ZWFtXCIgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzPVwiZm9ybS1jb250cm9sXCIgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG5nLW9wdGlvbnM9XCJ0ZWFtIGZvciB0ZWFtIGluIFBsYXllclRpbGVDdHJsLnRlYW1zXCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVxdWlyZWQgPlxyXG4gICAgICAgICAgICAgICAgICAgIDwvc2VsZWN0PlxyXG5cclxuICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICBgXHJcbiAgICB9O1xyXG59KTsiLCJ2YXIgc2lkZVBpY2tlciA9IGFuZ3VsYXIubW9kdWxlKCdTaWRlUGlja2VyJywgWydEcmFmdFRpbGUnLCAnU2lkZVBpY2tlck1vZGFsJywgJ1BsYXllcnNGYWN0b3J5JywgJ3VpLmJvb3RzdHJhcCddKTtcclxuXHJcbnNpZGVQaWNrZXIuZGlyZWN0aXZlKCdzaWRlUGlja2VyJywgZnVuY3Rpb24oKSB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIHJlc3RyaWN0OiAnQUUnLFxyXG4gICAgICAgIGNvbnRyb2xsZXI6ICdTaWRlUGlja2VyQ3RybCcsXHJcbiAgICAgICAgY29udHJvbGxlckFzOiAnU2lkZVBpY2tlckN0cmwnLFxyXG4gICAgICAgIHRlbXBsYXRlOiBgXHJcbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJkcmFmdC1jb250YWluZXJcIj5cclxuXHJcbiAgICAgICAgICAgICAgICA8ZGl2IG5nLWlmPVwiIVNpZGVQaWNrZXJDdHJsLnZhbGlkYXRlUGxheWVycygpXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgRWFjaCBwbGF5ZXIgbXVzdCBoYXZlIGEgbmFtZSBhbmQgYXNzaWduZWQgdGVhbSFcclxuICAgICAgICAgICAgICAgIDwvZGl2PlxyXG5cclxuICAgICAgICAgICAgICAgIDxkaXYgbmctaWY9XCIhU2lkZVBpY2tlckN0cmwudmFsaWRhdGVUZWFtcygpXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgVGhlcmUgbXVzdCBiZSBhdCBsZWFzdCB0d28gYWN0aXZlIHRlYW1zIVxyXG4gICAgICAgICAgICAgICAgPC9kaXY+XHJcblxyXG4gICAgICAgICAgICAgICAgPGRpdiBuZy1pZj1cIlNpZGVQaWNrZXJDdHJsLnZhbGlkYXRlUGxheWVycygpICYmIFNpZGVQaWNrZXJDdHJsLnZhbGlkYXRlVGVhbXMoKVwiPlxyXG5cclxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwicm91bmQtaGVhZGluZ1wiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBDaG9vc2UgVHdvIFRlYW1zXHJcbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIDx0ZWFtLXRpbGUgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG5nLXJlcGVhdD1cInRlYW0gaW4gU2lkZVBpY2tlckN0cmwudGVhbXNcIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0ZWFtPVwidGVhbVwiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGVjdGFibGU9XCJ0cnVlXCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZWN0LWZ1bmN0aW9uPVwiU2lkZVBpY2tlckN0cmwudGVhbUNsaWNrZWQodGVhbSwgc2VsZWN0ZWQpXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgPC90ZWFtLXRpbGU+XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIDxidXR0b24tdGlsZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBuZy1pZj1cIlNpZGVQaWNrZXJDdHJsLnNlbGVjdGVkVGVhbXMubGVuZ3RoID09PSAyXCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgZ2x5cGhpY29uPVwiJ3Rvd2VyJ1wiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsPVwiJ0RyYXcgRm9yIEhvbWUnXCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2xpY2stZnVuY3Rpb249XCJTaWRlUGlja2VyQ3RybC5kcmF3SG9tZSgpXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgPC9idXR0b24tdGlsZT5cclxuXHJcbiAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgYFxyXG4gICAgfTtcclxufSk7XHJcblxyXG5zaWRlUGlja2VyLmNvbnRyb2xsZXIoJ1NpZGVQaWNrZXJDdHJsJywgZnVuY3Rpb24ocGxheWVyc0ZhY3RvcnksICR1aWJNb2RhbCkge1xyXG4gICAgdGhpcy50ZWFtcyA9IHBsYXllcnNGYWN0b3J5LmdldEFjdGl2ZVRlYW1zKCk7XHJcbiAgICB0aGlzLnNlbGVjdGVkVGVhbXMgPSBbXVxyXG4gICAgdGhpcy5wbGF5ZXJzID0gcGxheWVyc0ZhY3RvcnkucGxheWVycztcclxuXHJcbiAgICB0aGlzLnZhbGlkYXRlVGVhbXMgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICBpZiAocGxheWVyc0ZhY3RvcnkuZ2V0QWN0aXZlVGVhbXMoKS5sZW5ndGggPCAyKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdHJ1ZTsgIFxyXG4gICAgfVxyXG5cclxuICAgIHRoaXMudmFsaWRhdGVQbGF5ZXJzID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgaWYgKHRoaXMucGxheWVycy5zb21lKHBsYXllciA9PiAhcGxheWVyLm5hbWUgfHwgIXBsYXllci50ZWFtKSkge1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2VcclxuICAgICAgICB9IFxyXG4gICAgICAgIHJldHVybiB0cnVlOyAgICAgICAgXHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy50ZWFtQ2xpY2tlZCA9IGZ1bmN0aW9uKHRlYW0sIHNlbGVjdGVkKSB7XHJcbiAgICAgICAgdmFyIHQgPSB0aGlzLnNlbGVjdGVkVGVhbXMuaW5kZXhPZih0ZWFtKTtcclxuXHJcbiAgICAgICAgaWYgKChzZWxlY3RlZCA9PT0gdHJ1ZSkgJiYgKHQgPT09IC0xKSkge1xyXG4gICAgICAgICAgICB0aGlzLnNlbGVjdGVkVGVhbXMucHVzaCh0ZWFtKTtcclxuICAgICAgICB9IFxyXG4gICAgICAgIGVsc2UgaWYgKChzZWxlY3RlZCA9PT0gZmFsc2UpICYmICh0ICE9PSAtMSkpIHtcclxuICAgICAgICAgICAgdGhpcy5zZWxlY3RlZFRlYW1zLnNwbGljZSh0LCAxKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5kcmF3SG9tZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGlmICh0aGlzLnNlbGVjdGVkVGVhbXMubGVuZ3RoICE9PSAyKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICBcclxuICAgICAgICB2YXIgd2lubmluZ1RlYW0gPSB0aGlzLnNlbGVjdGVkVGVhbXNbKE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDIpKV07XHJcblxyXG4gICAgICAgIHZhciBtb2RhbEluc3RhbmNlID0gJHVpYk1vZGFsLm9wZW4oe1xyXG4gICAgICAgICAgICB0ZW1wbGF0ZVVybDogJ3BhcnRpYWxzL1NpZGVQaWNrZXJNb2RhbC5odG1sJyxcclxuICAgICAgICAgICAgY29udHJvbGxlcjogJ1NpZGVQaWNrZXJNb2RhbEN0cmwgYXMgU2lkZVBpY2tlck1vZGFsQ3RybCcsXHJcbiAgICAgICAgICAgIHJlc29sdmU6IHtcclxuICAgICAgICAgICAgICAgIHdpbm5pbmdUZWFtOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHdpbm5pbmdUZWFtO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbn0pO1xyXG4iLCJ2YXIgc2lkZVBpY2tlck1vZGFsID0gYW5ndWxhci5tb2R1bGUoJ1NpZGVQaWNrZXJNb2RhbCcsIFsndWkuYm9vdHN0cmFwJ10pO1xyXG5cclxuc2lkZVBpY2tlck1vZGFsLmRpcmVjdGl2ZSgnc2lkZVBpY2tlck1vZGFsJywgZnVuY3Rpb24oKSB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIC8vIGNvbnRyb2xsZXIgaXMgc2V0IGJ5IHRoZSBtb2RhbC5vcGVuIGZ1bmN0aW9uLCBzbyBub3QgbmVlZGVkIGhlcmVcclxuICAgICAgICByZXN0cmljdDogJ0FFJyxcclxuICAgICAgICB0ZW1wbGF0ZTogYFxyXG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwic2lkZS1waWNrZXItbW9kYWxcIj5cclxuICAgICAgICAgICAgICAgIDx0ZWFtLXRpbGUgXHJcbiAgICAgICAgICAgICAgICAgICAgdGVhbT1cIlNpZGVQaWNrZXJNb2RhbEN0cmwud2lubmluZ1RlYW1cIj5cclxuICAgICAgICAgICAgICAgIDwvdGVhbS10aWxlPlxyXG4gICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICBgXHJcbiAgICB9O1xyXG59KTtcclxuXHJcbnNpZGVQaWNrZXJNb2RhbC5jb250cm9sbGVyKCdTaWRlUGlja2VyTW9kYWxDdHJsJywgZnVuY3Rpb24od2lubmluZ1RlYW0pIHtcclxuICAgIHRoaXMud2lubmluZ1RlYW0gPSB3aW5uaW5nVGVhbTtcclxufSk7XHJcbiIsInZhciB0ZWFtVGlsZSA9IGFuZ3VsYXIubW9kdWxlKCdUZWFtVGlsZScsIFsndWkuYm9vdHN0cmFwJ10pO1xyXG5cclxudGVhbVRpbGUuY29udHJvbGxlcignVGVhbVRpbGVDdHJsJywgZnVuY3Rpb24ocGxheWVyc0ZhY3RvcnksIGNvbG9ycykge1xyXG4gICAgdGhpcy5jb2xvcnMgPSBjb2xvcnM7XHJcbiAgICB0aGlzLnBsYXllck5hbWVzID0gcGxheWVyc0ZhY3RvcnkuZ2V0VGVhbVBsYXllck5hbWVzKHRoaXMudGVhbSk7XHJcbiAgICB0aGlzLnNlbGVjdGVkID0gZmFsc2U7XHJcblxyXG4gICAgdGhpcy5vblNlbGVjdCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGlmICh0aGlzLnNlbGVjdGFibGUgIT09IHRydWUpIHJldHVybjtcclxuICAgICAgICB0aGlzLnNlbGVjdGVkID0gIXRoaXMuc2VsZWN0ZWQ7XHJcbiAgICAgICAgdGhpcy5zZWxlY3RGdW5jdGlvbih7dGVhbTogdGhpcy50ZWFtLCBzZWxlY3RlZDogdGhpcy5zZWxlY3RlZH0pO1xyXG4gICAgfTtcclxufSk7XHJcblxyXG50ZWFtVGlsZS5kaXJlY3RpdmUoJ3RlYW1UaWxlJywgZnVuY3Rpb24oKSB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIHJlc3RyaWN0OiAnQUUnLFxyXG4gICAgICAgIHNjb3BlOiB7XHJcbiAgICAgICAgICAgIHRlYW06ICc9JyxcclxuICAgICAgICAgICAgc2VsZWN0YWJsZTogJz0nLFxyXG4gICAgICAgICAgICBzZWxlY3RGdW5jdGlvbjogJyYnXHJcbiAgICAgICAgfSxcclxuICAgICAgICBiaW5kVG9Db250cm9sbGVyOiB0cnVlLFxyXG4gICAgICAgIGNvbnRyb2xsZXI6ICdUZWFtVGlsZUN0cmwnLFxyXG4gICAgICAgIGNvbnRyb2xsZXJBczogJ1RlYW1UaWxlQ3RybCcsXHJcbiAgICAgICAgdGVtcGxhdGU6IGBcclxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cInRpbGUgdGlsZS1kZWZhdWx0XCIgXHJcbiAgICAgICAgICAgICAgICBuZy1jbGFzcz1cInsndGlsZS1zZWxlY3RhYmxlJzogVGVhbVRpbGVDdHJsLnNlbGVjdGFibGUgPT09IHRydWV9XCJcclxuICAgICAgICAgICAgICAgIG5nLWNsaWNrPVwiVGVhbVRpbGVDdHJsLm9uU2VsZWN0KClcIj5cclxuXHJcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwidGlsZS1zZWxlY3RlZC1pbmRpY2F0b3JcIiBuZy1pZj1cIlRlYW1UaWxlQ3RybC5zZWxlY3RlZFwiPlxyXG4gICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwiZ2x5cGhpY29uIGdseXBoaWNvbi1va1wiPjwvc3Bhbj5cclxuICAgICAgICAgICAgICAgIDwvZGl2PlxyXG5cclxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJpbnB1dC1ncm91cFwiPlxyXG5cclxuICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cImlucHV0LWdyb3VwLWFkZG9uXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDxpIGNsYXNzPVwiZ2x5cGhpY29uIGdseXBoaWNvbi11c2VyXCI+PC9pPlxyXG4gICAgICAgICAgICAgICAgICAgIDwvc3Bhbj5cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImlucHV0LWdyb3VwLW5vbi1pbnB1dFwiIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0b29sdGlwLXBsYWNlbWVudD1cInJpZ2h0XCIgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHVpYi10b29sdGlwPVwie3tUZWFtVGlsZUN0cmwucGxheWVyTmFtZXN9fVwiID5cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJ0cnVuY2F0ZVwiIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmctYmluZD1cIlRlYW1UaWxlQ3RybC5wbGF5ZXJOYW1lc1wiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImlucHV0LWdyb3VwXCI+XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwiaW5wdXQtZ3JvdXAtYWRkb25cIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPGkgY2xhc3M9XCJnbHlwaGljb24gZ2x5cGhpY29uLWZsYWdcIiBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5nLXN0eWxlPVwieydjb2xvcic6IFRlYW1UaWxlQ3RybC5jb2xvcnNbVGVhbVRpbGVDdHJsLnRlYW1dfVwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8L2k+XHJcbiAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxyXG5cclxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiaW5wdXQtZ3JvdXAtbm9uLWlucHV0XCIgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBsYWNlaG9sZGVyPVwiTmFtZVwiIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBuZy1iaW5kPVwiVGVhbVRpbGVDdHJsLnRlYW1cIiA+XHJcbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcblxyXG4gICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgIGBcclxuICAgIH07XHJcbn0pOyIsInZhciBkcmFmdEZhY3RvcnkgPSBhbmd1bGFyLm1vZHVsZSgnRHJhZnRGYWN0b3J5JywgW10pO1xyXG5cclxuZHJhZnRGYWN0b3J5LmZhY3RvcnkoJ2RyYWZ0RmFjdG9yeScsIGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIGRyYWZ0RmFjdG9yeSA9IHt9XHJcblxyXG4gICAgLy8gUmV0dXJucyBhIHJhbmRvbSBvcmRlciB0aGF0IHRlYW1zIGNhbiBkcmFmdCBpblxyXG4gICAgZHJhZnRGYWN0b3J5LmdldERyYWZ0T3JkZXIgPSBmdW5jdGlvbihhY3RpdmVUZWFtc09yaWdpbmFsKSB7XHJcbiAgICAgICAgdmFyIGRyYWZ0T3JkZXIgPSBbXTtcclxuICAgICAgICB2YXIgYWN0aXZlVGVhbXMgPSBhY3RpdmVUZWFtc09yaWdpbmFsLnNsaWNlKCk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgd2hpbGUgKGFjdGl2ZVRlYW1zLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgdmFyIHJhbmQgPSBnZXRSYW5kb21JbnRJbmNsdXNpdmUoMCwgYWN0aXZlVGVhbXMubGVuZ3RoIC0gMSk7XHJcbiAgICAgICAgICAgIGRyYWZ0T3JkZXIucHVzaChhY3RpdmVUZWFtc1tyYW5kXSk7XHJcbiAgICAgICAgICAgIGFjdGl2ZVRlYW1zLnNwbGljZShyYW5kLCAxKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGRyYWZ0T3JkZXI7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gUGVyZm9ybXMgYSByb3VuZCBvZiBOSEwgdGVhbSBkcmFmdGluZyBiYXNlZCBvbiBhIGdpdmVuIGRyYWZ0IG9yZGVyXHJcbiAgICBkcmFmdEZhY3RvcnkuYXV0b0RyYWZ0Um91bmQgPSBmdW5jdGlvbihkcmFmdE9yZGVyLCBhY3RpdmVUZWFtc09yaWdpbmFsLCBuaGxUZWFtcykge1xyXG4gICAgICAgIHZhciBhY3RpdmVUZWFtcyA9IGFjdGl2ZVRlYW1zT3JpZ2luYWwuc2xpY2UoKTtcclxuICAgICAgICB2YXIgZHJhZnRSb3VuZCA9IFtdO1xyXG5cclxuICAgICAgICBpZiAobmhsVGVhbXMubGVuZ3RoIDwgYWN0aXZlVGVhbXMubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICBcclxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFjdGl2ZVRlYW1zLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIHZhciByYW5kID0gZ2V0UmFuZG9tSW50SW5jbHVzaXZlKDAsIG5obFRlYW1zLmxlbmd0aCAtIDEpO1xyXG5cclxuICAgICAgICAgICAgZHJhZnRSb3VuZC5wdXNoKHtcclxuICAgICAgICAgICAgICAgICB0ZWFtIDogZHJhZnRPcmRlcltpXSwgXHJcbiAgICAgICAgICAgICAgICAgbmhsVGVhbSA6IG5obFRlYW1zW3JhbmRdXHJcbiAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIG5obFRlYW1zLnNwbGljZShyYW5kLCAxKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGRyYWZ0Um91bmQ7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gR2V0cyBlaXRoZXIgMCBvciAxIGF0IHJhbmRvbVxyXG4gICAgZnVuY3Rpb24gZ2V0UmFuZG9tSW50SW5jbHVzaXZlKG1pbiwgbWF4KSB7XHJcbiAgICAgICAgcmV0dXJuIE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIChtYXggLSBtaW4gKyAxKSkgKyBtaW47XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGRyYWZ0RmFjdG9yeTtcclxufSkiLCJ2YXIgcGxheWVyc0ZhY3RvcnkgPSBhbmd1bGFyLm1vZHVsZSgnUGxheWVyc0ZhY3RvcnknLCBbXSk7XHJcblxyXG5wbGF5ZXJzRmFjdG9yeS5mYWN0b3J5KCdwbGF5ZXJzRmFjdG9yeScsIGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIHBsYXllcnNGYWN0b3J5ID0ge307XHJcblxyXG4gICAgLy8gQXJyYXkgb2YgcGxheWVycyAtIHtpZCwgbmFtZSwgdGVhbX1cclxuICAgIHBsYXllcnNGYWN0b3J5LnBsYXllcnMgPSBbXVxyXG5cclxuICAgIC8vIFRoZSBpZCBvZiB0aGUgcGxheWVyIHRoYXQgd2lsbCBiZSBjcmVhdGVkIG5leHRcclxuICAgIHBsYXllcnNGYWN0b3J5Lm5leHRQbGF5ZXJJZCA9IDA7XHJcblxyXG4gICAgLy8gVGVhbXMgdGhhdCBwbGF5ZXJzIGNhbiBiZSBhc3NpZ25lZCB0b1xyXG4gICAgcGxheWVyc0ZhY3RvcnkucGxheWVyVGVhbXMgPSBbXHJcbiAgICAgICAgMSxcclxuICAgICAgICAyXHJcbiAgICBdO1xyXG5cclxuICAgIC8vIEFjY2VwdGFibGUgbGVuZ3RocyBmb3IgdGhlIHBsYXllclRlYW1zIGFycmF5XHJcbiAgICBwbGF5ZXJzRmFjdG9yeS5hbGxvd2VkTnVtYmVyT2ZUZWFtcyA9IFtcclxuICAgICAgICAyLFxyXG4gICAgICAgIDMsXHJcbiAgICAgICAgNCxcclxuICAgICAgICA1LFxyXG4gICAgICAgIDYsXHJcbiAgICAgICAgNyxcclxuICAgICAgICA4XHJcbiAgICBdXHJcblxyXG4gICAgLy8gUHVzaGVzIGEgcGxheWVyIG9iamVjdCB0byB0aGUgcGxheWVycyBhcnJheVxyXG4gICAgcGxheWVyc0ZhY3RvcnkuYWRkUGxheWVyID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgcGxheWVyc0ZhY3RvcnkucGxheWVycy5wdXNoKHtcclxuICAgICAgICAgICAgaWQgOiBwbGF5ZXJzRmFjdG9yeS5uZXh0UGxheWVySWQsIFxyXG4gICAgICAgICAgICBuYW1lIDogXCJcIiwgXHJcbiAgICAgICAgICAgIHRlYW0gOiAxXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHBsYXllcnNGYWN0b3J5Lm5leHRQbGF5ZXJJZCArKztcclxuICAgIH1cclxuICAgIFxyXG4gICAgLy8gRGVsZXRlcyBhIHBsYXllciAoYnkgaWQpIGZyb20gdGhlIHBsYXllcnMgYXJyYXlcclxuICAgIHBsYXllcnNGYWN0b3J5LmRlbGV0ZVBsYXllciA9IGZ1bmN0aW9uKGlkKSB7XHJcbiAgICAgICAgZm9yKHZhciBpID0gMDsgaSA8IHBsYXllcnNGYWN0b3J5LnBsYXllcnMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgaWYgKHBsYXllcnNGYWN0b3J5LnBsYXllcnNbaV0uaWQgPT09IGlkKSB7XHJcbiAgICAgICAgICAgICAgICBwbGF5ZXJzRmFjdG9yeS5wbGF5ZXJzLnNwbGljZShpLCAxKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyBBc3NpZ25zIHBsYXllcnMgcmFuZG9tbHkgdG8gb25lIG9mIHRoZSBudW1iZXJlZCB0ZWFtcyBkZWZpbmVkIGluIHBsYXllclRlYW1zXHJcbiAgICBwbGF5ZXJzRmFjdG9yeS5yYW5kb21pemVUZWFtcyA9IGZ1bmN0aW9uKG51bVRlYW1zKSB7XHJcbiAgICAgICAgdmFyIHBsYXllckluZGV4ZXMgPSBbXTtcclxuICAgICAgICBcclxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHBsYXllcnNGYWN0b3J5LnBsYXllcnMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgcGxheWVySW5kZXhlcy5wdXNoKGkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBzaHVmZmxlKHBsYXllckluZGV4ZXMpO1xyXG5cclxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHBsYXllckluZGV4ZXMubGVuZ3RoOyBpICsrKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgcGxheWVyc0ZhY3RvcnkucGxheWVyc1twbGF5ZXJJbmRleGVzW2ldXS50ZWFtID0gKGkgJSBudW1UZWFtcykgKyAxO1xyXG4gICAgICAgIH0gICAgICAgIFxyXG4gICAgfVxyXG4gICAgXHJcbiAgICAvLyBTZXRzIHBsYXllclRlYW1zIHRvIGJlIGFuIGFycmF5IG9mIGxlbmd0aCBuZXdOdW1cclxuICAgIHBsYXllcnNGYWN0b3J5LmNoYW5nZUFsbG93ZWROdW1iZXJPZlRlYW1zID0gZnVuY3Rpb24obmV3TnVtKSB7XHJcbiAgICAgICAgcGxheWVyc0ZhY3RvcnkucGxheWVyVGVhbXMgPSBbXTtcclxuXHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBuZXdOdW07IGkrKykge1xyXG4gICAgICAgICAgICBwbGF5ZXJzRmFjdG9yeS5wbGF5ZXJUZWFtcy5wdXNoKGkgKyAxKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy8gUmV0dXJucyBhbiBhcnJheSBvZiB0ZWFtcyB0aGF0IGhhdmUgYXQgbGVhc3Qgb25lIHBsYXllclxyXG4gICAgcGxheWVyc0ZhY3RvcnkuZ2V0QWN0aXZlVGVhbXMgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgYWN0aXZlVGVhbXMgPSBbXTtcclxuICAgICAgICBcclxuXHJcbiAgICAgICAgZm9yKHZhciBpID0gMDsgaSA8IHBsYXllcnNGYWN0b3J5LnBsYXllcnMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgaWYgKCFjb250YWlucyhhY3RpdmVUZWFtcywgcGxheWVyc0ZhY3RvcnkucGxheWVyc1tpXS50ZWFtKSkge1xyXG4gICAgICAgICAgICAgICAgYWN0aXZlVGVhbXMucHVzaChwbGF5ZXJzRmFjdG9yeS5wbGF5ZXJzW2ldLnRlYW0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBhY3RpdmVUZWFtcztcclxuICAgIH1cclxuXHJcbiAgICAvLyBSZXR1cm5zIGEgc3RyaW5nIGNvbnRhaW5pbmcgdGhlIG5hbWVzIG9mIHBsYXllcnMgb24gYSBzcGVjaWZpZWQgdGVhbVxyXG4gICAgcGxheWVyc0ZhY3RvcnkuZ2V0VGVhbVBsYXllck5hbWVzID0gZnVuY3Rpb24odGVhbSkge1xyXG4gICAgICAgIHZhciBwbGF5ZXJzID0gXCJcIjtcclxuICAgICAgICBcclxuICAgICAgICBmb3IodmFyIGkgPSAwOyBpIDwgcGxheWVyc0ZhY3RvcnkucGxheWVycy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBpZiAocGxheWVyc0ZhY3RvcnkucGxheWVyc1tpXS50ZWFtID09PSB0ZWFtKSB7XHJcbiAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgIGlmIChwbGF5ZXJzRmFjdG9yeS5wbGF5ZXJzW2ldLm5hbWUgPT09IFwiXCIpIHtcclxuICAgICAgICAgICAgICAgICAgICBwbGF5ZXJzICs9IFwiW3VubmFtZWRdXCI7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHBsYXllcnMgKz0gKHBsYXllcnNGYWN0b3J5LnBsYXllcnNbaV0ubmFtZSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBwbGF5ZXJzICs9IFwiLCBcIlxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBwbGF5ZXJzLnJlcGxhY2UoLywgJC8sIFwiXCIpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIENoZWNrcyBpZiBhbiBhcnJheSBjb250YWlucyBzb21ldGhpbmcgXHJcbiAgICBmdW5jdGlvbiBjb250YWlucyhhLCBvYmopIHtcclxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGEubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgaWYgKGFbaV0gPT09IG9iaikge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFNlZSBoZXJlOiBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vYS8xMjY0Njg2NFxyXG4gICAgZnVuY3Rpb24gc2h1ZmZsZShhcnJheSkge1xyXG4gICAgICAgIGZvciAodmFyIGkgPSBhcnJheS5sZW5ndGggLSAxOyBpID4gMDsgaS0tKSB7XHJcbiAgICAgICAgICAgIHZhciBqID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogKGkgKyAxKSk7XHJcbiAgICAgICAgICAgIHZhciB0ZW1wID0gYXJyYXlbaV07XHJcbiAgICAgICAgICAgIGFycmF5W2ldID0gYXJyYXlbal07XHJcbiAgICAgICAgICAgIGFycmF5W2pdID0gdGVtcDtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGFycmF5O1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBwbGF5ZXJzRmFjdG9yeTtcclxufSk7Il0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
