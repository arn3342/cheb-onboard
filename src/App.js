import './App.css'
import {
  Box,
  Button,
  HStack,
  Text,
  VStack,
  useMediaQuery
} from '@chakra-ui/react'
import Background from './assets/grad_new.png'
import { IoMdCheckmarkCircleOutline } from 'react-icons/io'
import { ButtonStyle } from './components/defaultStyles'
import { useEffect, useState } from 'react'
import FormScreen from './screens/formScreen'
import { initializeApp } from 'firebase/app'
import { firebaseConfig } from './firebaseConfig'
import { FiUpload } from 'react-icons/fi'

const _sectionData = [
  {
    id: 'buyer-section',
    title: 'Buy From CheB',
    props: [
      <>Get authentic sneakers from your nearest local stores or sellers</>,
      <>
        Join the <b>CheB Network</b> of thousands of Sneaker Enthusiasts
      </>,
      <>Get exclusive discounts of upto 30% on your purchases</>
    ]
  },
  {
    id: 'seller-section',
    title: 'Sell On CheB',
    props: [
      <>2X your sneaker sales, compete with GOAT, StockX</>,
      <>
        Get exclusively promoted on the <b>CheB Network</b> of thousands of
        buyers
      </>,
      <>Accept payment in 15+ methods, including crypto</>
    ]
  }
]

function App () {
  const [isLargerThan1000] = useMediaQuery('(min-width: 1000px)')
  const [formType, setFormType] = useState()
  const [firebaseApp, setFirebaseApp] = useState()

  function getMainHeight () {
    if (isLargerThan1000) {
      return 'full'
    } else return 'fit-content !important'
  }

  useEffect(() => {
    const app = initializeApp(firebaseConfig)
    setFirebaseApp(app)
  }, [])

  return (
    firebaseApp && (
      <Box
        id='main_app'
        h={'full'}
        overflow='scroll'
        w='full'
        bgImage={Background}
        bgRepeat='no-repeat'
        bgSize='100% 100%'
        py={'7'}
        px={!isLargerThan1000 && '5'}
      >
        {!formType ? (
          <HStack
            justify='center'
            align='center'
            h={isLargerThan1000 ? 'full' : 'max-content'}
            w='full'
            spacing={isLargerThan1000 ? '10' : '3'}
            flexWrap='wrap'
          >
            {_sectionData.map((data, index) => (
              <VStack
                key={data.id}
                h='max-content'
                w='450px'
                bg={index == 0 ? 'white' : 'black'}
                color={index == 0 ? 'black' : 'white'}
                px='7'
                py='7'
                borderRadius='md'
                spacing={'5'}
                role='group'
                transition='all 300ms'
                boxShadow='1px 10px 30px 5px rgba(0,0,0,0.1)'
                _hover={{
                  boxShadow: '1px 10px 30px 5px rgba(0,0,0,0.5)',
                  transform: 'scale(1.02)'
                }}
              >
                <VStack w='full' h='max-content' spacing='0' align='flex-start'>
                  <Text fontSize='lg' fontWeight='medium' lineHeight='1'>
                    I want to
                  </Text>
                  <Text fontSize='xx-large' fontWeight='bold'>
                    {data.title}
                  </Text>
                </VStack>
                <VStack spacing='2' w='full'>
                  {data.props.map((prop, usp_idx) => (
                    <HStack
                      justify='flex-start'
                      align='flex-start'
                      key={`usp_item_${usp_idx}`}
                    >
                      <IoMdCheckmarkCircleOutline
                        size='30'
                        color='green'
                        style={{
                          justifyContent: 'flex-start',
                          height: '25'
                        }}
                      />
                      <Text lineHeight='1.3' fontWeight='medium'>
                        {prop}
                      </Text>
                    </HStack>
                  ))}
                </VStack>
                <Button
                  {...ButtonStyle.inverted}
                  bg={index == 1 ? '#002de0' : 'black'}
                  borderWidth='thin'
                  borderColor='black'
                  boxShadow='1px 10px 30px 5px rgba(0,0,0,0.1)'
                  _hover={{
                    bg: 'white',
                    color: 'black',
                    boxShadow: '1px 10px 30px 5px rgba(0,0,0,0.5)'
                  }}
                  w='full'
                  onClick={() => setFormType(index == 0 ? 'buyer' : 'seller')}
                >
                  Join Now
                </Button>
              </VStack>
            ))}
          </HStack>
        ) : (
          <FormScreen formType={formType} firebaseApp={firebaseApp} />
        )}
      </Box>
    )
  )
}

export default App
