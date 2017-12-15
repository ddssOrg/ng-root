
export function contentEditable(element, onblur) {
  element.addEventListener('blur', function () {
    onblur && onblur(element.innerText);
    window.changeflag = true;
    window.closeFlag = true;
  });
  element.addEventListener('input', function () {
    window.changeflag = true;
    window.closeFlag = true;
  });
}