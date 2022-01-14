const isValidCoordinates = (lng: number, lat: number) => {
  return lng >= -180 && lng <= 180 && lat >= -90 && lat <= 90;
};
export default isValidCoordinates;
