import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useMatomo } from '@datapunt/matomo-tracker-react';
import Auth from '@dod-advana/advana-platform-ui/dist/utilities/Auth';
import SparkMD5 from 'spark-md5';

export default function TrackerWrapperHooks(ComposedComponent, documentTitle) {
	const { trackPageView, pushInstruction } = useMatomo();

	function WrappedComponent(props) {
		useEffect(() => {
			const userId = Auth.getUserId() || ' ';
			const regex = /\d{10}/g;
			const id = regex.exec(userId);
			
			console.log('matomo',userId,id,id ? id[0] : userId,SparkMD5.hash(id ? id[0] : userId));
			pushInstruction('setUserId',id, SparkMD5.hash(id ? id[0] : userId));
			trackPageView({
				// documentTitle and href get logged automatically

				documentTitle,
				href: window.location.href,
			});
		}, []);

		return <ComposedComponent {...props} />;
	}

	return WrappedComponent;
}

TrackerWrapperHooks.propTypes = {
	ComposedComponent: PropTypes.element.isRequired,
	documentTitle: PropTypes.string,
};
