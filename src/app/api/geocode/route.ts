import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;

  if (!lat || !lng) {
    return NextResponse.json({ error: 'Latitude and longitude are required' }, { status: 400 });
  }

  if (!apiKey || apiKey === 'YOUR_API_KEY_HERE') {
    return NextResponse.json({ error: 'API key is not configured.' }, { status: 500 });
  }

  const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== 'OK') {
      return NextResponse.json({ error: data.error_message || 'Geocoding API error' }, { status: 500 });
    }

    const addressComponents = data.results[0].address_components;
    const getAddressComponent = (type: string) => {
        const component = addressComponents.find((c: any) => c.types.includes(type));
        return component ? component.long_name : '';
    }

    const address = {
        street_number: getAddressComponent('street_number'),
        route: getAddressComponent('route'),
        locality: getAddressComponent('locality'),
        administrative_area_level_1: getAddressComponent('administrative_area_level_1'),
        postal_code: getAddressComponent('postal_code'),
        country: getAddressComponent('country'),
    };
    
    return NextResponse.json(address);
  } catch (error) {
    console.error('Geocoding fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch from Geocoding API' }, { status: 500 });
  }
}
