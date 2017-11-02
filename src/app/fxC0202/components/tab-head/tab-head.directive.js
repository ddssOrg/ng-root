angular.module('fxC0202')
  .directive('fxC0202TabHead', [() => {
    return {
      restrict: 'E',
      replace: true,
      templateUrl: 'app/fxC0202/components/tab-head/tab-head.html',
    }
  }]);
