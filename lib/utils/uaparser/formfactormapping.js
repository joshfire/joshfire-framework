/**
 * @fileOverview Mapping tables between a device family or a ua family and the
 * corresponding "formfactor" family for the Factory.
 */

/**
 * Maps a device name to a specific form factor
 *
 * This mapping table should be used first as it is more specific than the more
 * generic family2formfactor table.
 */
define({
  device2formfactor: {
    // iOS
    'iPhone': 'phone',
    'iPad': 'tablet',

    // Amazon Kindle
    'Kindle Fire': 'phone',
    'Kindle Fire HD': 'phone',
    'Kindle Fire HD 8.9" WiFi': 'tablet',
    'Kindle Fire HD 8.9" 4G': 'tablet',

    // Google Nexus 10
    'Nexus 10': 'tablet',

    // Samsung Galaxy Tab 8.9 and 10.1 models, see:
    // http://www.handsetdetection.com/properties/vendormodel/Samsung
    // http://www.samsung.com/uk/consumer/mobile-devices/tablets/tablets
    'GT-P5100': 'tablet',
    'GT-P5110': 'tablet',
    'GT-P7100': 'tablet',
    'GT-P7300': 'tablet',
    'GT-P7310': 'tablet',
    'GT-P7500': 'tablet',
    'GT-P7510': 'tablet',
    'SC-01D': 'tablet',
    'P7510': 'tablet',

    // HP TouchPad
    'HP TouchPad': 'tablet',

    // Sony Xperia tablets, see:
    // http://www.handsetdetection.com/properties/vendormodel/Sony
    'SonySO-03E': 'tablet',
    'SGPT12': 'tablet',
    'Sony Tablet S': 'tablet',

    // TV
    'GoogleTV': 'tv',
    'Philips TV': 'tv',
    'SamsungTV': 'tv'
  },
  /**
   * Maps an OS name to a specific form factor
   *
   * This mapping table should be used after the former one as it is more generic
   */
  os2formfactor: {
    // Google TV
    'GoogleTV': 'tv'
  },
  /**
   * Maps a user-agent family name to a specific form factor
   *
   * This mapping table is more generic than the device2formfactory tablet and
   * should be used when the former table does not return anything
   */
  family2formfactor: {
    'webOS TouchPad': 'tablet',
    'Opera Tablet': 'tablet',
    'Kindle': 'tablet',
    'PlayBook': 'tablet',
    'WeTab': 'tablet',

    'Mobile Safari': 'phone',
    'Nokia': 'phone',
    'Android': 'phone',
    'IEMobile': 'phone',
    'Opera Mini': 'phone',
    'Opera Mobile': 'phone',
    'Blackberry': 'phone',
    'Palm Pre': 'phone',
    'Palm Blazer': 'phone',
    'Fennec': 'phone',
    'Chrome Mobile': 'phone',
    'Firefox Mobile': 'phone'
  }
});

