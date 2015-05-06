var myModule = angular.module('tournamentPlan');
myModule.factory('PlayerService', function () {
    // factory function body that constructs shinyNewServiceInstance
    var __addPlayer = function (data) {
        var player = {
            name: "",
            points: 0,
            winPoints: 0,
            position: data.maxPlayerId,
            rank: "n/a",
            id: data.maxPlayerId
        };
        data.maxPlayerId = data.maxPlayerId + 1;
        data.playerList.push(player);
        data.playerCount = data.playerList.length;
        return data;
    };

    var __removePlayer = function (data, index) {
        _.remove(data.playerList, data.playerList[index]);
        data.playerCount = data.playerList.length;
        return data;
    };


    return {
        addPlayer: __addPlayer,
        removePlayer: __removePlayer
    };
});