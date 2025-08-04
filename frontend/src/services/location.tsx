export function getUserLocation(): Promise<{ lat: number; lon: number }> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      // Geolocation not supported by browser/device.
      reject(new Error("Geolocation not supported"));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
        });
      },
      (err) => {
        console.log(err);
        reject(
          new Error(
            "Could not get your location.\nPlease allow location access in your browser settings."
          )
        );
      }
    );
  });
}
