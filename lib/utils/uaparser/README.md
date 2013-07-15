# User-agent parser

This folder contains a user-agent parser based on [ua-parser](https://github.com/tobie/ua-parser/) and adjusted to fit the specific of the Factory.

The `regexes.yaml` file contains the list of regular expressions to use to extract meaningful information from opaque user-agent strings. The file is directly copied over from ua-parser's [regexes.yaml](https://raw.github.com/tobie/ua-parser/master/regexes.yaml) file. The file is divived into different sections: the `user_agent_parsers` and `device_parsers` sections are of particular interest for the Factory. That file should be updated from time to time as it gets completed by the community.

The `regexes-custom.yaml` file contains additional regular expressions that are more or less specific to the Factory.

The `parse.js` file is similar to the parse function exposed by the ua-parser project. It parses a user-agent string and returns an object structure that contains meaningful info about the device.

For instance, given the user-agent:

```
Mozilla/5.0 (Linux; U; Android 4.0; xx-xx; GT-P5100 Build/IML74K) AppleWebKit/534.30 (KHTML, like Gecko) Version/4.0 Safari/534.30
```

... the function returns:

```json
{
  "ua": {
    "family": "Android",
    "major": "4",
    "minor": "0"
  },
  "device": {
    "family": "GT-P5100"
  },
  "formfactor": {
    "family": "tablet"
  }
}
```

Main differences with the ua-project code:

* The `formfactor` property describes the generic device family bucket that the Factory uses to select the appropriate start file of a template.
* The `os` property is not implemented (but could easily be added if needed)


## How `parse` works

The parser uses the `regexes.js` file, generated from the `regexes.yaml` and
`regexes-custom.yaml` files as basis to extract relevant `ua` and `device` information. It then uses the `formfactormapping.js` file to set the appropriate `formfactor` property.


## How to update `regexes.yaml`

Whenever you want to update the `regexes.yaml` or `regexes-custom.yaml`, run:

```bash
node update-regexes.js
```

This will update the `regexes.js` file.