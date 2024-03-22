import {
  Box,
  Button,
  Grid,
  GridItem,
  HStack,
  IconButton,
  Image,
  Input,
  InputGroup,
  InputLeftElement,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  Text,
  VStack,
  useMediaQuery
} from '@chakra-ui/react'
import useFormManager from '../components/useFormManager'
import SneakerBanner from '../assets/sneaker_banner.png'
import { ButtonStyle, InputStyle } from '../components/defaultStyles'
import { FiCamera, FiPlus, FiUpload } from 'react-icons/fi'
import { useState } from 'react'
import { getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage'
import { StringHelper } from '../extensions/stringHelper'

const ImageContainer = ({ images, onNewImage }) => {
  // const [images, setImages] = useState([])
  function selectPhoto () {
    const el = document.getElementById('upload_file')
    el.click()
  }

  function addNewImage (e) {
    const file = e.target.files[0]
    onNewImage({ file: file, blobUrl: URL.createObjectURL(file) })
    // setImages(prev => [...prev, ])
  }

  return (
    <HStack flexWrap='wrap' spacing='4'>
      {images?.map((img, index) => (
        <Image
          key={`sneaker_img_${index}`}
          h='80px'
          w='80px'
          borderRadius='md'
          src={img.blobUrl}
          bg='#2D84B830'
        />
      ))}
      <VStack
        w='83px'
        h='80px'
        borderRadius='md'
        justify='center'
        bg='#2D84B840'
        onClick={selectPhoto}
        cursor='pointer'
        transition='all 300ms'
        _hover={{
          bg: '#2D84B870'
        }}
      >
        <FiCamera />
        <Text fontSize='xs' fontWeight='semibold'>
          Add Photo
        </Text>
      </VStack>
      <Input
        id='upload_file'
        type='file'
        hidden
        accept='image/*'
        onChange={addNewImage}
      />
    </HStack>
  )
}

/**
 *
 * @param {Object} props
 * @param {'seller' | 'buyer'} props.formType
 * @returns
 */
const FormScreen = ({ formType, firebaseApp }) => {
  const [isLargerThan1000] = useMediaQuery('(min-width: 1000px)')
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const {
    renderForm,
    submitForm,
    formApiState,
    isFormValid,
    content,
    injectContent
  } = useFormManager({
    formType: formType
  })

  const [sneakers, setSneakers] = useState([])
  const [currSneakerIdx, setCurrSneakerIdx] = useState(0)
  const [modalUploading, setModalUploading] = useState(false)

  function updateSneakerField (key, value) {
    const flatten = [...sneakers]
    const snkr = flatten[currSneakerIdx]
    snkr[key] = value

    setSneakers(flatten)
  }

  function isFormFilled () {
    const currentSnkr = sneakers[currSneakerIdx]
    if (sneakers.length > 0) {
      return (
        currentSnkr.name &&
        currentSnkr.colorVariants &&
        currentSnkr.sizeVariants &&
        currentSnkr.images?.length > 0
      )
    }
    return false
  }

  function switchModal () {
    if (sneakers.length <= 0) {
      setSneakers([{}])
    } else if (isFormFilled()) {
      setSneakers(prev => [
        ...prev,
        {
          name: '',
          colorVariants: '',
          sizeVariants: '',
          images: []
        }
      ])
    }
    setCurrSneakerIdx(sneakers.length)
    setIsUploadModalOpen(true)
  }

  function closeModal () {
    setIsUploadModalOpen(false)
  }

  function addNewSneakerImage (imageFile) {
    const flatten = [...sneakers]
    const snkr = flatten[currSneakerIdx]
    if (snkr.images?.length > 0) {
      snkr.images.push(imageFile)
    } else {
      snkr.images = [imageFile]
    }
    setSneakers(flatten)
  }

  async function uploadSneaker () {
    setModalUploading(true)
    const currentSneakerImgs = sneakers[currSneakerIdx].images
    const storage = getStorage(firebaseApp)
    const uploadImage = async image => {
      const storageRef = ref(
        storage,
        `/sneakerImages/${Date.now()}-${image.file.name}`
      )

      const response = await uploadBytes(storageRef, image.file)
      const url = await getDownloadURL(response.ref)
      return url
    }

    const imagePromises = Array.from(currentSneakerImgs, image =>
      uploadImage(image)
    )

    try {
      const imageRes = await Promise.all(imagePromises)
      const sneaker_data = {
        snakers: sneakers.map(obj => ({
          ...obj,
          images: imageRes
        }))
      }
      injectContent(sneaker_data)
      setIsUploadModalOpen(false)
    } catch (ex) {}
    setModalUploading(false)
    // return imageRes
  }

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
            <Box h='2' />
            <Modal
              isOpen={isUploadModalOpen}
              onClose={closeModal}
              size={isLargerThan1000 ? 'md' : 'full'}
            >
              <ModalOverlay />
              <ModalContent bg='#242424' color={'white'}>
                <ModalHeader>List your sneakers</ModalHeader>
                <ModalCloseButton onClick={closeModal} />
                <ModalBody>
                  <VStack spacing='2' w='full' align='left'>
                    <Text>
                      List your sneakers now and when CheB goes live, you will
                      find all your sneakers on the live store!
                    </Text>
                    <Box h='2' />
                    <Input
                      placeholder='Sneaker Name'
                      {...InputStyle}
                      value={sneakers[currSneakerIdx]?.name}
                      onChange={e => updateSneakerField('name', e.target.value)}
                    />
                    <VStack
                      p='2'
                      borderWidth='thin'
                      borderStyle='dashed'
                      borderColor='gray.600'
                      borderRadius='md'
                      align='left'
                    >
                      <Text fontSize='xs'>
                        Separate each variant with a comma. <br />{' '}
                        <b>Example:</b> Red,Green,Blue
                      </Text>
                      <Input
                        {...InputStyle}
                        placeholder='Color Variants'
                        size='sm'
                        value={sneakers[currSneakerIdx]?.colorVariants}
                        onChange={e =>
                          updateSneakerField('colorVariants', e.target.value)
                        }
                      />
                    </VStack>
                    <VStack
                      p='2'
                      borderWidth='thin'
                      borderStyle='dashed'
                      borderColor='gray.600'
                      borderRadius='md'
                      align='left'
                    >
                      <Text fontSize='xs'>
                        Separate each variant with a comma. <br />{' '}
                        <b>Example:</b> 6,6.5,7,8
                      </Text>
                      <Input
                        {...InputStyle}
                        placeholder='Size Variants'
                        size='sm'
                        value={sneakers[currSneakerIdx]?.sizeVariants}
                        onChange={e =>
                          updateSneakerField('sizeVariants', e.target.value)
                        }
                      />
                    </VStack>
                    <Box h='3' />
                    <ImageContainer
                      images={sneakers[currSneakerIdx]?.images}
                      onNewImage={addNewSneakerImage}
                    />
                  </VStack>
                </ModalBody>

                <ModalFooter pt='8' pb='4'>
                  <Button
                    bg='#03a61c'
                    color='white'
                    w='full'
                    onClick={uploadSneaker}
                    isDisabled={!isFormFilled()}
                    loadingText='Uploading Photos...'
                    _focus={{
                      bg: '#057816'
                    }}
                    isLoading={modalUploading}
                    _disabled={{
                      bg: '#057816'
                    }}
                    _active={{
                      bg: '#057816'
                    }}
                    _hover={{
                      bg: '#057816'
                    }}
                  >
                    Upload 1 sneaker
                  </Button>
                </ModalFooter>
              </ModalContent>
            </Modal>

            {formApiState !== 'success' && (
              <Button leftIcon={<FiUpload />} w='full' onClick={switchModal}>
                Click to upload Sneakers
              </Button>
            )}
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
