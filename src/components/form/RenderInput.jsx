import React from 'react';
import { FormGroup, FormControl, ControlLabel, HelpBlock } from 'react-bootstrap';

const RenderInput = ({
  input,
  label,
  type,
  meta: {touched, error, warning}
}) => {
  return (
    <FormGroup bsSize="large" validationState={touched && error ? 'error' : null}>
      <ControlLabel>{label}</ControlLabel>
      <FormControl {...input} placeholder={label} type={type} />
      {!touched || 
        (error && <HelpBlock className="errormessage">{error}</HelpBlock>)}
    </FormGroup>
  );
};

export default RenderInput;