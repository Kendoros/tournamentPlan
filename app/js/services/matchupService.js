var myModule = angular.module('tournamentPlan');
myModule.factory('MatchupService', function () {
    // factory function body that constructs shinyNewServiceInstance
    var __getMatchResult = function (match, winner) {
        if (winner === undefined) {
            match.winPlayerA = 'T';
            match.winPlayerB = 'T';
        } else {
            if (match.playerA === winner) {
                match.winPlayerA = 'W';
                match.winPlayerB = 'L';
            } else if (match.playerB === winner) {
                match.winPlayerA = 'L';
                match.winPlayerB = 'W';
            }
        }
        return match;
    };


    return {
        getMatchResult: __getMatchResult
    };
});