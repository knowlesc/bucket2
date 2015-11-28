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