import React from 'react';
import GCAccordion from '../../common/GCAccordion';

const GlobalSearchMatrixHandler = {
	getSearchMatrixItems(props) {
		const { renderCategories } = props;

		return (
			<>
				<div style={{ width: '100%', marginBottom: 10 }}>
					<GCAccordion
						expanded={true}
						header={'CATEGORY'}
						headerBackground={'rgb(238,241,242)'}
						headerTextColor={'black'}
						headerTextWeight={'normal'}
					>
						{renderCategories()}
					</GCAccordion>
				</div>
			</>
		);
	},
};

export default GlobalSearchMatrixHandler;
