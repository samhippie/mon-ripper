import React from 'react';

class Combined {
	constructor() {
		this.analyses = [];
		this.done = false;
		this.results = {};
	}

	setAnalyses(analyses) {
		this.analyses = analyses;
	}

	combine(callback) {
		//partition the analyses by enemy
		const enemyMap = {}
		this.analyses.forEach(analysis => {
			if(enemyMap[analysis.name]) {
				enemyMap[analysis.name].push(analysis);
			} else {
				enemyMap[analysis.name] = [analysis];
			}
		});
		Object.keys(enemyMap).forEach(name => {
			this.results[name] = this.monCombine(enemyMap[name]);
		});
		this.content = this.renderResults();
		this.done = true;
		callback(this);
	}

	//combines the analyses of a single enemy
	monCombine(analyses) {
		const results = analyses.map(a => a.results);
		return results.reduce((acc, r) => mergeResults(acc, r));

	}

	//renders the results for all pokemon analyzed
	renderResults() {
		const count = Object.keys(this.results)
			.map(name => this.results[name].length)
			.reduce((acc, x) => acc + x);
		console.log(this.results);
		return (
			<div>
				<p>Here are the minimum spreads. Check the dev console for all {count} results</p>
				{Object.keys(this.results).map((name, i) => this.renderResult(name, this.results[name], i))}
			</div>
		);
	}

	//renders the result of a single enemy
	renderResult(name, result, key) {
		//sums each stat's EVs
		const getTotal = (result) => {
			return result.map(r => r.ev).reduce((acc, x) => acc+x);
		}
		//get all items given to analyses (some might not have any results)
		const itemMap = {}
		for(const a of this.analyses) {
			a.items.forEach(i => itemMap[i] = true);
		}
		const items = ['No Item',...Object.keys(itemMap)];

		//get best overall result for each item
		let bestSpread = {}
		let minTotal = {}
		for(const r of result) {
			const total = getTotal(r);
			if(!bestSpread[r[0].item] || total < minTotal[r[0].item]) {
				bestSpread[r[0].item] = r;
				minTotal[r[0].item] = total;
			}
		}
		//get best neutral-natured result for each item (might not exist)
		let bestNeutralSpread = {};
		minTotal = {};
		for(const r of result.filter(r => !r.find(s => s.nature !== ' '))) {
			const total = getTotal(r);
			if(!bestNeutralSpread[r[0].item] || total < minTotal[r[0].item]) {
				bestNeutralSpread[r[0].item] = r;
				minTotal[r[0].item] = total;
			}
		}
		return (
			<div 
				key={key}
			>
				{name}<br/>
				Best spreads<br/>
				{items.map((item, i) => this.renderSpread(bestSpread[item], i))}<br/>
				Best spreads (neutral nature)<br/>
				{items.map((item, i) => this.renderSpread(bestNeutralSpread[item], i))}
			</div>
		);
	}

	renderSpread(spread, key) {
		if(!spread) {
			return (
				<div
					key={key}
				>
					No spread found
				</div>
			);
		}
		const item = spread[0].item;
		return (
			<div
				key={key}
			>
				{item}
				<ul>
					{spread.map((stat, i) => this.renderStat(stat, i))}
				</ul>
			</div>
		);
	}

	renderStat(stat, key) {
		return (
			<li
				key={key}
			>
				{stat.stat}({stat.nature}): {stat.ev}
			</li>
		);
	}
}

//results are a list of sets of EV combinations
//each EV combination specifies an exact value for 1 or more EVs
//
//this works by taking the cartesian product results1 x results 2
//and filtering out any impossible results 
//(same EV having multiple values, total > 508, impossible nature, etc)
function mergeResults(results1, results2) {
	const merged = [];
	for(const r1 of results1) {
		for(const r2 of results2) {
			//r1+r2 with exact duplicates removed
			const combined = [];
			for(const ev1 of r1.concat(r2)) {
				if(!combined.find(ev2 => ev2.stat === ev1.stat && 
									ev2.nature === ev1.nature &&
									ev2.ev === ev1.ev &&
									ev2.item === ev1.item)) {
					combined.push(ev1);
				}
			}
			if(verifyResult(combined)) {
				merged.push(combined);
			}
		}
	}
	return merged;
}

//verifies that the result doesn't contradict itself
function verifyResult(result) {
	//check for multiple values for the same stat
	//(including contradicting nature)
	for(const ev1 of result) {
		if(result.find(ev2 => ev1.stat === ev2.stat &&
						(ev1.nature !== ev2.nature ||
						ev1.ev !== ev2.ev))) {
			return false;
		}
	}
	//check for inconsistent items
	for(const ev1 of result) {
		if(result.find(ev2 => ev1.item !== ev2.item)) {
			return false;
		}
	}
	//check that up to 1 nature is +, and up to 1 nature is -
	let posCount = 0;
	let negCount = 0;
	for(const r of result) {
		if(r.nature === '+') posCount++;
		else if(r.nature === '-') negCount++;
	}
	if(posCount > 1 || negCount > 1) {
		return false;
	}
	//check that the total EVs are <= 508
	let evTotal = 0;
	for(const r of result) {
		evTotal += r.ev;
	}
	if(evTotal > 508) {
		return false;
	}
	return true;
}

export default Combined;
