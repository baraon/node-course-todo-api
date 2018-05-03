const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');

const {app} = require('./../server');
const {Todo} = require('./../models/todo');
const {todos, populateTodos, users, populateUsers} = require('./seed/seed');
const {User} = require('./../models/user');

beforeEach(populateUsers);
beforeEach(populateTodos);

describe('POST /todos', () => {
  it('should create a new todo', (done) => {
    var text = 'Todo test text';

    request(app)
      .post('/todos')
      .send({text})
      .expect(200)
      .expect((res) => {
        expect(res.body.text).toBe(text);
      })
      .end((err, res) => {
        if(err) {
          return done(err);
        }

        Todo.find({text}).then((todos) => {
          expect(todos.length).toBe(1);
          expect(todos[0].text).toBe(text);
          done();
        }).catch((e) => done(e));
      });
  });

  it('should not create todo with invalid body data', (done) => {
    request(app)
      .post('/todos')
      .send({})
      .expect(400)
      .end((err, res) => {
        if(err) {
          return done(err)
        }
        Todo.find().then((todos) => {
          expect(todos.length).toBe(2);
          done();
        }).catch((e) => done(e));
      });
  });
});

describe('GET /todos', () => {
  it('should get all todos', (done)=> {
    request(app)
      .get('/todos')
      .expect(200)
      .expect((res) => {
        expect(res.body.todos.length).toBe(2);
      })
      .end(done);
  });

  describe('GET /todos/:id', () => {
    it(`should get todos with id of: ${todos[0]._id.toHexString()}`, (done) => {
      request(app)
        .get(`/todos/${todos[0]._id.toHexString()}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.todo.text).toBe(todos[0].text);
        })
        .end(done);
    });

    it('should return 404 if todo not found', (done) => {
      var hexID = new ObjectID().toHexString();
      request(app)
        .get(`/todos/${hexID}`)
        .expect(404)
        .end(done);
    });

    it('should return 404 for non-object ids', (done) => {
      request(app)
        .get('/todos/123')
        .expect(404)
        .end(done);

    });
  });

  describe('DELETE /todos/:id', () => {
      it('should remove a todo', (done) => {
        var hexID = todos[0]._id.toHexString();

        request(app)
          .delete(`/todos/${hexID}`)
          .expect(200)
          .expect((res) => {
            expect(res.body.todo._id).toBe(hexID);
          })
          .end((err, res) => {
            if(err) {
              return done(err);
            }

            Todo.findById(hexID).then((todo) => {
              expect(todo).toNotExist();
              done();
            }).catch((e) => done(e));
          });
      });

      it('should return 404 if todo not found', (done) => {
        var hexID = new ObjectID().toHexString();

        request(app)
          .delete(`/todos/${hexID}`)
          .expect(404)
          .end(done);
      });

      it('should return 404 if object id is invalid', (done) => {
        request(app)
          .delete('/todos/123')
          .expect(404)
          .end(done);
      });
  });

  describe('PATCH /todos/:id', () => {
      it('should update a todo', (done) => {
        var hexID = todos[0]._id.toHexString();
        var text = 'the new new text';

        request(app)
          .patch(`/todos/${hexID}`)
          .send({
            completed: true,
            text: text
          })
          .expect(200)
          .expect((res) => {
            expect(res.body.todo.text).toBe(text);
            expect(res.body.todo.completed).toBe(true);
            expect(res.body.todo.completedAt).toBeA('number');
          })
          .end(done);
      });

      it('should clear completedAt when todo is not complete', (done) => {
        var hexID = todos[1]._id.toHexString();
        var text = 'the new new new new text';

        request(app)
          .patch(`/todos/${hexID}`)
          .send({
            completed: false,
            text: text
          })
          .expect(200)
          .expect((res) => {
            expect(res.body.todo.text).toBe(text);
            expect(res.body.todo.completed).toBe(false);
            expect(res.body.todo.completedAt).toNotExist();
          })
          .end(done);
      });

      it('should return 404 if todo not found', (done) => {
        var hexID = new ObjectID().toHexString();

        request(app)
          .patch(`/todos/${hexID}`)
          .expect(404)
          .end(done);
      });

      it('should return 404 if object id is invalid', (done) => {
        request(app)
          .patch('/todos/123')
          .expect(404)
          .end(done);
      });
  });

  describe('GET /users/me', () => {
    it('should return user if authenticated', (done) => {
      request(app)
        .get('/users/me')
        .set('x-auth', users[0].tokens[0].token)
        .expect(200)
        .expect((res) => {
          expect(res.body._id).toBe(users[0]._id.toHexString());
          expect(res.body.email).toBe(users[0].email);
        })
        .end(done);
    });

    it('should return 401 if not authenticated', (done) => {
      request(app)
        .get('/users/me')
        .set('x-auth', '123')
        .expect((res) => {
          expect(res.body).toEqual({});
        })
        .expect(401)
        .end(done);
    });
  });

  describe('POST /users', () => {
    it('should create a user', (done) => {
      var email = 'example@example.com';
      var password = '123abc';

      request(app)
        .post('/users')
        .send({email, password})
        .expect(200)
        .expect((res) => {
          expect(res.headers['x-auth']).toExist();
          expect(res.body._id).toExist();
          expect(res.body.email).toBe(email);
        })
        .end((err) => {
          if(err) {
            return done(err);
          }

          User.findOne({email}).then((user) => {
            expect(user).toExist();
            expect(user.password).toNotBe(password);
            done();
          });
        });
    });

    it('should return validation errors if request invalid', (done) => {
      var email = 'not a valid email cuh';
      var password = '';

      request(app)
        .post('/users')
        .send({email, password})
        .expect(400)
        .end(done);
    });

    it('should not create user if email in use', (done) => {
      var email = 'test@test.com';
      var password = '123';

      request(app)
        .post('/users')
        .send({email, password})
        .expect(400)
        .end(done);
    });
  });

  describe('POST /users/login', () => {
    it('should login user and return auth token', (done) => {
      request(app)
      .post('/users/login')
      .send({
        email: users[1].email,
        password: users[1].password
      })
      .expect(200)
      .expect((res) => {
        expect(res.headers['x-auth']).toExist();
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        User.findById(users[1]._id).then((user) => {
          expect(user.tokens[0]).toInclude({
            access: 'auth',
            token: res.headers['x-auth']
          });
          done();
        }).catch((e) => done(e));
      });
    });

    it('should reject invalid login', (done) => {
      request(app)
      .post('/users/login')
      .send({
        email: users[1].email,
        password: 'invalid password'
      })
      .expect(400)
      .end(done);
    });
  });

  describe('DELETE /users/me/token', () => {
    it('should logout user and delete auth token', (done) => {
      request(app)
        .delete('/users/me/token')
        .set('x-auth', users[0].tokens[0].token)
        .expect(200)
        .end((err, res) => {
          if(err) {
            return done(err);
          }

          User.findById(users[0]._id).then((user) => {
            expect(user.tokens.length).toBe(0);
            done();
        }).catch((e) => done(e));
    });
  });
  });
});
