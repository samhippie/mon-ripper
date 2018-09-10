import React, { Component } from 'react';
import './sidebar.css';

class Sidebar extends Component {

	renderAnalysis(analysis, index) {
		let label = 'Analysis ' + analysis.id;
		if(!analysis.done) {
			label += '*';
		}
		if(index === this.props.selected) {
			label = '>' + label;
		}
		return (
			<li
				key={index}
			>
				<button
					onClick={() => this.props.onSelect(index)}
				>
					{label}
				</button>
				<button
					onClick={() => this.props.onRemove(index)}
				>
					X
				</button>
			</li>
		);
	}

	renderAdd() {
		const key = this.props.analyses.length;
		return (
			<li
				key={key}
			>
				<button
					onClick={() => this.props.onAdd()}
				>
					Add New
				</button>
			</li>
		);
	}

	renderAnalyses() {
		return (
			<ul>
				{this.props.analyses.map((a,i) => this.renderAnalysis(a, i))}
				<br/>
				{this.renderAdd()}
			</ul>
		);
	}


	renderCombine() {
		let label = '';
		if(this.props.combined.done) {
			label = 'Show Combined Results';
		} else {
			label = 'Process and Show Combined Results';
		}
		return (
			<button
				onClick={() => this.props.onCombine()}
			>
				{label}
			</button>
		);
	}

	render() {
		return (
			<div className='sidebar'>
				<h5>Analyses</h5>
				{this.renderAnalyses()}
				{this.renderCombine()}
			</div>
		);
	}
}

export default Sidebar;
