import './App.css'
import {
  Box,
  Button,
  Grid,
  GridItem,
  Image,
  Input,
  Select,
  Text,
  VStack,
  useMediaQuery
} from '@chakra-ui/react'
import SneakerBanner from './assets/sneaker_banner.png'
import Background from './assets/grad_new.png'
import sampleObj from './assets/sample_item'
import { useState } from 'react'
import { Map, Marker } from '@vis.gl/react-google-maps'
import MapMarkerIcon from './assets/map_marker.png'
import axios from 'axios'

function extractKeyName (key) {
  if (key.includes('_')) {
    const init = key.split('_').join(' ')
    return init.charAt(0).toUpperCase() + init.slice(1)
  } else return key
}

function generateFields () {
  const fields = []

  fields.push({ name: 'Basic Information', type: 'label' })
  Object.keys(sampleObj().seller_information).map(seller_key => {
    if (typeof sampleObj().seller_information[seller_key] !== 'string') {
      if (Array.isArray(sampleObj().seller_information[seller_key])) {
        fields.push({
          name: seller_key,
          type: 'select',
          label: extractKeyName(seller_key),
          options: sampleObj().seller_information[seller_key]
        })
      } else {
        Object.keys(sampleObj().seller_information[seller_key]).map(
          child_key => {
            fields.push({
              name: child_key,
              type: 'input',
              label: extractKeyName(child_key)
            })
          }
        )
      }
    } else {
      fields.push({
        name: seller_key,
        type: 'input',
        label: extractKeyName(seller_key)
      })
    }
  })

  fields.push({ name: 'Store Information', type: 'label' })
  Object.keys(sampleObj().store_information).map(store_key => {
    if (store_key !== 'store_address') {
      if (typeof sampleObj().store_information[store_key] !== 'string') {
        if (Array.isArray(sampleObj().store_information[store_key])) {
          fields.push({
            name: store_key,
            type: 'select',
            label: extractKeyName(store_key),
            options: sampleObj().store_information[store_key]
          })
        } else {
          Object.keys(sampleObj().store_information[store_key]).map(
            child_key => {
              fields.push({
                name: child_key,
                type: 'input',
                label: extractKeyName(child_key)
              })
            }
          )
        }
      } else {
        fields.push({
          name: store_key,
          type: 'input',
          label: extractKeyName(store_key)
        })
      }
    } else {
      fields.push({
        name: store_key,
        type: 'map',
        label: extractKeyName(store_key)
      })
    }
  })

  return fields
}

function App () {
  const [formState, setFormState] = useState({})
  const [currentMapPos, setCurrentMapPos] = useState({
    lat: 0,
    lng: 0,
    isLoading: false
  })
  const [apiState, setApiState] = useState('idle')
  const [isLargerThan1200] = useMediaQuery('(min-width: 1200px)')

  const inputStyle = keyName => ({
    bg: '#2D84B840',
    size: 'md',
    outline: 'none',
    boxShadow: 'none',
    borderColor: 'transparent'
  })

  const buttonStyle = {
    size: 'md',
    w: 'full',
    transition: 'all 300ms',
    bg: 'white',
    color: 'black',
    _hover: {
      bg: 'black',
      color: 'white'
    },
    dropShadow: 'lg',
    inverted: {
      bg: 'black',
      color: 'white',
      _hover: {
        bg: 'white',
        color: 'black'
      }
    }
  }

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

  const renderChild = data => {
    const child_types = {
      input: (
        <Input
          key={data.name}
          placeholder={data.label}
          value={formState[data?.name]}
          onChange={e =>
            setFormState(prev => ({ ...prev, [data.name]: e.target.value }))
          }
          autoComplete='off'
          {...inputStyle(data.name)}
        />
      ),
      map: (
        <Box pos='relative' h='300px' w='full'>
          {currentMapPos.lat == 0 && (
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
                {...buttonStyle.inverted}
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

              setFormState(prev => ({
                ...prev,
                store_address: {
                  lat: ev.map.getCenter().lat(),
                  lng: ev.map.getCenter().lng()
                }
              }))
            }}
            defaultZoom={16}
            gestureHandling={'greedy'}
            disableDefaultUI={true}
            style={{ height: '300px' }}
          >
            <Marker
              position={formState.store_address || currentMapPos}
              draggable={true}
              icon={{
                url: MapMarkerIcon
              }}
              onDragEnd={ev =>
                setFormState(prev => ({
                  ...prev,
                  store_address: {
                    lat: ev.latLng.lat(),
                    lng: ev.latLng.lng()
                  }
                }))
              }
            />
          </Map>
        </Box>
      ),
      label: <Text fontSize='medium'>{data.name}</Text>,
      select: (
        <Select
          {...inputStyle()}
          placeholder={`Select ${data.label}`}
          onChange={e =>
            setFormState(prev => ({ ...prev, [data.name]: e.target.value }))
          }
          value={formState[data?.name]}
        >
          {data?.options?.map(opt => (
            <option key={opt.key} value={opt.value}>
              {opt.value}
            </option>
          ))}
        </Select>
      )
    }

    return child_types[data.type]
  }

  async function submitForm () {
    setApiState('pending')
    axios
      .post('https://backend.sheehanrahman.com/api/cheb', {
        sellerData: formState
      })
      .then(res => res.status == 200 && setApiState('success'))
      .catch(res => setApiState('error'))
  }

  return (
    <Grid
      gridTemplateColumns={isLargerThan1200 ? '1fr 1fr' : '1fr'}
      bgImage={Background}
      maxH='full'
    >
      <GridItem p='10' maxH='100%' overflowY='scroll' pos='relative'>
        <VStack
          w='full'
          h='full'
          align='flex-start'
          spacing='0'
          color='white'
          maxH='full'
        >
          <Text fontSize='xx-large' fontWeight='bold'>
            Supercharge your sneaker sales
          </Text>
          <Text fontSize='5xl' fontWeight='black'>
            with CheB
          </Text>
          <Box h='5' />
          <Text bg='#2D84B840' px='3' py='3'>
            CheB is a DoorDash like sneaker marketplace that aims to help and
            scale local sneaker stores, with the joint-forces of blockchain and
            crypto!
          </Text>

          <VStack
            pt='5'
            w='full'
            align='flex-start'
            spacing='2'
            h='fit-content'
            pb='160px'
          >
            {(apiState === 'idle' || apiState === 'error') &&
              generateFields().map(item => renderChild(item))}
            {apiState === 'success' && (
              <Text
                bgGradient={'linear(to-br, #e309dc60, #0960e3)'}
                px='3'
                py='3'
                borderRadius='md'
                fontWeight='semibold'
                boxShadow={'1px 10px 21px 1px rgba(0,0,0,0.55)'}
              >
                Thank you for joining our waitlist! As a welcome gift, we will
                promote your products on our homepage and the{' '}
                <b>CheB Network</b> for 1 week straight, to boost your sales!
              </Text>
            )}
          </VStack>
        </VStack>
      </GridItem>
      {isLargerThan1200 && (
        <GridItem>
          <Image h='full' w='full' src={SneakerBanner} objectFit='contain' />
        </GridItem>
      )}
      {apiState !== 'success' && (
        <VStack
          h='130px'
          pos='absolute'
          bottom='0'
          w={isLargerThan1200 ? '50%' : 'full'}
          justify='center'
          px='10'
          bgGradient='linear(to-t, #151F90, #0c5b8d10)'
          zIndex={'99'}
        >
          <VStack w='full' h='full' justify='center'>
            <Button
              {...buttonStyle}
              onClick={submitForm}
              isDisabled={
                Object.keys(formState).length < generateFields().length - 2
              }
              isLoading={apiState === 'pending'}
              loadingText='Submitting...'
            >
              Join Waitlist
            </Button>
          </VStack>
        </VStack>
      )}
    </Grid>
  )
}

export default App
