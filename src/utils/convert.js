export const formatWithCommas = (value) => {
  const pattern = /(-?\d+)(\d{3})/;
  while (pattern.test(value)) {
    value = value.toString().replace(pattern, "$1,$2");
  }
  return value;
};

export const cumulativeSumArray = (array) =>
  array.reduce((r, a) => {
    if (r.length > 0) a += r[r.length - 1];
    r.push(a);
    return r;
  }, []);