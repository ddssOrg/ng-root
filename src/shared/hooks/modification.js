
export function modificationHook(input, ele) {
    var cell = input.cell;
    var row = input.row;

    if (!cell.bdAble) {
        return;
    }

    var dbDom = $('<span></span>');
    if (cell.property == 'bqbsqbdbl' && row.data.bdezk == '0') {
        dbDom.append('<b class="ljw_table_important" style="cursor:default;">显著</b>');
    } else if (cell.property == 'bqbsqbdbl' && row.data.bdezk == '1') {
        dbDom.append('<b class="ljw_table_care" style="cursor:default;">关注</b>');
    } else if (cell.property == 'bqysqzbcy' && row.data.zbcy == '0') {
        dbDom.append('<b class="ljw_table_important" style="cursor:default;">显著</b>');
    } else if (cell.property == 'bqysqzbcy' && row.data.zbcy == '1') {
        dbDom.append('<b class="ljw_table_care" style="cursor:default;">关注</b>');
    }
    $(ele).css({'width':'65%','display':'inline-block'});
    if(isNotNull(dbDom.html())){
        dbDom.css({'display':'inline-block','width':'30%'});
    }    
    $(ele).after(dbDom);
}