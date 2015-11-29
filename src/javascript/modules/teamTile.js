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