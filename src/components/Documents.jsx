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
import prettyBytes from 'pretty-bytes';
import 'react-table/react-table.css'
import '../styles/Documents.css';

const fileTypeMap = {
  'RESUME': 'Resume',
  'COVERLETTER': 'Cover Letter',
  'TRANSCRIPT': 'Transcript',
  'PROFILEIMAGE': 'Profile Image',
  'OTHER': 'Other'
}

const validationFields = ['resume', 'coverletter', 'transcript', 'other'];
const maxDocSize = 2000000;

class Documents extends Component {

  state = {
    showDeleteModal: false,
    showRenameModal: false,
    deleteFilePath: '',
    renamePath: '',
    renameName: '',
    uploadMode: false,
    summary: '',
    documents: [],
    isLoading: false,
    largeFileFlag: true,
    quotaError: {value: false, remaining: 0.0, upload: 0.0},
    resume: {value: '', isValid: true, message: '', validState: null, document: null, filetype: 'RESUME'},
    coverletter: {value: '', isValid: true, message: '', validState: null, document: null, filetype: 'COVERLETTER'},
    transcript: {value: '', isValid: true, message: '', validState: null, document: null, filetype: 'TRANSCRIPT'},
    other: {value: '', isValid: true, message: '', validState: null, document: null, filetype: 'OTHER'},
    temp: {document: null, filetype: 'TEMP'},
    rename: {value: '', isValid: true, message: '', validState: null, filepath: ''},
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

  openDeleteModal = (path) => {
    let state = this.state;
    state.showDeleteModal = true;
    state.deleteFilePath = path;
    this.setState(state);
  }

  closeDeleteModal = () => {
    let state = this.state;
    state.showDeleteModal = false;
    state.deleteFilePath = '';
    this.setState(state);
  }

  openRenameModal = (path, name) => {
    let state = this.state;
    state.showRenameModal = true;
    state.rename.filepath = path;
    state.rename.value = name;
    this.setState(state);
  }

  closeRenameModal = () => {
    let state = this.state;
    state.showRenameModal = false;
    state.rename.filepath = '';
    state.rename.value = '';
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
        showDeleteModal: false,
        deleteFilePath: ''
      })
    });
  }

  renameFile = async (e) => {
    e.preventDefault();
    let state = this.state;
    const path = state.rename.filepath;
    const name = state.rename.value;

    const renameResult = await this.props.renameMutation({
      variables: {
        path,
        name
      }
    });

    const { success, error } = renameResult.data.renameFile;

    if (success) {
      state.rename.value = '';
      state.rename.isValid = true;
      state.rename.message = '';
      state.rename.validState = null;
      state.rename.filepath = '';
      state.showRenameModal = false;
      this.props.client.resetStore().then(() => {
        this.setState(state);
      });
    } else {
      state.rename.isValid = false;
      state.rename.message = error;
      state.rename.validState = "error";
      this.setState(state);
    }
  }

  handleChange = (e) => {
    let state = this.state;

    switch (e.target.id) {
      case 'resumeFile':
        state.resume.document = new Blob([e.target.files[0]], {type:'application/pdf'});
        state.resume.document.name = e.target.files[0].name;
        state.resume.isValid = true;
        state.resume.message = '';
        state.resume.validState = null;
        if (state.largeFileFlag && e.target.files[0].size > 1000000) {
          state.temp.document = new Blob([e.target.files[0]], {type:'application/pdf'});
          state.temp.document.name = 'temp-file.pdf';
          state.largeFileFlag = false;
        }
        break;
      case 'coverletterFile':
        state.coverletter.document = new Blob([e.target.files[0]], {type:'application/pdf'});
        state.coverletter.document.name = e.target.files[0].name;
        state.coverletter.isValid = true;
        state.coverletter.message = '';
        state.coverletter.validState = null;
        if (state.largeFileFlag && e.target.files[0].size > 1000000) {
          state.temp.document = new Blob([e.target.files[0]], {type:'application/pdf'});
          state.temp.document.name = 'temp-file.pdf';
          state.largeFileFlag = false;
        }
        break;
      case 'transcriptFile':
        state.transcript.document = new Blob([e.target.files[0]], {type:'application/pdf'});
        state.transcript.document.name = e.target.files[0].name;
        state.transcript.isValid = true;
        state.transcript.message = '';
        state.transcript.validState = null;
        if (state.largeFileFlag && e.target.files[0].size > 1000000) {
          state.temp.document = new Blob([e.target.files[0]], {type:'application/pdf'});
          state.temp.document.name = 'temp-file.pdf';
          state.largeFileFlag = false;
        }
        break;
      case 'otherFile':
        state.other.document = new Blob([e.target.files[0]], {type:'application/pdf'});
        state.other.document.name = e.target.files[0].name;
        state.other.isValid = true;
        state.other.message = '';
        state.other.validState = null;
        if (state.largeFileFlag && e.target.files[0].size > 1000000) {
          state.temp.document = new Blob([e.target.files[0]], {type:'application/pdf'});
          state.temp.document.name = 'temp-file.pdf';
          state.largeFileFlag = false;
        }
        break;
      default:
        state[e.target.id].value = e.target.value;
        state[e.target.id].isValid = true;
        state[e.target.id].message = '';
        state[e.target.id].validState = null;
    }

    state.summary = '';
    state.quotaError.value = false;

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
    state.quotaError.value = false;

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

    if (state.temp.document !== null) {
      let document = {
        name: 'temp-file',
        filetype: state.temp.filetype,
        file: state.temp.document,
        mimetype: state.temp.document.type,
        size: state.temp.document.size,
        fieldId: 'temp',
        filename: state.temp.document.name
      }
      state.documents.push(document);
    }

    this.setState(state);
  }

  checkDocuments = () => {
    let state = this.state;
    let valid = true;

    for (let i = 0; i < validationFields.length; i++) {
      let key = validationFields[i];
      if (state[key].document !== null && state[key].document.size > maxDocSize) {
        valid = false;
        state[key].isValid = false;
        state[key].message = 'Document size cannot exceed 2 MB.';
        state[key].validState = "error";
      }
    }

    if (!valid) {
      state.isLoading = false;
    }

    this.setState(state);
    return valid;
  }

  uploadUserFiles = () => {
    let state = this.state;

    this.props.uploadsMutation({
      variables: {
        files: state.documents
      }
    })
    .then((result) => {
      state.isLoading = false;
      const {success, errors, quotaError } = result.data.uploadFiles;
      if (success) {
        state.uploadMode = false;
        state.documents = [];
        this.props.client.resetStore().then(() => {
          this.setState(state);
        });
      } else {
        if (quotaError !== null) {
          state.quotaError.value = true;
          state.quotaError.remaining = quotaError.remaining;
          state.quotaError.upload = quotaError.uploadSize;
        } else {
          for (let i = 0; i < errors.length; i++) {
            const error = errors[i];
            const key = error.fieldId;
            const message = error.message;
            state[key].isValid = false;
            state[key].message = message;
            state[key].validState = "error";
          }
        }
        state.documents = [];
        this.setState(state);
      }
    })
    .catch(() => {
      state.isLoading = false;
      this.setState(state);
    });
  }

  onSubmit = async (e) => {
    e.preventDefault();
    this.resetValidationStates();
    this.setDocuments();
    let state = this.state;

    if (state.documents.length > 0) {
      const allValid = this.checkDocuments();
      if (allValid) {
        this.setState({isLoading: true});
        this.uploadUserFiles();
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
        accessor: 'name'
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
            onClick={ () => this.openRenameModal(props.value, props.original.name) }
          >
            Rename
          </a>
          <a
            className="btn btn-info"
            role="button"
            onClick={ () => this.openDeleteModal(props.value) }
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
            <p className="helper-text">Note: All documents must be pdf's. Maximum file size is 2 MB.</p>
            {this.state.summary !== '' && <p className="errormessage documents-message">{this.state.summary}</p>}
            {this.state.quotaError.value &&
              <div>
                <p className="errormessage documents-message">Upload exceeds your allowable quota.</p><br />
                <p className="errormessage documents-message">{`Upload Size: ${prettyBytes(this.state.quotaError.upload)}`}</p><br />
                <p className="errormessage documents-message">{`Your remaining space: ${prettyBytes(this.state.quotaError.remaining)}`}</p>
              </div>
            }
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
            defaultSorted={[
              {
                id: "updatedAt",
                desc: true
              }
            ]}
          />
        }
        {this.state.uploadMode
          ? <div>
              <Button
                type="submit"
                bsSize="large"
                className="pull-right"
                disabled={this.state.isLoading}
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
                disabled={this.state.isLoading}
                onClick={this.onSubmit}
              >
                {this.state.isLoading ? 'Uploading...' : 'Upload'}
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
        {this.state.showDeleteModal &&
          <Modal id="delete-file-modal" show={this.state.showDeleteModal} onHide={this.closeDeleteModal}>
            <Modal.Header>
              <Modal.Title>Delete File</Modal.Title>
            </Modal.Header>
            <Modal.Body className="modal-body">
              Are you sure you want to delete this file?
            </Modal.Body>
            <Modal.Footer>
              <Button bsSize="large" bsStyle="primary" onClick={this.deleteFile}>Yes</Button>
              <Button bsSize="large" onClick={this.closeDeleteModal}>Cancel</Button>
            </Modal.Footer>
          </Modal>
        }
        {this.state.showRenameModal &&
          <Modal id="rename-file-modal" show={this.state.showRenameModal} onHide={this.closeRenameModal}>
            <Modal.Header>
              <Modal.Title>Rename File</Modal.Title>
            </Modal.Header>
            <Modal.Body className="rename-modal-body">
              Please enter a new name for the file:
              <Form className="modal-input">
                <FormGroup controlId="rename" validationState={this.state.rename.validState}>
                  <FormControl
                    type="text"
                    placeholder="Document name"
                    value={this.state.rename.value}
                    onChange={this.handleChange}
                  />
                  <FormControl.Feedback />
                  <HelpBlock className="errormessage">{this.state.rename.message}</HelpBlock>
                </FormGroup>
              </Form>
            </Modal.Body>
            <Modal.Footer>
              <Button bsSize="large" bsStyle="primary" onClick={this.renameFile}>Save</Button>
              <Button bsSize="large" onClick={this.closeRenameModal}>Cancel</Button>
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
      quotaError {
        uploadSize
        remaining
      }
    }
  }
`

const RENAME_FILE_MUATATION = gql`
  mutation RenameFile($path: String!, $name: String!) {
    renameFile(path: $path, name: $name) {
      success
      error
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
  graphql(RENAME_FILE_MUATATION, {
    name: 'renameMutation'
  }),
  withRouter,
  withApollo
)(Documents)
