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