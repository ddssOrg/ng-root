angular.module('fxC0202')
  .directive('fxC0202ModuleTabs', [() => {
    return {
      restrict: 'E',
      replace: true,
      templateUrl: 'app/fxC0202/components/module-tabs/module-tabs.html',
      link: (scope, element, attrs) => {
        
      }
    }
  }]);
