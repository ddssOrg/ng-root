import {
  UITable,
  ROW_HIDE_CHANGED,
  TableFactory
} from '../../../shared/models';
import { FXUICell } from './UICell.type';

/**
 * inheritance of UITable
 */
@TableFactory({
  eleFactories: [],
  cellFactory: (data, row, cellEle) => new FXUICell(data, row, cellEle)
})
export class FXUITable extends UITable {
  /**
   * factory table by given table data and tab id
   * @param {Object} tableData 
   * @param {Object} tabid 
   */
  static factory(tableData, scope, tab, uimodule) {
    var table = new FXUITable(scope, tab, uimodule);
    table.init(tableData);
    return table;
  }

  afterInit() {
    let clonedTable = null;
    this.rows.forEach(r => {
      r.on(ROW_HIDE_CHANGED, (hide) => {
        if (!clonedTable) {
          clonedTable = clonedTable || $(`#main_table_panel_body_copy_${this.tab.id}`)[0];
          if (clonedTable) {
            clonedTable = $(clonedTable).find('tbody')[0];
          }
        }
        if (!clonedTable) return;
        $(clonedTable).children(`#${r.ele.id}`)[0].style.display = hide ? 'none' : null;
      });
    });

    // to resize float header
    setTimeout(() => {
      $(window).scroll();
    }, 1);
    
  }
}
