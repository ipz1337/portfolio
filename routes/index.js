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

async function getAllBlogs() {
  try {
    const connection = await getConnection();
        //only return the title and id and date and image
    const [rows] = await connection.execute('SELECT id, title, date, image FROM blogs');
    connection.release();
    return rows;
  } catch (error) {
    console.error('Error getting blogs from database:', error);
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

async function getAllBlogs() {
  try {
    const connection = await getConnection();
        //only return the title and id and date and image
    const [rows] = await connection.execute('SELECT id, title, date, image FROM blogs');
    connection.release();
    return rows;
  } catch (error) {
    console.error('Error getting blogs from database:', error);
    throw error;
  }
}

const ITEMS_PER_PAGE = 9; // or any number you prefer

router.get('/blogs', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const offset = (page - 1) * ITEMS_PER_PAGE;

        const connection = await getConnection();
        const [rows] = await connection.execute('SELECT id, title, date, image FROM blogs LIMIT ? OFFSET ?', [ITEMS_PER_PAGE, offset]);
        connection.release();

        const nextPage = page + 1;
        const prevPage = page - 1 > 0 ? page - 1 : 1;

        return res.status(200).render('blogs', { blogs: rows, nextPage, prevPage });
    } catch (error) {
        console.error('Error retrieving blogs:', error);
        return res.status(500).send('Error retrieving blogs');
    }
});

router.get('/blogs/:id', async (req, res) => {
  try {
      const blogId = req.params.id;

      const connection = await getConnection();
      const [rows] = await connection.execute('SELECT * FROM blogs WHERE id = ?', [blogId]);
      connection.release();

      if (rows.length === 0) {
          return res.status(404).send('Blog not found');
      }

      const blog = rows[0];
      return res.status(200).render('blog', { blog });
  } catch (error) {
      console.error('Error retrieving blog:', error);
      return res.status(500).send('Error retrieving blog');
  }
});



const Post_Key = "yourSecretPassword"; // Change this to your desired password

router.get('/create-blog', (req, res) => {
    //no key required to get to the page
    try {
        return res.status(200).render('createBlog');
    } catch (error) {
        console.error('Error retrieving blogs:', error);
        return res.status(500).send('Error retrieving blogs');
    }
});

router.post('/create-blog', async (req, res) => {
    try {
        const { title, content, image, password } = req.body;
        const date = new Date().toISOString().slice(0, 19).replace('T', ' ');
        const category = 'Uncategorized';
        const author = 'Admin';
        if (password !== Post_Key) {
            return res.status(401).send('Incorrect password');
        }

        const connection = await getConnection();
        const [rows] = await connection.execute('INSERT INTO blogs (title, content, image, date, category, author) VALUES (?, ?, ?, ?, ?, ?)', [title, content, image, date, category, author]);

        return res.status(200).send('Blog created successfully');
    } catch (error) {
        console.error('Error creating blog:', error);
        return res.status(500).send('Error creating blog');
    }
});


router.use('/api', apiDir);

module.exports = router;
