import {newRow } from '../providers';

export function addCommand(tab) {
  let row = newRow(tab);
  row && tab.table.tbody.addRow(row);
}