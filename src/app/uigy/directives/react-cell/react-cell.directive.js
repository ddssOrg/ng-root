'use strict';
angular.module('xmcjgy')
  .directive('reactCell', ['$compile', '$timeout', 'CellFactoryService','CellCompilePoolService', function ($compile, $timeout, cellFactory, cellCompiler) {
    return {
      restrict: 'A',
      transclude: true,
      link: function ($scope, element, attrs, ngModel, $transclude) {

        var result = null;
        var compileTask = null;
        var childScop = null;

        $scope.parentCell = element;

        element.attr('id', ['td', $scope.uitab.id, $scope.uirow.rowIndex, $scope.uicell.colIndex].join('_'));

        var $destroy = $scope.$on('$destroy', function () {
          if (result) {
            result.off();
            result.remove();
          }
          
          if (compileTask) {
            cellCompiler.removeTask(compileTask);
          }
          $destroy();
        });

        $scope.$watch(attrs.ngShow, function (value) {
          if (!value) {
            if (result) {
              result.remove();
            }
            if (childScop) {
              childScop.$destroy();
            }
            return;
          }

          $transclude(function (clone, newScope) {
            childScop = newScope;
            compileTask = (function (scope) {
              return loadTable(scope);
            })(childScop);
            cellCompiler.createTask(compileTask);
            cellCompiler.startCompile(20);
          });
        });

        function loadTable(scope) {
          if (!scope.$dataTable) return function () {
            return Promise.resolve();
          };
          var template =
            cellFactory.factory(scope.uirow, scope.uicell, scope.uitab, scope.$rowIndex, scope.$index); 
          result = $(template).appendTo(element);
          var compiledTemplate = $compile(result);
          
          return function () {
            return new Promise(function (resolve) {
              var content = compiledTemplate(scope);
              resolve();
            });
          };
        }
      }
    };
  }]);