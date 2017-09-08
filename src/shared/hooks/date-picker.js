export function datePicker(element, isTimepicker, format, onlylastday, onchange = () => { }) {
  $(element).datetimepicker({
    lang: 'zh',
    timepicker: Boolean(isTimepicker && isTimepicker != 'false'),
    format: format,
    onChangeDateTime: function (dp, $input) {
      let val = $input.val();
      $(element).val(val);
      onchange(val);
    },
    beforeShowDay: function (date) {
      if (onlylastday) {
        if (date.getDate() == moment(date).endOf('month').format("DD")) {
          return [true, ""]
        }
        return [false, ""];
      } else {
        return [true, ""]
      }
    }
  });
}