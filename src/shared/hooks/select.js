export function selectHook($scope, element, cell) {
  var options = {};
  var ul = $('<ul class="ng-select-options"></ul>');
  $(element).change(function () {
    if (!window.changeflag) {
      window.changeflag = true;
      window.closeFlag = true;
    }
    $scope.$apply(function () {
      var hasdm = false;
      angular.forEach(cell.options, function (option) {
        var name = option.name;
        var value = option.value;
        if ($(element).val() == name) {
          cell.value = value;
          hasdm = true;
        }
      });
      if (!hasdm) {
        cell.zdy = true;
        cell.value = $(element).val();
      } else {
        cell.zdy = false;
      }
    });
  });
  
  element.on('focus', function () {
    var width = $(element.parent())[0].offsetWidth;
    var height = element.height();
    var elmOffset = $(element).offset();
    ul.css({
      'top': (elmOffset.top + height),
      'left': elmOffset.left - 5,
      'min-width': width,
    });
    ul.show();
  });
  element.on('blur', function () {
    setTimeout(() => {
      hideul();
    }, 300);  
  });
  var hideul = () => {
      ul.hide();
  }
  var selectItem = function (value, name) {
    if (!window.changeflag) {
      window.changeflag = true;
      window.closeFlag = true;
    }
    cell.selectname = name;
    cell.value = value;
    if (cell.validate) {
      cell.validate();
    }
    hideul();
    setTimeout(() => {
      $scope.$apply();
    });
  }
  cell.options.forEach(option => {
    var name = option.name;
    var value = option.value;
    if (cell.value == value) {
      cell.selectname = name;
    }
    options[name] = value;
    var li = $('<li>' + name + '</li>');
    li.click(function () {
      selectItem(value, name);
    });
    ul.append(li);
  });
  ul.appendTo('body')
  // $(element).after(ul);
}
