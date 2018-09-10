import React, { Component } from 'react';

class Results extends Component {
	render() {
		return (
			<div>
				Sub-results<br/>
				{this.props.contents}
			</div>
		);
	}
}

export default Results;
