import actionTypes from '../constants/actionTypes';
//import runtimeEnv from '@mars/heroku-js-runtime-env'
const env = process.env;

function userLoggedIn(username) {
    return {
        type: actionTypes.USER_LOGGEDIN,
        username: username
    }
}

function logout() {
    return {
        type: actionTypes.USER_LOGOUT
    }
}

export function submitLogin(data) {
    return dispatch => {
        dispatch({ type: actionTypes.AUTH_ERROR, message: '' });
        return fetch(`${env.REACT_APP_API_URL}/signin`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data),
            mode: 'cors'
        }).then((response) => {
            return response.json().catch(() => ({})).then((res) => {
                if (!response.ok) {
                    dispatch({ type: actionTypes.AUTH_ERROR, message: res.msg || res.message || 'Sign in failed.' });
                    return;
                }
                localStorage.setItem('username', data.username);
                localStorage.setItem('token', res.token);
                dispatch(userLoggedIn(data.username));
            });
        }).catch((e) => {
            console.log(e);
            dispatch({ type: actionTypes.AUTH_ERROR, message: 'Network error. Check API URL.' });
        });
    }
}

export function submitRegister(data) {
    return dispatch => {
        dispatch({ type: actionTypes.AUTH_ERROR, message: '' });
        return fetch(`${env.REACT_APP_API_URL}/signup`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data),
            mode: 'cors'
        }).then((response) => {
            return response.json().catch(() => ({})).then((res) => {
                if (!response.ok) {
                    dispatch({ type: actionTypes.AUTH_ERROR, message: res.message || res.msg || 'Sign up failed.' });
                    return;
                }
                dispatch(submitLogin(data));
            });
        }).catch((e) => {
            console.log(e);
            dispatch({ type: actionTypes.AUTH_ERROR, message: 'Network error. Check API URL.' });
        });
    }
}

export function logoutUser() {
    return dispatch => {
        localStorage.removeItem('username');
        localStorage.removeItem('token');
        dispatch(logout())
    }
}