import { selectHook } from '../../hooks/select';
angular.module('app.shared')
  .directive('ngSelect', ['$timeout', '$parse', function ($timeout, $parse) {
    return {
      require: '?ngModel',
      restrict: 'A',
      scope: {
        cell: '=ngSelectCell'
      },
      link: ($scope, element, attrs) => {
        selectHook($scope, element, $scope.cell);
      },
    }
  }]);
