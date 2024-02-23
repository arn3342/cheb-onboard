import stateList from './stateList.json'
function SampleObject_Struct () {
  const states = Object.keys(stateList).map(key => ({
    key: key,
    value: stateList[key]
  }))
  return {
    seller_information: {
      first_Name: 'Aousaf',
      last_Name: 'Rashid',
      contact_email: '',
      billing_address: '651N Broad St.',
      billing_zip: '19709',
      billing_state: states
    },
    store_information: {
      store_name: 'Byte Store',
      store_description: 'ABC <this field is optional>',
      store_address: { lat: 12, lng: '' },
      store_street_address: '',
      store_zip: '19709',
      store_state: states,
      support_email: '',
      store_type: [
        { key: 'store', value: 'Store Owner' },
        { key: 'reseller', value: 'Independent Reseller' }
      ]
    }
  }
}
export default SampleObject_Struct
