angular.module('fx')
  .directive('fxTabHead', [() => {
    return {
      restrict: 'E',
      replace: true,
      templateUrl: 'app/fx/components/tab-head/tab-head.html',
    }
  }]);
