var myModule = angular.module('tournamentPlan');
myModule.factory('GroupPhaseService', function () {
    // factory function body that constructs shinyNewServiceInstance
    var __setSelectedGroup = function (data, index) {
        if (data.usedGroups && data.usedGroups[index]) {
            data.selectedGroup.groupAssignment = data.usedGroups[index].code;
        }
        return data;
    };

    var __generateGroupPhase = function (data) {
        data.groups = [];
        for (var x = 0; x < data.groupNames.length; x++) {
            var groupName = data.groupNames[x];
            var group = {
                groupAssignment: groupName,
                matchups: []
            };
            var playerForGroup = [];
            for (var p = 0; p < data.playerList.length; p++) {
                var player = data.playerList[p];
                player.winPoints = 0;
                if (player !== undefined) {
                    if (player.groupAssignment) {
                        if (player.groupAssignment.length > 0) {
                            if (player.groupAssignment === groupName) {
                                playerForGroup.push(player);
                            }
                        }
                    }
                }
            }

            /* WIN keys:
             NF - not finished
             W - win
             T - tie
             L - lose
             */
            for (var n = 0; n < playerForGroup.length - 1; n++) {
                for (var m = n + 1; m < playerForGroup.length; m++) {
                    var matchup = {
                        playerA: playerForGroup[n],
                        pointsPlayerA: 0,
                        winPlayerA: 'NF',
                        playerB: playerForGroup[m],
                        pointsPlayerB: 0,
                        winPlayerB: 'NF'
                    };
                    group.matchups.push(matchup);
                }

            }
            data.groups.push(group);
        }
        return data;
    };


    return {
        setSelectedGroup: __setSelectedGroup,
        generateGroupPhase: __generateGroupPhase
    };
});