angular.module('fx', ['ngDialog', 'ngSwordHttp', 'app.shared'])
  .config(['$compileProvider', ($compileProvider) => {
    $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|pageoffice|ftp|mailto|file|javascript):/);
  }]);