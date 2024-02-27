import { Box, Button, VStack } from '@chakra-ui/react'
import { ButtonStyle } from './defaultStyles'
import { Map, Marker } from '@vis.gl/react-google-maps'
import { useMemo, useState } from 'react'
import MapMarkerIcon from '../assets/map_marker.png'

/**
 *
 * @param {Object} props
 * @param {{lat: float, lng: float}} props.defaultValue
 * @param {(params: { lat: float, lng: float }) => void} props.onChangeLocation Event fired with the latest latitude and longitude from the map
 * @returns JSX.Element
 */
const MapComponent = ({ onChangeLocation, defaultValue }) => {
  const [currentMapPos, setCurrentMapPos] = useState({
    lat: 0,
    lng: 0,
    isLoading: false
  })

  const renderMap = useMemo(
    () => currentMapPos.lat !== 0 && currentMapPos.lng !== 0,
    [currentMapPos]
  )

  function getExactLocation () {
    setCurrentMapPos(prev => ({ ...prev, isLoading: true }))
    const options = {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0
    }

    const success = pos => {
      const crd = pos.coords
      setCurrentMapPos({
        lat: crd.latitude,
        lng: crd.longitude,
        isLoading: false
      })
    }
    const error = err =>
      setCurrentMapPos(prev => ({ ...prev, isLoading: false }))

    navigator.geolocation.getCurrentPosition(success, error, options)
  }

  return (
    <Box pos='relative' h='300px' w='full'>
      {!renderMap && (
        <VStack
          pos='absolute'
          h='full'
          w='full'
          bg='#00000080'
          zIndex={'9'}
          justify='center'
          align='center'
        >
          <Button
            {...ButtonStyle.inverted}
            w='max-content'
            onClick={getExactLocation}
            isLoading={currentMapPos.isLoading}
            loadingText='Getting location'
          >
            Set Location On Map
          </Button>
        </VStack>
      )}
      <Map
        center={currentMapPos}
        onCenterChanged={ev => {
          setCurrentMapPos({
            lat: ev.map.getCenter().lat(),
            lng: ev.map.getCenter().lng()
          })

          onChangeLocation({
            lat: ev.map.getCenter().lat(),
            lng: ev.map.getCenter().lng()
          })
        }}
        defaultZoom={16}
        gestureHandling={'greedy'}
        disableDefaultUI={true}
        style={{ height: '300px' }}
      >
        <Marker
          //   position={formState.store_address || currentMapPos}
          position={defaultValue || currentMapPos}
          draggable={true}
          icon={{
            url: MapMarkerIcon
          }}
          onDragEnd={ev =>
            onChangeLocation({
              lat: ev.latLng.lat(),
              lng: ev.latLng.lng()
            })
          }
        />
      </Map>
    </Box>
  )
}

export default MapComponent
