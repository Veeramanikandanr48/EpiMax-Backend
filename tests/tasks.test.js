const request = require('supertest');
const app = require('../server'); // Import your Express app

describe('Tasks API', () => {
  let authToken;
  let taskId; // Declare taskId variable to store the ID of the created task

  beforeAll(async () => {
    // Authenticate a user with the necessary permissions
    const loginResponse = await request(app)
      .post('/login')
      .send({ username: 'adminusername', password: 'adminpassword' });

    authToken = loginResponse.body.token;
  });

  it('should create a new task', async () => {
    const newTask = { title: 'New Task', description: 'Description of the new task' };

    const response = await request(app)
      .post('/tasks')
      .set('Authorization', `Bearer ${authToken}`)
      .send(newTask);

    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty('taskId');

    // Store the ID of the created task
    taskId = response.body.taskId;
  });

  it('should get all tasks', async () => {
    const response = await request(app)
      .get('/tasks')
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThanOrEqual(1); // Assuming there's at least one task
  });

  it('should get a task by ID', async () => {
    const response = await request(app)
      .get(`/tasks/${taskId}`) // Use the stored taskId
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('id', taskId);
  });

  it('should return 404 if task not found', async () => {
    const nonExistentTaskId = 'non_existent_task_id'; // Assuming this task ID does not exist

    const response = await request(app)
      .get(`/tasks/${nonExistentTaskId}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.statusCode).toBe(404);
  });

  it('should update a task by ID', async () => {
    const updatedTask = { title: 'Updated Task', description: 'Updated description' };

    const response = await request(app)
      .put(`/tasks/${taskId}`) // Use the stored taskId
      .set('Authorization', `Bearer ${authToken}`)
      .send(updatedTask);

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('message', 'Task updated successfully');
  });

  it('should return 404 if task not found when updating', async () => {
    const nonExistentTaskId = 'non_existent_task_id'; // Assuming this task ID does not exist
    const updatedTask = { title: 'Updated Task', description: 'Updated description' };

    const response = await request(app)
      .put(`/tasks/${nonExistentTaskId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send(updatedTask);

    expect(response.statusCode).toBe(404);
  });

  it('should delete a task by ID', async () => {
    const response = await request(app)
      .delete(`/tasks/${taskId}`) // Use the stored taskId
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('message', 'Task deleted successfully');
  });

  it('should return 404 if task not found when deleting', async () => {
    const nonExistentTaskId = 'non_existent_task_id'; // Assuming this task ID does not exist

    const response = await request(app)
      .delete(`/tasks/${nonExistentTaskId}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.statusCode).toBe(404);
  });
});

// Include the userRoutes tests here
describe('User Routes', () => {
    let authToken;
  
    beforeAll(async () => {
      // Authenticate a user with the necessary permissions
      const loginResponse = await request(app)
        .post('/login')
        .send({ username: 'adminusername', password: 'adminpassword' });
  
      authToken = loginResponse.body.token;
    });
  
    it('should get user profile', async () => {
      const response = await request(app)
        .get('/user/profile')
        .set('Authorization', `Bearer ${authToken}`);
  
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('username');
      expect(response.body).toHaveProperty('role');
    });
  
    it('should update user profile', async () => {
      const updatedProfile = { username: 'newusername', role: 'user' };
  
      const response = await request(app)
        .put('/user/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updatedProfile);
  
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('message', 'Profile updated successfully');
    });
  
    it('should delete user account', async () => {
      const response = await request(app)
        .delete('/user/profile')
        .set('Authorization', `Bearer ${authToken}`);
  
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('message', 'Account deleted successfully');
    });
  });

  
// Include the adminRoutes tests here
describe('Admin Routes', () => {
  let authToken;

  beforeAll(async () => {
    // Authenticate a user with admin permissions
    const loginResponse = await request(app)
      .post('/login')
      .send({ username: 'adminveera', password: 'adminpassword' });

    authToken = loginResponse.body.token;
  });

  it('should get all users', async () => {
    const response = await request(app)
      .get('/admin/users')
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThanOrEqual(1); // Assuming there's at least one user
  });

  it('should update a user by ID', async () => {
    // Assuming there's a user with ID 1 in the database
    const userIdToUpdate = 1;
    const updatedUser = { username: 'newusername', password: 'newpassword', role: 'user' };

    const response = await request(app)
      .put(`/admin/users/${userIdToUpdate}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send(updatedUser);

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('message', 'User updated successfully');
  });

  it('should delete a user by ID', async () => {
    // Assuming there's a user with ID 2 in the database
    const userIdToDelete = 2;

    const response = await request(app)
      .delete(`/admin/users/${userIdToDelete}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('message', 'User deleted successfully');
  });
});

