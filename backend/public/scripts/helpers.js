function replaceAllElementTextGiven(selector, replacementText) {
  $(selector).text(function() {
    return replacementText;
  })
}

/**
 * Set's element located by selector to given width.
 * @param selector, string
 * @param newWidth, width with measurement (px, %, etc.)
 */
function setElementWidth(selector, newWidth) {
  $(selector).width(newWidth);
}

function round(value, decimals = 1) {
  return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
}