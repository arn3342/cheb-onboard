import {
  Box,
  Button,
  HStack,
  Image,
  Input,
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
import React, {
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState
} from 'react'
import MapComponent from './map'
import { InputStyle } from './defaultStyles'
import axios from 'axios'
import StateList from '../assets/stateList'
import MultiSelect from './multiSelect'
import { StringHelper } from '../extensions/stringHelper'
import { FiCamera, FiUpload } from 'react-icons/fi'
import {
  getDownloadURL,
  getStorage,
  ref as FrbStorageRef,
  uploadBytes
} from 'firebase/storage'
import { v4 as uuidv4 } from 'uuid'

const Seller_Fields = {
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

const Buyer_Fields = {
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
  'Choose Your interests': [
    {
      'Brands you like': {
        isMultiSelect: true,
        options: [
          { key: 'nike', value: 'Nike' },
          { key: 'puma', value: 'Puma' },
          { key: 'reebok', value: 'Reebok' },
          { key: 'vans', value: 'Vans' },
          { key: 'adidas', value: 'Adidas' }
        ]
      }
    }
  ]
}

const ImageContainer = ({ images, onNewImage }) => {
  // const [images, setImages] = useState([])
  function selectPhoto () {
    const el = document.getElementById('upload_file')
    el.click()
  }

  function addNewImage (e) {
    const file = e.target.files[0]
    onNewImage(file)
    // setImages(prev => [...prev, ])
  }

  function getImageSrc (img) {
    if (typeof img === 'string') return img
    else return URL.createObjectURL(img)
  }

  return (
    <HStack flexWrap='wrap' spacing='4'>
      {images?.map((img, index) => (
        <Image
          key={`sneaker_img_${index}`}
          h='80px'
          w='80px'
          borderRadius='md'
          src={getImageSrc(img)}
          bg='#2D84B830'
          objectFit={'contain'}
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

const SneakerModal = React.forwardRef(({ firebaseApp, onSuccess }, ref) => {
  const [isLargerThan1000] = useMediaQuery('(min-width: 1000px)')
  const [apiState, setApiState] = useState('idle')
  const uid = uuidv4()
  const SAMPLE_OBJ = {
    uid: uid,
    name: '',
    colorVariants: '',
    sizeVariants: '',
    images: []
  }
  const [sneakerData, setSneakerData] = useState(SAMPLE_OBJ)
  const [isOpen, setIsOpen] = useState(false)

  useImperativeHandle(ref, () => ({
    openModal,
    performEdit
  }))

  function performEdit (data) {
    setSneakerData(data)
    setIsOpen(true)
  }

  function openModal () {
    setIsOpen(true)
  }

  function onClose () {
    setSneakerData(SAMPLE_OBJ)
    setIsOpen(false)
  }

  function updateSneakerField (key, value) {
    setSneakerData(prev => ({ ...prev, [key]: value }))
  }

  function addNewImage (file) {
    setSneakerData(prev => ({
      ...prev,
      images: prev.images?.length > 0 ? [...prev.images, file] : [file]
    }))
  }

  async function submitForm () {
    console.log('Called...')
    setApiState('pending')
    const currentSneakerImgs = sneakerData.images
    const storage = getStorage(firebaseApp)
    const uploadImage = async image => {
      if (typeof image !== 'string') {
        const storageRef = FrbStorageRef(
          storage,
          `/sneakerImages/${Date.now()}-${image.name}`
        )

        const response = await uploadBytes(storageRef, image)
        const url = await getDownloadURL(response.ref)
        return url
      }
      return image
    }

    const imagePromises = Array.from(currentSneakerImgs, image =>
      uploadImage(image)
    )

    try {
      const imageRes = await Promise.all(imagePromises)
      setApiState('success')
      onSuccess({ ...sneakerData, images: imageRes })
      onClose()
      setApiState(SAMPLE_OBJ)
      console.log('Successfully uploaded sneaker')
    } catch (ex) {
      console.log('Upload error:', ex)
      setApiState('error')
    }
  }

  const isFormValid = !StringHelper.isPropsEmpty(sneakerData)

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size={isLargerThan1000 ? 'md' : 'full'}
    >
      <ModalOverlay />
      <ModalContent bg='#242424' color={'white'}>
        <ModalHeader>List your sneakers</ModalHeader>
        <ModalCloseButton onClick={onClose} />
        <ModalBody>
          <VStack spacing='2' w='full' align='left'>
            <Text>
              List your sneakers now and when CheB goes live, you will find all
              your sneakers on the live store!
            </Text>
            <Box h='2' />
            <Input
              placeholder='Sneaker Name'
              {...InputStyle}
              value={sneakerData.name}
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
                Separate each variant with a comma. <br /> <b>Example:</b>{' '}
                Red,Green,Blue
              </Text>
              <Input
                {...InputStyle}
                placeholder='Color Variants'
                size='sm'
                value={sneakerData.colorVariants}
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
                Separate each variant with a comma. <br /> <b>Example:</b> 6,7,8
              </Text>
              <Input
                {...InputStyle}
                placeholder='Size Variants'
                size='sm'
                value={sneakerData.sizeVariants}
                onChange={e =>
                  updateSneakerField('sizeVariants', e.target.value)
                }
              />
            </VStack>
            <Box h='3' />
            <ImageContainer
              images={sneakerData.images}
              onNewImage={addNewImage}
            />
          </VStack>
        </ModalBody>

        <ModalFooter pt='8' pb='4'>
          <Button
            bg='#03a61c'
            color='white'
            w='full'
            onClick={submitForm}
            isDisabled={!isFormValid}
            isLoading={apiState === 'pending'}
            loadingText='Uploading Sneaker...'
            _focus={{
              bg: '#057816'
            }}
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
  )
})

/**
 *
 * @param {Object} props
 * @param {'seller' | 'buyer'} props.formType
 * @returns
 */
const useFormManager = ({ formType, firebaseApp }) => {
  const [formState, setFormState] = useState({})
  const [apiState, setApiState] = useState('idle')
  const [isFormValid, setIsFormValid] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [sneakers, setSneakers] = useState([])
  const sneakerModalRef = useRef()

  const _contents = {
    seller: {
      title: 'Supercharge your sneaker sales',
      subTitle: 'With CheB'
    },
    buyer: {
      title: 'Get authentic sneakers, at your doorstep',
      subTitle: 'from CheB'
    }
  }

  const content = _contents[formType]

  useEffect(() => {
    const requiredFields = generateFields().filter(
      x => x.type !== 'label'
    ).length
    setIsFormValid(
      (Object.keys(formState).length == requiredFields ||
        Object.keys(formState).length > requiredFields) &&
        !StringHelper.hasEmptyNestedProperties(formState)
    )
  }, [formState])

  function triggerModal () {
    sneakerModalRef.current?.openModal()
  }

  function generateFields () {
    const _formObject = formType === 'seller' ? Seller_Fields : Buyer_Fields
    const _fields = []

    const _fieldType = fieldObject => {
      if (Array.isArray(Object.values(fieldObject)[0])) return 'select'
      else if (
        Object.values(fieldObject)[0].hasOwnProperty('lat') &&
        Object.values(fieldObject)[0].hasOwnProperty('lng')
      )
        return 'map'
      else if (
        Object.values(fieldObject)[0].hasOwnProperty('isMultiSelect') &&
        Object.values(fieldObject)[0].hasOwnProperty('options')
      )
        return 'select-multi'
    }

    Object.keys(_formObject).map(parentKey => {
      _fields.push({ name: parentKey, type: 'label' })

      _formObject[parentKey].map(field => {
        if (typeof field === 'string' || field instanceof String) {
          _fields.push({ name: field, type: 'input' })
        } else {
          _fields.push({
            name: Object.keys(field)[0],
            type: _fieldType(field),
            options:
              _fieldType(field) === 'select'
                ? Object.values(field)[0]
                : _fieldType(field) === 'select-multi'
                ? Object.values(field)[0].options
                : null
          })
        }
      })
    })

    return _fields
  }

  const renderField = data => {
    const state_key_name = data.name.toLowerCase().replace(' ', '_')
    const child_types = {
      input: (
        <Input
          key={data.name}
          placeholder={data.name}
          value={formState[data?.name]}
          onChange={e => {
            setFormState(prev => ({
              ...prev,
              [state_key_name]: e.target.value
            }))
          }}
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
          onChange={e => {
            setFormState(prev => ({
              ...prev,
              [state_key_name]: e.target.value
            }))
          }}
          value={formState[data?.name]}
        >
          {data?.options?.map(opt => (
            <option key={opt.key} value={opt.value}>
              {opt.value}
            </option>
          ))}
        </Select>
      ),
      'select-multi': (
        <MultiSelect
          options={data?.options}
          onChange={values => {
            setFormState(prev => ({
              ...prev,
              liked_brands: values
            }))
          }}
        />
      )
    }

    return child_types[data.type]
  }

  async function submitForm () {
    console.log('Form is:', { ...formState, sneakers })
    setApiState('pending')
    const data = {}
    if (formType === 'seller') data.sellerData = { ...formState, sneakers }
    else data.buyerData = formState
    axios
      .post('https://backend.sheehanrahman.com/api/cheb', {
        ...data
      })
      .then(res => res.status == 200 && setApiState('success'))
      .catch(res => setApiState('error'))
  }

  function addSneaker (data) {
    const flatten = [...sneakers]
    const existingIdx = flatten.findIndex(x => x.uid === data.uid)
    if (existingIdx < 0) {
      setSneakers(prev => [...prev, data])
    } else {
      const existing = { ...flatten[existingIdx], ...data }
      flatten[existingIdx] = existing
      setSneakers(flatten)
    }
  }

  function editSneaker (data) {
    sneakerModalRef.current?.performEdit(data)
  }

  const SneakerListItem = ({ snkr, index }) => (
    <HStack
      key={`sneaker_listing_${index}`}
      bg='white'
      borderRadius='md'
      px='2'
      py='2'
      w='full'
      color='black'
      spacing='4'
      onClick={() => editSneaker(snkr)}
    >
      <Image h='40px' w='40px' borderRadius='md' src={snkr.images[0]} />
      <VStack spacing='0' align='flex-start'>
        <Text fontSize='large'>{snkr.name}</Text>
        <Text fontSize='xs'>
          <b>Multiple Variants</b> - Click to edit
        </Text>
      </VStack>
    </HStack>
  )

  function renderForm () {
    return (
      <>
        {(apiState === 'idle' || apiState === 'error') &&
          generateFields().map(item => renderField(item))}

        {apiState !== 'success' &&
          sneakers?.map((snkr, index) => (
            <SneakerListItem snkr={snkr} index={index} />
          ))}
        <Box h='2' />

        <SneakerModal
          ref={sneakerModalRef}
          firebaseApp={firebaseApp}
          onSuccess={addSneaker}
        />

        {formType === 'seller' && apiState !== 'success' && (
          <Button leftIcon={<FiUpload />} w='full' onClick={triggerModal}>
            Click to upload Sneakers
          </Button>
        )}
      </>
    )
  }

  return {
    renderForm,
    submitForm,
    formApiState: apiState,
    isFormValid,
    content
  }
}

export default useFormManager
