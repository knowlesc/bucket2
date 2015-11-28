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