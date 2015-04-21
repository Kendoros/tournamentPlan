var myModule = angular.module('tournamentPlan');
myModule.factory('KOPhaseService', function () {
    // factory function body that constructs shinyNewServiceInstance
    var __generateKoPhase = function (data) {
        // generate winner bracket:
        data.winnerBracket = {};

        data.winnerBracket.quater = createMatchupsForKo(4);
        data.winnerBracket.half = createMatchupsForKo(2);
        data.winnerBracket.final = createMatchupsForKo(1);
        data.winnerBracket.third = createMatchupsForKo(1);

        //loser Bracket
        data.loserBracket = {};
        data.loserBracket.fiveEight = createMatchupsForKo(2);
        data.loserBracket.nineTwelve = createMatchupsForKo(2);
        data.loserBracket.sevenEight = createMatchupsForKo(1);
        data.loserBracket.elevenTwelve = createMatchupsForKo(1);
        data.loserBracket.fiveSix = createMatchupsForKo(1);
        data.loserBracket.nineTen = createMatchupsForKo(1);

        data.koPhaseGenerated = true;
        return data;
    };


    var createMatchupsForKo = function (amount) {
        var matchups = [];
        for (var x = 0; x < amount; x++) {
            matchups.push({
                koNumber: x,
                playerA: {},
                pointsPlayerA: 0,
                winPlayerA: 'NF',
                playerB: {},
                pointsPlayerB: 0,
                winPlayerB: 'NF'
            })
        }
        return matchups;

    };


    return {
        generateKoPhase: __generateKoPhase
    };
});