import React, { Component } from 'react';
import GCButton from '../common/GCButton';

export class Tip extends Component{
  state = {
  	compact: true,
  	text: ''
  };

  // for TipContainer
  componentDidUpdate(nextProps, nextState) {
  	const { onUpdate } = this.props;

  	if (onUpdate && this.state.compact !== nextState.compact) {
  		onUpdate();
  	}
  }

  render() {
  	const { onConfirm, onOpen } = this.props;

  	return (
  		<div className="Tip">
  				<GCButton
  					onClick={() => {
  						onOpen();
  						onConfirm();
  					}}
  					style={{
  						height: 40,
  						minWidth: 40,
  						padding: '2px 8px 0px',
  						fontSize: 14,
  						margin: '16px 0px 0px 10px',
  					}}
  				>
  					Save
  				</GCButton>
  		</div>
  	);
  }
}

export default Tip;