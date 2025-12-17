export function isBlob(val): boolean {
  return Object.prototype.toString.call(val) === '[object Blob]';
}

export const setAttrs = (ele, attrs = {}) => {
  Object.entries(attrs).forEach(([k, v]) => {
    ele.setAttribute(k, v);
  });
};

export const downloadBlob = (blob, options = {}) => {
  const fileReader = new FileReader();
  fileReader.readAsDataURL(blob);
  fileReader.onload = (e) => {
    const elmentA = document.createElement('a');
    const href = e.target?.result ?? '';
    if (!href) return;
    setAttrs(elmentA, { ...options, href });
    document.body.appendChild(elmentA);
    elmentA.click();
    document.body.removeChild(elmentA);
  };
};
