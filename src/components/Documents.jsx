import React, { Component } from 'react';
import { Redirect } from 'react-router';
import gql from 'graphql-tag';
import { graphql, compose } from 'react-apollo';
import { withApollo } from 'react-apollo';
import { withRouter } from 'react-router-dom';
import Loading from './Loading';
import ReactTable from "react-table";
import moment from 'moment'
import { Col, Form, Button, FormGroup, FormControl, ControlLabel, HelpBlock, Panel, Modal } from 'react-bootstrap';
import 'react-table/react-table.css'
import '../styles/Documents.css';

const fileTypeMap = {
  'RESUME': 'Resume',
  'COVERLETTER': 'Cover Letter',
  'TRANSCRIPT': 'Transcript',
  'PROFILEIMAGE': 'Profile Image'
}

const validationFields = ['resume', 'coverletter', 'transcript', 'other'];

class Documents extends Component {

  state = {
    showModal: false,
    deleteFilePath: '',
    uploadMode: false,
    summary: '',
    documents: [],
    resume: {value: '', isValid: true, message: '', validState: null, document: null, filetype: 'RESUME'},
    coverletter: {value: '', isValid: true, message: '', validState: null, document: null, filetype: 'COVERLETTER'},
    transcript: {value: '', isValid: true, message: '', validState: null, document: null, filetype: 'TRANSCRIPT'},
    other: {value: '', isValid: true, message: '', validState: null, document: null, filetype: 'OTHER'}
  }

  getDocuments = () => {
    let docs = []

    for (let i = 0; i < this.props.userQuery.user.files.length; i++) {
      let file = this.props.userQuery.user.files[i];
      let doc = {};
      doc.name = file.name;
      doc.filename = file.filename;
      doc.updatedAt = file.updatedAt;
      doc.path = file.path;
      doc.filetype = fileTypeMap[file.filetype];
      if (file.filetype !== 'PROFILEIMAGE') {
        docs.push(doc);
      }
    }

    return docs;
  }

  openModal = (path) => {
    let state = this.state;
    state.showModal = true;
    state.deleteFilePath = path;
    this.setState(state);
  }

  closeModal = () => {
    let state = this.state;
    state.showModal = false;
    state.deleteFilePath = '';
    this.setState(state);
  }

  deleteFile = async (e) => {
    e.preventDefault();
    let state = this.state;
    const path = state.deleteFilePath;

    await this.props.deleteFile({
      variables: {
        path
      }
    });

    this.props.client.resetStore().then(() => {
      this.setState({
        showModal: false,
        deleteFilePath: ''
      })
    });
  }

  handleChange = (e) => {
    let state = this.state;

    switch (e.target.id) {
      case 'resumeFile':
        state.resume.document = e.target.files[0];
        break;
      case 'coverletterFile':
        state.coverletter.document = e.target.files[0];
        break;
      case 'transcriptFile':
        state.transcript.document = e.target.files[0];
        break;
      case 'otherFile':
        state.other.document = e.target.files[0];
        break;
      default:
        state[e.target.id].value = e.target.value;
        state[e.target.id].isValid = true;
        state[e.target.id].message = '';
        state[e.target.id].validState = null;
    }

    this.setState(state);
  }

  formIsValid = () => {
    let state = this.state;

    for (let i = 0; i < validationFields.length; i++) {
      let key = validationFields[i];
      if (!state[key].isValid) return false;
    }

    return true;
  }

  buttonDisabled = () => {
    return this.formIsValid() ? false : true;
  }

  resetValidationStates = () => {
    let state = this.state;

    for (let i = 0; i < validationFields.length; i++) {
      let key = validationFields[i];

      state[key].isValid = true;
      state[key].message = '';
      state[key].validState = null;
    }

    this.setState(state);
  }

  resetFields = () => {
    let state = this.state;

    for (let i = 0; i < validationFields.length; i++) {
      let key = validationFields[i];

      state[key].value = '';
      state[key].document = null;
    }

    state.documents = [];
    state.summary = '';

    this.setState(state);
  }

  setDocuments = () => {
    let state = this.state;

    for (let i = 0; i < validationFields.length; i++) {
      let key = validationFields[i];
      if (state[key].document !== null) {
        let document = {
          name: state[key].value,
          filetype: state[key].filetype,
          file: state[key].document,
          mimetype: state[key].document.type,
          size: state[key].document.size,
          fieldId: key,
          filename: state[key].document.name
        }
        state.documents.push(document);
      }
    }

    this.setState(state);
  }

  onSubmit = async (e) => {
    e.preventDefault();
    this.resetValidationStates();
    this.setDocuments();
    let state = this.state;

    if (state.documents.length > 0) {
      const uploadMultipleResult = await this.props.uploadsMutation({
        variables: {
          files: state.documents
        },
      });
      if (uploadMultipleResult.data.uploadFiles.success) {
        state.uploadMode = false;
        state.documents = [];
        this.props.client.resetStore().then(() => {
          this.setState(state);
        });
      } else {
        for (let i = 0; i < uploadMultipleResult.data.uploadFiles.errors.length; i++) {
          const error = uploadMultipleResult.data.uploadFiles.errors[i];
          const key = error.fieldId;
          const message = error.message;
          state[key].isValid = false;
          state[key].message = message;
          state[key].validState = "error";
        }
        state.documents = [];
        this.setState(state);
      }
    } else {
      this.setState({ summary: 'No documents selected' });
    }
  }

  render() {

    if (this.props.userQuery.loading) {
      return <Loading />;
    }

    if (this.props.userQuery.error) {
      return <Redirect to='/login'/>;
    }

    if (this.props.userQuery.user.username !== this.props.match.params.username) {
      return <Redirect to='/dashboard'/>;
    }

    const columns = [
      {
        Header: () => <div><strong>Document Name</strong></div>,
        accessor: 'name',
        width: 200
      },
      {
        Header: () => <div><strong>File Type</strong></div>,
        accessor: 'filetype',
        width: 125
      },
      {
        id: 'updatedAt',
        Header: () => <div><strong>Date Uploaded</strong></div>,
        accessor: props => moment(props.updatedAt).format('DD/MM/YYYY h:mm a'),
        width: 175
      },
      {
        accessor: 'path',
        Cell: props =>
        <div className="button-div">
          <a href={props.value} className="btn btn-info" role="button" target="_blank">View</a>
          <a
            href={props.value}
            className="btn btn-info"
            role="button"
            download={props.original.filename}
          >
            Download
          </a>
          <a
            className="btn btn-info"
            role="button"
            onClick={ () => this.openModal(props.value) }
          >
            Delete
          </a>
        </div>
      }
    ];

    var { documents } = this.state;
    documents = this.getDocuments();

    return (
      <div className="documents">
        {this.state.uploadMode &&
          <Panel>
            <Panel.Heading>
              <Panel.Title componentClass="h3">Upload Documents</Panel.Title>
            </Panel.Heading>
            <p className="helper-text">Note: All documents must be pdf's</p>
            {this.state.summary !== '' && <p className="errormessage documents-message">{this.state.summary }</p>}
            <Form horizontal>
              <FormGroup controlId="resume" validationState={this.state.resume.validState}>
                <Col componentClass={ControlLabel} sm={2}>
                  Resume:
                </Col>
                <Col sm={10}>
                  <FormControl
                    type="text"
                    placeholder="Document name"
                    value={this.state.resume.value}
                    onChange={this.handleChange}
                  />
                  <FormGroup controlId="resumeFile">
                    <FormControl
                      type="file"
                      className="file-upload"
                      onChange={this.handleChange}
                    />
                  </FormGroup>
                  <FormControl.Feedback />
                  <HelpBlock className="errormessage">{this.state.resume.message}</HelpBlock>
                </Col>
              </FormGroup>
              <FormGroup controlId="coverletter" validationState={this.state.coverletter.validState}>
                <Col componentClass={ControlLabel} sm={2}>
                  Cover Letter:
                </Col>
                <Col sm={10}>
                  <FormControl
                    type="text"
                    placeholder="Document name"
                    value={this.state.coverletter.value}
                    onChange={this.handleChange}
                  />
                  <FormGroup controlId="coverletterFile">
                    <FormControl
                      type="file"
                      className="file-upload"
                      onChange={this.handleChange}
                    />
                  </FormGroup>
                  <FormControl.Feedback />
                  <HelpBlock className="errormessage">{this.state.coverletter.message}</HelpBlock>
                </Col>
              </FormGroup>
              <FormGroup controlId="transcript" validationState={this.state.transcript.validState}>
                <Col componentClass={ControlLabel} sm={2}>
                  Transcript:
                </Col>
                <Col sm={10}>
                  <FormControl
                    type="text"
                    placeholder="Document name"
                    value={this.state.transcript.value}
                    onChange={this.handleChange}
                  />
                  <FormGroup controlId="transcriptFile">
                    <FormControl
                      type="file"
                      className="file-upload"
                      onChange={this.handleChange}
                    />
                  </FormGroup>
                  <FormControl.Feedback />
                  <HelpBlock className="errormessage">{this.state.transcript.message}</HelpBlock>
                </Col>
              </FormGroup>
              <FormGroup controlId="other" validationState={this.state.other.validState}>
                <Col componentClass={ControlLabel} sm={2}>
                  Other:
                </Col>
                <Col sm={10}>
                  <FormControl
                    type="text"
                    placeholder="Document name"
                    value={this.state.other.value}
                    onChange={this.handleChange}
                  />
                  <FormGroup controlId="otherFile">
                    <FormControl
                      type="file"
                      className="file-upload"
                      onChange={this.handleChange}
                    />
                  </FormGroup>
                  <FormControl.Feedback />
                  <HelpBlock className="errormessage">{this.state.other.message}</HelpBlock>
                </Col>
              </FormGroup>
            </Form>
          </Panel>
        }
        {!this.state.uploadMode &&
          <ReactTable
            className="-striped"
            data={documents}
            columns={columns}
            minRows={5}
            showPagination={false}
            noDataText='No documents found'
            style={{
              borderRadius: "5px",
              overflow: "hidden",
              padding: "5px",
              textAlign: "center"
            }}
          />
        }
        {this.state.uploadMode
          ? <div>
              <Button
                type="submit"
                bsSize="large"
                className="pull-right"
                onClick={ () =>  {
                  this.resetValidationStates();
                  this.resetFields();
                  this.setState({ uploadMode: !this.state.uploadMode })
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                bsSize="large"
                bsStyle="primary"
                className="pull-right savebutton"
                onClick={this.onSubmit}
              >
                Upload
              </Button>
            </div>
          : <Button
              type="submit"
              bsSize="large"
              bsStyle="primary"
              className="pull-right"
              onClick={ () => {
                this.resetFields();
                this.setState({ uploadMode: !this.state.uploadMode });
              }}
            >
              Upload Documents
            </Button>
        }
        {this.state.showModal &&
          <Modal id="delete-file-modal" show={this.state.showModal} onHide={this.closeModal}>
            <Modal.Header>
              <Modal.Title>Delete File</Modal.Title>
            </Modal.Header>
            <Modal.Body className="modal-body">
              Are you sure you want to delete this file?
            </Modal.Body>
            <Modal.Footer>
              <Button bsSize="large" bsStyle="primary" onClick={this.deleteFile}>Yes</Button>
              <Button bsSize="large" onClick={this.closeModal}>Cancel</Button>
            </Modal.Footer>
          </Modal>
        }
      </div>
    );
  }
}

const USER_QUERY = gql`
  query UserQuery($where: UserWhereUniqueInput!) {
    user(where: $where) {
      role
      username
      files {
        id
        updatedAt
        filename
        path
        name
        filetype
      }
    }
  }
`

const DELETE_FILE_MUATATION = gql`
  mutation DeleteFile($path: String!) {
    fileDelete(path: $path) {
      id
    }
  }
`

const UPLOADS_MUTATION = gql`
  mutation UploadFiles($files: [DocumentInput!]!) {
    uploadFiles(files: $files) {
      success
      errors {
        fieldId
        message
      }
    }
  }
`

export default compose(
  graphql(USER_QUERY, {
    name: 'userQuery',
    options: props => ({
      variables: {
          where: {
            username: props.match.params.username
          }
        },
    }),
  }),
  graphql(DELETE_FILE_MUATATION, {
    name: 'deleteFile'
  }),
  graphql(UPLOADS_MUTATION, {
    name: 'uploadsMutation'
  }),
  withRouter,
  withApollo
)(Documents)
