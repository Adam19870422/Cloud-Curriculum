document.addEventListener('copy', function (e) {

  const clipboardText = window.getSelection().toString();
  var lastChar = clipboardText.slice(-1);

  var isLastCharANewline = /[\n\r]+/g.test(lastChar);

  if (isLastCharANewline) {
    e.clipboardData.setData('text/plain', clipboardText.slice(0, -1));
  } else {
    e.clipboardData.setData('text/plain', clipboardText);
  }
  e.preventDefault();
});