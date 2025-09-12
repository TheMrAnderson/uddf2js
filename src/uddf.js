const xml2js = require('xml2js');

async function parseUDDF(xmlData, unit = "si") {
	const parser = new xml2js.Parser({ explicitArray: false, mergeAttrs: true, ignoreNamespaces: true });

	return parser.parseStringPromise(xmlData).then(function (result) {
		const cloned = JSON.parse(JSON.stringify(result));

		function convertDiveSection(obj) {
			if (Array.isArray(obj)) {
				return obj.map(convertDiveSection);
			} else if (obj && typeof obj === 'object') {
				const newObj = {};
				Object.keys(obj).forEach(key => {
					newObj[key] = formatParameterValue(key, convertDiveSection(obj[key]), unit);
				});
				return newObj;
			} else {
				return obj;
			}
		}

		if (cloned.uddf && cloned.uddf.profiledata && cloned.uddf.profiledata.repetitiongroup) {
			cloned.uddf.profiledata.repetitiongroup = ensureArray(cloned.uddf.profiledata.repetitiongroup);
			cloned.uddf.profiledata.repetitiongroup.forEach(group => {
				if (group.dive) {
					group.dive = ensureArray(group.dive).map(dive => convertDiveSection(dive));
				}
			});
		}

		return { unit, data: cloned };
	});
}

function ensureArray(val) {
	if (val === undefined) return [];
	return Array.isArray(val) ? val : [val];
}

function formatParameterValue(key, value, unit) {
	// If value is an object or array, return as-is (let recursion handle children)
	if (value && typeof value === 'object') return value;
	// ...existing conversion logic for primitives...
	const normKey = key.toLowerCase();
	if (typeof value === 'string' && !isNaN(value) && value.trim() !== '') {
		value = parseFloat(value);
	}
	switch (normKey) {
		case 'airtemperature':
		case 'lowesttemperature':
		case 'temperature':
			if (unit === "metric") {
				return value - 273.15; // Kelvin to Celsius
			} else if (unit === "imperial") {
				return Math.round(((value - 273.15) * 9 / 5) + 32); // Kelvin to Fahrenheit
			} else {
				return value; // SI (Kelvin)
			}
		case 'breathingconsumptionvolume': // m^3 / second
		case 'breathingconsumptionvolumebegin': // m^3 / second
		case 'breathingconsumptionvolumeend': // m^3 / second
		case 'breathingconsumptionvolumestep': // m^3 / second
		case 'tankvolume':
		case 'tankvolumebegin':
		case 'tankvolumeend':
		case 'tankvolumestep':
		case 'totallungcapacity':
		case 'vitalcapacity':
			if (unit === "metric") {
				return Math.round(value * 1000); // m^3 to liters
			} else if (unit === "imperial") {
				return Math.round(value * 35.3147 * 1000) / 1000; // m^3 to cubic feet, 3 decimals
			} else {
				return value; // SI (m^3)
			}
		case 'altitude':
		case 'altitudeofexposure':
		case 'arealength':
		case 'arealength':
		case 'averagedepth':
		case 'averagevisibility':
		case 'beam':
		case 'dcalarmdepth':
		case 'depth':
		case 'divedepthbegin':
		case 'divedepthend':
		case 'divedepthstep':
		case 'draught':
		case 'equivalentairdepth':
		case 'focallength':
		case 'focusingdistance':
		case 'greatestdepth':
		case 'height':
		case 'length':
		case 'maximumdepth':
		case 'maximumoperatingdepth':
		case 'maximumvisibility':
		case 'minimumdepth':
		case 'minimumvisibility':
		case 'r0':
		case 'setdcaltitude':
		case 'setdcdivedepthalarm':
		case 'size':
		case 'visibility':
		case 'wayaltitude':
			if (unit === "imperial") {
				return Math.round(value * 3.28084); // meters to feet
			} else {
				return value; // metric and si: meters
			}
		case 'calculatedpo2':
		case 'highestpo2':
		case 'measuredpo2':
		case 'pressuredrop':
		case 'surfacepressure':
		case 'tankpressureend':
		case 'tankpressurereserve':
		case 'tankpressure':
		case 'tankpressurebegin':
			if (unit === "imperial") {
				return Math.round(value * 0.0001450377); // Pascal to psi
			} else if (unit === "metric") {
				return Math.round(value / 100000); // Pascal to bar
			} else {
				return value; // si: Pascal
			}
		case 'bottomtimemaximum':
		case 'bottomtimeminimum':
		case 'bottomtimestepbegin':
		case 'bottomtimestepend':
		case 'desaturationtime':
		case 'diveduration':
		case 'divetime':
		case 'nodecotime':
		case 'noflighttime':
		case 'passedtime':
			//case 'period': Leaving this in seconds because this is part of <dcalarm>
		case 'remainingbottomtime':
		case 'remainingo2time':
		case 'surfaceintervalbeforealtitudeexposure':
		case 'timespan':
		case 'timespanbeforedive':
		case 'totallengthofexposure':
			if (unit === "imperial" ) {
				if (value === 0) return 0;
				if (value < 60) {
					// less than a minute, show as 0:SS
					return `0:${String(Math.round(value)).padStart(2, '0')}`;
				} else {
					return Math.round(value / 60); // seconds to minutes
				}
			} else {
				return value; // si: seconds
			}
		case 'displacement':
		case 'leadquantity':
		case 'tonnage':
		case 'weight':
			if (unit === "imperial") {
				return Math.round(value * 2.20462); // kg to lbs
			} else {
				return value; // metric and si: kg
			}
		case 'density':
			if (unit === "imperial") {
				return Math.round(value * 0.062428); // kg/m^3 to lbs/ft^3
			} else {
				return value; // metric and si: kg/m^3
			}
		case 'lightintensity':
			if (unit === "imperial") {
				return Math.round(value * 0.092903); // lux to foot-candle
			} else {
				return value; // metric and si: lux
			}
		case 'maximumascendingrate': // meters per second
			if (unit === "imperial") {
				return Math.round(value * 3.28084 * 100) / 100; // m/s to ft/s, 2 decimals
			} else {
				return value; // metric and si: m/s
			}
		default:
			if (typeof value === 'object') {
				if (value.type && normKey === 'divemode') {
					return `Type: ${value.type}`;
				} else if (value.ref && normKey === 'switchmix') {
					return `Ref: ${value.ref}`;
				}
			} else {
				return value;
			}
	}
}

module.exports = { parseUDDF };