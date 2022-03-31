const request = require('supertest');
const app = require('../../src/app');
const { mockUser, seedTestDB, tearDownDB } = require('../dbSetup');

describe('Test /comment endpoints', () => {
  describe('POST /comment/:listing_id', () => {
    let token;
    let userid;

    beforeEach(async () => {
      await tearDownDB();
      await seedTestDB();
      const mockUserReqBody = {
        email: mockUser.email,
        password: mockUser.password,
      };
      const signinRes = await request(app)
        .post('/auth/signin')
        .send(mockUserReqBody);
      token = signinRes.body.authToken;
      userid = signinRes.body.userId;
    });

    afterEach(async () => {
      await tearDownDB();
    });

    it('Successfully created a comment', async () => {
      const mockPostListingReqBody = {
        userID: userid,
        title: 'Dining Table In Good Condition',
        condition: 'used',
        category: 'Table',
        city: 'Winnipeg',
        provinceCode: 'MB',
        imageURL: 'https://source.unsplash.com/gySMaocSdqs/',
        price: 50,
        description: 'Just used for 3 years',
      };

      const mockPostCommentReqBody = {
        comment: 'mock comment',
      };

      const postListingRes = await request(app)
        .post('/listing')
        .set('Authorization', `Bearer ${token}`)
        .send(mockPostListingReqBody);

      const postCommentRes = await request(app)
        .post(`/comment/${postListingRes.body.listingId}`)
        .set('Authorization', `Bearer ${token}`)
        .send(mockPostCommentReqBody);

      expect(postCommentRes.statusCode).toEqual(200);
    });

    it('Should return 404 error if listing does not exist', async () => {
      const mockPostCommentReqBody = {
        comment: 'mock comment',
      };

      const postCommentRes = await request(app)
        .post('/comment/123123')
        .set('Authorization', `Bearer ${token}`)
        .send(mockPostCommentReqBody);

      expect(postCommentRes.statusCode).toEqual(404);
    });

    it('Should return 400 error if comment field is not provided', async () => {
      const mockPostListingReqBody = {
        userID: userid,
        title: 'Dining Table In Good Condition',
        condition: 'used',
        category: 'Table',
        city: 'Winnipeg',
        provinceCode: 'MB',
        imageURL: 'https://source.unsplash.com/gySMaocSdqs/',
        price: 50,
        description: 'Just used for 3 years',
      };

      const postListingRes = await request(app)
        .post('/listing')
        .set('Authorization', `Bearer ${token}`)
        .send(mockPostListingReqBody);

      let postCommentRes = await request(app)
        .post(`/comment/${postListingRes.body.listingId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({});

      expect(postCommentRes.statusCode).toEqual(400);

      postCommentRes = await request(app)
        .post(`/comment/${postListingRes.body.listingId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ comment: '' });

      expect(postCommentRes.statusCode).toEqual(400);
    });
  });

  describe('GET /comment/:listing_id', () => {
    let token;
    let userid;

    beforeEach(async () => {
      await tearDownDB();
      await seedTestDB();
      const mockUserReqBody = {
        email: mockUser.email,
        password: mockUser.password,
      };
      const signinRes = await request(app)
        .post('/auth/signin')
        .send(mockUserReqBody);
      token = signinRes.body.authToken;
      userid = signinRes.body.userId;
    });

    afterEach(async () => {
      await tearDownDB();
    });

    it('Successfully fetch a comment that was just created', async () => {
      const mockPostListingReqBody = {
        userID: userid,
        title: 'Dining Table In Good Condition',
        condition: 'used',
        category: 'Table',
        city: 'Winnipeg',
        provinceCode: 'MB',
        imageURL: 'https://source.unsplash.com/gySMaocSdqs/',
        price: 50,
        description: 'Just used for 3 years',
      };

      const mockPostCommentReqBody = {
        comment: 'mock comment',
      };

      const postListingRes = await request(app)
        .post('/listing')
        .set('Authorization', `Bearer ${token}`)
        .send(mockPostListingReqBody);

      await request(app)
        .post(`/comment/${postListingRes.body.listingId}`)
        .set('Authorization', `Bearer ${token}`)
        .send(mockPostCommentReqBody);

      const getCommentRes = await request(app)
        .get(`/comment/${postListingRes.body.listingId}`);
      expect(getCommentRes.statusCode).toEqual(200);
    });

    it('Successfully fetch >1 comment', async () => {
      const mockPostListingReqBody = {
        userID: userid,
        title: 'Dining Table In Good Condition',
        condition: 'used',
        category: 'Table',
        city: 'Winnipeg',
        provinceCode: 'MB',
        imageURL: 'https://source.unsplash.com/gySMaocSdqs/',
        price: 50,
        description: 'Just used for 3 years',
      };

      const mockPostCommentReqBody1 = {
        comment: 'mock comment1',
      };

      const mockPostCommentReqBody2 = {
        comment: 'mock comment2',
      };

      const postListingRes = await request(app)
        .post('/listing')
        .set('Authorization', `Bearer ${token}`)
        .send(mockPostListingReqBody);

      await request(app)
        .post(`/comment/${postListingRes.body.listingId}`)
        .set('Authorization', `Bearer ${token}`)
        .send(mockPostCommentReqBody1);

      await request(app)
        .post(`/comment/${postListingRes.body.listingId}`)
        .set('Authorization', `Bearer ${token}`)
        .send(mockPostCommentReqBody2);

      const getCommentRes = await request(app)
        .get(`/comment/${postListingRes.body.listingId}`);
      expect(getCommentRes.statusCode).toEqual(200);
      expect(getCommentRes.body.comments.length).toEqual(2);
    });

    it('Should return 404 error if listing does not exist', async () => {
      const getCommentRes = await request(app)
        .get('/comment/123123');

      expect(getCommentRes.statusCode).toEqual(404);
    });
  });
});
