import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const FarmMap = ({ farms }) => {
  if (!farms || farms.length === 0) {
    return <div>No farm location data available</div>;
  }

  // Use the first farm's location as the map center
  const center = farms[0].location?.coordinates 
    ? [farms[0].location.coordinates[1], farms[0].location.coordinates[0]]
    : [20.5937, 78.9629]; // Default to India center

  return (
    <div style={{ height: '300px', width: '100%' }}>
      <MapContainer
        center={center}
        zoom={10}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {farms.map((farm, index) => {
          if (!farm.location?.coordinates) return null;
          
          const [lng, lat] = farm.location.coordinates;
          return (
            <Marker key={index} position={[lat, lng]}>
              <Popup>
                <div>
                  <h4>{farm.name}</h4>
                  <p>Area: {farm.area} hectares</p>
                  <p>Type: {farm.cropType}</p>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default FarmMap;