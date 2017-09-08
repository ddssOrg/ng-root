angular.module('xmcjgy')
  .service('CellFactoryService', ['$filter', function ($filter) {
    
    var CellFactoryService = {};

    const entityMap = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
      '/': '&#x2F;',
      '`': '&#x60;',
      '=': '&#x3D;'
    };

    // 工厂函数库
    const factories = {
      checkbox: createCheckBox,
      select: createSelect,
      label: createLabel,
      href: createHref,
      dialog: createDialog,
      TAB: createTab,
      text: createText,
      disable: createDisable,
      textarea: createTextarea,
      upload: createUpload,
      fileselect: createFileSelect,
      number: createNumber,
      datetime: createDateTime,
      fileview: createFileView,
    };

    CellFactoryService.pool = [];
    /**
     * @param  {} row Data
     * @param  {} cellData
     * @param  {} uitab
     * @param  {} index
     * @param  {} rowIndex
     * @returns template
     */
    CellFactoryService.factory = function (row, cell, uitab, index, rowIndex) {
      var func = factories[cell.dataType];
      var input = {
        row: row,
        cell: cell,
        uitab: uitab,
        index: index,
        rowIndex: rowIndex,
      };
      if (!func) {
        return '<div class="cell-contaienr"></div>';
      } else {
        var content = func.apply(input, []) || '';
        return '<div class="cell-contaienr">' + content + '</div>';
      }
    }

    return CellFactoryService;

    /**
     * @desc 创建check类型
     * @param  {} row
     * @param  {} cell
     * @param  {} uitab
     * @param  {} index
     * @param  {} rowIndex
     */
    function createCheckBox() {
      return '<input type="checkbox" ng-model="uirow.checked">';
    }

    function createSelect() {
      if (!this.cell.custom && !this.row.id) {
        return '<select style="width: 100%;position: relative;z-index: 1;" onchange="window.changeflag=true;window.closeFlag = true;" ' + getFontClass(this.cell) + ' ' +
          'ng-focus="inputFocus(uicell)" ng-blur="$validate();exeFuncs(uitab)" ' +
          'ng-model="uicell.value" value="' + escapeHtml(this.cell.value) + '" ng-options="option.value as option.name for option in ::$options|filter:uicell.value"> ' +
          '</select>';
      } else if ((this.cell.custom && !this.row.id) || this.cell.writeable) {
        var cell = this.cell;
        if (this.cell.options && this.cell.value) {
          var selectedOption = this.cell.options.find(function (opt) { return opt.value === cell.value });
          if (selectedOption) {
            cell.selectName = selectedOption.name;
          }
        }
        
        return '<input id="' + ['select', this.uitab.id, this.row.rowIndex, this.cell.colIndex].join('_') + '"' +
          '' + getFontClass(this.cell) + ' onchange="window.changeflag=true;window.closeFlag = true;" ng-focus="inputFocus(uicell)" ' +
          'ng-blur="$validate();exeFuncs(uitab)" placeholder="请选择" style="width: 100%;" type="text" ng-select ' +
          'ng-select-topoffset="{{uimodule.tabs.length==1?30:0}}" ng-select-cell="uicell" value="' + escapeStr(cell.selectName) + '" ng-model="uicell.selectname" ' +
          '/>';
                
      } else if (this.row.id && !this.cell.writeable) {
        return '<span ' + getFontClass(this.cell) + ' ' +
          'ng-repeat="option in ::$options|filter:uicell.value" ng-bind="option.name"></span>';
      } else {
        return '';
      }
    }

    function createLabel() {
      return '<span ng-bind="uicell.value+(uicell.serial?rowIndex:\'\')"' + getFontClass(this.cell) + '>' +
        (this.cell.value || '') + (this.cell.serial ? this.row.rowIndex : '') + '</span>';
    }

    function createHref() {
      if (cell.value) {
        return '<a ng-href="/download.sword?ctrl=DemoCtrl_downloadallfile&mbpath={{uicell.value}}{{getAuditParams()}}" ' + getFontClass(this.cell) + ' ' +
          'style="font-weight: bold;" target="_blank">{{uirow.data[uicell.labelProperty]}}</a>';
      } else {
        return ' <span ' + getFontClass(this.cell) + '>{{uirow.data[uicell.labelProperty]}}</span>  ';
      }
    }

    function createTab() {
      if (this.cell.href != '' && this.cell.href != '/') {
        return '<a href="javascript:;" ' + getFontClass(this.cell) + ' ng-click="showDialog(uicell, uirow)" ' +
          'style="font-weight: bold;" ng-bind="uirow.data[uicell.labelProperty]">' + this.row.data[this.cell.labelProperty] + '</a>';
      } else {
        return '<span ' + getFontClass(this.cell) + ' ng-bind="uirow.data[uicell.labelProperty]">' + this.row.data[this.cell.labelProperty] + '</span>';
      }
    }

    function createFileView() {
      return '<a href="javascript:;" ng-click="viewOneFile(uirow.id)" class="ng-scope">预览</a>';
    }

    function createText() {
      return '<input ' + getFontClass(this.cell) + ' ng-focus="inputFocus(uicell)" ng-blur="$validate();exeFuncs(uitab)" ' +
        'onchange="window.changeflag=true;window.closeFlag = true;" ng-paste-text ' +
        'style="width: 100%;" type="text" ng-model="uicell.value" value="' + escapeStr(this.cell.value) + '" />';
    }

    function createDialog() {
      if (this.row.data && this.row.data[this.cell.dataSource]) {
        return '<a href="javascript:;" ' + getFontClass(this.cell) + ' ng-click="showDialog(uicell, uirow)" ' +
          'style="font-weight: bold;">{{uirow.data[uicell.labelProperty]}}</a>';
      } else {
        return '<span ' + getFontClass(this.cell) + '>{{uirow.data[uicell.labelProperty]}}</span>';
      }
    }
    
    function createDisable() {
      return '<div><span ng-bind="uicell.value || \'---\'">' + escapeHtml(this.cell.value || '---') + '</span></div>';
    }

    function createTextarea() {
      return '<div id="' + ['textarea', this.uitab.id, this.row.rowIndex, this.cell.colIndex].join('_') + '" ' +
        '' + getFontClass(this.cell) + ' style="outline:none;position: relative;z-index: 1;margin: 3px;min-height:16px;white-space:normal;word-break:break-all;word-wrap:break-word; " ' +
        'ng-paste-text  contenteditable="true" ng-model="uicell.value" ng-bind-html="getTextareaDivText(uicell.value)">' + escapeHtml(this.cell.value) + '</div>';
    }
    
    function createUpload() {
      if (this.row.id && this.cell.haveCjmbFlag && this.uitab.id != '10101-1' && this.uitab.id != '10101-2'
        && this.uitab.id != '10101-3' && this.uitab.id != '10201-1' && this.uitab.id != '10201-2' && this.uitab.id != '10201-3' && this.uitab.id != '10201-3' && this.uitab.id != '10301-1') {
        return '<div> ' +
          '<a ng-if="uicell.ftjlURL" href="javascript:;" ng-click="openFtjl(uicell.ftjlURL)">访谈</a> ' +
          '<a href="javascript:;" ng-fileupload-url="{{::$uploadUrl}}" ng-fileupload-param=\'{"xmid":"{{xmid}}","cjbddm":"{{cjbddm}}","cjbgdm":"{{::$uitabID}}","cjmxdm":"{{$uirowData.cjmxdm}}"}\' ' +
          'ng-fileupload-template="{{::$templateProperty}}" ' +
          'ng-fileupload>上传</a> <a ng-if="uicell.value" href="javascript:;" ng-click="viewFile($uirowData.cjmxdm,uicell.isRefXm)">预览({{$uirowData.fjsl}})</a> ' +
          '<a ng-if="uicell.value" href="javascript:;" ng-click="delFile($uirowData.cjmxdm,uicell,uirow)">删除</a> ' +
          '</div>';
                  
      } else if (this.row.id && !this.cell.haveCjmbFlag) {
        return '<div> ' +
          '<a href="javascript:;" ng-fileupload-url="{{::$uploadUrl}}" ng-fileupload-param=\'{"xmid":"{{xmid}}","cjbddm":"{{cjbddm}}","cjbgdm":"{{::$uitabID}}","cjmxdm":"{{$uirowData.cjmxdm}}"}\' ' +
          'ng-fileupload-cell="uicell" ng-fileupload-row=\'uirow\' ng-fileupload-template=\'{{::$templateProperty}}\' ' +
          'ng-fileupload>上传</a> <a ng-if="uicell.value" href="javascript:;" ng-click="viewFile($uirowData.cjmxdm,uicell.isRefXm)">预览({{$uirowData.fjsl}})</a> ' +
          '<a ng-if="uicell.value" href="javascript:;" ng-click="delFile($uirowData.cjmxdm,uicell,uirow)">删除</a> ' +
          '</div>';
      } else if (this.row.id && this.cell.haveCjmbFlag && (this.uitab.id == '10101-1' || this.uitab.id == '10101-2'
        || this.uitab.id == '10101-3' || this.uitab.id == '10201-1' || this.uitab.id == '10201-2' || this.uitab.id == '10201-3' || this.uitab.id == '10201-3' || this.uitab.id == '10301-1')) {
        return '<div> ' +
          ' <a href="javascript:;" ng-fileupload-url="{{::$uploadUrl}}" ng-fileupload-param=\'{"xmid":"{{xmid}}","cjbddm":"{{cjbddm}}","cjbgdm":"{{::$uitabID}}","cjmxdm":"{{$uirowData.cjmxdm}}"}\' ' +
          ' ng-fileupload-cell="uicell" ng-fileupload-row=\'uirow\' ng-fileupload-template=\'{{::$templateProperty}}\' ' +
          'ng-fileupload>上传</a> <a ng-if="uicell.value" href="javascript:;" ng-click="viewFile($uirowData.cjmxdm,uicell.isRefXm)">预览({{$uirowData.fjsl}})</a> ' +
          ' <a ng-if="uicell.value" href="javascript:;" ng-click="delFile($uirowData.cjmxdm,uicell)">删除</a> ' +
          '<a ng-href="/download.sword?ctrl=DemoCtrl_downloadallfile&mbpath={{uicell.cjmbFileUrl}}{{getAuditParams()}}" target="_blank">模板</a> ' +
          '</div>';
      } else if (!this.row.id) {
        return '<div><a href="javascript:;" ng-click="exeCommand({action:\'saveRow\',tabid:$uitabID},uirow)">保存</a></div>';
      } else {
        return '';
      }
    }
    
    function createFileSelect() {
      return '<div> ' +
        '<a href="javascript:;" ng-click="fileSelect(uirow.id)">获取</a> ' +
        '<a ng-if="uicell.value" href="javascript:;" ng-click="viewFile(uirow.id)">预览</a> ' +
        '</div>';
    }
    
    function createNumber() {
      return '<input onchange="window.changeflag=true;window.closeFlag = true;" ' + getFontClass(this.cell) + ' ' +
        'ng-init="numberCellChange(uitab,' + this.index + ');numberInit(uicell);" ng-focus="inputFocus(uicell)" ng-paste-text ' +
        'ng-blur="$validate();exeFuncs(uitab,uicell,rowIndex,' + this.index + ');sumRowRefresh(uitab);changeReport(uitab)" ' +
        'style="width: 100%; text-align: right;" type="text" ng-model="uicell.value" />';
    };
    
    function createDateTime() {
      return '<input onchange="window.changeflag=true;window.closeFlag = true;" ng-focus="inputFocus(uicell)" ng-blur="$validate();exeFuncs(uitab)" ng-datetimepicker ' +
        '' + getFontClass(this.cell) + ' ng-format="{{uicell.format}}" type="text" style="width: 100%;" ' +
        'ng-model="uicell.value" class="l_member_date" ng-paste-text />';
      ;
    }

    /**
     * utils
     * @param {} cell 
     */

    function getFontClass(cell) {
      return cell.font ? (cell.font.bold ? 'class="font-bold-row"' : '') : '';
    }

    function escapeHtml(value) {
      return String(value || '').replace(/[&<>"'`=\/]/g, function (s) {
        return entityMap[s];
      });
    }

    function escapeStr(value) {
      return value ? value.toString().replace(/\"/g, '\\\"') : '';
    }

  }]);