export function pasteHook(scope, tab, table, row, cell, ele) {
  let _scope = {
    $apply: scope.$apply.bind(scope),
    cell,
    row,
    tab,
    table,
  };

  $.csspaste(_scope, $(ele));
  $.csscopy(_scope, $(ele));
}
