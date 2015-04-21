var myModule = angular.module('tournamentPlan');
myModule.factory('PersistenceService', function () {
    // factory function body that constructs shinyNewServiceInstance
    var __exportData = function (data) {
        return JSON.stringify(data);
    };
    var __importData = function (data, importData) {
        data = JSON.parse(importData);
        return data;
    };


    return {
        importData: __importData,
        exportData: __exportData
    };
});