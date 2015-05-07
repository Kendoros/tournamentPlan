(function (angular) {
    'use strict';

// Declare app level module which depends on views, and components
    var tournamentPlan = angular.module('tournamentPlan', [
            'ngRoute'
        ]).
        config(['$routeProvider', function ($routeProvider) {
            $routeProvider.otherwise({redirectTo: '/view1'});
        }]);

    tournamentPlan.controller('tournamentPlanController', ['$scope', '$log', '$filter', 'GroupPhaseService', 'PlayerService', 'PersistenceService', 'KOPhaseService', 'MatchupService',
        function ($scope, $log, $filter, GroupPhaseService, PlayerService, PersistenceService, KOPhaseService, MatchupService) {
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
            };

            $scope.hasNoWinner = function () {
                if ($scope.data.tournamentWinner) {
                    return false;
                } else {
                    return true;
                }

            };

            $scope.addPlayer = function () {
                $scope.data = PlayerService.addPlayer($scope.data);
            };

            $scope.removePlayer = function (index) {
                $scope.data = PlayerService.removePlayer($scope.data, index);
            };

            $scope.data.usedGroups = [];
            $scope.changeTab = function (tabNumber) {

                var allListButtons = $('.listButton');
                allListButtons.removeClass('selectedMenuItem');
                for (var x = 0; x < allListButtons.length; x++) {
                    var listButton = allListButtons[x];
                    if (listButton.attributes['ng-click'].value === 'changeTab(' + tabNumber + ')') {
                        listButton.classList.add('selectedMenuItem');
                    }
                }

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

                $scope.data.usedGroups = $filter('orderBy')($scope.data.usedGroups, "code");
                $scope.changeGroupTab(0);

            };
            $scope.data.groupCount = 0;
            $scope.data.groupSize = 4;
            $scope.data.groupGenerated = false;
            $scope.data.groups = [];

            $scope.data.displayGroupIndex = 0;
            $scope.data.selectedGroup = {};

            $scope.initGroupPhase = function () {
                setTimeout(function () {
                    $scope.changeGroupTab(0);
                }, 100);
            };

            $scope.changeGroupTab = function (index) {
                $scope.data = GroupPhaseService.setSelectedGroup($scope.data, index);
            };

            $scope.initKoPhase = function () {
                setTimeout(function () {
                    $scope.changeKoPhase(0);
                }, 100);
            };

            $scope.data.koPhase = '';
            $scope.changeKoPhase = function (index) {
                var allListButtons = $('.koList');
                allListButtons.removeClass('selectedKoPhase');
                for (var x = 0; x < allListButtons.length; x++) {
                    var listButton = allListButtons[x];
                    if (listButton.attributes['ng-click'].value === 'changeKoPhase(' + index + ')') {
                        listButton.classList.add('selectedKoPhase');
                    }
                }

                if (index === 0) {
                    $scope.data.koPhase = 'winner';
                } else if (index === 1) {
                    $scope.data.koPhase = 'loser';
                }
            };


            $scope.generateMatchups = function () {
                $scope.data = GroupPhaseService.generateGroupPhase($scope.data);
            };
            $scope.matchChange = function (group) {
                for (var x = 0; x < $scope.data.playerList.length; x++) {
                    var player = $scope.data.playerList[x];
                    if (group.groupAssignment === player.groupAssignment) {
                        var points = 0;
                        var winPoints = 0;
                        for (var y = 0; y < group.matchups.length; y++) {
                            if (group.matchups[y].playerA.id === player.id) {
                                points = points + group.matchups[y].pointsPlayerA;
                                if (group.matchups[y].winPlayerA === 'W') {
                                    winPoints = winPoints + $scope.data.configuration.points.win;
                                } else if (group.matchups[y].winPlayerA === 'T') {
                                    winPoints = winPoints + $scope.data.configuration.points.tie;
                                } else if (group.matchups[y].winPlayerA === 'L') {
                                    winPoints = winPoints + $scope.data.configuration.points.loose;
                                }
                            } else if (group.matchups[y].playerB.id === player.id) {
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
            };

            $scope.clickWinButtonGroupPhase = function (match, player, group) {
                MatchupService.getMatchResult(match, player);
                $scope.matchChange(group);
            };

            $scope.clickTieButtonGroupPhase = function ($event, match, group) {
                MatchupService.getMatchResult(match);
                $scope.matchChange(group);
            };

            $scope.clickWinButtonKoPhaseQuater = function (quater, winner, loser, $index) {
                MatchupService.getMatchResult(quater, winner);
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
            };

            $scope.clickWinButtonKoPhaseFiveEight = function (fiveEight, winner, loser, $index) {
                MatchupService.getMatchResult(fiveEight, winner);
                if ($index === 0) {
                    $scope.data.loserBracket.fiveSix[0].playerA = winner;
                    $scope.data.loserBracket.sevenEight[0].playerA = loser;
                } else if ($index === 1) {
                    $scope.data.loserBracket.fiveSix[0].playerB = winner;
                    $scope.data.loserBracket.sevenEight[0].playerB = loser;
                }
            };

            $scope.clickWinButtonKoPhaseNineTwelve = function (nineTwelve, winner, loser, $index) {
                MatchupService.getMatchResult(nineTwelve, winner);
                if ($index === 0) {
                    $scope.data.loserBracket.nineTen[0].playerA = winner;
                    $scope.data.loserBracket.elevenTwelve[0].playerA = loser;
                } else if ($index === 1) {
                    $scope.data.loserBracket.nineTen[0].playerB = winner;
                    $scope.data.loserBracket.elevenTwelve[0].playerB = loser;
                }
            };

            $scope.clickWinButtonKoPhaseToSetWinners = function (match, winner, rank) {
                winner.rank = rank;
                if (match.playerA === winner) {
                    match.playerB.rank = rank + 1;
                } else if (match.playerB === winner) {
                    match.playerA.rank = rank + 1;
                }
                MatchupService.getMatchResult(match, winner);
            };


            $scope.clickWinButtonKoPhaseHalf = function (half, winner, loser, $index) {
                MatchupService.getMatchResult(half, winner);
                if ($index === 0) {
                    $scope.data.winnerBracket.final[0].playerA = winner;
                    $scope.data.winnerBracket.third[0].playerA = loser;
                } else if ($index === 1) {
                    $scope.data.winnerBracket.final[0].playerB = winner;
                    $scope.data.winnerBracket.third[0].playerB = loser;
                }
            };

            $scope.data.tournamentWinner = undefined;
            $scope.clickWinButtonKoPhaseFinals = function (finals, winner) {
                winner.rank = 1;
                if (finals.playerA === winner) {
                    finals.playerB.rank = 2;
                } else if (finals.playerB === winner) {
                    finals.playerA.rank = 2;
                }
                MatchupService.getMatchResult(finals, winner);
                $scope.data.tournamentWinner = winner;
            };
            $scope.clickWinButtonKoPhaseThird = function (third, winner) {
                winner.rank = 3;
                if (third.playerA === winner) {
                    third.playerB.rank = 4;
                } else if (third.playerB === winner) {
                    third.playerA.rank = 4;
                }
                MatchupService.getMatchResult(third, winner);
            };

            $scope.isGroupSelected = function (group) {
                if (group.selected == true) {
                    return 'groupselected';
                }
                return '';
            };

            $scope.getClassForGroup = function (winCode) {
                if (winCode === 'W') {
                    return 'player-won';
                } else if (winCode === 'T') {
                    return 'player-tie';
                } else if (winCode === 'L') {
                    return 'player-lost';
                }
                return '';
            };
            $scope.data.koPhaseGenerated = false;
            $scope.generateKoPhase = function () {
                $scope.data = KOPhaseService.generateKoPhase($scope.data);
            };


            $scope.data.groupNames = ["A", "B", "C", "D", "E", "F", "G",
                "H", "I", "J", "K", "L", "M", "N", "O", "P",
                "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];

            $scope.data.groupsForDropDown = [];

            $scope.textForExport = "";
            $scope.textForImport = "";

            $scope.persistence = {
                export: {
                    exportAll: function () {
                        $scope.persistence.export.text = PersistenceService.exportData($scope.data)
                    },
                    text: ''
                },
                import: {
                    importAll: function () {
                        $scope.data = PersistenceService.importData($scope.data, $scope.persistence.import.text);
                    },
                    text: ''
                }

            }


            function readSingleFile(evt) {
                //Retrieve the first (and only!) File from the FileList object
                var f = evt.target.files[0];

                if (f) {
                    var r = new FileReader();
                    r.onload = function(e) {
                        $scope.persistence.import.text = e.target.result;
                    };
                    r.readAsText(f);
                } else {
                    alert("Failed to load file");
                }
            }

            $scope.initConfiguration = function () {
                document.getElementById('fileinput').addEventListener('change', readSingleFile, false);
            };


            // run on initialization
            var generateGroupForDropDown = function () {
                for (var x = 0; x < $scope.data.groupNames.length / 2; x++) {
                    $scope.data.groupsForDropDown.push({
                        name: "Gruppe " + $scope.data.groupNames[x],
                        code: $scope.data.groupNames[x]
                    });
                }
            }();

            $scope.changeTab(0);
        }
    ])
    ;


})(angular);