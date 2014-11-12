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
                url: 'views/groupPhase.html'}
        ];
        $scope.template = $scope.templates[0];
        $scope.playerList = [];
        $scope.maxPlayerId = 0;
        $scope.playerCount = 0;
        $scope.selectedTab = 0;


        $scope.data = {};


        $scope.addPlayer = function () {
            var player = {
                name: "",
                points: 0,
                position: $scope.maxPlayerId,
                code: "",
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
            $scope.selectedGroup.groupAssignment = $scope.usedGroups[index].code;

        }
        $scope.generateMatchups = function (index) {
            for (var runner = 0; runner < $scope.groups[index].entries.length - 1; runner++) {
                var matchup = {
                    playerA: $scope.groups[index].entries[runner].playerId,
                    pointsA: 0,
                    playerB: $scope.groups[index].entries[runner + 1].playerId,
                    pointsB: 0
                }
                $scope.groups[index].matchups.push(matchup);
            }
        }

        // TODO!!!
        $scope.$watch('groups', function (oldValue, newValue) {
            if (oldValue !== newValue && oldValue.length === newValue.length) {
                for (var groupSelector = 0; groupSelector < newValue.length; groupSelector++) {
                    if (oldValue[groupSelector] !== newValue[groupSelector]) {
                        if (oldValue[groupSelector].entries !== newValue[groupSelector].entries) {
                            for (var runner = 0; runner < newValue[groupSelector].entries.length - 1; runner++) {
                                newValue[groupSelector].matchups[runner].playerA = newValue[groupSelector].entries[runner].playerId;
                                newValue[groupSelector].matchups[runner].playerb = newValue[groupSelector].entries[runner + 1].playerId;
                            }
                        }
                    }
                }
            }
        }, true);


        $scope.groupNames = ["A", "B", "C", "D", "E", "F", "G",
            "H", "I", "J", "K", "L", "M", "N", "O", "P",
            "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"]

        $scope.groupsForDropDown = [];

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