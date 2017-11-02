
angular.module('myapp', ['ngRoute', 'ngDialog','ngSwordHttp', 'xmcjgy', 'fx','fxC0202'])
  .config(['$routeProvider', '$compileProvider', '$logProvider', ($routeProvider, $compileProvider, $logProvider) => {
    $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|pageoffice|ftp|mailto|file|javascript):/);
    $logProvider.debugEnabled(true);
  }])
  .run(['$rootScope', ($rootScope) => {
      
  }]);
