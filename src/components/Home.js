import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import '@fortawesome/fontawesome-free/css/all.css'; // Import all icons
import * as FaIcons from 'react-icons/fa';
import * as AiIcons from 'react-icons/ai';
import { SidebarData } from './SidebarData';
import Map from 'ol/Map';
import OSM from 'ol/source/OSM';
import TileLayer from 'ol/layer/Tile';
import View from 'ol/View';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { Draw, Modify } from 'ol/interaction';
import { createBox } from 'ol/interaction/Draw';
import { toStringXY } from 'ol/coordinate';
import * as ol from 'ol';


const HomePage = () => {
  const [sidebar, setSidebar] = useState(false);
  // const [polygonFeatures, setPolygonFeatures] = useState([]); // Initialize polygonFeatures as an empty array
  const vectorSourceRef = useRef(new VectorSource({ features: [] }));
  const drawRef = useRef(null);
  const mapRef = useRef(null);
  const [drawing, setDrawing] = useState(null);
  
  function resizeMap() {
    const mapContainer = document.getElementById('map-container');
    const sidebar = document.querySelector('.nav-menu');
  
    if (sidebar.classList.contains('active')) {
      // Sidebar is open, adjust map container width
      mapContainer.style.width = 'calc(100% - 250px)'; // Adjust width based on sidebar size
    } else {
      // Sidebar is closed, reset map container width
      mapContainer.style.width = '100%';
    }
  }

  const showSidebar = () => {
    setSidebar(!sidebar);
    resizeMap();
  }

  useEffect(() => {
    const createMap = () => {
      const map = new Map({
        target: 'map-container',
        layers: [
          new TileLayer({
            source: new OSM()
          }),
          new VectorLayer({
            source: vectorSourceRef.current
          })
        ],
        view: new View({
          center: [0, 0],
          zoom: 4
        })
      });

      const draw = new Draw({
        source: vectorSourceRef.current,
        type: 'Polygon',
      });

      draw.on('drawend', (event) => {
        const polygon = event.feature.getGeometry();
        const coordinates = polygon.getCoordinates()[0].map((coord) =>
          toStringXY(coord, 6)
        );
        console.log('Polygon Coordinates:', coordinates);
        // Save coordinates to MongoDB via Flask backend
        saveDrawingCoordinates(coordinates);

        // Clear the current interaction
        map.removeInteraction(drawRef.current);
        drawRef.current = null;
      });

      const startDrawing = () => {
        if (!drawRef.current) {
          map.addInteraction(draw);
          drawRef.current = draw;
        }
      };

      return {map, startDrawing};
    };

    const { map, startDrawing } = createMap();
    mapRef.current = { map, startDrawing };

    return () => {
      if (mapRef.current) {
        mapRef.current.map.setTarget(null); // Clear the map target when unmounting
      }
    };
  }, []);

      const handleStartDrawing = () => {
        if (mapRef.current) {
          mapRef.current.startDrawing(); // Invoke startDrawing method from mapRef.current
        }
      };

      const saveDrawingCoordinates = async (coordinates) => {
        const user_id = sessionStorage.getItem('user_id'); // Retrieve user_id from session storage
        console.log(user_id)
        // const user_id = await userSession ? JSON.parse(userSession).id : null;

        if (!user_id) {
          console.error('User not authenticated');
          return;
        }

        const requestBody = {
          user_id,
          coordinates,
          label_type: 'polygon' // Example: Include label_type if needed
        };
        try{
          const response =await fetch('http://localhost:5000/draw', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
          })
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
      
          const data = await response.json();
          console.log('Drawing coordinates saved:', data);
          // Handle success (e.g., show a success message)
        } catch (error) {
          console.error('Error saving drawing coordinates:', error);
          // Handle error (e.g., show an error message)
        }
      };
    
  return (
    <>
      <div className='navbar'>
          <Link to='#' className='menu-bars'>
          <FaIcons.FaBars onClick={showSidebar} />
          </Link>
      </div>
      <nav className={sidebar ? 'nav-menu active' : 'nav-menu'}>
          <ul className='nav-menu-items' onClick={showSidebar}>
            <li className='navbar-toggle'>
              <Link to='#' className='menu-bars'>
              <AiIcons.AiOutlineClose />
              </Link>
            </li>
            {SidebarData.map((item, index) => {
              return (
                <li key={index} className={item.cName}>
                  <Link to={item.path}>
                    <span>{item.title}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div id="map-container" style={{ width: '1500px', height: '500px' }}></div>
        <button onClick={handleStartDrawing}>Start Drawing</button>
        {/* <button onClick={handleSaveDrawing}>Save Drawing</button> */}
      <footer className="footer">
        <p>&copy; 2024 My Website</p>
      </footer>
    </>
  );
};

export default HomePage;