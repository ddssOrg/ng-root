angular.module('app.shared')
  .directive('functionMenu', [() => {
    return {
      restrict: 'E',
      replace: true,
      templateUrl: 'shared/components/function-menu/function-menu.html',
      controller: ['$scope', ($scope)=> {
        $(".new_function_menu").css("right", "1px");
        $(".new_function_menu").css("bottom", "40%");
        //setTimeout('$(".new_function_menu").css("width",$(".new_function_menu").width())',100);//set fix width to prevent drag slide width change
        //setTimeout('autoTextarea()',1000);//set fix width to prevent drag slide width change
        $(".new_function_menu").draggable({
          containment: "body",
          handle: ".function_menu_click_move",
          start: function () {
            $(".new_function_menu").css("right", "");
            $(".new_function_menu").css("bottom", "");
          },
          stop: function () {
            var right = $(window).width() - $(".new_function_menu").position().left - $(".new_function_menu").width();
            var bottom = $(window).height() - $(".new_function_menu").position().top - $(".new_function_menu").height();
            if (bottom <= 0) bottom = 0; //按钮不允许超出下边界
            $(".new_function_menu").css("left", "");
            $(".new_function_menu").css("top", "");
            $(".new_function_menu").css("right", right + "px");
            $(".new_function_menu").css("bottom", bottom);
            $(".new_function_menu").css("width", '180px');
          }
        });
      }],
    }
  }]);
