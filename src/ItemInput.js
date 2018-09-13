import React, { Component } from 'react';
import './iteminput.css';

class ItemInput extends Component {

	handleAdd() {
		const items = this.props.analysis.items.slice();
		items.push('');
		this.props.onChange(items);
	}

	handleRemove(index) {
		const items = this.props.analysis.items.slice();
		items.splice(index, 1);
		this.props.onChange(items);
	}

	handleChange(index, value) {
		const items = this.props.analysis.items.slice();
		items[index] = value;
		this.props.onChange(items);
	}

	//replace items with some known good items
	handleTheWorks() {
		this.props.onChange([
			'Assault Vest',
			'Choice Band',
			'Choice Scarf',
			'Choice Specs',
			'Expert Belt',
			'Life Orb'
		]);
	}

	//render each entry of entering in an item
	renderItem(item, index) {
		return (
			<li 
				className="item-entry"
				key={index}
			>
				<label>
					<input
						type="text"
						value={item}
						onChange={event => this.handleChange(index, event.target.value)}
					/>
				</label>
				<button
					onClick={() => this.props.onCorrect(index)}
				>
					Auto-correct
				</button>
				<button
					onClick={() => this.handleRemove(index)}
				>
					X
				</button>
			</li>
		);
	}

	//render the button for adding new items
	renderAdd() {
		const key = this.props.analysis.items.length;
		return (
			<li
				key={key}
			>
				<button
					onClick={() => this.handleAdd()}
				>
					Add
				</button>
			</li>
		);
	}

	//render the list of added items
	renderItems() {
		const items = this.props.analysis.items;
		return (
			<ul>
				{items.map((item, i) => this.renderItem(item, i))}
				{this.renderAdd()}
			</ul>
		);
	}

	//lets the user add all the good items
	renderTheWorks() {
		return (
			<button
				onClick={() => this.handleTheWorks()}
			>
				The Works
			</button>
		);
	}

	render() {
		return (
			<div className="iteminput">
				<h5>Items</h5>
				If you know the item for sure, leave this empty and input the item in the damage calc.<br/>
				Enter the names exactly as they appear in showdown (e.g. "Choice Scarf")
				{this.renderItems()}
				{this.renderTheWorks()}
			</div>
		);
	}
}

export default ItemInput;
