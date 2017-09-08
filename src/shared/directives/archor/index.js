angular.module('app.shared')
  .directive('appArchor', [() => {
    return {
      restrict: 'A',
      link: (scope, element, attrs) => {
        element.on('click.app-archor', () => {
          if (!attrs['appArchor']) return;
          let target = $(`#${attrs['appArchor']}`);
          let { top } = target.offset();
          $(window).scrollTop(top);
        });
      }
    }
  }]);