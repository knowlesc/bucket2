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
