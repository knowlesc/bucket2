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
