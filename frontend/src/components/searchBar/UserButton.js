import React from 'react';
import PropTypes from 'prop-types';
import Badge from '@material-ui/core/Badge';
import { withStyles } from '@material-ui/core/styles';
import GCButton from '../common/GCButton';
import { PAGE_DISPLAYED } from '../../utils/gamechangerUtils';
import { setState, clearDashboardNotification } from '../../utils/sharedFunctions';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

const StyledBadge = withStyles((theme) => ({
	badge: {
		backgroundColor: '#AD0000',
		right: '11px !important',
		top: '11px !important',
		color: 'white',
		fontSize: 12,
		minWidth: 15,
		width: 16,
		height: 16,
	},
}))(Badge);

const UserButton = (props) => {
	const { context, backgroundColor } = props;
	const { state, dispatch } = context;
	const { userData, cloneData } = state;

	return (
		<StyledBadge
			badgeContent={userData?.notifications ? userData.notifications[cloneData.clone_name]?.total : undefined}
		>
			<GCButton
				onClick={() => {
					window.history.pushState(
						null,
						document.title,
						`/#/${state.cloneData.url.toLowerCase()}/${PAGE_DISPLAYED.userDashboard}`
					);
					clearDashboardNotification(state.cloneData.clone_name, 'total', state, dispatch);
					setState(dispatch, { pageDisplayed: PAGE_DISPLAYED.userDashboard });
				}}
				style={{
					margin: '0 0 0 60px',
					height: 50,
					width: 50,
					minWidth: 'none',
					backgroundColor: `${backgroundColor || '#131E43'}`,
					border: `${backgroundColor || '#131E43'}`,
				}}
			>
				<AccountCircleIcon sx={{ fontSize: 30, margin: '-10px 0' }} />
			</GCButton>
		</StyledBadge>
	);
};

export default UserButton;

UserButton.propTypes = {
	context: PropTypes.shape({
		state: PropTypes.shape({
			userData: PropTypes.shape({
				notifications: PropTypes.shape({
					total: PropTypes.number,
				}),
			}),
		}),
		dispatch: PropTypes.func,
	}),
	backgroundColor: PropTypes.string,
};
