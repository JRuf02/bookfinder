import { useAppState } from "../state/AppStateProvider";
import { GeoCoordinates } from "../types/GeoCoordinates";

export type LocationError = {
  title: string;
  text: string;
};

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

/** Access the user's geolocation and cache it to the global AppState */
export async function getAndCacheUserLocation(
  dispatch: ReturnType<typeof useAppState>["dispatch"],
  onError?: (error: LocationError) => void,
) {
  try {
    const location = await getUserLocation();
    dispatch({
      type: "SET_USER_COORDINATES",
      payload: location,
    });

    return location;
  } catch {
    onError?.({
      title: "Could not get your location",
      text: "Please activate GPS in your device settings and allow location access for this app.",
    });

    return null;
  }
}
