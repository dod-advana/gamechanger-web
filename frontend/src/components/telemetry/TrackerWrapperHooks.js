import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useMatomo } from '@datapunt/matomo-tracker-react';
import Auth from '@dod-advana/advana-platform-ui/dist/utilities/Auth';
import SparkMD5 from 'spark-md5';

export default function TrackerWrapperHooks(ComposedComponent, documentTitle) {
	const { trackPageView, pushInstruction } = useMatomo();

	const isDecoupled =
		window?.__env__?.REACT_APP_GC_DECOUPLED === 'true' ||
		process.env.REACT_APP_GC_DECOUPLED === 'true';

	function WrappedComponent(props) {
		useEffect(() => {
			const userId = isDecoupled
				? Auth.getTokenPayload().cn
				: Auth.getUserId() || ' ';
			const regex = /\d{10}/g;
			const id = regex.exec(userId);
			pushInstruction('setUserId', SparkMD5.hash(id ? id[0] : userId));
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
