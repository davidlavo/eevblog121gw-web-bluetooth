(function (window) {
  'use strict';
  var App = window.App || {};
	var EEVBlog121GWParser = App.EEVBlog121GWParser;

  function EEVBlog121GW() {
    this.parser = new App.EEVBlog121GWParser();
  }

	const MeterMode = {
		Low_Z: 0,   // rangeVal: 4 rangeMultExp: 0
		DCV: 1,     // rangeVal: 1,2,3,4 rangeMultExp: 0
		ACV: 2,     // rangeVal: 1,2,3,4 rangeMultExp: 0
		DCmV: 3,    // rangeVal: 2,3 rangeMultExp: -3
		ACmV: 4,    // rangeVal: 2,3 rangeMultExp: -3
		Temp: 5,    // rangeVal: 4 rangeMultExp: 0
		Hz: 6,      // rangeVal: 2,3 rangeMultExp: 0 (KHz), rangeVal: 1,2,3 rangeMultExp: 3 (Hz)
		mS: 7,      // rangeVal: 1,2,3 rangeMultExp: 0
		Duty: 8,    // rangeVal: 1 rangeMultExp: 0
		Resistor: 9,    // rangeVal: 1,2 rangeMultExp: 6, rangeVal: 2,3 rangeMultExp: 0, rangeVal: 1,2,3 rangeMultExp: 3
		Continuity: 10, // rangeVal: 3 rangeMultExp: 0
		Diode: 11,  // rangeVal: 1,2 rangeMultExp: 0
		Capacitor: 12,  // rangeVal: 3,4 rangeMultExp: -9, rangeVal: 2,3,4,5 rangeMultExp: -6
		ACuVA: 13,  // rangeVal: 2,3,4,5 rangeMultExp: 0
		ACmVA: 14,
		ACVA: 15,   // rangeVal: 4,5 rangeMultExp: -3, rangeVal: 2,3 rangeMultExp: 0
		ACuA: 16,   // rangeVal: 2,3 rangeMultExp: 0
		DCuA: 17,   // rangeVal: 2,3 rangeMultExp: 0
		ACmA: 18,
		DCmA: 19,
		ACA: 20,    // rangeVal: 3 rangeMultExp: -3, rangeVal: 1,2 rangeMultExp: 0
		DCA: 21,    // rangeVal: 3 rangeMultExp: -3, rangeVal: 1,2 rangeMultExp: 0
		DCuVA: 22,  // rangeVal: 3,4,5 rangeMultExp: 0
		DCmVA: 23,
		DCVA: 24,   // rangeVal: 4,5 rangeMultExp: -3 rangeVal: 2,3 rangeMultExp: 0
		_TempC: 100,
		_TempF: 105,
		_Battery: 110,
		_APO_On: 120,
		_APO_Off: 125,
	 	_YEAR: 130,
		_DATE: 135,
		_TIME: 140,
		_BURDEN_VOLTAGE: 150,
		_LCD: 160,
		_dBm: 180,
		_Interval: 190
	};

	const Sign = {
		positive: 1,
		negative: -1
	};

	const AC_DC = {
	  none: 0,
	  dc: 1,
	  ac: 2,
	  acdc: 3
	};

	const BarRange = {
		"5": 0,
		"50": 1,
		"500": 2,
		"1000": 3
	};

	const MinMaxAve = {
		none: 0,
		max: 1,
		min: 2,
		ave: 3,
		minMaxAve: 4
	};

  const RangeLookup = [
		{ baseUnits: "V", units: "V", label: "Voltage Low Z", values: [4], notation: " " },    //0
		{ baseUnits: "V", units: "V", label: "Voltage DC", values: [1,2,3,4], notation: "    " },    //1
		{ baseUnits: "V", units: "V", label: "Voltage AC", values: [1,2,3,4], notation: "    " },     //2
		{ baseUnits: "V", units: "mV", label: "Voltage DC", values: [2,3], notation: "mm" },     //3
		{ baseUnits: "V", units: "mV", label: "Voltage AC", values: [2,3], notation: "mm" },     //4
		{ baseUnits: "°C", units: "°C", label: "Temp", values: [4], notation: " " },     //5
		{ baseUnits: "Hz", units: "KHz", label: "Frequency", values: [2,3,1,2,3], notation: "  kkk" },   //6
		{ baseUnits: "s", units: "ms", label: "Period", values: [1,2,3], notation:"   " },     //7
		{ baseUnits: "%", units: "%", label: "Duty", values: [4], notation: " " },     //8
		{ baseUnits: "Ω", units: "KΩ", label: "Resistance", values: [2,3,1,2,3,1,2], notation: "  kkkMM" }, //9
		{ baseUnits: "Ω", units: "KΩ", label: "Continuity", values: [3], notation: " " },     //10
		{ baseUnits: "V", units: "V", label: "Diode", values: [1,2], notation: "  " },     //11
		{ baseUnits: "F", units: "mF" /*"ms"*/, label: "Capacitance", values: [3,4,2,3,4,5], notation: "nnuuuu" },  //12
		{ baseUnits: "VA", units: "uVA", label: "Power AC", values: [4,5,2,3], notation: "    " },     //13
		{ baseUnits: "VA", units: "mVA", label: "Power AC", values: [4,5,2,3], notation: "mm  " },     //14
		{ baseUnits: "VA", units: "VA", label: "Power AC", values: [4,5,2,3], notation: "mm  " },     //15, units in orig code "mVA"
		{ baseUnits: "A", units: "uA", label: "Current AC", values: [2,3], notation: "  " },     //16
		{ baseUnits: "A", units: "uA", label: "Current DC", values: [2,3], notation: "  " },     //17
		{ baseUnits: "A", units: "mA", label: "Current AC", values: [3,1,2], notation: "mmm" },     //18
		{ baseUnits: "A", units: "mA", label: "Current DC", values: [1,2], notation: "mm" },     //19
		{ baseUnits: "A", units: "A", label: "Current AC", values: [3,1,2], notation: "m  " },     //20
		{ baseUnits: "A", units: "A", label: "Current DC", values: [3,1,2], notation: "m  " },     //21
		{ baseUnits: "VA", units: "uVA", label: "Power DC", values: [3,4,4,5], notation: "    " },     //22
		{ baseUnits: "VA", units: "mVA", label: "Power DC", values: [4,5,2,3], notation: "mm  " },     //23
		{ baseUnits: "VA", units: "VA", label: "Power DC", values: [4,5,2,3], notation: "mm  " }    //24
	];

	EEVBlog121GW.prototype.processMessageData = function(msgData) {
		let bytes = msgData.buffer;
    let remainder = new Uint8ClampedArray(bytes);
		while (remainder != null && remainder.length > 0) {
			let parserState = this.parser.parse(remainder);
			if (parserState === EEVBlog121GWParser.ParsingState.error) {
				console.log("Error parsing device response: " + this.parser.processed().toString(16) +
					", length: " + this.parser.processed().length + ", offset: " + this.parser.offset);
				remainder = this.parser.remainder();
				this.parser.reset();
			} else if (parserState === EEVBlog121GWParser.ParsingState.completed) {
				console.log("Successfully parsed device response: " + this.parser.processed().toString(16));
				let meterState = this.constructMeterState();
				console.log("Meter state: ", meterState);
				/*
				responseParser.meterState?.let { meterState ->
						manager?.broadcastUpdate(
								MEASUREMENT_RECEIVED, meterState, BluetoothGatt.GATT_SUCCESS
						)
						listener?.onMeterStateReceived(meterState)
				}
				responseParser.measurement?.let { measure ->
						manager?.broadcastUpdate(
								MEASUREMENT_RECEIVED, measure, BluetoothGatt.GATT_SUCCESS
						)
						listener?.onMeasurementReceived(measure)
				}
				responseParser.subMeasurement?.let { subMeasure ->
						manager?.broadcastUpdate(
								SUBMEASUREMENT_RECEIVED, subMeasure, BluetoothGatt.GATT_SUCCESS
						)
						listener?.onSubMeasurementReceived(subMeasure)
				}
				*/
				remainder = this.parser.remainder();
				this.parser.reset();
			} else {
				// In progress - keep responseParser intact and wait for next update
				remainder = null;
			}
		}
		return this.parser.state;
	}

	EEVBlog121GW.prototype.constructMeterState = function() {
		let mainMode = getEnumByValue(MeterMode, this.parser.mainModeIndex());
		console.log("Meter mode is: " + mainMode);
		let subMode = getEnumByValue(MeterMode, this.parser.subModeIndex());
		console.log("Sub mode is: " + subMode);
		let barSignNegative = this.parser.barSignNegative();
		let barSign = barSignNegative != null ?
			(barSignNegative ? Sign.negative : Sign.positive) : null;
		console.log("Bar sign: " + barSign);
		let bar1000_500 = getEnumByValue(BarRange, this.parser.bar1000_500());
		console.log("Bar1000_500: " + bar1000_500);
		let acdc = getEnumByValue(AC_DC, this.parser.acdcValue());
		console.log("AC_DC: " + acdc);
		let minMaxAve = getEnumByValue(MinMaxAve, this.parser.minMaxAveValue());

		return {
      mainMode: mainMode,
      subMode: subMode,
      barOff: this.parser.barOff(),
      bar0_150: this.parser.bar0_150(),
      barSign: barSign,
      bar1000_500: bar1000_500,
      barValue: this.parser.barValue(),
      statusC: this.parser.statusC(),
      status1KHz: this.parser.status1KHz(),
      status1ms: this.parser.status1ms(),
      statusACDC: acdc,
      statusAuto: this.parser.statusAuto(),
      statusAPO: this.parser.statusAPO(),
      statusBat: this.parser.statusBat(),
			statusBT: this.parser.statusBT(),
      statusArrow: this.parser.statusArrow(),
      statusREL: this.parser.statusREL(),
      statusTest: this.parser.statusTest(),
      statusMem: this.parser.statusMem(),
      statusAHold: this.parser.statusAHold(),
      statusAC: this.parser.statusAC(),
      statusDC: this.parser.statusDC(),
      statusMinMax: minMaxAve,
      year: this.parser.yearByte,
      month: this.parser.monthByte,
      serialNumber: this.parser.serialNumber
    };
  }

	function getEnumByValue(e, v) {
		if (typeof v == 'number') {
			for (const [key, value] of Object.entries(e)) {
				if (value === v) {
					return key;
				}
			}
		}
		return null;
	}

  App.EEVBlog121GW = EEVBlog121GW;
  window.App = App;
})(window);
