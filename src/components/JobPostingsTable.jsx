import React from 'react';
import gql from 'graphql-tag';
import { graphql, compose } from 'react-apollo';
import { withApollo } from 'react-apollo';
import { withRouter } from 'react-router-dom';
import { Button, Label } from 'react-bootstrap';
import ReactTable from 'react-table';
import Loading from './Loading';

const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];


/*
Code below is from:
  https://stackoverflow.com/questions/3224834/get-difference-between-2-dates-in-javascript
By Shyam Habarakada
*/
const _MS_PER_DAY = 1000 * 60 * 60 * 24;

// a and b are javascript Date objects
function dateDiffInDays(a, b) {
  // Discard the time and time-zone information.
  const utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  const utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());

  return Math.floor((utc2 - utc1) / _MS_PER_DAY);
}
/* End of referenced code */

/*
Code below is from (with minor alterations):
  https://stackoverflow.com/questions/2901102/how-to-print-a-number-with-commas-as-thousands-separators-in-javascript
By Elias Zamaria
*/

function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/* End of referenced code */

class JobPostingsTable extends React.Component {

  getPostings= () => {
    let postings = [];

    this.props.jobPostingsQuery.feed.jobpostings.forEach(result => {
      let posting = {};

      let date = new Date(result.deadline);

      posting.deadline = {
        day: monthNames[date.getMonth()] + " " +
             date.getDate().toString() + ", " +
             date.getFullYear().toString(),

        daysUntil: dateDiffInDays(new Date(Date.now()), date)
      }

      posting.job = {
        id:           result.id,
        title:        result.title,
        organization: result.businessprofile.name
      };

      posting.location = {
        city:    result.location.city,
        region:  result.location.region,
        country: result.location.country
      }

      posting.duration = result.duration;
      posting.openings = result.openings;
      posting.salary = result.salary;


      postings.push(posting);
    });

    return postings;
  }

  render() {
    if (this.props.jobPostingsQuery.loading) {
      return <Loading />
    }

    if (this.props.jobPostingsQuery.error) {
      return <h3>Error</h3>
    }

    let postings = this.getPostings();

    const columns = [
      {
        Header: () => <div><strong>Deadline</strong></div>,
        accessor: 'deadline',
        Cell: props =>
          <div>
            { props.value.daysUntil > 6
              ? <Label bsStyle="primary">In {props.value.daysUntil} Days</Label>

              : (props.value.daysUntil > 3)
              ? <Label bsStyle="warning">In {props.value.daysUntil} Days</Label>

              : (props.value.daysUntil > 1)
              ? <Label bsStyle="danger">In {props.value.daysUntil} Days</Label>

              : (props.value.daysUntil === 1)
              ? <Label bsStyle="danger">In 1 Day</Label>

              : (props.value.daysUntil === 0)
              ? <Label bsStyle="danger">Today</Label>

              : <Label>Passed</Label>
            }
            <br />
            <span>{props.value.day}</span>
         </div>,
        width: 150
      },
      {
        Header: () => <div><strong>Job</strong></div>,
        accessor: 'job',
        Cell: props =>
          <div>
            <a href={`/jobs/` + props.value.id}>{props.value.title}</a>
            <br />
            <span>{props.value.organization}</span>
          </div>,
        width: 200
      },
      {
        Header: () => <div><strong>Location</strong></div>,
        accessor: 'location',
        Cell: props =>
          <div>
            <span>{props.value.city}, {props.value.region}</span>
            <br />
            <span>{props.value.country}</span>
          </div>,
        width: 220
      },
      {
        Header: () => <div><strong>Duration</strong></div>,
        accessor: 'duration',
        Cell: props =>
          <div>
            {props.value
              ? <span>{props.value} Months</span>
              : <span>N/A</span>
            }
          </div>,
        width: 100
      },
      {
        Header: () => <div><strong>Openings</strong></div>,
        accessor: 'openings',
        Cell: props =>
          <div>
            {props.value
              ? <span>{props.value} Openings</span>
              : <span>N/A</span>
            }
          </div>,
        width: 100
      },
      {
        Header: () => <div><strong>Salary/Wage</strong></div>,
        accessor: 'salary',
        Cell: props =>
          <div>
            {props.value
              ? <span>${numberWithCommas(props.value)}</span>
              : <span>N/A</span>
            }
          </div>,
        width: 120
      },
      {
        Header: () => <div><strong>Actions</strong></div>,
        accessor: 'job',
        Cell: props =>
          <div>
            <Button href={`/jobs/` + props.value.id} bsStyle="primary">Details</Button>
          </div>,
        width: 200
      }
    ]

    return (
      <div id="view-job-postings">
        <h1>Job Postings</h1>
          <ReactTable
            id="job-postings-table"
            columns={columns}
            data={postings}
            minRows={5}
            showPagination={false}
          />
      </div>
    );
  }
}

const JOB_POSTINGS_QUERY = gql`
  query UserQuery {
    feed {
      jobpostings {
        id
        title
        deadline
        duration
        openings
        salary
        businessprofile {
          name
        }
        location {
          city
          region
          country
        }
      }
    }
  }
`

export default compose(
  graphql(JOB_POSTINGS_QUERY, {
    name: 'jobPostingsQuery',
  }),
  withRouter,
  withApollo
) (JobPostingsTable);
