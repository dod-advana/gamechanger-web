import React, { useContext } from 'react';
import _ from 'lodash';
import Typography from '@material-ui/core/Typography';

import { commaThousands } from '../../../utils/gamechangerUtils';

import { SearchContext } from './SearchContext';
import JumpButton from './JumpButton';

const ACTIVE_TAB_COLOR = 'rgb(68,111,145)';

const formatLabelFromKey = (key) => {
	return key.split(/(?=[A-Z])/).join(' ');
};

const formatMetaData = (meta = {}, tab) => {
	if (_.isEmpty(meta)) return null;

	if (tab === 'all') return ` (${commaThousands(calculatSumTotal(meta))})`;

	if (!_.isNil(meta?.[tab]?.total))
		return ` (${commaThousands(meta[tab]?.total)})`;

	return null;
};

const calculatSumTotal = (meta) => {
	return _.sum(_.map(Object.values(meta), 'total'));
};

const SearchTabBar = (props) => {
	const { searchTypes, activeTab, setActiveTab, resultMetaData, returnHome } =
		useContext(SearchContext);

	const { containerStyles = {} } = props;

	const searchTypesWithAll = { all: true, ...searchTypes };

	return (
		<div style={{ ...styles.container, ...containerStyles }}>
			<div style={styles.left}>
				<JumpButton
					style={{ marginTop: 0 }}
					reverse={true}
					label="Back to Home"
					action={returnHome}
				/>
			</div>

			<div style={styles.tabsContainer}>
				{_.map(searchTypesWithAll, (enabled, searchType) => {
					if (!enabled) return null;
					if (resultMetaData[searchType]?.total <= 0) return null;

					let style = styles.tab;

					if (activeTab === searchType)
						style = { ...style, ...styles.activeTab };

					return (
						<Typography
							key={searchType}
							style={style}
							variant="body1"
							onClick={() => setActiveTab(searchType)}
						>
							{formatLabelFromKey(searchType)}
							{formatMetaData(resultMetaData, searchType)}
						</Typography>
					);
				})}
			</div>
		</div>
	);
};

const styles = {
	container: {
		display: 'flex',
		alignItems: 'center',
		height: '100%',
	},
	left: {
		width: 440,
		padding: '0 10px',
		height: '100%',
		display: 'flex',
		alignItems: 'center',
	},
	tabsContainer: {
		height: '100%',
		width: '100%',

		display: 'flex',
		alignItems: 'center',
		justifyContent: 'flex-start',
	},
	activeTab: {
		borderBottom: `4px solid ${ACTIVE_TAB_COLOR}`,
		color: ACTIVE_TAB_COLOR,
		padding: '25px 0',
	},
	tab: {
		cursor: 'pointer',
		borderBottom: '4px solid transparent',
		fontWeight: '500',
		fontSize: 18,
		textTransform: 'capitalize',
		marginRight: 50,
	},
};

export default SearchTabBar;
