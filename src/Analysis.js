import React from 'react';
import BattleMovedex from './moves';

class Analysis {
	constructor(id) {
		this.id = id;

		this.type = 'offense';
		this.name = '';
		this.mon = '';
		this.damage = 0;
		this.isKO = false;
		this.move = '';
		this.items = [];

		//which move to select if doing a defensive calc
		//this should be 0 for offensive calcs
		this.selectedMove = 0;

		this.calc = this.renderCalc();
		this.calcWrapper = new CalcWrapper(this.calc);

		//whether application has been done
		this.hasApplied = false;
		//whether analysis has been done
		this.done = false;
		
		this.results = null;
		
		//this has an error string if there is an error
		this.error = null;
	}

	setType(type) {
		this.type = type;
	}

	setMon(mon) {
		this.mon = mon;
	}

	setName(name) {
		this.name = name;
	}

	setMove(move) {
		this.move = move;
	}

	setDamage(damage) {
		this.damage = parseInt(damage, 10);
	}

	setKO(isKO) {
		this.isKO = isKO;
	}

	setItems(items) {
		this.items = items;
	}

	renderCalc() {
		return (
			<iframe
				id="calcIframe"
				title="Damage Calc"
				src="VGC-Damage-Calculator/index.html"
				width="500"
				height="500"
			/>
		);
	}

	//puts all the information given in the damage calc
	//so the user can then adjust everything
	applyToCalc() {
		const c = this.calcWrapper;
		const enemyBuilder = new ImportableBuilder();
		enemyBuilder.name = this.name || 'Swadloon';
		if(this.type === 'offense') {
			enemyBuilder.moves[0] = this.move;
		}
		const enemy = enemyBuilder.build();
		c.putMon(this.mon, 1);
		c.putMon(enemy, 2);

		c.getRoll();
	}

	analyze() {
		if(this.type === 'offense') {
			this.offensiveAnalysis();
		} else {
			this.defensiveAnalysis();
		}
	}

	offensiveAnalysis() {
		const c = this.calcWrapper;

		//get whether the move is physical or special
		const move = getMove(this.move);
		const isPhysical = move.category === 'Physical';

		//start search with - nature, then neutral nature, then positive nature
		//for each nature, make sure damage is between min roll of 0 evs and max roll of 252 evs
		const natureTypes = ['-',' ','+'];
		natureTypes.forEach(natureType => {
			const nature = getNature(isPhysical, true, natureType);
			const stat = getStat(isPhysical, true);
			c.setNature(nature);
			//TODO ev optimization stated above
			for(let i = 0; i <= 252; i += 4) {
				c.setEV(stat, i);
				c.selectMove(this.selectedMove, 2);
				const roll = c.getRoll();
			}
		});
		
		//save EV values that yeild a possible roll
	}

	defensiveAnalysis() {
		//TODO later
	}
}

//gets a nature that changes the given stat
//' ' for neutral, '-' for minus, '+' for plus
//speed for moves like gyro ball matters here,
//but I'm just not going to worry about it
//everything is neutral speed
function getNature(isPhysical, isOffensive, type) {
	if(isPhysical) {
		if(isOffensive) {
			switch(type) {
				case '-':
					return 'Modest';
				case ' ':
					return 'Hardy';
				case '+':
					return 'Adamant';
				//no default
			}
		} else {
			switch(type) {
				case '-':
					return 'Lonely';
				case ' ':
					return 'Hardy';
				case '+':
					return 'Impish';
				//no default
			}
		}
	} else {
		if(isOffensive) {
			switch(type) {
				case '-':
					return 'Adamant';
				case ' ':
					return 'Hardy';
				case '+':
					return 'Modest';
				//no default
			}
		} else {
			switch(type) {
				case '-':
					return 'Naughty';
				case ' ':
					return 'Hardy';
				case '+':
					return 'Careful';
				//no default
			}
		}
	}
}

//gets the internal stat name for the given stat type
function getStat(isPhysical, isOffensive) {
	if(isPhysical) {
		if(isOffensive) {
			return 'at';
		} else {
			return 'df';
		}
	} else {
		if(isOffensive) {
			return 'sa';
		} else {
			return 'sd';
		}
	}
}

//builder for making PS importables
//I'm too lazy to make proper setters, but it should be fine
class ImportableBuilder {
	constructor() {
		this.name = 'Swadloon';
		this.moves = ['','','',''];
		this.evs = {
			HP: 0,
			Atk: 0,
			Def: 0,
			SpA: 0, 
			SpD: 0,
			Spe: 0,
		}
		this.ivs = {
			HP: 31,
			Atk: 31,
			Def: 31,
			SpA: 31, 
			SpD: 31,
			Spe: 31,
		}
		this.item = '';
		this.ability = '';
		this.level = 50;
		this.nature = 'Hardy';
	}

	//returns a PS importable that the damage calc will accept
	build() {

		let evString = '';
		Object.keys(this.evs).forEach(stat => {
			if(this.evs[stat] > 0) {
				evString += this.evs[stat] + ' ' + stat + ' / '
			}
		});

		let ivString = '';
		Object.keys(this.ivs).forEach(stat => {
			if(this.ivs[stat] < 31) {
				ivString += this.ivs[stat] + ' ' + stat + ' / '
			}
		});

		return this.name + ' @ ' + this.item + '\n' +
			'Ability: ' + this.ability + '\n' +
			'Level: ' + this.level + '\n' + 
			'EVs: ' + evString + '\n' + 
			this.nature + ' Nature\n' +
			'IVs: ' + ivString + '\n' +
			'- ' + this.moves[0] + '\n' + 
			'- ' + this.moves[1] + '\n' + 
			'- ' + this.moves[2] + '\n' + 
			'- ' + this.moves[3] + '\n';
			
	}
}


//class for manipulating the damage calc
class CalcWrapper {
	constructor(calc) {
		this.nameCounts = {};
	}

	getCalc() {
		return document.getElementById('calcIframe');
	}

	//puts the given PS importable in the place
	//place is either 1 or 2
	putMon(mon, place) {
		const calc = this.getCalc();
		const $ = calc.contentWindow.$;

		//put the mon in as a custom set
		$('#customMon').val(mon);
		//never repeat names for the same species
		const species = getSpeciesName(mon);
		if(!this.nameCounts[species]) {
			this.nameCounts[species] = 0;
		}
		const spread = this.nameCounts[species]
		$('#spreadName').val(spread);
		this.nameCounts[species]++;
		calc.contentWindow.savecustom();

		//put the saved set in the proper place
		const info = $('.set-selector.select2-offscreen')
		const pokeinfo = place === 1 ? info.first() : info.last();
		pokeinfo.val(species + ' (' + spread + ')');
		pokeinfo.change();

	}

	//sets item of a mon
	//item is something like "Choice Scarf"
	setItem(item, place=2) {
		const calc = this.getCalc();
		const $ = calc.contentWindow.$;

		//gets the item selector
		const itemElem = place === 1 
			? $('.item').first()
			: $('.item').last();
		itemElem.val(item);
		itemElem.change();
	}

	//sets nature of given mon
	//nature is something like "Modest"
	setNature(nature, place=2) {
		const calc = this.getCalc();
		const $ = calc.contentWindow.$;

		//gets nature selector
		const natureElem = place === 1 
			? $('.nature').first()
			: $('.nature').last();
		natureElem.val(nature);
		natureElem.change();
	}

	//sets the ev to the given value of the given mon
	//stat is something like 'at'
	setEV(stat, value, place=2) {
		const calc = this.getCalc();
		const $ = calc.contentWindow.$;

		const evElem = place === 1
			? $('.' + stat).first().find('.evs')
			: $('.' + stat).last().find('.evs')
		evElem.val(value);
		evElem.change();
	}

	//selects the given move
	selectMove(index, place) {
		const calc = this.getCalc();
		const $ = calc.contentWindow.$;

		const side = place === 1 ? 'L' : 'R';
		$('#resultMove' + side + index).click();
	}

	//returns the current roll of the selected move
	//as a list of numbers
	getRoll() {
		const calc = this.getCalc();
		const $ = calc.contentWindow.$;
		
		const rollsText = $('#damageValues').text();
		//TODO go from string to list of numbers
	}
}

//gets the species name of an importable mon, regardless of nickname
function getSpeciesName(mon) {
	//name is everything before the last ' @'
	const parts = mon.split(' @');
	const namePart = parts.slice(0, parts.length - 1)
		.reduce((acc, x) => acc + x);
	//check for nickname
	if(namePart[namePart.length-1] === ')') {
		//after the last '(', before the ')' after that
		const speciesParts = namePart.split('(');
		return speciesParts[speciesParts.length-1].split(')')[0]
	}
	return namePart;
}

let healthPixels = null;

//see this for math
//https://github.com/Zarel/Pokemon-Showdown-Client/blob/ b8a06bc08e3f2a6d563db3f0c261f8c9f9ea5db4/src/battle.ts
export function getHealthPixels() {
	if(!healthPixels) {
		let ranges = []
		const epsilon = 0.5 / 714;
		for(let i = 0; i < 48; i++) {
			if(i === 0) {
				ranges.push([0,0]);
			} else if(i === 1) {
				ranges.push([0+epsilon, 2/48 - epsilon]);
			} else if(i === 9) {
				ranges.push([9/48, 0.2]);
				ranges.push([0.2+epsilon, 10/48 - epsilon]);
			} else if(i === 24) {
				ranges.push([0.5, 0.5]);
				ranges.push([0.5 + epsilon, 25/48 - epsilon]);
			} else if(i === 48) {
				ranges.push([1, 1]);
			} else {
				ranges.push([i / 48, (i+1) / 48 - epsilon]);
			}
		}
		healthPixels = [];
		ranges.forEach((range, id) => {
			healthPixels.push({
				lower: range[0],
				upper: range[1],
				id: id,
			});
		});
	}
	return healthPixels;
}

//gets the move from move.js using the move's proper name
function getMove(name) {
	//move.js uses a different naming scheme
	name = name.toLowerCase().replace(' ', '');
	return BattleMovedex[name];
}

export default Analysis;
