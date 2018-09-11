/*
 *	Generic modal, used to show a chunk of JSX in a modal
 */

import React, { Component } from 'react';
import './genericmodal.css';

class GenericModal extends Component {
	componentDidMount() {
		document.addEventListener('keydown', (e) => this.handleKeyDown(e));
	}

	handleKeyDown(event) {
		if(!this.props.show) {
			return;
		}
		if(event.key === (this.props.closeKey || 'Escape')) {
			this.props.onClose();
		}
	}

	render() {
		if(!this.props.show) {
			return null;
		}

		return (
			<div className="modal-backdrop">
				<div className="modal">
					<div className="modal-contents">
						{this.props.contents}
					</div>
					<div className="modal-footer">
						<button onClick={this.props.onClose}>
							{this.props.closeText || 'Close (Esc)'}
						</button>
					</div>
				</div>
			</div>
		);
	}
}

export default GenericModal;
