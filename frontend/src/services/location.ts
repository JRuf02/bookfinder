import { GeoCoordinates } from "../types/GeoCoordinates";

export function getUserLocation(): Promise<GeoCoordinates> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      // Geolocation not supported by browser/device.
      reject(new Error("Geolocation not supported"));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
      },
      (err) => {
        console.log(err);
        reject(
          new Error(
            "Could not get your location.\nPlease activate GPS in your device settings and allow location access for this app.",
          ),
        );
      },
    );
  });
}
