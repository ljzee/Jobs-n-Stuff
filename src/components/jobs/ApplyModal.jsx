import React, { Component } from 'react';
import { Button, Modal } from 'react-bootstrap';
import '../../styles/ApplyModal.css';
import Select from 'react-select';

let resumeoptions = [];
let coverletteroptions = [];

class ApplyModal extends Component {

  state = {
    resumeOption: {value: null, label: null},
    coverLetterOption: {value: null, label: null},
  }

  componentDidMount() {
    resumeoptions = this.props.resumechoices;
    coverletteroptions = this.props.coverletterchoices;
  }


  resumeHandleChange  = (e) => {
    this.setState({resumeOption: e});
  }

  coverletterHandleChange = (e) => {
    this.setState({coverLetterOption: e});
  }

  submitApplication = () => {
    let resumeSelected = this.state.resumeOption.value;
    let coverLetterSelected = this.state.coverLetterOption.value;
    this.props.apply(resumeSelected, coverLetterSelected);
  }

  render() {


    return (
      <Modal id="apply-modal" show={this.props.showapply} onHide={this.props.closeapply}>
        <Modal.Header>
          <Modal.Title>Documents</Modal.Title>
        </Modal.Header>

        <Modal.Body>
        <h3>Resume</h3>
        <Select
          className="resumeOption"
          value={this.state.resumeOption}
          onChange={this.resumeHandleChange.bind(this)}
          options={resumeoptions}
          placeholder="Select a document"
        />
        {this.props.requirecoverletter &&
        <div>
        <h3>Cover Letter</h3>
          <Select
            className="coverLetterOption"
            value={this.state.coverLetterOption}
            onChange={this.coverletterHandleChange.bind(this)}
            options={coverletteroptions}
            placeholder="Select a document"
          />
          </div>
        }

        </Modal.Body>
        <Modal.Footer>
          <Button bsSize="large" bsStyle="success" onClick={this.submitApplication}>Apply</Button>
          <Button bsSize="large" onClick={this.props.closeapply}>Cancel</Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

export default ApplyModal;
