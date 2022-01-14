const isPositiveInteger = (n: any) => {
  return n >>> 0 === parseFloat(n);
};
export default isPositiveInteger;
