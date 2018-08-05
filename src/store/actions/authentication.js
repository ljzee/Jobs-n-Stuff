import * as actionTypes from './actionTypes';

export const passwordRestEmailSent = () => {
  return {
    type: actionTypes.PASSWORD_RESET_EMAIL_SENT,
  }
}

export const passwordResetAlertShown = () => {
  return {
    type: actionTypes.PASSWORD_RESET_ALERT_SHOWN,
  }
}