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