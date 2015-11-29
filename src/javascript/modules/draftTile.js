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