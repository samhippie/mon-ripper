import React, { Component } from 'react';
import ItemInput from './ItemInput';
import { getHealthPixels } from './Analysis'
import './moninput.css';

class MonInput extends Component {

	//user selects whether it's an offensive or defensive analysis
	renderType() {
		return (
			<div>
				Type of Analysis
				<br/>
				<label>
					<input 
						type="radio" 
						checked={this.props.analysis.type === 'offense'}
						onChange={() => this.props.onType('offense')}
					/>
					Offense (Enemy is dealing damage)
				</label>
				<br/>
				<label>
					<input 
						type="radio" 
						checked={this.props.analysis.type === 'defense'}
						onChange={() => this.props.onType('defense')}
					/>
					Defense (Enemy is taking damage)
				</label>
			</div>
		);
	}

	//user enters in their mon importable
	renderMon() {
		return (
			<label>
				Your Mon (PS importable)<br/>
				<textarea
					rows="9"
					cols="40"
					value={this.props.analysis.mon}
					onChange={event => this.props.onMon(event.target.value)}
				/>
			</label>
		);
	}

	//user enters the enemy pokemon's name
	renderName() {
		return (
			<label>
				Enemy Pokemon
				<input
					type="text"
					value={this.props.analysis.name}
					onChange={event => this.props.onName(event.target.value)}
				/>
			</label>
		);
	}

	//user enters the move, either their own or the enemy's
	renderMove() {
		let label = this.props.analysis.type === 'offense'
						? 'Enemy Move'
						: 'Your Move';
		return (
			<label>
				{label}
				<input
					type="text"
					value={this.props.analysis.move}
					onChange={event => this.props.onMove(event.target.value)}
				/>
			</label>
		);
	}

	//user enters in the damage done, which is either absolute or in a range
	renderDamage() {
		const ko = (
			<label>
				Was the attack a KO?
				<input
					type="checkbox"
					checked={this.props.analysis.isKO}
					onChange={event => this.props.onKO(event.target.checked)}
				/>
			</label>
		);
		if(this.props.analysis.type === 'offense') {
			//user just enters in a number
			return (
				<div>
					<label>
						Absolute damage taken
						<input
							type="text"
							value={this.props.analysis.damage}
							onChange={event => this.props.onDamage(event.target.value)}
						/>
					</label>
					<br/>
					{ko}
				</div>
			);
		} else {
			//user enters a dropdown value
			return (
				<div>
					<label>
						Relative damage dealt
						<select 
							value={this.props.analysis.damage}
							onChange={event => this.props.onDamage(event.target.value)}
						>
							{getRelativeDamages()}
						</select>
					</label>
					<br/>
					{ko}
				</div>
			);
		}
	}

	//user enters in the possible items
	renderItems() {
		return (
			<ItemInput
				analysis={this.props.analysis}
				onChange={items => this.props.onItems(items)}
			/>
		);
	}

	//user is done entering in info, ready to set the field/conditions
	renderApply() {
		return (
			<button
				onClick={() => this.props.onApply()}
			>
				Apply
			</button>
		);
	}

	render() {
		return (
			<div className="moninput">
				<h5>Main Input</h5>
				{this.renderType()}
				<div className="mon-left">
					{this.renderMon()}
				</div>
				<div className="mon-right">
					{this.renderName()}
					<br/>
					{this.renderMove()}
					<br/>
					{this.renderDamage()}
					<br/>
					{this.renderItems()}
					<br/>
					{this.renderApply()}
				</div>
			</div>
		);
	}
}

//returns the options for pixel-based damages
let relativeDamages = null;
function getRelativeDamages() {
	if(relativeDamages) {
		return relativeDamages;
	} 
	relativeDamages = [];
	getHealthPixels().forEach(range => {
		let label = '';
		if(range.lower === range.upper) {
			//same, just show the percentage
			label = (range.lower * 100).toFixed(1) + '%'
		} else {
			//over a range, show both
			label = (range.lower * 100).toFixed(1) + '-' +
				(range.upper * 100).toFixed(1) + '%';
		}
		relativeDamages.push(
			<option
				value={range.id}
				key={range.id}
			>
				{label}
			</option>
		);
	});
	return relativeDamages;
}

export default MonInput;
