
angular.module('app.shared')
  .directive('ngFileupload', ['xmcjgyService', function (xmcjgyService) {
    return {
      restrict: 'A',
      link: function (scope, element, attrs, ngModel) {
        var row = scope.uirow;
        var cell = scope.uicell;
        $(element).attr('id', 'upload_' + row.rowIndex + '_' + (new Date().getTime()));
        var param = angular.fromJson(attrs.ngFileuploadParam);
        var getParam = function () {
          return param;
        }
        var fjsl = 0;
        $(element).cssFileUpload({
          url: attrs.ngFileuploadUrl,
          simple: false,
          multiple: true,
          template: attrs.ngFileuploadTemplate,
          data: getParam,
          onBeforeSelectFile: function (selectFile) {
            if (row.id) {
              selectFile();
            } else {
              //校验信息录入是否完整
              if (param.cjbddm == '10101' || param.cjbddm == '10201' || param.cjbddm == '10301') {
                var hasZbfl = false;
                var hasZlmc = false;
                angular.forEach(row.cells, function (cell) {
                  if (cell.property == 'zbfl' && cell.value) {
                    hasZbfl = true;
                    row.data.zbfl = cell.value;
                  }
                  if (cell.property == 'zlmc' && cell.value) {
                    hasZlmc = true;
                    row.data.zlmc = cell.value;
                    cell.dataType = 'label'
                  }
                });
                if (!hasZbfl) {
                  alert('请选择资料分类');
                  return;
                }
                if (!hasZlmc) {
                  alert('请填写资料名称');
                  return;
                }
              } else if (param.cjbddm == '10102' || param.cjbddm == '10103' || param.cjbddm == '10202' || param.cjbddm == '10302') {
                var hasFtjsfl = false;
                var hasBftrymc = false;
                angular.forEach(row.cells, function (cell) {
                  if (cell.property == 'ftjsfl' && cell.value) {
                    hasFtjsfl = true;
                    row.data.ftjsfl = cell.value;
                  }
                  if (cell.property == 'bftrymc' && cell.value) {
                    hasBftrymc = true;
                    row.data.bftrymc = cell.value;
                    //cell.dataType='label'
                  }
                });
                if (!hasFtjsfl) {
                  if (param.cjbddm == '10102' || param.cjbddm == '10202' || param.cjbddm == '10302') {
                    alert('请选择访谈角色分类');
                  } else if (param.cjbddm == '10103') {
                    alert('请选择调查场所分类');
                  }
                  return;
                }
                if (!hasBftrymc) {
                  if (param.cjbddm == '10102' || param.cjbddm == '10202' || param.cjbddm == '10302') {
                    alert('请填写被访谈人员名称');
                  } else if (param.cjbddm == '10103') {
                    alert('请填写被调查场所名称、地点');
                  }
                  return;
                }
              }
              //保存单行数据
              //						scope.$apply(function(){
              var rowdata = param;
              angular.forEach(row.cells, function (cell) {
                rowdata[cell.property] = cell.value;
              });
              xmcjgyService.saveRowData(rowdata, function (resp) {
                if (resp.succ) {
                  //param.cjmxdm = resp.obj.cjmxdm;
                  var key = resp.obj.key;
                  row.id = resp.obj[key];
                  //param.cjmxdm=resp.obj.cjmxdm;
                  row.data[key] = resp.obj[key];
                  angular.forEach(row.cells, function (cell) {
                    if (cell.property == key) {
                      cell.value = row.id;
                    }
                  });
                  //row.data.whfshxydm=resp.obj.whfshxydm;
                  selectFile();
                } else {
                  alert(resp.msg);
                }
              }, function (errResp) {
                alert('保存数据时发生错误');
              });
              //						});
            }
          },
          add: function (e, data) {
            fjsl = data.files.length;
          },
          success: function () {
            scope.$apply(function () {
              cell.value = true;
              if (!isNull(row.data.fjsl)) {
                row.data.fjsl = parseInt(row.data.fjsl) + fjsl;
              } else {
                row.data.fjsl = fjsl;
              }
            });
          }
        });
      }
    }
  }]);