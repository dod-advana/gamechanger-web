import React from 'react';
import PropTypes from 'prop-types';
import paginator from 'paginator';

const Page = ({ pageNumber, onClick, active }) => {
	return (
		<li className={active ? 'active' : ''} onClick={onClick}>
			{pageNumber}
		</li>
	);
};

const Pagination = ({
	activePage,
	itemsCountPerPage,
	totalItemsCount,
	pageRangeDisplayed,
	showJumpToFirstLastPages,
	showFirstPageWithEllipsis,
	onChange,
}) => {
	const paginationInfo = new paginator(itemsCountPerPage, pageRangeDisplayed).build(totalItemsCount, activePage);

	const buildPages = () => {
		const pages = [];
		if (showJumpToFirstLastPages) {
			pages.push(
				<Page
					active={false}
					key="first"
					onClick={() => {
						onChange(1);
					}}
					pageNumber="«"
				/>
			);
		}

		if (paginationInfo.has_previous_page) {
			pages.push(
				<Page
					active={false}
					key="prev"
					onClick={() => {
						onChange(activePage - 1);
					}}
					pageNumber="⟨"
				/>
			);
		}

		if (showFirstPageWithEllipsis && paginationInfo.first_page > 1) {
			pages.push(
				<Page
					active={false}
					key={1}
					onClick={() => {
						onChange(1);
					}}
					pageNumber={1}
				/>
			);
			if (paginationInfo.first_page > 2) {
				pages.push(<span>...</span>);
			}
		}

		for (let i = paginationInfo.first_page; i <= paginationInfo.last_page; i += 1) {
			pages.push(
				<Page
					active={i === activePage}
					key={i}
					onClick={() => {
						onChange(i);
					}}
					pageNumber={i}
				/>
			);
		}

		if (paginationInfo.has_next_page) {
			pages.push(
				<Page
					active={false}
					key="next"
					onClick={() => {
						onChange(activePage + 1);
					}}
					pageNumber="⟩"
				/>
			);
		}

		if (showJumpToFirstLastPages) {
			pages.push(
				<Page
					active={false}
					key="last"
					onClick={() => {
						onChange(paginationInfo.total_pages);
					}}
					pageNumber="»"
				/>
			);
		}
		return pages;
	};

	return <ul className="pagination-container">{buildPages()}</ul>;
};

Pagination.defaultProps = {
	showJumpToFirstLastPages: true,
	showFirstPageWithEllipsis: true,
};

Pagination.propTypes = {
	activePage: PropTypes.number.isRequired,
	itemsCountPerPage: PropTypes.number.isRequired,
	totalItemsCount: PropTypes.number.isRequired,
	onChange: PropTypes.func.isRequired,

	showJumpToFirstLastPages: PropTypes.bool,
	showFirstPageWithEllipsis: PropTypes.bool,
};

export default Pagination;
