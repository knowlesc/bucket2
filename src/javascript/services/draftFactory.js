var draftFactory = angular.module('DraftFactory', []);

draftFactory.factory('draftFactory', function() {
    var draftFactory = {}

    // Returns a random order that teams can draft in
    draftFactory.getDraftOrder = function(activeTeamsOriginal) {
        var draftOrder = [];
        var activeTeams = activeTeamsOriginal.slice();
        
        while (activeTeams.length > 0) {
            var rand = getRandomIntInclusive(0, activeTeams.length - 1);
            draftOrder.push(activeTeams[rand]);
            activeTeams.splice(rand, 1);
        }
        return draftOrder;
    }

    // Performs a round of NHL team drafting based on a given draft order
    draftFactory.autoDraftRound = function(draftOrder, activeTeamsOriginal, nhlTeams) {
        var activeTeams = activeTeamsOriginal.slice();
        var draftRound = [];

        if (nhlTeams.length < activeTeams.length) {
            return;
        }
    
        for (var i = 0; i < activeTeams.length; i++) {
            var rand = getRandomIntInclusive(0, nhlTeams.length - 1);

            draftRound.push({
                 team : draftOrder[i], 
                 nhlTeam : nhlTeams[rand]
             });

            nhlTeams.splice(rand, 1);
        }
        return draftRound;
    }

    // Gets either 0 or 1 at random
    function getRandomIntInclusive(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    return draftFactory;
})