const request = require("request");

const fateLabels = {
  8:	"Legendary",
  7:	"Epic",
  6:	"Fantastic",
  5:	"Superb",
  4:	"Great",
  3:	"Good",
  2:	"Fair",
  1:	"Average",
  0:	"Mediocre",
  "-1":	"Poor",
  "-2":	"Terrible"
};
const getFateLabel = (number) => {
  if (number > 8) {
    return "Undefinedly awesome";
  }
  if (number < -2) {
    return "Undefinedly bad";
  }
  return fateLabels[number];
}

const characterNames = {
	'U76J576QM': 'Sam Dunbar',
  'U76NYHA8L': 'Tabby Carmichael',
  'U773ZGJEQ': 'Hal Bailmann',
  'U76JC19E1': 'Marcus Cain',
  'U76BLTN2X': 'The GM'
};
const getCharacterName = (user_id) => {
	if	(user_id in characterNames) {
  	return characterNames[user_id];
  }
  return false;
}

const confirmationMessages = [
  "Rolling dice...",
  "Estimating your failure...",
  "Approximating your success...",
  "Seeding pseudo-random generator...",
  "Shaking magic 8-ball...",
  "Listening to quantum noise...",
  "This isn't going to end well..."
];
const getConfirmationMessage = () => confirmationMessages[Math.floor(Math.random() * (confirmationMessages.length))];

const partRegex = /((?:\w+)(?: [+-]?\d+)?|(?:\w+ )?(?:[+-]?\d+))/g;
const findParts = (str) => {return str.match(partRegex)};

const partSplitRegex = /^(\w+)? ?([+-]?\d+)?$/;
const splitPart = (str) => {return str.match(partSplitRegex)};

let rollDice = () => {
  let results = [...Array(4)].map(() => Math.floor(Math.random() * (3)) - 1);
  return results;
};

let roll = (skill="Unnamed roll", modifier = 0) => {
	let dice = rollDice();
  let result = dice.reduce((a, b) => a + b, parseInt(modifier));
	return {
  	skill: skill,
    modifier: modifier,
    dice: dice,
    result: result,
    resultLabel: getFateLabel(result)
  }
}

const rollCommand = (user_name, user_id, text) => {
	let parts = findParts(text);
  let results = parts.reduce((acc, part) => {
  	let [,skill,modifier] = splitPart(part);
    acc.push(roll(skill,modifier));
    return acc;
  }, [])


  let response = {
    response_type: "in_channel",
    text: `*${user_name}* rolls for...`,
    attachments: results.map((result) => {
      return {
        mrkdwn_in: ["text", "footer"],
        text: `${result.skill}: *${result.result}* _(${result.resultLabel})_`,
        footer: `Roll: ${result.dice}, Modifier: ${result.modifier}`
      }
    })
	};

  if (getCharacterName(user_id))
  	response.text = `*${getCharacterName(user_id)}* _(${user_name})_ rolls for...`

  return response;
}


/**
 * HTTP Cloud Function.
 *
 * @param {Object} req Cloud Function request context.
 * @param {Object} res Cloud Function response context.
 */
exports.slashCommandsHttp = function slashCommandsHttp (req, res) {

  console.log("Request.body object:")
  console.log(req.body);

  if (req.body.team_id != 'T77AH0J0N')
  {
    res.send("I will not regress for you.")
    return;
  }

  let responseData = {
    '/roll': rollCommand
  }[req.body.command](req.body.user_name, req.body.user_id, req.body.text);

  res.json({
    "response_type": "ephemeral",
    "text": getConfirmationMessage()
  });

  request({
    uri: req.body.response_url,
    method: "POST",
    json: responseData
  });
};

/*
  Example req.body :
  {
    token: 'tkZ5APRroLCWhJMf6ebJ2Sef',
    team_id: 'T77AH0J0N',
    team_domain: 'regressionio',
    channel_id: 'D77GN9WMV',
    channel_name: 'directmessage',
    user_id: 'U76J576QM',
    user_name: 'kev.belisle',
    command: '/rbot',
    text: 'HELLO HELLO',
    response_url: 'https://hooks.slack.com/commands/T77AH0J0N/245367693313/8R6ljfDxgyLy1Ipam07SaOGg',
    trigger_id: '245367693329.245357018022.faa699ceeba26ac0c9c913668abde51d'
  }
*/
