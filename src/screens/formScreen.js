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
  const [isLargerThan1200] = useMediaQuery('(min-width: 1200px)')
  const { renderForm, submitForm, formApiState, isFormValid, content } =
    useFormManager({
      formType: formType
    })

  return (
    <Grid
      gridTemplateColumns={isLargerThan1200 ? '1fr 1fr' : '1fr'}
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
            {content.title}
          </Text>
          <Text fontSize='5xl' fontWeight='black'>
            {content.subTitle}
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
            {renderForm()}
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
      {isLargerThan1200 && (
        <GridItem>
          <Image h='full' w='full' src={SneakerBanner} objectFit='contain' />
        </GridItem>
      )}
      {formApiState !== 'success' && (
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
