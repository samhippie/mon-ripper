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
				{Object.keys(this.results).map((name, i) => this.renderResult(this.results[name], i))}
			</div>
		);
	}

	//renders the result of a single enemy
	renderResult(result, key) {
		const getTotal = (result) => {
			return result.map(r => r.ev).reduce((acc, x) => acc+x);
		}
		//get best overall result
		let bestSpread = null
		let minTotal = null
		for(const r of result) {
			const total = getTotal(r);
			if(!bestSpread || total < minTotal) {
				bestSpread = r;
				minTotal = total;
			}
		}
		//get best neutral-natured result (might not exist);
		let bestNeutralSpread = null;
		minTotal = null;
		for(const r of result) {
			const total = getTotal(r);
			if(r.nature === ' ' && (!bestNeutralSpread || total < minTotal)) {
				bestNeutralSpread = r;
				minTotal = total;
			}
		}
		return (
			<div 
				key={key}
			>
				Best spread:<br/>
				{this.renderSpread(bestSpread)}<br/>
				Best spread (neutral nature):<br/>
				{this.renderSpread(bestNeutralSpread)}
			</div>
		);
	}

	renderSpread(spread) {
		if(!spread) {
			return 'no spread found';
		}
		return (
			<ul>
				{spread.map((stat, i) => this.renderStat(stat, i))}
			</ul>
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
									ev2.ev === ev1.ev)) {
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
