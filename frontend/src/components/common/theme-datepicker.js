import createMuiTheme from '@material-ui/core/styles/createMuiTheme';

const themeDatePicker = createMuiTheme({
	spacing: 5,
	palette: {
		primary: {
			main: '#313541',
		},
		secondary: {
			main: '#386F94',
		},
	},
	typography: {
		useNextVariants: true,
		h1: {
			fontFamily: 'Montserrat',
			fontWeight: '300',
			fontSize: 48,
			letterSpacing: 0,
			lineHeight: '58px',
		},
		h2: {
			fontFamily: 'Montserrat',
			fontWeight: 'bold',
			fontSize: 38,
			letterSpacing: 0,
			lineHeight: '48px',
		},
		h3: {
			fontFamily: 'Montserrat',
			fontWeight: 'bold',
			fontSize: 24,
			letterSpacing: 0,
			lineHeight: '30px',
		},
		h4: {
			fontFamily: 'Noto Sans',
			fontWeight: 'bold',
			fontSize: 18,
			letterSpacing: '4.46px',
			lineHeight: '24px',
		},
		h5: {
			fontFamily: 'Montserrat',
			fontWeight: 'bold',
			fontSize: 16,
			lineHeight: '20px',
		},
		h6: {
			fontFamily: 'Montserrat',
			fontWeight: 'bold',
			fontSize: 12,
			lineHeight: '16px',
		},
		body1: {
			fontFamily: 'Noto Sans',
			fontSize: 20,
			letterSpacing: 0,
			lineHeight: '28px',
			color: '#3F4A56',
		},
		body2: {
			fontFamily: 'Noto Sans',
			fontSize: 16,
			letterSpacing: 0,
			lineHeight: '24px',
		},
		button: {
			fontSize: 16,
			fontFamily: 'Montserrat',
			fontWeight: 'bold',
		},
	},
	overrides: {
		MuiPickersToolbar: {
			toolbar: {
				backgroundColor: '#313541',
			},
		},
		MuiPickersCalendarHeader: {
			switchHeader: {
				// backgroundColor: lightBlue.A200,
				// color: "white",
			},
		},
		MuiPickersDay: {
			day: {
				color: '#313541',
			},
			daySelected: {
				backgroundColor: '#313541',
			},
			dayDisabled: {
				color: '#313541',
			},
			current: {
				color: '#313541',
			},
		},
		MuiPickersModal: {
			dialogAction: {
				color: '#313541',
			},
		},
	},
});

export default themeDatePicker;
