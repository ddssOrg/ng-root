import './float-scroll';
import './head-float';
import './file-upload';
import './select';
import './year-month-picker';
import './date-picker';
import './archor';
import { contentEditable} from '../hooks/content-editable';

/**
 * trivials
 */
angular.module('app.shared')
  .directive('focusMe', ['$timeout', '$parse', ($timeout, $parse) => {
    return {
      link: (scope, element, attrs) => {
        $timeout(() => {
          element[0].focus();
        });
      }
    };
  }])
  .directive('ngHotkey', ['$timeout', '$parse', ($timeout, $parse) => {
    return {
      require: '?ngModel',
      restrict: 'A',
      link: ($scope, element, attrs, ngModel) => {
        $scope.$eval(attrs.ngHotkey);
      }
    }
  }])
  .directive('ngPasteText', () => {
    return {
      restrict: 'A',
      link: (scope, element, attrs, ngModel, $filter) => {
        $.csscopy(scope, element);
        $.csspaste(scope, element);
      }
    }
  })
  .directive('contenteditable', () => {
    return {
      require: 'ngModel',
      link: (scope, element, attrs, ctrl) => {
        contentEditable(element, function () {
          var html = element.html();
          ctrl.$setViewValue(html);
        });
      }
    };
  });