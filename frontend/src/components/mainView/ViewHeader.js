import React from 'react';
import LoadableVisibility from 'react-loadable-visibility/react-loadable';
import LoadingIndicator from '@dod-advana/advana-platform-ui/dist/loading/LoadingIndicator';

const DefaultViewHeaderHandler = LoadableVisibility({
	loader: () => import('../modules/default/defaultViewHeaderHandler'),
	loading: () => {
		return (
			<div style={{ width: window.screen.width - 50 }}>
				<LoadingIndicator shadedOverlay={true} />
			</div>
		);
	},
});

const PolicyViewHeaderHandler = LoadableVisibility({
	loader: () => import('../modules/policy/policyViewHeaderHandler'),
	loading: () => {
		return (
			<div style={{ width: window.screen.width - 50 }}>
				<LoadingIndicator shadedOverlay={true} />
			</div>
		);
	},
});

const JbookViewHeaderHandler = LoadableVisibility({
	loader: () => import('../modules/jbook/jbookViewHeaderHandler'),
	loading: () => {
		return (
			<div style={{ width: window.screen.width - 50 }}>
				<LoadingIndicator shadedOverlay={true} />
			</div>
		);
	},
});

const EDAViewHeaderHandler = LoadableVisibility({
	loader: () => import('../modules/eda/edaViewHeaderHandler'),
	loading: () => {
		return (
			<div style={{ width: window.screen.width - 50 }}>
				<LoadingIndicator shadedOverlay={true} />
			</div>
		);
	},
});

const ViewHeader = (props) => {
	const { context } = props;
	const { state } = context;

	const getViewHeaderComponent = (props) => {
		switch (state.cloneData.view_header_module) {
			case 'policy/policyViewHeaderHandler':
				return <PolicyViewHeaderHandler {...props} />;
			case 'jbook/jbookViewHeaderHandler':
				return <JbookViewHeaderHandler {...props} />;
			case 'eda/edaViewHeaderHandler':
				return <EDAViewHeaderHandler {...props} />;
			default:
				return <DefaultViewHeaderHandler {...props} />;
		}
	};

<<<<<<< HEAD
	return <>{getViewHeaderComponent(props)}</>;
=======
	return (
		<div className={'results-count-view-buttons-container'} style={extraStyle}>
			{state.cloneData.clone_name === 'gamechanger' ? (
				<>
					<div className={'view-filters-container'}>
						{state.searchSettings.specificOrgsSelected &&
							Object.keys(orgFilter).map((org, index) => {
								if (state.searchSettings.orgFilter[org]) {
									return (
										<Button
											variant="outlined"
											backgroundColor="white"
											display="inline-flex"
											name={org}
											value={org}
											style={{
												marginRight: '10px',
												padding: '10px 15px',
												backgroundColor: 'white',
												color: 'orange',
												height: 40,
												ariaPressed: 'true',
											}}
											endIcon={<CloseIcon />}
											onClick={(event) => {
												handleOrganizationFilterChange(event, state, dispatch);
											}}
										>
											<span
												style={{
													fontFamily: 'Montserrat',
													fontWeight: 300,
													color: 'black',
													width: '100%',
													marginTop: '5px',
													marginBottom: '5px',
												}}
											>
												{org}
											</span>
										</Button>
									);
								} else {
									return null;
								}
							})}

						{state.searchSettings.specificTypesSelected &&
							Object.keys(typeFilter).map((type, index) => {
								if (state.searchSettings.typeFilter[type]) {
									return (
										<Button
											variant="outlined"
											backgroundColor="white"
											display="inline-flex"
											style={{
												marginRight: '10px',
												padding: '10px 15px',
												backgroundColor: 'white',
												color: 'orange',
												height: 40,
											}}
											endIcon={<CloseIcon />}
											value={type}
											onClick={(event) => {
												handleTypeFilterChange(event, state, dispatch);
											}}
										>
											<span
												style={{
													fontFamily: 'Montserrat',
													fontWeight: 300,
													color: 'black',
													width: '100%',
													marginTop: '5px',
													marginBottom: '5px',
												}}
											>
												{type}
											</span>
										</Button>
									);
								} else {
									return null;
								}
							})}
					</div>
				</>
			) : (
				<> </>
			)}
			<div
				className={'view-buttons-container'}
				style={
					cloneData.clone_name !== 'gamechanger'
						? { marginRight: 35, zIndex: 99 }
						: { marginRight: 15, zIndex: 99 }
				}
			>
				{categorySorting !== undefined && categorySorting[activeCategoryTab] !== undefined && (
					<>
						<FormControl variant="outlined" classes={{ root: classes.root }}>
							<InputLabel classes={{ root: classes.formlabel }} id="view-name-select">
								Sort
							</InputLabel>
							<Select
								labelId="view-name"
								label="Sort"
								id="view-name-select"
								value={currentSort}
								onChange={handleChangeSort}
								classes={{ root: classes.selectRoot, icon: classes.selectIcon }}
								className="MuiInputBase-root"
								autoWidth
							>
								{categorySorting[activeCategoryTab].map((sort) => {
									return (
										<MenuItem
											key={`${sort}-key`}
											value={sort}
											style={{ display: 'flex', padding: '3px 6px' }}
										>
											{sort}
										</MenuItem>
									);
								})}
							</Select>
						</FormControl>
						{currentSort !== 'Alphabetical' ? (
							<div style={{ width: '40px', marginRight: '6px', display: 'flex' }}>
								<i
									className="fa fa-sort-amount-desc"
									style={{
										marginTop: '80%',
										marginRight: '5px',
										cursor: 'pointer',
										color: currentOrder === 'desc' ? 'rgb(233, 105, 29)' : 'grey',
									}}
									aria-hidden="true"
									onClick={() => {
										handleChangeOrder('desc');
									}}
								/>
								<i
									className="fa fa-sort-amount-asc"
									style={{
										marginTop: '80%',
										cursor: 'pointer',
										color: currentOrder === 'asc' ? 'rgb(233, 105, 29)' : 'grey',
									}}
									aria-hidden="true"
									onClick={() => {
										handleChangeOrder('asc');
									}}
								/>
							</div>
						) : (
							<div style={{ width: '40px', marginRight: '6px', display: 'flex' }}>
								<i
									className="fa fa-sort-alpha-asc"
									style={{
										marginTop: '80%',
										marginRight: '5px',
										cursor: 'pointer',
										color: currentOrder === 'asc' ? 'rgb(233, 105, 29)' : 'grey',
									}}
									aria-hidden="true"
									onClick={() => {
										handleChangeOrder('asc');
									}}
								/>
								<i
									className="fa fa-sort-alpha-desc"
									style={{
										marginTop: '80%',
										cursor: 'pointer',
										color: currentOrder === 'desc' ? 'rgb(233, 105, 29)' : 'grey',
									}}
									aria-hidden="true"
									onClick={() => {
										handleChangeOrder('desc');
									}}
								/>
							</div>
						)}
					</>
				)}
				<FormControl variant="outlined" classes={{ root: classes.root }}>
					<InputLabel classes={{ root: classes.formlabel }} id="view-name-select">
						View
					</InputLabel>
					<Select
						className={`MuiInputBase-root tutorial-step-${componentStepNumbers['Change View']}`}
						labelId="view-name"
						label="View"
						id="view-name-select"
						value={dropdownValue}
						onChange={handleChangeView}
						classes={{ root: classes.selectRoot, icon: classes.selectIcon }}
						autoWidth
					>
						{viewNames.map((view) => {
							if (view.name === 'Card') {
								return [
									<MenuItem
										key={`Card-List`}
										value={'List'}
										style={{ display: 'flex', padding: '3px 6px' }}
									>
										List View
									</MenuItem>,
									<MenuItem
										key={`Card-Grid`}
										value={'Grid'}
										style={{ display: 'flex', padding: '3px 6px' }}
									>
										Grid View
									</MenuItem>,
								];
							} else {
								return (
									<MenuItem
										key={`${view.name}-key`}
										value={view.name}
										style={{ display: 'flex', padding: '3px 6px' }}
									>
										{view.title}
									</MenuItem>
								);
							}
						})}
					</Select>
				</FormControl>
				{cloneData?.clone_name === 'eda' && (
					<a
						target="_blank"
						rel="noopener noreferrer"
						href="https://qlik.advana.data.mil/sense/app/604403a7-bf08-4d56-8807-7b5491a3db22/sheet/96329f3e-18a3-40e8-8b02-99d82feb1a6b/state/analysis"
					>
						<GCButton style={{ height: 50, margin: '16px 0px 0px 10px', minWidth: 0 }}>
							Validation Metrics
						</GCButton>
					</a>
				)}
				<GCButton
					className={`tutorial-step-${state.componentStepNumbers['Share Search']}`}
					id={'gcShareSearch'}
					onClick={() => createCopyTinyUrl(cloneData.url, dispatch)}
					style={{ height: 50, padding: '0px 7px', margin: '16px 0px 0px 10px', minWidth: 50 }}
					disabled={!state.rawSearchResults || state.rawSearchResults.length <= 0}
				>
					<GCTooltip title="Share" placement="bottom" arrow>
						<i className="fa fa-share" style={{ margin: '0 0 0 5px' }} />
					</GCTooltip>
				</GCButton>

				<SelectedDocsDrawer
					selectedDocuments={state.selectedDocuments}
					docsDrawerOpen={state.docsDrawerOpen}
					setDrawer={setDrawer}
					clearSelections={() => setState(dispatch, { selectedDocuments: new Map() })}
					openExport={() => setState(dispatch, { exportDialogVisible: true })}
					removeSelection={(doc) => removeSelectedDocument(doc)}
					componentStepNumbers={state.componentStepNumbers}
					isDrawerReady={state.isDrawerReady}
					setDrawerReady={setDrawerReady}
					setShowTutorial={(showTutorial) => setState(dispatch, { showTutorial: showTutorial })}
					setStepIndex={setStepIndex}
					showTutorial={state.showTutorial}
					rawSearchResults={state.rawSearchResults}
				/>
			</div>
		</div>
	);
};

ViewHeader.propTypes = {
	activeCategoryTab: PropTypes.string,
	cloneData: PropTypes.shape({
		url: PropTypes.string,
	}),
	componentStepNumbers: PropTypes.objectOf(PropTypes.number),
	count: PropTypes.number,
	currentViewName: PropTypes.string,
	entityCount: PropTypes.number,
	listView: PropTypes.bool,
	selectedCategories: PropTypes.objectOf(PropTypes.bool),
	topicCount: PropTypes.number,
	timeFound: PropTypes.number,
	viewNames: PropTypes.arrayOf(
		PropTypes.shape({
			name: PropTypes.string,
			title: PropTypes.string,
		})
	),
	categorySorting: PropTypes.objectOf(PropTypes.arrayOf(PropTypes.string)),
	currentSort: PropTypes.string,
	currentOrder: PropTypes.string,
>>>>>>> f279a568fa5a0ecb7588964bdc7f0b49fd2632a8
};

export default ViewHeader;
