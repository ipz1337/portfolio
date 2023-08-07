const express = require('express');
const router = express.Router();
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const apiDir = require('./api/index');
const { getConnection } = require('../utils/mysql');




const corsOptions = {
  origin: '*',
  methods: 'GET, POST, PUT, DELETE, OPTIONS',
  allowedHeaders: 'Content-Type, Authorization',
};

router.use(cors(corsOptions));
router.use(bodyParser.json());
router.use(express.urlencoded({ extended: true }));
router.use(express.static(path.resolve(__dirname, '', 'views')));
router.use(express.json({ limit: '50000mb' }));

async function getProjects() {
  try {
    const connection = await getConnection();
    const [rows] = await connection.execute('SELECT * FROM projects');
    connection.release();
    return rows;
  } catch (error) {
    console.error('Error getting projects from database:', error);
    throw error;
  }
}

async function getProjectById(id) {
  try {
    const connection = await getConnection();
    const [rows] = await connection.execute('SELECT * FROM projects WHERE id = ?', [id]);
    connection.release();
    return rows[0];
  } catch (error) {
    console.error('Error getting project by ID from database:', error);
    throw error;
  }
}

router.get('/', async (req, res) => {
  try {
    const projects = await getProjects();

    return res.render('index', { projects});
  } catch (error) {
    console.error('Error retrieving projects:', error);
    return res.status(500).send('Error retrieving projects');
  }
});

// New route for individual project pages
router.get('/project/:id', async (req, res) => {
  try {
    const projectId = req.params.id;
    const project = await getProjectById(projectId);
    if (project) {
      return res.status(200).render('project', { project });
    } else {
      return res.status(404).send('Project not found');
    }
  } catch (error) {
    console.error('Error retrieving project by ID:', error);
    return res.status(500).send('Error retrieving project');
  }
});


router.get('/get-a-quote', async (req, res) => {
  return res.status(200).render('quote');
});

router.use('/api', apiDir);

module.exports = router;
