import React from 'react';
import PropTypes from 'prop-types';
import Badge from '@material-ui/core/Badge';
import { withStyles } from '@material-ui/core/styles';
import { ConstrainedIcon } from '@dod-advana/advana-side-nav/dist/SlideOutMenu';
import UserIcon from '../../images/icon/UserIcon.png';
import GCButton from '../common/GCButton';
import { PAGE_DISPLAYED } from '../../utils/gamechangerUtils';
import { setState, clearDashboardNotification } from '../../utils/sharedFunctions';

const StyledBadge = withStyles((theme) => ({
	badge: {
		backgroundColor: '#AD0000',
		right: '11px !important',
		top: '11px !important',
		color: 'white',
		fontSize: 12,
		minWidth: 15,
		width: 16,
		height: 16
	}
}))(Badge);

const UserButton = (props) => {
	const { context } = props;
	const { state, dispatch } = context;
	const { userData, cloneData } = state;

	return (
		<StyledBadge 
			badgeContent={
				userData?.notifications ? userData.notifications[cloneData.clone_name]?.total : undefined
			}
		>
			<GCButton
				onClick={() => {
					window.history.pushState(null, document.title, `/#/${state.cloneData.url.toLowerCase()}/${PAGE_DISPLAYED.userDashboard}`)
					clearDashboardNotification(state.cloneData.clone_name, 'total', state, dispatch);
					setState(dispatch, { pageDisplayed: PAGE_DISPLAYED.userDashboard });
				}}
				style={{ height: 50, width: 60, minWidth: 'none', padding: '0 18px', margin: '0 0 0 4%', backgroundColor: '#131E43', border: '#131E43' }}
			>
				<ConstrainedIcon src={UserIcon} />
			</GCButton>
		</StyledBadge>
	);
}

export default UserButton;

UserButton.propTypes = {
	context: PropTypes.shape({
		state: PropTypes.shape({
			userData: PropTypes.shape({
				notifications: PropTypes.shape({
					total: PropTypes.number
				})
			})
		}),
		dispatch: PropTypes.func
	})
};