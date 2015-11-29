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
