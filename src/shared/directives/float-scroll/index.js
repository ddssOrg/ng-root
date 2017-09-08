angular.module('app.shared')
  .directive('ngFloatScroll', ['$timeout', '$parse', function ($timeout, $parse) {
    return {
      require: '?ngModel',
      restrict: 'A',
      scope: {
        cell: '=ngSelectTable'
      },
      link: function ($scope, element, attrs, ngModel) {
        var tabId = attrs.ngFloatScroll;
        var leftScrollBar;
        var rightScrollBar;
        var $element = $(element);
        var scrollId = "#main_table_panel_" + attrs.ngFloatScroll;
        var isPosInObj = function (e, obj, options) {
          var x = e.clientX;
          var y = e.clientY;
          if (options && options.type == 'page') {
            x = e.pageX;
            y = e.pageY;
          }
          var left = obj.position().left;
          var top = obj.position().top;
          var width = obj.width();
          var height = obj.height();
          return x >= left && x <= left + width && y >= top && y <= top + height;
        }
        var releaseObj = function (obj) {
          if (obj) {
            obj.remove();
            obj = null;
          }
        }
        $element.mouseenter(function (e) {
          if ($element.height() <= $(window).height()) return;
          if ($element.width() <= $(window).width()) return;
          var minY = 100;
          var maxY = 400;
          var step = 100;
          releaseObj(leftScrollBar);
          releaseObj(rightScrollBar);
          var clientY = e.clientY + 50;
          //高度用户指定先限定高度，不用自动计算
          /*if(clientY < minY) clientY = minY;
          if(clientY > maxY) clientY = maxY;*/
          clientY = 300;
          var id = $element.attr("id");
          var leftBtn = $("<div class='float_scroll_bar' style='float:left;left:15px;top:" + clientY + "px;'></div>");
          var leftA = $("<a class='float_scroll_click'></a>");
          leftA.click(function () {
            var scrollLeft = $(scrollId).scrollLeft();
            var $ths = $("#main_table_" + tabId + ' tr:first-child').find("td");
            var columnsWidth = 0;
            var columnsNumber = 0;
            $("#main_table_" + tabId).find("td:lt(2), th:lt(2)").each(() => {
              if (columnsNumber++ >= 2) return;
              columnsWidth += $(this).outerWidth(true);
            });
            var wholeWidth = $("#main_table_" + tabId).width() - columnsWidth;
            for (var i = $ths.length; i >= 2; i--) {
              var width = $($ths[i]).outerWidth(true);
              if (scrollLeft > wholeWidth) {
                step = scrollLeft - wholeWidth;
                break;
              }
              wholeWidth -= width;
            }
            //$(scrollId).scrollLeft($(scrollId).scrollLeft()-10);
            $(scrollId).animate({ scrollLeft: $(scrollId).scrollLeft() - step });
          });
          var leftIcon = $("<i class='font-awesome-icon icon-chevron-left'></i>");
          leftA.append(leftIcon);
          leftBtn.append(leftA);
          $element.before(leftBtn);
          leftScrollBar = leftBtn;
				
				
          var rightBtn = $("<div class='float_scroll_bar' style='float:right; right:30px;top:" + clientY + "px;'></div>");
          var rightA = $("<a class='float_scroll_click'></a>");
          rightA.click(function () {
            var scrollLeft = $(scrollId).scrollLeft();
            var $ths = $("#main_table_" + tabId).find("tr:first-child td");
            var scrollWidth = 0;
            for (var i = 2; i < $ths.length; i++) {
              var width = $($ths[i]).outerWidth(true);
              scrollWidth += width;
              if (scrollLeft < scrollWidth) {
                step = scrollWidth - scrollLeft;
                break;
              }
            }
            $(scrollId).animate({ scrollLeft: scrollLeft + step });
          });
          var rightIcon = $("<i class='font-awesome-icon icon-chevron-right'></i>");
          rightA.append(rightIcon);
          rightBtn.append(rightA);
          $element.before(rightBtn);
          rightScrollBar = rightBtn;
				
        });
        $element.mouseleave(function (e) {
          if (leftScrollBar && rightScrollBar) {
            var clientX = e.clientX;
            var clientY = e.clientY;
            var fixColumn = $('#main_table_panel_body_copy_' + attrs.ngFloatScroll);
            if (fixColumn.length > 0) {
              //兼容左侧冻结列
              if (isPosInObj(e, fixColumn, { type: 'page' })) {
                return;
              }
            }
            if (!isPosInObj(e, leftScrollBar) && !isPosInObj(e, rightScrollBar)) {
              releaseObj(leftScrollBar);
              releaseObj(rightScrollBar);
            }
          }
        });
      }
    }
  }]);