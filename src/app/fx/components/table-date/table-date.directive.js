angular.module('fx')
  .directive('fxTableDate', [() => {
    return {
      restrict: 'E',
      replace: true,
      templateUrl: 'app/fx/components/table-date/table-date.html',
    }
  }]);
