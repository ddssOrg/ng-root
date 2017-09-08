angular.module('fx')
  .directive('fxMainTablePanel', [() => {
    return {
      restrict: 'E',
      replace: true,
      templateUrl: 'app/fx/components/main-table-panel/main-table-panel.html',
    }
  }]);
