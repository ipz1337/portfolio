const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const { getConnection } = require('../../utils/mysql');
const { Webhook, MessageBuilder } = require('discord-webhook-node');
const hook = new Webhook('https://discord.com/api/webhooks/1100517178773602456/ixjHBGLcApFoi3AIhZM0TLoW3e5Q1Bw7c4oSlr7o3moT5KtTX8A1Npka_JF2ef2H01xd');

const ratelimit = require('express-rate-limit');


//quote = 1 request per day

const quoteLimiter = ratelimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 1, // limit each IP to 1 requests per windowMs
  message: 'You have reached the daily limit of 1 quote request. Please try again tomorrow.'
});



//use the limiter
router.use('/quote', quoteLimiter);

router.post(
  '/add_project',
  [
    check('name').not().isEmpty().trim().escape(),
    check('description').not().isEmpty().trim().escape(),
    check('image').not().isEmpty().trim().escape(),
    check('link').not().isEmpty().trim().escape(),
    check('userAuthKey').not().isEmpty().trim().escape(),
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    const { name, description, image, link, userAuthKey } = req.body;

    if (userAuthKey !== process.env.APIKEY) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
      const connection = await getConnection();
      const [result] = await connection.execute(
        'INSERT INTO projects (title, `desc`, image, url) VALUES (?, ?, ?, ?)',
        [name, description, image, link]
      );
      connection.release();
      return res.status(200).json({ message: 'Project added successfully', projectId: result.insertId });
    } catch (error) {
      console.error('Error adding project to database:', error);
      return res.status(500).json({ message: 'Error adding project to database' });
    }
  }
);



router.post('/quote', async (req, res) => {
  console.log(req.body);

  const {
    email = "N/A",
    telegramOrDiscord = "N/A",
    projectDetails = "N/A",
    budgetRange = "N/A",
    timeframe = "N/A",
    otherDetails = "N/A"
  } = req.body;

  // Check if required fields are empty
  if (!email || !projectDetails) {
    return res.status(400).send('Email and project details are required.');
  }

  // Construct the embed object with the submitted data
  const embed = new MessageBuilder()
  .setTitle('New Quote Request')
  .setColor('#7289DA')
  .addField('Email', email || 'N/A')
  .addField('Telegram or Discord', telegramOrDiscord || 'N/A')
  .addField('Project Details', projectDetails || 'N/A')
  .addField('Budget Range', budgetRange || 'N/A')
  .addField('Timeframe', timeframe || 'N/A')
  .addField('Other Details', otherDetails || 'N/A')
  .setFooter('Powered by swyft')
  .setTimestamp();
  try {
    // Send the embed to the Discord webhook
    await hook.send(embed);

    // Redirect the user back to the home page
    return res.status(200).redirect('/');
  } catch (error) {
    console.error(error);

    // Handle any errors
    return res.status(500).send('An error occurred while sending the request.');
  }
});

module.exports = router;
