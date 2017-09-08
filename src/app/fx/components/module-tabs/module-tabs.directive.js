angular.module('fx')
  .directive('moduleTabs', [() => {
    return {
      restrict: 'E',
      replace: true,
      templateUrl: 'app/fx/components/module-tabs/module-tabs.html',
      link: (scope, element, attrs) => {
        
      }
    }
  }]);
