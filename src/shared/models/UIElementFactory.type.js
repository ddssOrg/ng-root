
/**
 * @abstract
 * element factory is used to generate and compile cells for uitable
 */
export class UIElementFactory {

  /**
   * @abstract
   */
  createTemplate({ cell, row, tab }) {
    return '';
  }

  /**
   * @abstract
   * @param {*} payload
   */
  compile({ row,
    cell,
    tab,
    colIndex,
    rowIndex,
    $dataTable,
    scope,
    tabIndex
  }) {

  }
}
