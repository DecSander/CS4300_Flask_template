export function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export function toTitleCase(str) {
  return str.replace(/\w\S*/g, txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
}

export function replaceUnderscores(str) {
  return str.replace(/[_-]/g, " ");
}

export function formatText(str) {
  return toTitleCase(replaceUnderscores(str));
}
