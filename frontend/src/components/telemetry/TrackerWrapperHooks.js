import React, { useEffect } from 'react';
import { useMatomo } from '@datapunt/matomo-tracker-react'
import Auth from 'advana-platform-ui/dist/utilities/Auth';
import SparkMD5 from "spark-md5";

export default function TrackerWrapperHooks(ComposedComponent, documentTitle) {
	const { trackPageView, pushInstruction } = useMatomo();

	function WrappedComponent(props) {
		useEffect(() => {
			const userId = process.env.REACT_APP_GC_DECOUPLED === 'true' ? Auth.getTokenPayload().cn : Auth.getUserId() || ' ';
			const regex = /\d{10}/g;
			const id = regex.exec(userId)
			pushInstruction('setUserId', SparkMD5.hash(id ? id[0] : userId));
			trackPageView({
				// documentTitle and href get logged automatically

				documentTitle,
				href: window.location.href,
			});
		}, []);

		return <ComposedComponent {...props} />
	}

	return WrappedComponent;
}
