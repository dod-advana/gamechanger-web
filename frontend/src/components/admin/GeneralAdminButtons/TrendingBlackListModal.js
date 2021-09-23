import React from 'react';
import Modal from 'react-modal';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import GCTrendingBlacklist from '../HomepageEditor/GCTrendingBlacklist';
import GCButton from '../../common/GCButton';
import { styles } from '../util/GCAdminStyles';

/**
 *
 * @class TrendingBlacklistModal
 */
export default ({
	showTrendingBlacklistModal,
	setShowTrendingBlacklistModal,
}) => {
	const closeTrendingBlacklistModal = () => {
		setShowTrendingBlacklistModal(false);
	};
	return (
		<Modal
			isOpen={showTrendingBlacklistModal}
			onRequestClose={closeTrendingBlacklistModal}
			style={styles.esIndexModal}
		>
			<IconButton
				aria-label="close"
				style={{
					position: 'absolute',
					right: '0px',
					top: '0px',
					height: 60,
					width: 60,
					color: 'black',
					backgroundColor: styles.backgroundGreyLight,
					borderRadius: 0,
				}}
				onClick={() => closeTrendingBlacklistModal()}
			>
				<CloseIcon style={{ fontSize: 30 }} />
			</IconButton>
			<GCTrendingBlacklist />
			<div
				style={{
					display: 'flex',
					justifyContent: 'flex-end',
					marginLeft: '20px',
					marginRight: '2em',
					width: '95%',
				}}
			>
				<GCButton
					id={'esModalClose'}
					onClick={() => setShowTrendingBlacklistModal(false)}
					style={{ margin: '10px' }}
				>
					Close
				</GCButton>
			</div>
		</Modal>
	);
};
