angular.module('fx')
  .directive('fxSubTable', [() => {
    return {
      restrict: 'E',
      replace: true,
      templateUrl: 'app/fx/components/sub-table/sub-table.html',
    }
  }]);
