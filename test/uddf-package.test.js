const uddf2js = require('uddf2js');
const fs = require('fs');
const path = require('path');

function loadTestXml(filename) {
	return fs.readFileSync(path.join(__dirname, 'test_data', filename), 'utf8');
}

describe('parseUDDF', () => {
	test('package handles subsurface manually entered data', async () => {
		const xmlData = loadTestXml('subsurface_manual.uddf');
		const result = await uddf2js.parseUDDF(xmlData, 'imperial');
		expect(result.unit).toBe('imperial');
		const waypoints = result.data.uddf.profiledata.repetitiongroup[0].dive[0].samples.waypoint;
		expect(waypoints.length).toBeCloseTo(4);
		expect(waypoints[1].depth).toBeCloseTo(19, 2);
		expect(result.data.uddf.profiledata.repetitiongroup[0].dive[0].informationbeforedive).toBeDefined();
		expect(result.data.uddf.profiledata.repetitiongroup[0].dive[0].informationafterdive).toBeDefined();
		expect(result.data.uddf.profiledata.repetitiongroup[0].dive[0].tankdata).toBeDefined();
		const greatestDepth = result.data.uddf.profiledata.repetitiongroup[0].dive[0].informationafterdive.greatestdepth;
		expect(greatestDepth).toBeCloseTo(19, 2);
		const diveDuration = result.data.uddf.profiledata.repetitiongroup[0].dive[0].informationafterdive.diveduration;
		expect(diveDuration).toBeCloseTo(32, 2);
	});

	test('package returns SI units by default', async () => {
		const xmlData = loadTestXml('sample1.uddf');
		const result = await uddf2js.parseUDDF(xmlData);
		expect(result.unit).toBe('si');
		const waypoints = result.data.uddf.profiledata.repetitiongroup[0].dive[0].samples.waypoint;
		expect(waypoints[0].temperature).toBe(293.15);
		expect(waypoints[0].tankVolume).toBe(0.012);
		expect(waypoints[0].depth).toBe(10);
	});

	test('package converts to metric units', async () => {
		const xmlData = loadTestXml('sample1.uddf');
		const result = await uddf2js.parseUDDF(xmlData, 'metric');
		expect(result.unit).toBe('metric');
		const waypoints = result.data.uddf.profiledata.repetitiongroup[0].dive[0].samples.waypoint;
		expect(waypoints[0].temperature).toBeCloseTo(20, 2);
		expect(waypoints[0].tankVolume).toBeCloseTo(12, 2);
		expect(waypoints[0].depth).toBe(10);
	});

	test('package converts to imperial units', async () => {
		const xmlData = loadTestXml('sample1.uddf');
		const result = await uddf2js.parseUDDF(xmlData, 'imperial');
		expect(result.unit).toBe('imperial');
		const waypoints = result.data.uddf.profiledata.repetitiongroup[0].dive[0].samples.waypoint;
		expect(waypoints[0].temperature).toBeCloseTo(68, 2);
		expect(waypoints[0].tankVolume).toBeCloseTo(0.4238, 3);
		expect(waypoints[0].depth).toBeCloseTo(33, 2);
	});

	test('package handles multiple waypoints', async () => {
		const xmlData = loadTestXml('sample1.uddf');
		const result = await uddf2js.parseUDDF(xmlData, 'metric');
		expect(result.unit).toBe('metric');
		const waypoints = result.data.uddf.profiledata.repetitiongroup[0].dive[0].samples.waypoint;
		expect(waypoints.length).toBe(2);
		expect(waypoints[1].temperature).toBeCloseTo(22, 2);
		expect(waypoints[1].tankVolume).toBeCloseTo(11, 2);
		expect(waypoints[1].depth).toBe(15);
	});

	test('package handles dive computer', async () => {
		const xmlData = loadTestXml('suunto_eon.uddf');
		const result = await uddf2js.parseUDDF(xmlData, 'imperial');
		expect(result.unit).toBe('imperial');
		const waypoints = result.data.uddf.profiledata.repetitiongroup[0].dive[0].samples.waypoint;
		expect(waypoints.length).toBeCloseTo(8);
	});

	test('package handles subsurface manually entered data', async () => {
		const xmlData = loadTestXml('subsurface_manual.uddf');
		const result = await uddf2js.parseUDDF(xmlData, 'metric');
		expect(result.unit).toBe('metric');
		const waypoints = result.data.uddf.profiledata.repetitiongroup[0].dive[0].samples.waypoint;
		expect(waypoints.length).toBeCloseTo(4);
	});
});