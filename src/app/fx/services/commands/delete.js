export function deleteCommand(tab) {
  if (!tab.table.tbody) return;
  var selectedNoIdRows = [];
  var selectedRows = [];
  var canDel = true;
  tab.table.tbody.rows.forEach(row => {
    if (row.checked) {
      if (row.id) {
        selectedRows.push(row);
      } else {
        selectedNoIdRows.push(row);
      }
    }
  });
  if (selectedRows.length <= 0 && selectedNoIdRows.length <= 0) {
    setPrompt('请选中要删除的记录', false);
  } else {
    selectedRows.forEach(row => {
      row.remove(true);
    });
    selectedNoIdRows.forEach(row => {
      row.remove();
    });
    // refreshGroup(tab);
    tab.table.tbody.scope.sumRowRefresh(tab);
    window.changeflag = true;
    window.closeFlag = true;
  }
}