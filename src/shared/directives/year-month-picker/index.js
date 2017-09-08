angular.module('app.shared')
  .directive('ngYearMonthpicker', ['$timeout', '$parse', function ($timeout, $parse) {
    return {
      require: '?ngModel',
      restrict: 'A',
      link: function ($scope, element, attrs, ngModel) {
        var changeValue = function (ym) {
          $(element).val(ym);
          ngModel.$setViewValue(ym);
        }
        $('.ym-box>.year>.center').html(moment().format('YYYY'));
        $('.ym-box>.year>.left').click(function () {
          var year = $('.ym-box>.year>.center').html();
          $('.ym-box>.year>.center').html(parseInt(year) - 1);
        });
        $('.ym-box>.year>.right').click(function () {
          var year = $('.ym-box>.year>.center').html();
          $('.ym-box>.year>.center').html(parseInt(year) + 1);
        });
        $('.ym-box>.month>span').click(function () {
          var y = $('.ym-box>.year>.center').html();
          var m = $(this).attr('month');
          changeValue(y + '-' + m);
          $('.ym-box').fadeOut(200);
        });
        $(element).click(function () {
          $('.ym-box').fadeIn(200);
        });
        $(element).focus(function () {
          $('.ym-box').fadeIn(200);
        });
      }
    }
  }]);