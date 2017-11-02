angular.module('fxC0202')
  .directive('fxC0202MainTablePanel', [() => {
    return {
      restrict: 'E',
      replace: true,
      templateUrl: 'app/fxC0202/components/main-table-panel/main-table-panel.html',
    }
  }]);
