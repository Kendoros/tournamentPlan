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
        $scope.playerList = [];
        $scope.maxPlayerId = 0;
        $scope.playerCount = 0;
        $scope.selectedTab = 0;


        $scope.data = {};


        $scope.configuration = {
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
                position: $scope.maxPlayerId,
                rank: 0,
                id: $scope.maxPlayerId
            };
            $scope.maxPlayerId = $scope.maxPlayerId + 1;
            $scope.playerList.push(player);
            $scope.playerCount = $scope.playerList.length;

        };

        $scope.removePlayer = function (index) {
            var newList = [];
            for (var x = 0; x < $scope.playerList.length; x++) {
                if (x !== index) {
                    newList.push($scope.playerList[x]);
                }
            }

            $scope.playerList = newList;
            $scope.playerCount = $scope.playerList.length;
        }

        $scope.usedGroups = [];
        $scope.changeTab = function (tabNumber) {
            $scope.selectedTab = 0;
            $scope.selectedTab = tabNumber;
            $scope.template = $scope.templates[$scope.selectedTab];
            $scope.usedGroups = [];

            for (var x = 0; x < $scope.playerList.length; x++) {
                var player = $scope.playerList[x];
                if (player !== undefined) {
                    if (player.groupAssignment) {
                        if (player.groupAssignment.length > 0) {

                            if ($filter('filter')($scope.usedGroups, {code: player.groupAssignment}).length === 0) {
                                $scope.usedGroups.push({code: player.groupAssignment});
                            }
                        }
                    }
                }
            }

            $scope.usedGroups = $filter('orderBy')($scope.usedGroups, "code")
            $scope.changeGroupTab(0);

        }
        $scope.groupCount = 0;
        $scope.groupSize = 4;
        $scope.groupGenerated = false;
        $scope.groups = [];

        $scope.displayGroupIndex = 0;
        $scope.selectedGroup = {};

        $scope.changeGroupTab = function (index) {
            if ($scope.usedGroups) {
                if ($scope.usedGroups[index]) {
                    $scope.selectedGroup.groupAssignment = $scope.usedGroups[index].code;
                }
            }
        }

        $scope.koPhase = '';
        $scope.changeKoPhase = function (index) {
            if (index === 0) {
                $scope.koPhase = 'winner';
            } else if (index === 1) {
                $scope.koPhase = 'loser';
            }
        }


        $scope.generateMatchups = function () {
            $scope.groups = [];
            for (var x = 0; x < $scope.groupNames.length; x++) {
                var groupName = $scope.groupNames[x];
                var group = {
                    groupAssignment: groupName,
                    matchups: []
                }
                var playerForGroup = [];
                for (var p = 0; p < $scope.playerList.length; p++) {
                    var player = $scope.playerList[p];
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
                $scope.groups.push(group);
            }
        }
        $scope.matchChange = function (group) {
            for (var x = 0; x < $scope.playerList.length; x++) {
                var player = $scope.playerList[x];
                if (group.groupAssignment === player.groupAssignment) {
                    var points = 0;
                    var winPoints = 0;
                    for (var y = 0; y < group.matchups.length; y++) {
                        if (group.matchups[y].playerA === player) {
                            points = points + group.matchups[y].pointsPlayerA;
                            if (group.matchups[y].winPlayerA === 'W') {
                                winPoints = winPoints + $scope.configuration.points.win;
                            } else if (group.matchups[y].winPlayerA === 'T') {
                                winPoints = winPoints + $scope.configuration.points.tie;
                            } else if (group.matchups[y].winPlayerA === 'L') {
                                winPoints = winPoints + $scope.configuration.points.loose;
                            }
                        } else if (group.matchups[y].playerB === player) {
                            points = points + group.matchups[y].pointsPlayerB;
                            if (group.matchups[y].winPlayerB === 'W') {
                                winPoints = winPoints + $scope.configuration.points.win;
                            } else if (group.matchups[y].winPlayerB === 'T') {
                                winPoints = winPoints + $scope.configuration.points.tie;
                            } else if (group.matchups[y].winPlayerB === 'L') {
                                winPoints = winPoints + $scope.configuration.points.loose;
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
                $scope.winnerBracket.half[0].playerA = winner;
                $scope.loserBracket.fiveEight[0].playerA = loser;
            } else if ($index === 1) {
                $scope.winnerBracket.half[1].playerA = winner;
                $scope.loserBracket.fiveEight[1].playerA = loser;
            } else if ($index === 2) {
                $scope.winnerBracket.half[0].playerB = winner;
                $scope.loserBracket.fiveEight[0].playerB = loser;
            } else if ($index === 3) {
                $scope.winnerBracket.half[1].playerB = winner;
                $scope.loserBracket.fiveEight[1].playerB = loser;
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
                $scope.loserBracket.fiveSix[0].playerA = winner;
                $scope.loserBracket.sevenEight[0].playerA = loser;
            } else if ($index === 1) {
                $scope.loserBracket.fiveSix[0].playerB = winner;
                $scope.loserBracket.sevenEight[0].playerB = loser;
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
                $scope.loserBracket.nineTen[0].playerA = winner;
                $scope.loserBracket.elevenTwelve[0].playerA = loser;
            } else if ($index === 1) {
                $scope.loserBracket.nineTen[0].playerB = winner;
                $scope.loserBracket.elevenTwelve[0].playerB = loser;
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
                $scope.winnerBracket.final[0].playerA = winner;
                $scope.winnerBracket.third[0].playerA = loser;
            } else if ($index === 1) {
                $scope.winnerBracket.final[0].playerB = winner;
                $scope.winnerBracket.third[0].playerB = loser;
            }
        }

        $scope.tournamentWinner = undefined;
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

            $scope.tournamentWinner = winner;
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
        $scope.koPhaseGenerated = false;
        $scope.winnerBracket = {};
        $scope.loserBracket = {};
        $scope.generateKoPhase = function () {

            // generate winner bracket:
            $scope.winnerBracket = {};
            $scope.winnerBracket.quater = [];
            for (var q = 0; q < 4; q++) {
                $scope.winnerBracket.quater.push($scope.createMatchupForKo(q));
            }
            $scope.winnerBracket.half = [];
            for (var h = 0; h < 2; h++) {
                $scope.winnerBracket.half.push($scope.createMatchupForKo(h));
            }
            $scope.winnerBracket.final = [];
            for (var f = 0; f < 1; f++) {
                $scope.winnerBracket.final.push($scope.createMatchupForKo(f));
            }
            $scope.winnerBracket.third = [];
            for (var t = 0; t < 1; t++) {
                $scope.winnerBracket.third.push($scope.createMatchupForKo(t));
            }

            //loser Bracket
            $scope.loserBracket = {};
            $scope.loserBracket.fiveEight = [];
            for (var x1 = 0; x1 < 2; x1++) {
                $scope.loserBracket.fiveEight.push($scope.createMatchupForKo(x1));
            }
            $scope.loserBracket.nineTwelve = [];
            for (var x2 = 0; x2 < 2; x2++) {
                $scope.loserBracket.nineTwelve.push($scope.createMatchupForKo(x2));
            }
            $scope.loserBracket.sevenEight = [];
            for (var x3 = 0; x3 < 1; x3++) {
                $scope.loserBracket.sevenEight.push($scope.createMatchupForKo(x3));
            }
            $scope.loserBracket.elevenTwelve = [];
            for (var x4 = 0; x4 < 1; x4++) {
                $scope.loserBracket.elevenTwelve.push($scope.createMatchupForKo(x4));
            }
            $scope.loserBracket.fiveSix = [];
            for (var x5 = 0; x5 < 1; x5++) {
                $scope.loserBracket.fiveSix.push($scope.createMatchupForKo(x5));
            }
            $scope.loserBracket.nineTen = [];
            for (var x6 = 0; x6 < 1; x6++) {
                $scope.loserBracket.nineTen.push($scope.createMatchupForKo(x6));
            }


            $scope.koPhaseGenerated = true;
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


        $scope.groupNames = ["A", "B", "C", "D", "E", "F", "G",
            "H", "I", "J", "K", "L", "M", "N", "O", "P",
            "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"]

        $scope.groupsForDropDown = [];



        $scope.exportAll = function(){

        }


        // run on initialization
        var generateGroupForDropDown = function () {
            for (var x = 0; x < $scope.groupNames.length / 2; x++) {
                $scope.groupsForDropDown.push({
                    name: "Gruppe " + $scope.groupNames[x],
                    code: $scope.groupNames[x]
                });
            }
        }();


    }]);

})(angular);