import * as actionTypes from '../actions/actionTypes';

const initialState = {
  showPasswordResetEmailAlert: false,
}

const passwordRestEmailSent = (state, action) => {
  return {
    ...state,
    showPasswordResetEmailAlert: true,
  }
}

const passwordResetAlertShown = (state, action) => {
  return {
    ...state,
    showPasswordResetEmailAlert: false,
  }
}

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.PASSWORD_RESET_ALERT_SHOWN: 
      return passwordResetAlertShown(state, action);
    case actionTypes.PASSWORD_RESET_EMAIL_SENT: return passwordRestEmailSent(state, action);
    default:
      return state;
  }
}

export default reducer;