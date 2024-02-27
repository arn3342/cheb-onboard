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
import { useState } from 'react'
import axios from 'axios'
import MapComponent from './components/map'
import { ButtonStyle, InputStyle } from './components/defaultStyles'
import StateList from './assets/stateList'


const Form_Fields = {
  'Basic Information': [
    'First Name',
    'Last Name',
    'Contact Email',
    'Billing Address',
    {
      'Billing State': StateList
    },
    'Billing Zip'
  ],
  'Store Information': [
    'Store Name',
    'Store Description',
    { 'Store Street Address': { lat: 0, lng: 0 } },
    { 'Store State': StateList },
    'Store Zip',
    'Support Email',
    {
      'Store Type': [
        { key: 'store', value: 'Store Owner' },
        { key: 'reseller', value: 'Independent Reseller' }
      ]
    }
  ]
}

function generateFields () {
  const _fields = []

  const _fieldType = fieldObject => {
    if (Array.isArray(Object.values(fieldObject)[0])) return 'select'
    else if (
      Object.values(fieldObject)[0].hasOwnProperty('lat') &&
      Object.values(fieldObject)[0].hasOwnProperty('lng')
    )
      return 'map'
  }

  Object.keys(Form_Fields).map(parentKey => {
    _fields.push({ name: parentKey, type: 'label' })

    Form_Fields[parentKey].map(field => {
      if (typeof field === 'string' || field instanceof String) {
        _fields.push({ name: field, type: 'input' })
      } else {
        _fields.push({
          name: Object.keys(field)[0],
          type: _fieldType(field),
          options: _fieldType(field) === 'select' ? Object.values(field)[0] : null
        })
      }
    })
  })

  return _fields
}

function App () {
  const [formState, setFormState] = useState({})
  const [apiState, setApiState] = useState('idle')
  const [isLargerThan1200] = useMediaQuery('(min-width: 1200px)')

  const renderChild = data => {
    const state_key_name = data.name.toLowerCase().replace(' ', '_')
    const child_types = {
      input: (
        <Input
          key={data.name}
          placeholder={data.name}
          value={formState[data?.name]}
          onChange={e =>
            setFormState(prev => ({ ...prev, [state_key_name]: e.target.value }))
          }
          autoComplete='off'
          {...InputStyle}
        />
      ),
      map: (
        <MapComponent
          defaultValue={formState.store_address}
          onChangeLocation={({ lat, lng }) =>
            setFormState(prev => ({
              ...prev,
              store_address: {
                lat: lat,
                lng: lng
              }
            }))
          }
        />
      ),
      label: <Text fontSize='medium'>{data.name}</Text>,
      select: (
        <Select
          {...InputStyle}
          placeholder={`Select ${data.name}`}
          onChange={e =>
            setFormState(prev => ({ ...prev, [state_key_name]: e.target.value }))
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
              {...ButtonStyle}
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
