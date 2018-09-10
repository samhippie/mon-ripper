import React, { Component } from 'react';
import './calc.css';

class Calc extends Component {

	renderCalc() {
		return this.props.analysis.calc;
	}

	renderAnalyze() {
		return (
			<button
				onClick={() => this.props.onAnalyze()}
			>
				Save and Analyze
			</button>
		);
	}

	render() {
		return (
			<div className="calc-holder">
				<h5>Damage Calc</h5>
				<p>
					After applying, adjust field and conditions below<br/>
					(The set selector will say Abomasnow, but that's okay)
				</p>
				{this.renderCalc()}
				{this.renderAnalyze()}
			</div>
		);
	}
}

export default Calc;
