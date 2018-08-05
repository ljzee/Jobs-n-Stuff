import React from 'react';
import { Button } from 'react-bootstrap';
import { Field } from 'redux-form'
import RenderInput from './RenderInput';
import RenderRadioGroup from './RenderRadioGroup';

const ValidationForm = props => {
  const { handleSubmit, fields, submitText } = props;
  return (
    <form onSubmit={handleSubmit}>
    {
      fields.map(field => {
        switch(field.type) {
          case 'radio':
            return (
              <Field 
                key={field.name}
                name={field.name}
                options={field.options}
                component={RenderRadioGroup}
                value={field.options[0].value}
                helpBlock={field.helpBlock}
              />
            );
          default:
            return (
              <Field 
                key={field.name}
                name={field.name}
                type={field.type}
                component={RenderInput}
                label={field.label}
              />
            );
        }
      })
    }
    <Button
      type="submit"
      block
      bsSize="large"
      bsStyle="primary"
      style={{
        margin: '0 auto'
      }}
    >
      {submitText}
    </Button>
  </form>
  )
}

export default ValidationForm;