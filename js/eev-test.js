// Create a scoping variable
if (typeof(EEVTest) == 'undefined') {
	var EEVTest = {};
}

EEVTest.bluetoothDevice = null;
EEVTest.gattServer = null;
EEVTest.measurementCharacteristic = null;

EEVTest.meter = new App.EEVBlog121GW();

EEVTest.connectMeterButtonClick = function() {
  EEVTest.requestDevice()
  .then(EEVTest.connectDeviceAndCacheCharacteristics)
  .catch(error => {
    log('Argh! ' + error);
  });
}

EEVTest.requestDevice = function() {
  let result = Promise.resolve();
  if (!EEVTest.bluetoothDevice) {
    log('Requesting Bluetooth Device...');
    result = navigator.bluetooth.requestDevice(
      {filters: EEVTest.eevblog121gwDevices()})
    .then(device => {
      EEVTest.bluetoothDevice = device;
      EEVTest.bluetoothDevice.addEventListener('gattserverdisconnected', EEVTest.onDisconnected);
    });
  }
  return result;
}

EEVTest.connectDeviceAndCacheCharacteristics = function() {
  if (EEVTest.bluetoothDevice.gatt.connected) {
    return Promise.resolve();
  }

  log('Connecting to GATT Server...');
  return EEVTest.bluetoothDevice.gatt.connect()
  .then(server => {
    EEVTest.gattServer = server;
    log('Getting Measurement Service...');
    return EEVTest.gattServer.getPrimaryService('0bd51666-e7cb-469b-8e4d-2742f1ba77cc');
  })
  .then(measurementService => {
    log('Getting Measurement Characteristic...');
    return measurementService.getCharacteristic('e7add780-b042-4876-aae1-112855353cc1');
  })
  .then(characteristic => {
    EEVTest.measurementCharacteristic = characteristic;
    EEVTest.measurementCharacteristic.addEventListener('characteristicvaluechanged',
        EEVTest.handleMeasurementChanged);
    document.querySelector('#startNotifications').disabled = false;
    document.querySelector('#stopNotifications').disabled = true;
  });
}

/* This function will be called when `readValue` resolves and
 * characteristic value changes since `characteristicvaluechanged` event
 * listener has been added. */
EEVTest.handleMeasurementChanged = function(event) {
  let data = event.target.value;
  let parsingState = EEVTest.meter.processMessageData(data);
  //let msmt = new EEVBlog121GW.Measurement(data);
  //log('> Display value is ' + msmt.displayValue);
  //document.getElementById('measurement_mode').innerHTML = msmt.meterMode.name;
  //document.getElementById('measurement_value').innerHTML = msmt.displayValue.split(" ")[0];
  //document.getElementById('measurement_units').innerHTML = msmt.displayValue.split(" ")[1];
}

EEVTest.onDisconnected = function(event) {
  let device = event.target;
  log('Device ' + device.name + ' is disconnected.');
}

EEVTest.onStartNotificationsButtonClick = function() {
  log('Starting Measurement Notifications...');
  EEVTest.measurementCharacteristic.startNotifications()
  .then(_ => {
    log('> Notifications started');
    document.querySelector('#startNotifications').disabled = true;
    document.querySelector('#stopNotifications').disabled = false;
  })
  .catch(error => {
    log('Argh! ' + error);
  });
}

EEVTest.onStopNotificationsButtonClick = function() {
  log('Stopping Measurement Notifications...');
  EEVTest.measurementCharacteristic.stopNotifications()
  .then(_ => {
    log('> Notifications stopped');
    document.querySelector('#startNotifications').disabled = false;
    document.querySelector('#stopNotifications').disabled = true;
  })
  .catch(error => {
    log('Argh! ' + error);
  });
}

EEVTest.onResetButtonClick = function() {
  if (!EEVTest.bluetoothDevice) {
    return;
  }
  log('Disconnecting from Bluetooth Device...');
  if (EEVTest.bluetoothDevice.gatt.connected) {
    EEVTest.bluetoothDevice.gatt.disconnect();
  } else {
    log('> Bluetooth Device is already disconnected');
  }
  EEVTest.bluetoothDevice = null;
}

/* Utils */
EEVTest.anyDevice = function() {
  // This is the closest we can get for now to get all devices.
  // https://github.com/WebBluetoothCG/web-bluetooth/issues/234
  return Array.from('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ')
      .map(c => ({namePrefix: c}))
      .concat({name: ''});
}

EEVTest.eevblog121gwDevices = function() {
  // To scan for just 121GW meters, look for the main (advertised) service
  // Note: the UUID must be lowercase!
  return [{services: ['0bd51666-e7cb-469b-8e4d-2742f1ba77cc']}];
}
