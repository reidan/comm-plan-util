# Overview

This node package can be used to interact with xMatters Comm Plan exports.

# Features

## Process Communication Plans

Command Line Utility: ````process-comm-plan <Communication Plan Zip File>````

## Message Builder

Command Line Utility ````build-messages````

See [message-builder-templates](https://github.com/reidan/message-builder-templates) to see the library of existing templates.

It will process a combination of templates, local config and the form metadata (based on the blown up structure from the Process Communication Plans feature) to generate nice email message markup (in theory could go beyond email messages).

Takes three arguments:

* -configFile -c: The config file that will define all of the generated messages [default: ./conf/message-config.json]
* -templatesDir -t: The directory containing templates (most likely will be a local copy of the templates repo) [default: ~/message-builder/templates]
* -projectRoot -p: The path that holds the output of the process communication plan feature [default: current working directory]

Templates use Handlebars with 2 additional helpers/partials:

* xm_property (helper): takes a property name and grabs the Id of the Property from the form metadata and adds it into the message in a Comm Plan recognizable form (ie. {{xm_property name}})
* xm_parts (partial): Will process a list of parts and generate a single string of text. It requires that the active context has a "parts" variable which is a list of objects that look like one of the following: 

```` { "isProperty": true, "name": "property_name" } ````
```` { "isText": true, "text": "Something is happening" } ````

ie. Configuration:

```` 
{
	"property": "PROP_NAME1",
	"parts": [
		{
			"isText": true,
			"text": "Here is a property value: "
		},
		{
			"isProperty": "true",
			"name": "PROP_NAME2"
		}
	]
} 
````

Template:
````
{{xm_property property}}
<br />
{{> xm_parts }}

````

Output:
````
${PROP_NAME1.ID}
<br \>
Here is a peroperty value: ${PROP_NAME2.ID}

````