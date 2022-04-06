import React, { useContext, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import SearchBanner from '../searchBar/GCSearchBanner';
import { SlideOutToolContext } from '@dod-advana/advana-side-nav/dist/SlideOutMenuContext';
import SlideOutMenuContent from '@dod-advana/advana-side-nav/dist/SlideOutMenuContent';
import AdminMainViewFactory from '../factories/adminMainViewFactory';

const AdminMainView = (props) => {
	const { jupiter, context } = props;

	const { state } = context;

	const [pageToView, setPageToView] = useState();
	const { setToolState, unsetTool } = useContext(SlideOutToolContext);
	const [pageLoaded, setPageLoaded] = useState(false);
	const [mainViewHandler, setMainViewHandler] = useState();
	const [pages, setPages] = useState();

	useEffect(() => {
		if (state.cloneDataSet && !pageLoaded) {
			const factory = new AdminMainViewFactory(state.cloneData.main_view_module);
			const handler = factory.createHandler();
			setMainViewHandler(handler);
			setPageLoaded(true);
			const tmpPages = handler.getPages();
			setPageToView(tmpPages.general);
			setPages(tmpPages);
		}
	}, [state, pageLoaded]);

	useEffect(() => {
		// Update the document title using the browser API
		if (state.cloneDataSet && pageLoaded) {
			setToolState({
				knowledgeBaseHref: 'https://wiki.advana.data.mil',
				toolTheme: mainViewHandler.getToolTheme(state.cloneData),
				toolName: `${state.cloneData.clone_name.toUpperCase()} ADMIN`,
				hideAllApplicationsSection: false,
				hideContentSection: false,
				extraSupportLinks: [],
				associatedApplications: [],
			});
		}

		return () => {
			unsetTool();
		};
	}, [state, unsetTool, setToolState, setPageToView, pageLoaded, mainViewHandler]);

	return (
		<div style={{ minHeight: 'calc(100vh - 120px)' }}>
			{pageLoaded && (
				<>
					<SlideOutMenuContent type="closed">
						{mainViewHandler.closedAdminMenu(setPageToView, pages, state.cloneData.clone_name)}
					</SlideOutMenuContent>
					<SlideOutMenuContent type="open">
						{mainViewHandler.openedAdminMenu(setPageToView, pages, state.cloneData.clone_name)}
					</SlideOutMenuContent>

					<SearchBanner
						onTitleClick={() => {
							window.location.href = `#/${state.cloneData.clone_name}/admin`;
							setPageToView(pages.general);
						}}
						titleBarModule={'admin/adminTitleBarHandler'}
						jupiter={jupiter}
						rawSearchResults={[]}
						cloneData={state.cloneData}
					/>

					{mainViewHandler.renderSwitch(pageToView, state.cloneData.clone_name)}
				</>
			)}
		</div>
	);
};

AdminMainView.propTypes = {
	context: PropTypes.shape({
		state: PropTypes.shape({
			cloneDataSet: PropTypes.bool,
			cloneData: PropTypes.shape({
				main_view_module: PropTypes.string,
				clone_name: PropTypes.string,
			}),
		}),
		dispatch: PropTypes.func,
	}),
	jupiter: PropTypes.bool,
};

export default AdminMainView;
