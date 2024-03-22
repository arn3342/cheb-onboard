import {
  Button,
  HStack,
  Input,
  Select,
  Text,
  useMediaQuery
} from '@chakra-ui/react'
import { useEffect, useMemo, useState } from 'react'
import MapComponent from './map'
import { InputStyle } from './defaultStyles'
import axios from 'axios'
import StateList from '../assets/stateList'
import MultiSelect from './multiSelect'
import { StringHelper } from '../extensions/stringHelper'

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

/**
 *
 * @param {Object} props
 * @param {'seller' | 'buyer'} props.formType
 * @returns
 */
const useFormManager = ({ formType }) => {
  const [formState, setFormState] = useState({})
  const [apiState, setApiState] = useState('idle')
  const [isFormValid, setIsFormValid] = useState(false)

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
    console.log('Form is:', formState)
    setApiState('pending')
    const data = {}
    if (formType === 'seller') data.sellerData = formState
    else data.buyerData = formState
    axios
      .post('https://backend.sheehanrahman.com/api/cheb', {
        ...data
      })
      .then(res => res.status == 200 && setApiState('success'))
      .catch(res => setApiState('error'))
  }

  function renderForm () {
    if (apiState === 'idle' || apiState === 'error') {
      return generateFields().map(item => renderField(item))
    }
  }

  function injectContent (newObject) {
    setFormState(prev => ({ ...prev, ...newObject }))
  }

  return {
    renderForm,
    submitForm,
    formApiState: apiState,
    isFormValid,
    content,
    injectContent
  }
}

export default useFormManager
