const express = require('express');
const { randomBytes } = require('crypto');
const axios = require('axios');

const app = express();
app.use(express.json());
app.use(require('cors')());

const commentsByPostId = {};

app.get('/posts/:id/comments', (req, res) => {
  res.json(commentsByPostId[req.params.id] || []);
});

app.post('/posts/:id/comments', async (req, res) => {
  const postId = req.params.id;
  const commentId = randomBytes(4).toString('hex');
  const { content } = req.body;

  const comments = commentsByPostId[postId] || [];
  comments.push({ id: commentId, content });

  commentsByPostId[postId] = comments;

  await axios.post('http://event-bus-srv:4005/events', {
    type: 'CommentCreated',
    data: {
      id: commentId,
      content,
      postId,
    },
  });

  res.status(201).json(comments);
});

app.post('/events', (req, res) => {
  res.json({});
});

app.listen(4001, () => console.log('App is running on port 4001'));
