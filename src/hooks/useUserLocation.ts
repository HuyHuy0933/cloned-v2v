import { use } from 'i18next';
import { useEffect, useState } from 'react';

export type Location = {
    latitude: number | null;
    longitude: number | null;
}

export type Address = {
    city: string | null;
    country: string | null;
}

export enum LocationErrorType {
    OK = 0,
    BROWSER_NOT_SUPPORT = 1,
    NOT_FOUND_LOCATION = 2,
}

const useUserLocation = () => {
    const [language, setLanguage] = useState<string>('en');
    const [location, setLocation] = useState<Location>({ latitude: null, longitude: null });
    const [address, setAddress] = useState<Address>({ city: null, country: null });
    const [isLoading, setIsLoading] = useState<boolean>(true);   
    const [error, setError] = useState<LocationErrorType | null>(null);    

    useEffect(() => {
        const userLanguage = navigator.language || navigator.languages[0] || 'en';
        setLanguage(userLanguage);        
        getGeolocation(userLanguage, setLocation, setIsLoading, setAddress, setError);
    }, []);    

    return { language, location, address, isLoading, error };
};

const getGeolocation = (
    language: string,
    setLocation: React.Dispatch<React.SetStateAction<Location>>,
    setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,    
    setAddress: React.Dispatch<React.SetStateAction<Address>>,    
    setError: React.Dispatch<React.SetStateAction<LocationErrorType | null>>    
): void => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                setLocation({ latitude, longitude });                
                setError(LocationErrorType.OK);
                if (longitude && latitude) {                    
                    fetchPlaceDetails(latitude, longitude, language, setIsLoading, setAddress, setError);
                }
            },
            () => {
                setError(LocationErrorType.NOT_FOUND_LOCATION);
                setIsLoading(false);
            }
        );
    } else {
        setError(LocationErrorType.BROWSER_NOT_SUPPORT);
        setIsLoading(false);
    }
};

const fetchPlaceDetails = async (
    latitude: number,
    longitude: number,
    language: string,
    setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
    setAddress: React.Dispatch<React.SetStateAction<Address>>,
    setError: React.Dispatch<React.SetStateAction<LocationErrorType | null>>   
  ) => {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&namedetails=1&accept-language=${language}`;
  
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch location details");
  
      const data = await response.json();
      const city = data.address && (data.address.city || data.address.town || data.address.village || data.address.suburb);
      const country = data.address && data.address.country;
      
      let translatedCity = (data.namedetails && data.namedetails[`name:${language}`]) || city;
      let translatedCountry = (data.namedetails && data.namedetails[`name:${language}`]) || country;  
      
      if (!translatedCity || !translatedCountry) {
        const fallbackResponse = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&namedetails=1&accept-language=en`
        );
        if (!fallbackResponse.ok) throw new Error("Failed to fetch fallback place details");
  
        const fallbackData = await fallbackResponse.json();
        translatedCity = fallbackData.address.city || fallbackData.address.town || fallbackData.address.village || fallbackData.address.suburb;
        translatedCountry = fallbackData.address.country;
      }  
      setAddress({ city: translatedCity, country: translatedCountry });
      setIsLoading(true);
    } catch (err) {      
      setError(LocationErrorType.NOT_FOUND_LOCATION);
    }
    finally {        
        setIsLoading(false);
    }
  };

export { useUserLocation };
