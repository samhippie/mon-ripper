import React, { Component } from 'react';
import './main.css';

import MonInput from './MonInput';
import Calc from './Calc';
import Results from './Results';
import Sidebar from './Sidebar';
import GenericModal from './GenericModal.js';

import Analysis from './Analysis';
import Combined from './Combined';

class Main extends Component {
	constructor(props) {
		super(props);
		this.state = {
			analyses: [new Analysis(0)],
			selectedAnalysis: 0,
			lastAnalysisId: 0,
			combined: new Combined(),
			showCombinedModal: false,
		}
	}

	handleType(type) {
		const analyses = this.state.analyses.slice();
		analyses[this.state.selectedAnalysis].setType(type);
		this.setState({
			analyses: analyses,
		});
	}


	handleMon(mon) {
		const analyses = this.state.analyses.slice();
		analyses[this.state.selectedAnalysis].setMon(mon);
		this.setState({
			analyses: analyses,
		});
	}

	handleName(name) {
		const analyses = this.state.analyses.slice();
		analyses[this.state.selectedAnalysis].setName(name);
		this.setState({
			analyses: analyses,
		});
	}

	handleMove(move) {
		const analyses = this.state.analyses.slice();
		analyses[this.state.selectedAnalysis].setMove(move);
		this.setState({
			analyses: analyses,
		});
	}

	handleDamage(damage) {
		const analyses = this.state.analyses.slice();
		analyses[this.state.selectedAnalysis].setDamage(damage);
		this.setState({
			analyses: analyses,
		});
	}

	handleKO(isKO) {
		const analyses = this.state.analyses.slice();
		analyses[this.state.selectedAnalysis].setKO(isKO);
		this.setState({
			analyses: analyses,
		});
	}

	handleItems(items) {
		const analyses = this.state.analyses.slice();
		analyses[this.state.selectedAnalysis].setItems(items);
		this.setState({
			analyses: analyses,
		});
	}

	//apply the mon input to the calc
	handleApply() {
		const analysis = this.state.analyses[this.state.selectedAnalysis];
		analysis.applyToCalc();
	}

	//do the analysis for this particular setup
	handleAnalyze() {
		const analysis = this.state.analyses[this.state.selectedAnalysis];
		analysis.analyze(analysis => {
			const analyses = this.state.analyses.slice();
			analyses[this.state.selectedAnalysis] = analysis;
			this.setState({
				analyses: analyses,
			});
		});
	}

	//pick another saved analysis
	handleAnalysisSelect(index) {
		this.setState({
			selectedAnalysis: index,
		});
	}

	//add another analysis
	handleAddAnalysis() {
		const analyses = this.state.analyses.slice();
		analyses.push(new Analysis(this.state.lastAnalysisId + 1));
		this.setState({
			analyses: analyses,
			lastAnalysisId: this.state.lastAnalysisId + 1,
		});
	}

	//let the user remove analyses
	handleRemoveAnalysis(index) {
		const analyses = this.state.analyses.slice();
		//must always have at least 1 analysis
		if(analyses.length > 1) {
			analyses.splice(index, 1);
			//make sure we don't select a removed analysis
			let newSelected = this.state.selectedAnalysis;
			if(index ===  this.state.selectedAnalysis) {
				newSelected = 0;
			} else if(index < this.state.selectedAnalysis) {
				//indices got shifted by removing an earlier entry
				newSelected--;
			}
			this.setState({
				analyses: analyses,
				selectedAnalysis: newSelected,
			});
		}
	}

	//combine the saved analyses if needed
	//show the results
	handleCombine() {
		this.state.combined.setAnalyses(this.state.analyses);
		this.state.combined.combine((combined) => {
			this.setState({
				showCombinedModal: true,
				combined: combined,
			});
		});
	}

	renderMonInput() {
		return (
			<MonInput 
				analysis={this.state.analyses[this.state.selectedAnalysis]}
				onType={type => this.handleType(type)}
				onMon={mon => this.handleMon(mon)}
				onName={name => this.handleName(name)}
				onMove={move => this.handleMove(move)}
				onDamage={damage => this.handleDamage(damage)}
				onKO={isKO => this.handleKO(isKO)}
				onItems={items => this.handleItems(items)}
				onApply={() => this.handleApply()}
			/>
		);
	}


	renderCalc() {
		return (
			<Calc 
				analysis={this.state.analyses[this.state.selectedAnalysis]}
				onAnalyze={() => this.handleAnalyze()}
			/>
		);
	}

	renderResults() {
		return (
			<Results 
				content={this.state.analyses[this.state.selectedAnalysis].content}
			/>
		);
	}

	renderSidebar() {
		return (
			<Sidebar 
				analyses={this.state.analyses}
				selected={this.state.selectedAnalysis}
				combined={this.state.combined}
				onSelect={index => this.handleAnalysisSelect(index)}
				onAdd={() => this.handleAddAnalysis()}
				onRemove={index => this.handleRemoveAnalysis(index)}
				onCombine={() => this.handleCombine()}
			/>
		);
	}

	renderCombineModal() {
		return (
			<GenericModal
				show={this.state.showCombinedModal}
				contents={this.state.combined.content}
				onClose={() => this.setState({ showCombinedModal: false })}
			/>
		);
	}

	renderDisclaimer() {
		return null;
	}

	render() {
		return (
			<div className="main">
				{this.renderCombineModal()}
				<div className="left-subscreen">
					{this.renderDisclaimer()}
					{this.renderMonInput()}
					{this.renderCalc()}
					{this.renderResults()}
				</div>
				<div className="right-subscreen">
					{this.renderSidebar()}
				</div>
			</div>
		);
	}

}

export default Main;
