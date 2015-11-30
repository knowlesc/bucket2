'use strict';

var app = angular.module('app', ['ngRoute', 'PlayerPicker', 'BucketDraft', 'SidePicker', 'BucketHeader']);

app.config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/Players', {
        templateUrl: 'partials/PlayerPicker.html'
    }).when('/Draft', {
        templateUrl: 'partials/Draft.html'
    }).when('/Sides', {
        templateUrl: 'partials/SidePicker.html'
    }).otherwise({
        redirectTo: '/Players'
    });
}]);

app.constant('colors', ['', '#2980b9', '#e67e22', '#8e44ad', '#27ae60', '#ffffff', '#2c3e50', '#c0392b', '#f1c40f']);

app.constant('nhlTeams', [{ abbr: 'ANA', name: 'Anaheim Ducks' }, { abbr: 'ARI', name: 'Arizona Coyotes' }, { abbr: 'BOS', name: 'Boston Bruins' }, { abbr: 'BUF', name: 'Buffalo Sabres' }, { abbr: 'CGY', name: 'Calgary Flames' }, { abbr: 'CAR', name: 'Carolina Hurricanes' }, { abbr: 'CHI', name: 'Chicago Blackhawks' }, { abbr: 'COL', name: 'Colorado Avalanche' }, { abbr: 'CBJ', name: 'Columbus Blue Jackets' }, { abbr: 'DAL', name: 'Dallas Stars' }, { abbr: 'DET', name: 'Detroit Red Wings' }, { abbr: 'EDM', name: 'Edmonton Oilers' }, { abbr: 'FLA', name: 'Florida Panthers' }, { abbr: 'LAK', name: 'Los Angeles Kings' }, { abbr: 'MIN', name: 'Minnesota Wild' }, { abbr: 'MTL', name: 'Montreal Canadiens' }, { abbr: 'NSH', name: 'Nashville Predators' }, { abbr: 'NJD', name: 'New Jersey Devils' }, { abbr: 'NYI', name: 'New York Islanders' }, { abbr: 'NYR', name: 'New York Rangers' }, { abbr: 'OTT', name: 'Ottawa Senators' }, { abbr: 'PHI', name: 'Philadelphia Flyers' }, { abbr: 'PIT', name: 'Pittsburgh Penguins' }, { abbr: 'SJS', name: 'San Jose Sharks' }, { abbr: 'STL', name: 'St. Louis Blues' }, { abbr: 'TBL', name: 'Tampa Bay Lightning' }, { abbr: 'TOR', name: 'Toronto Maple Leafs' }, { abbr: 'VAN', name: 'Vancouver Canucks' }, { abbr: 'WSH', name: 'Washington Capitals' }, { abbr: 'WPG', name: 'Winnipeg Jets' }]);
'use strict';

var buttonTile = angular.module('ButtonTile', ['ui.bootstrap']);

buttonTile.controller('ButtonTileCtrl', function () {
    this.getGlyphiconClass = function () {
        return 'glyphicon-' + this.glyphicon;
    };
});

buttonTile.directive('buttonTile', function () {
    return {
        restrict: 'AE',
        scope: {
            glyphicon: '=',
            label: '=',
            clickFunction: '&'
        },
        bindToController: true,
        controller: 'ButtonTileCtrl',
        controllerAs: 'ButtonTileCtrl',
        template: '\n            <div class="tile tile-selectable">\n                <button class="btn tile-button pull-right" \n                    ng-click="ButtonTileCtrl.clickFunction()">\n\n                    <span class="glyphicon" \n                        ng-class="ButtonTileCtrl.getGlyphiconClass()">\n                    </span>\n                    <span ng-bind="ButtonTileCtrl.label"></span>\n\n                </button>\n            </div>\n        '
    };
});
'use strict';

var bucketDraft = angular.module('BucketDraft', ['DraftTile', 'TeamTile', 'ButtonTile', 'DraftFactory', "PlayersFactory"]);

bucketDraft.directive('bucketDraft', function () {
    return {
        restrict: 'AE',
        controller: 'DraftCtrl',
        controllerAs: 'DraftCtrl',
        template: '\n            <div class="draft-container">\n\n                <div ng-if="!DraftCtrl.validatePlayers()">\n                    Each player must have a name and assigned team!\n                </div>\n\n                <div ng-if="!DraftCtrl.validateTeams()">\n                    There must be at least two active teams!\n                </div>\n\n                <div ng-if="DraftCtrl.validatePlayers() && DraftCtrl.validateTeams()">\n\n                    <div class="round-heading">\n                        Draft Order\n                    </div>\n\n                    <team-tile \n                        ng-repeat="team in DraftCtrl.draftOrder"\n                        team="team"\n                        position="{{$index + 1}}">\n                    </team-tile>\n\n                    <button-tile\n                        glyphicon="\'th-list\'"\n                        label="\'Get Draft Order\'"\n                        click-function="DraftCtrl.getDraftOrder()">\n                    </button-tile>\n\n                    <button-tile\n                        ng-if="DraftCtrl.draftOrder.length > 0 && DraftCtrl.autoDraftPossible()"\n                        glyphicon="\'play\'"\n                        label="\'Draft NHL Teams\'"\n                        click-function="DraftCtrl.autoDraftRound()">\n                    </button-tile>\n\n                </div>\n\n                <div ng-repeat="round in DraftCtrl.draftResults.slice().reverse()">\n\n                    <div class="round-heading">\n                        Round {{ DraftCtrl.draftResults.length - $index }}\n                    </div>\n\n                    <draft-tile \n                        ng-repeat="result in round"\n                        nhl-team="result.nhlTeam"\n                        team="result.team">\n                    </draft-tile>\n\n                </div>\n            </div>\n        '
    };
});

bucketDraft.controller('DraftCtrl', function (playersFactory, draftFactory, nhlTeams) {
    this.players = playersFactory.players;
    this.nhlTeams = nhlTeams.slice();
    this.draftOrder = [];
    this.draftResults = [];

    this.validateTeams = function () {
        if (playersFactory.getActiveTeams().length < 2) {
            return false;
        }
        return true;
    };

    this.validatePlayers = function () {
        if (this.players.some(function (player) {
            return !player.name || !player.team;
        })) {
            return false;
        }
        return true;
    };

    this.getDraftOrder = function () {
        this.draftResults = [];
        this.nhlTeams = nhlTeams.slice();
        this.draftOrder = draftFactory.getDraftOrder(playersFactory.getActiveTeams());
    };

    this.autoDraftRound = function () {
        var activeTeams = playersFactory.getActiveTeams();

        if (this.nhlTeams.length < activeTeams.length) {
            return;
        };

        var roundResults = draftFactory.autoDraftRound(this.draftOrder, activeTeams, this.nhlTeams);
        this.draftResults.push(roundResults);
    };

    this.autoDraftPossible = function () {
        var activeTeams = playersFactory.getActiveTeams();
        return this.nhlTeams.length > activeTeams.length;
    };
});
'use strict';

var draftTile = angular.module('DraftTile', ['ui.bootstrap']);

draftTile.controller('DraftTileCtrl', function (colors) {
    this.colors = colors;
});

draftTile.directive('draftTile', function () {
    return {
        restrict: 'AE',
        scope: {
            team: '=',
            nhlTeam: '='
        },
        bindToController: true,
        controller: 'DraftTileCtrl',
        controllerAs: 'DraftTileCtrl',
        template: '\n            <div class="tile tile-default">\n\n                <div class="input-group">\n\n                    <span class="input-group-addon nhl-team-logo-container">\n                        <img class="nhl-team-logo" \n                            ng-src="http://cdn.nhle.com/nhl/images/logos/teams/{{DraftTileCtrl.nhlTeam.abbr}}_logo.svgz?v=9.5">\n                        </img>\n                    </span>\n\n                    <div class="input-group-non-input">\n                        <div class="truncate" \n                            ng-bind="DraftTileCtrl.nhlTeam.name">\n                        </div>\n                    </div>\n\n                </div>\n\n                <div class="input-group">\n\n                    <span class="input-group-addon">\n                        <i class="glyphicon glyphicon-flag" \n                            ng-style="{\'color\': DraftTileCtrl.colors[DraftTileCtrl.team]}">\n                        </i>\n                    </span>\n\n                    <div  \n                        class="input-group-non-input" \n                        placeholder="Name" \n                        ng-bind="DraftTileCtrl.team" >\n                    </div>\n\n                </div>\n            </div>\n        '
    };
});
'use strict';

var bucketHeader = angular.module('BucketHeader', []);

bucketHeader.directive('bucketHeader', function () {
    return {
        restrict: 'AE',
        controller: 'HeaderCtrl',
        controllerAs: 'HeaderCtrl',
        template: '\n            <div class="header">\n\n                <a href="#/Players"\n                    class="header-text" \n                    ng-class="HeaderCtrl.getClass(\'/Players\')">\n                    Players\n                </a>\n\n                <a href="#/Draft"\n                    class="header-text" \n                    ng-class="HeaderCtrl.getClass(\'/Draft\')">\n                    Draft\n                </a>\n\n                <a href="#/Sides"\n                    class="header-text" \n                    ng-class="HeaderCtrl.getClass(\'/Sides\')">\n                    Sides\n                </a>\n\n            </div>\n        '
    };
});

bucketHeader.controller('HeaderCtrl', function ($location) {
    this.getClass = function (path) {
        return $location.$$path == path ? 'active' : '';
    };
});
'use strict';

var playerPicker = angular.module('PlayerPicker', ['PlayerTile', 'PlayersFactory']);

playerPicker.directive('playerPicker', function () {
    return {
        restrict: 'AE',
        controller: 'PlayerPickerCtrl',
        controllerAs: 'PlayerPickerCtrl',
        template: '     \n            <form novalidate> \n\n                <div class="team-sizer">\n\n                    <div class="input-group">\n\n                        <span class="input-group-addon">\n                            Number of Teams\n                        </span>\n\n                        <select ng-model="PlayerPickerCtrl.numTeams" \n                            class="form-control" \n                            ng-change="PlayerPickerCtrl.updateAllowedNumberOfTeams()"\n                            ng-options="size for size in PlayerPickerCtrl.allowedNumberOfTeams"\n                            required >\n                        </select>\n\n                    </div>\n                </div>\n\n                <player-tile \n                    ng-repeat="player in PlayerPickerCtrl.players"\n                    player="player" \n                    teams="PlayerPickerCtrl.playerTeams"\n                    delete-player="PlayerPickerCtrl.deletePlayer(id)">\n                </player-tile>\n\n                <button-tile\n                    glyphicon="\'plus\'"\n                    label="\'Add Player\'"\n                    click-function="PlayerPickerCtrl.addPlayer()">\n                </button-tile>\n\n                <button-tile\n                    ng-if="PlayerPickerCtrl.players.length > 1"\n                    glyphicon="\'question-sign\'"\n                    label="\'Randomize Teams\'"\n                    click-function="PlayerPickerCtrl.randomizeTeams()">\n                </button-tile>\n\n            </form>\n        '
    };
});

playerPicker.controller('PlayerPickerCtrl', function (playersFactory) {
    this.players = playersFactory.players;
    this.playerTeams = playersFactory.playerTeams;
    this.numTeams = playersFactory.playerTeams.length;
    this.allowedNumberOfTeams = playersFactory.allowedNumberOfTeams;

    this.updateAllowedNumberOfTeams = function (value) {
        playersFactory.changeAllowedNumberOfTeams(this.numTeams);
        this.allowedNumberOfTeams = playersFactory.allowedNumberOfTeams;
        this.playerTeams = playersFactory.playerTeams;
    };

    this.randomizeTeams = function () {
        playersFactory.randomizeTeams(this.numTeams);
    };

    this.addPlayer = function () {
        playersFactory.addPlayer();
    };

    this.deletePlayer = function (id) {
        playersFactory.deletePlayer(id);
    };
});
'use strict';

var playerTile = angular.module('PlayerTile', []);

playerTile.controller('PlayerTileCtrl', function (playersFactory, colors) {
    this.colors = colors;
});

playerTile.directive('playerTile', function () {
    return {
        restrict: 'AE',
        scope: {
            player: '=',
            teams: '=',
            deletePlayer: '&'
        },
        bindToController: true,
        controller: 'PlayerTileCtrl',
        controllerAs: 'PlayerTileCtrl',
        template: '\n            <div class="tile tile-default">\n\n                <button class="btn tile-delete-button" \n                    ng-click="PlayerTileCtrl.deletePlayer({id : PlayerTileCtrl.player.id})">\n                    \n                    <span class="glyphicon glyphicon-remove"></span>\n\n                </button>\n\n                <div class="input-group">\n\n                    <span class="input-group-addon">\n                        <i class="glyphicon glyphicon-user"></i>\n                    </span>\n\n                    <input type="text" \n                        class="form-control" \n                        placeholder="Name" \n                        ng-model="PlayerTileCtrl.player.name" \n                        required />\n                </div>\n                \n                <div class="input-group">\n\n                    <span class="input-group-addon">\n                        <i class="glyphicon glyphicon-flag" \n                        ng-style="{\'color\': PlayerTileCtrl.colors[PlayerTileCtrl.player.team]}">\n                        </i>\n                    </span>\n\n                    <select ng-model="PlayerTileCtrl.player.team" \n                        class="form-control" \n                        ng-options="team for team in PlayerTileCtrl.teams"\n                        required >\n                    </select>\n\n                </div>\n            </div>\n        '
    };
});
'use strict';

var sidePicker = angular.module('SidePicker', ['DraftTile', 'SidePickerModal', 'PlayersFactory', 'ui.bootstrap']);

sidePicker.directive('sidePicker', function () {
    return {
        restrict: 'AE',
        controller: 'SidePickerCtrl',
        controllerAs: 'SidePickerCtrl',
        template: '\n            <div class="draft-container">\n\n                <div ng-if="!SidePickerCtrl.validatePlayers()">\n                    Each player must have a name and assigned team!\n                </div>\n\n                <div ng-if="!SidePickerCtrl.validateTeams()">\n                    There must be at least two active teams!\n                </div>\n\n                <div ng-if="SidePickerCtrl.validatePlayers() && SidePickerCtrl.validateTeams()">\n\n                    <div class="round-heading">\n                        Choose Two Teams\n                    </div>\n\n                    <team-tile \n                        ng-repeat="team in SidePickerCtrl.teams"\n                        team="team"\n                        selectable="true"\n                        select-function="SidePickerCtrl.teamClicked(team, selected)">\n                    </team-tile>\n\n                    <button-tile\n                        ng-if="SidePickerCtrl.selectedTeams.length === 2"\n                        glyphicon="\'tower\'"\n                        label="\'Draw For Home\'"\n                        click-function="SidePickerCtrl.drawHome()">\n                    </button-tile>\n\n                </div>\n            </div>\n        '
    };
});

sidePicker.controller('SidePickerCtrl', function (playersFactory, $uibModal) {
    this.teams = playersFactory.getActiveTeams();
    this.selectedTeams = [];
    this.players = playersFactory.players;

    this.validateTeams = function () {
        if (playersFactory.getActiveTeams().length < 2) {
            return false;
        }
        return true;
    };

    this.validatePlayers = function () {
        if (this.players.some(function (player) {
            return !player.name || !player.team;
        })) {
            return false;
        }
        return true;
    };

    this.teamClicked = function (team, selected) {
        var t = this.selectedTeams.indexOf(team);

        if (selected === true && t === -1) {
            this.selectedTeams.push(team);
        } else if (selected === false && t !== -1) {
            this.selectedTeams.splice(t, 1);
        }
    };

    this.drawHome = function () {
        if (this.selectedTeams.length !== 2) {
            return;
        }

        var _winningTeam = this.selectedTeams[Math.floor(Math.random() * 2)];

        var modalInstance = $uibModal.open({
            templateUrl: 'partials/SidePickerModal.html',
            controller: 'SidePickerModalCtrl as SidePickerModalCtrl',
            resolve: {
                winningTeam: function winningTeam() {
                    return _winningTeam;
                }
            }
        });
    };
});
'use strict';

var sidePickerModal = angular.module('SidePickerModal', ['ui.bootstrap']);

sidePickerModal.directive('sidePickerModal', function () {
    return {
        // controller is set by the modal.open function, so not needed here
        restrict: 'AE',
        template: '\n            <div class="side-picker-modal">\n                <team-tile \n                    team="SidePickerModalCtrl.winningTeam">\n                </team-tile>\n            </div>\n        '
    };
});

sidePickerModal.controller('SidePickerModalCtrl', function (winningTeam) {
    this.winningTeam = winningTeam;
});
'use strict';

var teamTile = angular.module('TeamTile', ['ui.bootstrap']);

teamTile.controller('TeamTileCtrl', function (playersFactory, colors) {
    this.colors = colors;
    this.playerNames = playersFactory.getTeamPlayerNames(this.team);
    this.selected = false;

    this.onSelect = function () {
        if (this.selectable !== true) return;
        this.selected = !this.selected;
        this.selectFunction({ team: this.team, selected: this.selected });
    };
});

teamTile.directive('teamTile', function () {
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
        template: '\n            <div class="tile tile-default" \n                ng-class="{\'tile-selectable\': TeamTileCtrl.selectable === true}"\n                ng-click="TeamTileCtrl.onSelect()">\n\n                <div class="tile-selected-indicator" ng-if="TeamTileCtrl.selected">\n                    <span class="glyphicon glyphicon-ok"></span>\n                </div>\n\n                <div class="input-group">\n\n                    <span class="input-group-addon">\n                        <i class="glyphicon glyphicon-user"></i>\n                    </span>\n\n                    <div class="input-group-non-input" \n                        tooltip-placement="right" \n                        uib-tooltip="{{TeamTileCtrl.playerNames}}" >\n\n                        <div class="truncate" \n                            ng-bind="TeamTileCtrl.playerNames">\n                        </div>\n\n                    </div>\n                </div>\n                \n                <div class="input-group">\n\n                    <span class="input-group-addon">\n                        <i class="glyphicon glyphicon-flag" \n                            ng-style="{\'color\': TeamTileCtrl.colors[TeamTileCtrl.team]}">\n                        </i>\n                    </span>\n\n                    <div class="input-group-non-input" \n                        placeholder="Name" \n                        ng-bind="TeamTileCtrl.team" >\n                    </div>\n\n                </div>\n            </div>\n        '
    };
});
'use strict';

var draftFactory = angular.module('DraftFactory', []);

draftFactory.factory('draftFactory', function () {
    var draftFactory = {};

    // Returns a random order that teams can draft in
    draftFactory.getDraftOrder = function (activeTeamsOriginal) {
        var draftOrder = [];
        var activeTeams = activeTeamsOriginal.slice();

        while (activeTeams.length > 0) {
            var rand = getRandomIntInclusive(0, activeTeams.length - 1);
            draftOrder.push(activeTeams[rand]);
            activeTeams.splice(rand, 1);
        }
        return draftOrder;
    };

    // Performs a round of NHL team drafting based on a given draft order
    draftFactory.autoDraftRound = function (draftOrder, activeTeamsOriginal, nhlTeams) {
        var activeTeams = activeTeamsOriginal.slice();
        var draftRound = [];

        if (nhlTeams.length < activeTeams.length) {
            return;
        }

        for (var i = 0; i < activeTeams.length; i++) {
            var rand = getRandomIntInclusive(0, nhlTeams.length - 1);

            draftRound.push({
                team: draftOrder[i],
                nhlTeam: nhlTeams[rand]
            });

            nhlTeams.splice(rand, 1);
        }
        return draftRound;
    };

    // Gets either 0 or 1 at random
    function getRandomIntInclusive(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    return draftFactory;
});
'use strict';

var playersFactory = angular.module('PlayersFactory', []);

playersFactory.factory('playersFactory', function () {
    var playersFactory = {};

    // Array of players - {id, name, team}
    playersFactory.players = [];

    // The id of the player that will be created next
    playersFactory.nextPlayerId = 0;

    // Teams that players can be assigned to
    playersFactory.playerTeams = [1, 2];

    // Acceptable lengths for the playerTeams array
    playersFactory.allowedNumberOfTeams = [2, 3, 4, 5, 6, 7, 8];

    // Pushes a player object to the players array
    playersFactory.addPlayer = function () {
        playersFactory.players.push({
            id: playersFactory.nextPlayerId,
            name: "",
            team: 1
        });

        playersFactory.nextPlayerId++;
    };

    // Deletes a player (by id) from the players array
    playersFactory.deletePlayer = function (id) {
        for (var i = 0; i < playersFactory.players.length; i++) {
            if (playersFactory.players[i].id === id) {
                playersFactory.players.splice(i, 1);
            }
        }
    };

    // Assigns players randomly to one of the numbered teams defined in playerTeams
    playersFactory.randomizeTeams = function (numTeams) {
        var playerIndexes = [];

        for (var i = 0; i < playersFactory.players.length; i++) {
            playerIndexes.push(i);
        }

        shuffle(playerIndexes);

        for (var i = 0; i < playerIndexes.length; i++) {
            playersFactory.players[playerIndexes[i]].team = i % numTeams + 1;
        }
    };

    // Sets playerTeams to be an array of length newNum
    playersFactory.changeAllowedNumberOfTeams = function (newNum) {
        playersFactory.playerTeams = [];

        for (var i = 0; i < newNum; i++) {
            playersFactory.playerTeams.push(i + 1);
        }
    };

    // Returns an array of teams that have at least one player
    playersFactory.getActiveTeams = function () {
        var activeTeams = [];

        for (var i = 0; i < playersFactory.players.length; i++) {
            if (!contains(activeTeams, playersFactory.players[i].team)) {
                activeTeams.push(playersFactory.players[i].team);
            }
        }
        return activeTeams;
    };

    // Returns a string containing the names of players on a specified team
    playersFactory.getTeamPlayerNames = function (team) {
        var players = "";

        for (var i = 0; i < playersFactory.players.length; i++) {
            if (playersFactory.players[i].team === team) {

                if (playersFactory.players[i].name === "") {
                    players += "[unnamed]";
                } else {
                    players += playersFactory.players[i].name;
                }
                players += ", ";
            }
        }
        return players.replace(/, $/, "");
    };

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
//# sourceMappingURL=bundle.js.map
