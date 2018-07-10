import React from 'react';
import { graphql, compose } from 'react-apollo';
import gql from 'graphql-tag';
import { Button, FormGroup, FormControl, ControlLabel, HelpBlock } from 'react-bootstrap';
import '../styles/UploadFile.css'

class UploadFile extends React.Component {
  state = {
    filename: {value: '', isValid: true, message: '', validState: null},
    selectedFile: null,
  }

  handleChange = (e) => {
    var state = this.state;
    switch (e.target.id) {
      case 'selectedFile':
        state.selectedFile = e.target.files[0];
        break;
      default:
        state[e.target.id].value = e.target.value;
        state[e.target.id].message = '';
        state[e.target.id].validState = null;
    }
    this.setState(state);
  }

  onSubmit = async (e) => {
    e.preventDefault();
    this.resetValidationStates();
    var state = this.state;
    const file = state.selectedFile;
    const name = state.filename.value;
    const filetype = 'RESUME';

    try {
      await this.props.uploadMutation({
        variables: {
          file,
          name,
          filetype,
        },
      });
      this.props.history.push(`/dashboard`);
    } catch (Error) {
      console.log(Error.message);
    }
  }

  resetValidationStates = () => {
    var state = this.state;

    Object.keys(state).map(key => {
      if (state[key].hasOwnProperty('isValid')) {
        state[key].isValid = true;
        state[key].message = '';
        state[key].validState = null;
      }
    });
    this.setState(state);
  }

  render() {
    const filename = this.state.filename;
    return (
      <div className="UploadFile">
        <form onSubmit={this.onSubmit}>
          <h2 className="form-signin-heading">Upload File</h2>
          <FormGroup controlId="filename" bsSize="large" validationState={filename.validState}>
            <ControlLabel>File Name</ControlLabel>
            <FormControl
              type="text"
              placeholder="Enter file name"
              value={filename.value}
              onChange={this.handleChange}
            />
            <FormControl.Feedback />
            <HelpBlock className="uploaderrormessage">{filename.message}</HelpBlock>
          </FormGroup>
          <FormGroup controlId="selectedFile" bsSize="large">
            <ControlLabel>File Upload</ControlLabel>
            <FormControl
              type="file"
              onChange={this.handleChange}
            />
          </FormGroup>
          <Button
            type="submit"
            block
            bsSize="large"
            primary="true"
          >
            Upload File
          </Button>
        </form>
      </div>
    )
  }
}

const UPLOAD_MUTATION = gql`
  mutation uploadFile($file: Upload!, $name: String!, $filetype: Filetype!) {
    uploadFile(file: $file, name: $name, filetype: $filetype) {
      id
    }
  }
`

export default compose(
  graphql(UPLOAD_MUTATION, { name: 'uploadMutation' }),
)(UploadFile);
