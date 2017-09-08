let calculateDiv = $(`
  <div class="calculate-panel">
    <div class="calculate-desc"></div>
    <div class="checked-desc"></div>
  </div>
`).appendTo('body').hide();

let calculateDivRender = (style, calculateDesc,checkedDesc) => {
  calculateDesc && calculateDiv.find('.calculate-desc').html(calculateDesc);
  checkedDesc && calculateDiv.find('.checked-desc').html(checkedDesc);
  calculateDiv.css(style);
};

export function calculationHook(input, ele) { 
  var isQB = input.scope.isQB;
  if(!isQB){
    $(ele).nextAll('.cell_calculate').hide();
    return;
  }
  var tab = input.tab;
  var cell = input.cell;
  var row = input.row;
  var rowIndex = row.rowIndex;
  var tabs = input.scope.uimodule.tabs;
  var colIndex = input.colIndex;
  let loadedFlag = false;
  let contentCache = {};
  
  //判断是否是计算公式的单元格
  if (isCalculate(tab.table.columns, cell, tab.table.tbody.rows, rowIndex, colIndex, tab, tabs)) {  
    var fxIconStr = //'<div style="width:100%;height:0;position:relative;">'+
                    '<div class="cell_calculate" style="position:absolute;top:-7px;right:0;cursor:pointer;">'+
                    '<img src="/resources/images/cw/fx1.png" width="10" height="10"></div>';
    var fxIcon = $(fxIconStr);
    if($(ele).nextAll('.cell_calculate').size() > 0){
      $(ele).nextAll('.cell_calculate').show();
    }else{
      $(ele).after(fxIcon);
    }
    
    var flag = null;
    $(ele).nextAll('.cell_calculate').click(function (e) {
      flag = true;
      setTimeout(() => {
        if (!flag) return;
        contentCache['main_table_C0201-3 tbody'] = contentCache['main_table_C0201-3 tbody'] || $('#main_table_C0201-3 tbody')[0];
        contentCache['main_table_C0201-4 tbody'] = contentCache['main_table_C0201-4 tbody'] || $('#main_table_C0201-4 tbody')[0];
        contentCache['main_table_C0201-5 tbody'] = contentCache['main_table_C0201-5 tbody'] || $('#main_table_C0201-5 tbody')[0];
      
        if (contentCache['main_table_C0201-3 tbody']
          || contentCache['main_table_C0201-4 tbody']
          || contentCache['main_table_C0201-5 tbody']
        ) {
          var calculateDesc = getCalculate(tab.table.columns, cell, tab.table.tbody.rows, rowIndex, colIndex, tabs, tab);
          //calculateDesc && calculateDiv.find('.calculate-desc').html(calculateDesc);
          //calculateDiv.find('.calculate-desc').tooltip({html : true });
          var checkedDesc = getCheckedMSG(tab.id, tabs, tab.table.tbody.rows[rowIndex].cells[0].value, cell.property);
          // calculateDivRender({ 'left': e.pageX, 'top': e.pageY - 80 }, calculateDesc, checkedDesc);
          //calculateDivRender({ 'left':$(ele).offset().left + $(ele).width() - 4, 'top': $(ele).offset().top - 543 }, calculateDesc);
          calculateDivRender({ 'left': e.pageX, 'top': e.pageY - 80 }, calculateDesc, checkedDesc);
          $('body').append(calculateDiv);
          calculateDiv.fadeIn(300);
        }
      }, 300);
      e.preventDefault();
    }).mouseout(function (e) {
      flag = false;
      if (calculateDiv) {
        calculateDiv.hide();
      }
    });
				
  }
}