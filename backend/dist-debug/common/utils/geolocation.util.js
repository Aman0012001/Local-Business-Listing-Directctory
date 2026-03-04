"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateDistance = calculateDistance;
exports.createPostGISPoint = createPostGISPoint;
exports.isValidCoordinates = isValidCoordinates;
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRadians(lat1)) *
            Math.cos(toRadians(lat2)) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return Math.round(distance * 100) / 100;
}
function toRadians(degrees) {
    return degrees * (Math.PI / 180);
}
function createPostGISPoint(latitude, longitude) {
    return `SRID=4326;POINT(${longitude} ${latitude})`;
}
function isValidCoordinates(latitude, longitude) {
    return (latitude >= -90 &&
        latitude <= 90 &&
        longitude >= -180 &&
        longitude <= 180);
}
//# sourceMappingURL=geolocation.util.js.map