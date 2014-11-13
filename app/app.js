(function (angular) {
    'use strict';

// Declare app level module which depends on views, and components
    var tournamentPlan = angular.module('myApp', [
            'ngRoute',
            'myApp.version'
        ]).
        config(['$routeProvider', function ($routeProvider) {
            $routeProvider.otherwise({redirectTo: '/view1'});
        }]);

    tournamentPlan.controller('tournamentPlanController', ['$scope', '$log', '$filter', function ($scope, $log, $filter) {
        $scope.templates = [
            {
                name: 'playerList.html',
                url: 'views/playerList.html'},
            {
                name: 'groupPhase.html',
                url: 'views/groupPhase.html'},
            {
                name: 'koPhase.html',
                url: 'views/koPhase.html'},
            {
                name: 'results.html',
                url: 'views/results.html'},
            {
                name: 'configuration.html',
                url: 'views/configuration.html'
            }
        ];
        $scope.template = $scope.templates[0];
        $scope.data = {};
        $scope.data.playerList = [];
        $scope.data.maxPlayerId = 0;
        $scope.data.playerCount = 0;
        $scope.data.selectedTab = 0;


        $scope.data.configuration = {
            points: {
                win: 3,
                tie: 2,
                loose: 0
            }
        }

        $scope.addPlayer = function () {
            var player = {
                name: "",
                points: 0,
                winPoints: 0,
                position: $scope.data.maxPlayerId,
                rank: 0,
                id: $scope.data.maxPlayerId
            };
            $scope.data.maxPlayerId = $scope.data.maxPlayerId + 1;
            $scope.data.playerList.push(player);
            $scope.data.playerCount = $scope.data.playerList.length;

        };

        $scope.removePlayer = function (index) {
            var newList = [];
            for (var x = 0; x < $scope.data.playerList.length; x++) {
                if (x !== index) {
                    newList.push($scope.data.playerList[x]);
                }
            }

            $scope.data.playerList = newList;
            $scope.data.playerCount = $scope.data.playerList.length;
        }

        $scope.data.usedGroups = [];
        $scope.changeTab = function (tabNumber) {
            $scope.data.selectedTab = 0;
            $scope.data.selectedTab = tabNumber;
            $scope.template = $scope.templates[$scope.data.selectedTab];
            $scope.data.usedGroups = [];

            for (var x = 0; x < $scope.data.playerList.length; x++) {
                var player = $scope.data.playerList[x];
                if (player !== undefined) {
                    if (player.groupAssignment) {
                        if (player.groupAssignment.length > 0) {

                            if ($filter('filter')($scope.data.usedGroups, {code: player.groupAssignment}).length === 0) {
                                $scope.data.usedGroups.push({code: player.groupAssignment});
                            }
                        }
                    }
                }
            }

            $scope.data.usedGroups = $filter('orderBy')($scope.data.usedGroups, "code")
            $scope.changeGroupTab(0);

        }
        $scope.data.groupCount = 0;
        $scope.data.groupSize = 4;
        $scope.data.groupGenerated = false;
        $scope.data.groups = [];

        $scope.data.displayGroupIndex = 0;
        $scope.data.selectedGroup = {};

        $scope.changeGroupTab = function (index) {
            if ($scope.data.usedGroups) {
                if ($scope.data.usedGroups[index]) {
                    $scope.data.selectedGroup.groupAssignment = $scope.data.usedGroups[index].code;
                }
            }
        }

        $scope.data.koPhase = '';
        $scope.changeKoPhase = function (index) {
            if (index === 0) {
                $scope.data.koPhase = 'winner';
            } else if (index === 1) {
                $scope.data.koPhase = 'loser';
            }
        }


        $scope.generateMatchups = function () {
            $scope.data.groups = [];
            for (var x = 0; x < $scope.data.groupNames.length; x++) {
                var groupName = $scope.data.groupNames[x];
                var group = {
                    groupAssignment: groupName,
                    matchups: []
                }
                var playerForGroup = [];
                for (var p = 0; p < $scope.data.playerList.length; p++) {
                    var player = $scope.data.playerList[p];
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
                        }
                        group.matchups.push(matchup);
                    }

                }
                $scope.data.groups.push(group);
            }
        }
        $scope.matchChange = function (group) {
            for (var x = 0; x < $scope.data.playerList.length; x++) {
                var player = $scope.data.playerList[x];
                if (group.groupAssignment === player.groupAssignment) {
                    var points = 0;
                    var winPoints = 0;
                    for (var y = 0; y < group.matchups.length; y++) {
                        if (group.matchups[y].playerA === player) {
                            points = points + group.matchups[y].pointsPlayerA;
                            if (group.matchups[y].winPlayerA === 'W') {
                                winPoints = winPoints + $scope.data.configuration.points.win;
                            } else if (group.matchups[y].winPlayerA === 'T') {
                                winPoints = winPoints + $scope.data.configuration.points.tie;
                            } else if (group.matchups[y].winPlayerA === 'L') {
                                winPoints = winPoints + $scope.data.configuration.points.loose;
                            }
                        } else if (group.matchups[y].playerB === player) {
                            points = points + group.matchups[y].pointsPlayerB;
                            if (group.matchups[y].winPlayerB === 'W') {
                                winPoints = winPoints + $scope.data.configuration.points.win;
                            } else if (group.matchups[y].winPlayerB === 'T') {
                                winPoints = winPoints + $scope.data.configuration.points.tie;
                            } else if (group.matchups[y].winPlayerB === 'L') {
                                winPoints = winPoints + $scope.data.configuration.points.loose;
                            }
                        }
                    }
                    player.points = points;
                    player.winPoints = winPoints;
                }
            }
        }

        $scope.clickWinButtonGroupPhase = function (match, player, group) {
            if (match.playerA === player) {
                match.winPlayerA = 'W';
                match.winPlayerB = 'L';
            } else if (match.playerB === player) {
                match.winPlayerA = 'L';
                match.winPlayerB = 'W';
            }
            $scope.matchChange(group);
        }

        $scope.clickTieButtonGroupPhase = function ($event, match, group) {
            match.winPlayerA = 'T';
            match.winPlayerB = 'T';
            $scope.matchChange(group);
        }

        $scope.clickWinButtonKoPhaseQuater = function (quater, winner, loser, $index) {
            if (quater.playerA === winner) {
                quater.winPlayerA = 'W';
                quater.winPlayerB = 'L';
            } else if (quater.playerB === winner) {
                quater.winPlayerA = 'L';
                quater.winPlayerB = 'W';
            }
            if ($index === 0) {
                $scope.data.winnerBracket.half[0].playerA = winner;
                $scope.data.loserBracket.fiveEight[0].playerA = loser;
            } else if ($index === 1) {
                $scope.data.winnerBracket.half[1].playerA = winner;
                $scope.data.loserBracket.fiveEight[1].playerA = loser;
            } else if ($index === 2) {
                $scope.data.winnerBracket.half[0].playerB = winner;
                $scope.data.loserBracket.fiveEight[0].playerB = loser;
            } else if ($index === 3) {
                $scope.data.winnerBracket.half[1].playerB = winner;
                $scope.data.loserBracket.fiveEight[1].playerB = loser;
            }
        }

        $scope.clickWinButtonKoPhaseFiveEight = function (fiveEight, winner, loser, $index) {
            if (fiveEight.playerA === winner) {
                fiveEight.winPlayerA = 'W';
                fiveEight.winPlayerB = 'L';
            } else if (fiveEight.playerB === winner) {
                fiveEight.winPlayerA = 'L';
                fiveEight.winPlayerB = 'W';
            }
            if ($index === 0) {
                $scope.data.loserBracket.fiveSix[0].playerA = winner;
                $scope.data.loserBracket.sevenEight[0].playerA = loser;
            } else if ($index === 1) {
                $scope.data.loserBracket.fiveSix[0].playerB = winner;
                $scope.data.loserBracket.sevenEight[0].playerB = loser;
            }
        }

        $scope.clickWinButtonKoPhaseNineTwelve = function (nineTwelve, winner, loser, $index) {
            if (nineTwelve.playerA === winner) {
                nineTwelve.winPlayerA = 'W';
                nineTwelve.winPlayerB = 'L';
            } else if (nineTwelve.playerB === winner) {
                nineTwelve.winPlayerA = 'L';
                nineTwelve.winPlayerB = 'W';
            }
            if ($index === 0) {
                $scope.data.loserBracket.nineTen[0].playerA = winner;
                $scope.data.loserBracket.elevenTwelve[0].playerA = loser;
            } else if ($index === 1) {
                $scope.data.loserBracket.nineTen[0].playerB = winner;
                $scope.data.loserBracket.elevenTwelve[0].playerB = loser;
            }
        }

        $scope.clickWinButtonKoPhaseToSetWinners = function (match, winner, rank) {
            winner.rank = rank;
            if (match.playerA === winner) {
                match.winPlayerA = 'W';
                match.winPlayerB = 'L';
                match.playerB.rank = rank + 1;
            } else if (match.playerB === winner) {
                match.winPlayerA = 'L';
                match.winPlayerB = 'W';
                match.playerA.rank = rank + 1;
            }
        }


        $scope.clickWinButtonKoPhaseHalf = function (half, winner, loser, $index) {
            if (half.playerA === winner) {
                half.winPlayerA = 'W';
                half.winPlayerB = 'L';
            } else if (half.playerB === winner) {
                half.winPlayerA = 'L';
                half.winPlayerB = 'W';
            }

            if ($index === 0) {
                $scope.data.winnerBracket.final[0].playerA = winner;
                $scope.data.winnerBracket.third[0].playerA = loser;
            } else if ($index === 1) {
                $scope.data.winnerBracket.final[0].playerB = winner;
                $scope.data.winnerBracket.third[0].playerB = loser;
            }
        }

        $scope.data.tournamentWinner = undefined;
        $scope.clickWinButtonKoPhaseFinals = function (finals, winner) {
            winner.rank = 1;
            if (finals.playerA === winner) {
                finals.winPlayerA = 'W';
                finals.winPlayerB = 'L';
                finals.playerB.rank = 2;
            } else if (finals.playerB === winner) {
                finals.winPlayerA = 'L';
                finals.winPlayerB = 'W';
                finals.playerA.rank = 2;
            }

            $scope.data.tournamentWinner = winner;
        }
        $scope.clickWinButtonKoPhaseThird = function (third, winner) {
            winner.rank = 3;
            if (third.playerA === winner) {
                third.winPlayerA = 'W';
                third.winPlayerB = 'L';
                third.playerB.rank = 4;
            } else if (third.playerB === winner) {
                third.winPlayerA = 'L';
                third.winPlayerB = 'W';
                third.playerA.rank = 4;
            }
        }

        $scope.getClassForGroup = function (winCode) {
            if (winCode === 'W') {
                return 'player-won';
            } else if (winCode === 'T') {
                return 'player-tie';
            } else if (winCode === 'L') {
                return 'player-lost';
            }
            return '';
        }
        $scope.data.koPhaseGenerated = false;
        $scope.data.winnerBracket = {};
        $scope.data.loserBracket = {};
        $scope.generateKoPhase = function () {

            // generate winner bracket:
            $scope.data.winnerBracket = {};
            $scope.data.winnerBracket.quater = [];
            for (var q = 0; q < 4; q++) {
                $scope.data.winnerBracket.quater.push($scope.createMatchupForKo(q));
            }
            $scope.data.winnerBracket.half = [];
            for (var h = 0; h < 2; h++) {
                $scope.data.winnerBracket.half.push($scope.createMatchupForKo(h));
            }
            $scope.data.winnerBracket.final = [];
            for (var f = 0; f < 1; f++) {
                $scope.data.winnerBracket.final.push($scope.createMatchupForKo(f));
            }
            $scope.data.winnerBracket.third = [];
            for (var t = 0; t < 1; t++) {
                $scope.data.winnerBracket.third.push($scope.createMatchupForKo(t));
            }

            //loser Bracket
            $scope.data.loserBracket = {};
            $scope.data.loserBracket.fiveEight = [];
            for (var x1 = 0; x1 < 2; x1++) {
                $scope.data.loserBracket.fiveEight.push($scope.createMatchupForKo(x1));
            }
            $scope.data.loserBracket.nineTwelve = [];
            for (var x2 = 0; x2 < 2; x2++) {
                $scope.data.loserBracket.nineTwelve.push($scope.createMatchupForKo(x2));
            }
            $scope.data.loserBracket.sevenEight = [];
            for (var x3 = 0; x3 < 1; x3++) {
                $scope.data.loserBracket.sevenEight.push($scope.createMatchupForKo(x3));
            }
            $scope.data.loserBracket.elevenTwelve = [];
            for (var x4 = 0; x4 < 1; x4++) {
                $scope.data.loserBracket.elevenTwelve.push($scope.createMatchupForKo(x4));
            }
            $scope.data.loserBracket.fiveSix = [];
            for (var x5 = 0; x5 < 1; x5++) {
                $scope.data.loserBracket.fiveSix.push($scope.createMatchupForKo(x5));
            }
            $scope.data.loserBracket.nineTen = [];
            for (var x6 = 0; x6 < 1; x6++) {
                $scope.data.loserBracket.nineTen.push($scope.createMatchupForKo(x6));
            }


            $scope.data.koPhaseGenerated = true;
        }

        $scope.createMatchupForKo = function (number) {
            return {
                koNumber: number,
                playerA: {},
                pointsPlayerA: 0,
                winPlayerA: 'NF',
                playerB: {},
                pointsPlayerB: 0,
                winPlayerB: 'NF'
            };
            ;
        }


        $scope.data.groupNames = ["A", "B", "C", "D", "E", "F", "G",
            "H", "I", "J", "K", "L", "M", "N", "O", "P",
            "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"]

        $scope.data.groupsForDropDown = [];

        $scope.textForExport = "";
        $scope.textForImport = "";
        $scope.exportAll = function () {
            $scope.textForExport = JSON.stringify($scope.data);
        }
        $scope.importAll = function ($event) {
            $scope.data = JSON.parse($event.currentTarget.nextElementSibling.value);
        }


        // run on initialization
        var generateGroupForDropDown = function () {
            for (var x = 0; x < $scope.data.groupNames.length / 2; x++) {
                $scope.data.groupsForDropDown.push({
                    name: "Gruppe " + $scope.data.groupNames[x],
                    code: $scope.data.groupNames[x]
                });
            }
        }();


    }]);

})(angular);