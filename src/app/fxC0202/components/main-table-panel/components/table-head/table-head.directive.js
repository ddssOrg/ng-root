angular.module('fxC0202')
  .directive('fxC0202TableHead', [() => {
    return {
      restrict: 'E',
      replace: true,
      templateUrl: 'app/fxC0202/components/main-table-panel/components/table-head/table-head.html',
    }
  }]);
