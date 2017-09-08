angular.module('fx')
  .directive('fxSpinner', [() => {
    return {
      restrict: 'E',
      replace: true,
      templateUrl: 'app/fx/components/spinner/spinner.html',
    }
  }]);
