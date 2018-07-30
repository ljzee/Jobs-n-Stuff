import React from 'react';
import { FormGroup, HelpBlock, Radio } from 'react-bootstrap';

const RenderRadioGroup = ({ input, helpBlock, options, meta: {touched, error} }) => {
  return (
    <FormGroup>
      {options.map(option => (
        <Radio
          {...input}
          key={option.value}
          inline
          value={option.value}
          checked={input.value === option.value}
        >{option.label}</Radio>
      ))}
      {!touched || 
        (error && <HelpBlock className="errormessage">{error}</HelpBlock>)}
      {helpBlock ? 
        <HelpBlock className="radioHelp">{helpBlock}</HelpBlock> 
        : 
        null
      }
    </FormGroup>       
  );
};



export default RenderRadioGroup;