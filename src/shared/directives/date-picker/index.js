import { datePicker } from '../../hooks/date-picker';
angular.module('app.shared')
  .directive('ngDatetimepicker', function () {
    return {
      require: '?ngModel',
      restrict: 'A',
      link: function ($scope, element, attrs, ngModel) {
        datePicker(element, ngTimepicker, attrs.ngFormat, attrs.ngOnlylastday);
      }
    };
  });