import React from 'react';
import { gcOrange } from '../common/gc-colors';

export default function StatPill({ stat, descriptor }) {
	return (
		<div style={{border: '1px solid #E4E4E4', borderRadius: '10px', padding: 15, textAlign: 'center', marginBottom: 20}}>
			<div style={{color: gcOrange, font: 'normal normal 600 28px/20px Noto Sans', marginBottom: 5}}>{stat ? stat : 0}</div>
			<div style={{font: 'normal normal 600 10px Noto Sans'}}>{descriptor}</div>
		</div>
	);
}
