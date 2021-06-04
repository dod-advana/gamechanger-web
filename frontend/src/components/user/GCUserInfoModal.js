import React, {useState} from 'react';
import PropTypes from 'prop-types';
import { Dialog, DialogActions, DialogContent, DialogTitle, Typography, TextField } from "@material-ui/core";
import GCButton from '../common/GCButton';
import EmailValidator from "email-validator";
import {getUserData, setState} from "../../sharedFunctions";
import GamechangerUserManagementAPI from "../api/GamechangerUserManagement";

const gcUserManagementAPI = new GamechangerUserManagementAPI();

const styles = {
    modalBody: {
        width: 1000,
        display: 'flex', 
        flexDirection: 'column',
    },
    inputDiv: {
        width: '100%',
        margin: '16px auto',
    },
    textField: {
        width: '100%'
    },
    submitBtn: {
        marginBottom: 16,
        marginRight: 16
    },
    modalHeader: {
        padding: '16px 24px 0px'
	},
	disclaimer: {
        width: 970,
        display: 'flex', 
		flexDirection: 'column',
		marginLeft: 25,
		marginBottom: -10,
		marginTop: 10,
		paddingRight: 30,
		fontFamily: 'Montserrat'
    },
}

export default function GCUserInfoModal (props) {
    const {
        context
    } = props;
    
    const {state, dispatch} = context;

    const [emailError, setEmailError] = useState(false);
    const [orgError, setOrgError] = useState(false);

    const checkRequired = (field, value) => {
        if (field === 'email') {
            setEmailError(!value || value === '' || !EmailValidator.validate(value))
        }
        else if (field === 'org') {
            setOrgError(!value || value === '');
        }
    }

    const isValid = () => {
        const { email, org } = state.userInfo;
        return (email !== null && EmailValidator.validate(email) && org !== null && org !== '');
    }
    
    const setUserInfoModal = (isOpen) => {
		setState(dispatch, { userInfoModalOpen: isOpen });
	}

	const handleUserInfoInput = (field, text) => {
		const userInfo = {...state.userInfo};
		userInfo[field] = text;
		setState(dispatch, { userInfo })
	}

	const submitUserInfo = async () => {
		// save in pg
		try {
			await gcUserManagementAPI.submitUserInfo(state.userInfo);
			getUserData(dispatch);
		} catch(err) {
			console.log(err)
		}
		setUserInfoModal(false);
	}

    return (
        <Dialog
            open={state.userInfoModalOpen}
            maxWidth="xl"
        >
            <DialogTitle style={styles.modalHeader}>
                <div style={{display: 'flex', width: '100%'}}>
                    <Typography variant="h3" display="inline" style={{ fontWeight: 700 }}>Tell Us About Yourself</Typography>
                </div>
            </DialogTitle>
			<p style={styles.disclaimer}>The GAMECHANGER Team is collecting user data to support our research as we continue improving the application. Your responses will not be shared or used for any purposes outside of the GAMECHANGER development team.</p>
            <DialogContent style={styles.modalBody}>
                <div style={{...styles.inputDiv, height: 60}}>
                    {/* <Typography variant="h5">Email Address</Typography> */}
                    <TextField
                        label="Email Address"
                        error={emailError}
                        helperText={emailError ? 'Please enter a valid email address' : ''}
                        variant="outlined"
                        style={styles.textField}
                        required
                        onBlur={event => {handleUserInfoInput('email', event.target.value); checkRequired('email', event.target.value);}}
                        FormHelperTextProps={{
                            style: { fontSize: 12 }
                        }}
                    />
                </div>
                <div style={{...styles.inputDiv, height: 60}}>
                    <TextField
                        label="Organization"
                        error={orgError}
                        helperText={orgError ? 'Please enter an organization' : ''}
                        variant="outlined"
                        style={styles.textField}
                        required
                        onBlur={event => {handleUserInfoInput('org', event.target.value); checkRequired('org', event.target.value);}}
                        FormHelperTextProps={{
                            style: { fontSize: 12 }
                        }}
                    />
                </div>
                <div style={styles.inputDiv}>
                    <Typography variant="h6" style={{margin: '0 0 5px 0'}}>(Optional) What data sets or capabilities is GAMECHANGER lacking that would be valuable for your role or office?</Typography>
                    <TextField
                        multiline
                        variant="outlined"
                        rows={4}
                        style={styles.textField}
                        onBlur={event => handleUserInfoInput('q1', event.target.value)}
                    />
                </div>
                <div style={styles.inputDiv}>
                    <Typography variant="h6" style={{margin: '0 0 5px 0'}}>(Optional) Can you share any examples of how GAMECHANGER has impacted your job?</Typography>
                    <TextField
                        multiline
                        variant="outlined"
                        rows={4}
                        style={styles.textField}
                        onBlur={event => handleUserInfoInput('q2', event.target.value)}
                    />
                </div>
            </DialogContent>
            <DialogActions>
                <GCButton
                    onClick={() => submitUserInfo()}
                    style={styles.submitBtn}
                    disabled={!isValid() || emailError || orgError}
                >
                    Submit
                </GCButton>
            </DialogActions>
        </Dialog>   
    )
};

GCUserInfoModal.propTypes = {
    context: PropTypes.shape({
        state: PropTypes.shape({
            userInfo: PropTypes.objectOf(PropTypes.string),
            userInfoModalOpen: PropTypes.bool
        }),
        dispatch: PropTypes.func
    })
}