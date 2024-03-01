import {
  Box,
  Button,
  Grid,
  GridItem,
  Image,
  Text,
  VStack,
  useMediaQuery
} from '@chakra-ui/react'
import useFormManager from '../components/useFormManager'
import SneakerBanner from '../assets/sneaker_banner.png'
import { ButtonStyle } from '../components/defaultStyles'

/**
 *
 * @param {Object} props
 * @param {'seller' | 'buyer'} props.formType
 * @returns
 */
const FormScreen = ({ formType }) => {
  const [isLargerThan1000] = useMediaQuery('(min-width: 1000px)')
  const { renderForm, submitForm, formApiState, isFormValid, content } =
    useFormManager({
      formType: formType
    })

  return (
    <Grid
      gridTemplateColumns={isLargerThan1000 ? '1fr 1fr' : '1fr'}
      maxH={isLargerThan1000 ? 'full' : 'fit-content'}
    >
      <GridItem
        p='10'
        pb={isLargerThan1000 ? '10' : 0}
        px={isLargerThan1000 ? '10' : 0}
        maxH='100%'
        overflowY='scroll'
        pos='relative'
      >
        <VStack
          w='full'
          h='full'
          align='flex-start'
          spacing='0'
          color='white'
          maxH='full'
        >
          <Text
            fontSize={isLargerThan1000 ? 'xx-large' : 'lg'}
            fontWeight='bold'
          >
            {content.title}
          </Text>
          <Text
            fontSize={isLargerThan1000 ? '5xl' : 'xx-large'}
            fontWeight='black'
          >
            {content.subTitle}
          </Text>
          <Box h='5' />
          <Text
            bg='#2D84B840'
            px='3'
            py='3'
            fontSize={isLargerThan1000 ? 'md' : 'sm'}
          >
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
            pb={isLargerThan1000 ? '160px' : 0}
          >
            {renderForm()}
            {!isLargerThan1000 && formApiState !== 'success' && (
              <VStack w='full' justify='center' pt='10'>
                <Button
                  {...ButtonStyle}
                  onClick={submitForm}
                  isDisabled={!isFormValid}
                  isLoading={formApiState === 'pending'}
                  loadingText='Submitting...'
                >
                  Join Waitlist
                </Button>
              </VStack>
            )}
            {formApiState === 'success' && (
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
      {isLargerThan1000 && (
        <GridItem>
          <Image h='full' w='full' src={SneakerBanner} objectFit='contain' />
        </GridItem>
      )}
      {isLargerThan1000 && formApiState !== 'success' && (
        <VStack
          h='130px'
          pos={'absolute'}
          bottom='0'
          w={isLargerThan1000 ? '50%' : 'full'}
          justify='center'
          px='10'
          bgGradient='linear(to-t, #151F90, #0c5b8d10)'
          zIndex={'99'}
        >
          <VStack w='full' h='full' justify='center'>
            <Button
              {...ButtonStyle}
              onClick={submitForm}
              isDisabled={!isFormValid}
              isLoading={formApiState === 'pending'}
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

export default FormScreen
