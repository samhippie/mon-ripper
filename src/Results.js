import React, { Component } from 'react';

class Results extends Component {
	render() {
		return (
			<div>
				Sub-results<br/>
				{this.props.content}
			</div>
		);
	}
}

export default Results;
