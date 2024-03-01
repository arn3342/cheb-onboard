import { Button, HStack } from '@chakra-ui/react'
import { useState } from 'react'
import { FaCheck } from 'react-icons/fa6'

const MultiSelect = ({ options, onChange }) => {
  const [selected, setSelected] = useState([])

  const _isSelected = key => selected.includes(key)

  function performSelection ({ key, value }) {
    const _spread = [...selected]
    if (_isSelected(key)) {
      const idx = _spread.findIndex(x => x === key )
      _spread.splice(idx, 1)
    } else {
      _spread.push(key)
    }
    setSelected(_spread)
    onChange(_spread)
  }
  return (
    <HStack w='full' h='max-content' spacing='2' flexWrap='wrap'>
      {options?.map(opt => (
        <Button
          key={opt.key}
          py='0'
          px='5'
          size='sm'
          bg={_isSelected(opt.key) ? 'black' : 'white'}
          color={_isSelected(opt.key) ? 'white' : 'black'}
          _hover={{ bg: 'black', color: 'white' }}
          transition='all 300ms'
          pl={_isSelected(opt.key) ? '15px' : '10px'}
          leftIcon={
            <FaCheck
              size={_isSelected(opt.key) ? '13px' : '0px'}
              style={{
                transition: 'all 300ms'
              }}
            />
          }
          onClick={() => performSelection(opt)}
        >
          {opt.value}
        </Button>
      ))}
    </HStack>
  )
}

export default MultiSelect
