angular.module('fxC0202', ['ngDialog', 'ngSwordHttp', 'app.shared'])
  .config(['$compileProvider', ($compileProvider) => {
    $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|pageoffice|ftp|mailto|file|javascript):/);
  }]);