import React from 'react';
import { Label } from 'react-bootstrap';
import moment from 'moment';

export const AUTH_TOKEN = 'auth_token';
export const USER_TOKEN = 'user_token';

export const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

/*
Code below is from:
  https://stackoverflow.com/questions/3224834/get-difference-between-2-dates-in-javascript
By Shyam Habarakada
*/
export const _MS_PER_DAY = 1000 * 60 * 60 * 24;

export const dateDiffInDays = (a, b) => {
  // Discard the time and time-zone information.
  const utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  const utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());

  return Math.floor((utc2 - utc1) / _MS_PER_DAY);
}
/* End of referenced code */

export const jobposting_columns = [
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
    width: 150,
    sortMethod: (a, b) => {
      return a.daysUntil -  b.daysUntil;
    }
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
    width: 200,
    sortMethod: (a, b) => {
      return a.title > b.title ? 1 : -1;
    }
  },
  {
    Header: () => <div><strong>Type</strong></div>,
    accessor: 'type',
    Cell: props =>
      <div>
        {props.value === 'FULLTIME'
          ? <span>Full-time</span>
          : props.value === 'PARTTIME'
          ? <span>Part-time</span>
          : <span>N/A</span>
        }
      </div>,
    width: 100
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
    width: 220,
    sortMethod: (a, b) => {
      return a.city> b.city? 1 : -1;
    }
  },
  {
    Header: () => <div><strong>Openings</strong></div>,
    accessor: 'openings',
    Cell: props =>
      <div className="center-content-div ">
        {props.value
          ? <span>{props.value}</span>
          : <span>N/A</span>
        }
      </div>,
    width: 100,
  },
  {
    Header: () => <div><strong>Duration</strong></div>,
    accessor: 'duration',
    Cell: props =>
      <div className="center-content-div ">
        {props.value
          ? <span>{props.value} Months</span>
          : <span>N/A</span>
        }
      </div>,
    width: 100
  },
  {
    Header: () => <div><strong>Pay</strong></div>,
    accessor: 'pay',
    Cell: props =>
      <div>
        {props.value.salary && props.value.paytype === "SALARY"
          ? <span>{`$${props.value.salary.toLocaleString("en-US", {minimumFractionDigits: 2})}`}</span>

          : props.value.salary && props.value.paytype === "HOURLY"
          ? <span>{`$${props.value.salary.toLocaleString("en-US", {minimumFractionDigits: 2})}`}/hr</span>

          : <span>N/A</span>
        }
      </div>,
    width: 120,
    sortMethod: (a, b) => {
      return a.salary - b.salary;
    }
  },
  {
    Header: () => <div><strong>Actions</strong></div>,
    accessor: 'job',
    width: 125,
    Cell: props =>
      <div>
        <a
          className="btn btn-info"
          role="button"
          href={`/jobs/${props.value.id}`}
        >
          Details
        </a>
      </div>,
    sortable: false
  }
];

export const applications_columns = [
  {
    Header: () => <div><strong>Title</strong></div>,
    accessor: 'jobposting',
    Cell: props => <span>{props.value.title}</span>,
  },
  {
    Header: () => <div><strong>Company</strong></div>,
    accessor: 'jobposting',
    Cell: props => <span>{props.value.businessprofile.name}</span>
  },
  {
    id: 'updatedAt',
    Header: () => <div><strong>Submitted</strong></div>,
    width: 175,
    accessor: props => moment(props.updatedAt).format('DD/MM/YYYY h:mm a')
  },
  {
    Header: () => <div><strong>Job Details</strong></div>,
    accessor: 'jobposting',
    width: 150,
    Cell: props =>
      <a
        className="btn btn-info"
        role="button"
        href={`/jobs/${props.value.id}`}
      >
        View Job
      </a>
  },
  {
    Header: () => <div><strong>Documents</strong></div>,
    accessor: 'files',
    Cell: props =>
    <div className="center-content-div">
    {props.value.length === 2
      ?
        <div>
          {props.value[0].filetype === 'RESUME'
            ?
              <div>
                <a
                  href={props.value[0].path}
                  className="btn btn-info application-table-button"
                  role="button"
                  target="_blank"
                >
                  Resume
                </a>
                <a
                  href={props.value[1].path}
                  className="btn btn-info application-table-button"
                  role="button"
                  target="_blank"
                >
                  Cover Letter
                </a>
              </div>
            :
              <div>
                <a
                  href={props.value[1].path}
                  className="btn btn-info application-table-button"
                  role="button"
                  target="_blank"
                >
                  Resume
                </a>
                <a
                  href={props.value[0].path}
                  className="btn btn-info application-table-button"
                  role="button"
                  target="_blank"
                >
                  Cover Letter
                </a>
              </div>
          }
        </div>
      :
        <div>
          <a
            href={props.value[0].path}
            className="btn btn-info application-table-button"
            role="button"
            target="_blank"
          >
            Resume
          </a>
        </div>
    }
  </div>
  }
]
