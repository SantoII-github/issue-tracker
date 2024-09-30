const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
    let projectname = "testing-suite" + new Date().toString();

    suite('POST /api/issues/:project', () => {
        test('Create issue with every field', (done) => {
            let testData = {
                issue_title: 'Test Title 1',
                issue_text: 'Test Text 1',
                created_by: 'Post Test Suite',
                assigned_to: 'Chai',
                status_text: 'To be tested'
            }

            chai
                .request(server)
                .post(`/api/issues/${projectname}`)
                .send(testData)
                .end((err, res) => {
                    assert.equal(res.status, 200);
                    assert.equal(res.body.issue_title, testData.issue_title)
                    assert.equal(res.body.issue_text, testData.issue_text)
                    assert.equal(res.body.created_by, testData.created_by)
                    assert.equal(res.body.assigned_to, testData.assigned_to)
                    assert.equal(res.body.status_text, testData.status_text)
                    issueId_1 = res.body._id;
                    done();
                })
        });

        test('Create issue with only required fields', (done) => {
            let testData = {
                issue_title: 'Test Title 2',
                issue_text: 'Test Text 2',
                created_by: 'Post Test Suite'
            }

            chai
                .request(server)
                .post(`/api/issues/${projectname}`)
                .send(testData)
                .end((err, res) => {
                    assert.equal(res.status, 200);
                    assert.equal(res.body.issue_title, testData.issue_title)
                    assert.equal(res.body.issue_text, testData.issue_text)
                    assert.equal(res.body.created_by, testData.created_by)
                    issueId_2 = res.body._id;
                    done();
                })
        });

        test('Create issue with missing required fields', (done) => {
            let testData = {
                issue_title: 'Test Title 3',
                created_by: 'Post Test Suite'
            }

            chai
                .request(server)
                .post(`/api/issues/${projectname}`)
                .send(testData)
                .end((err, res) => {
                    assert.equal(res.status, 200);
                    assert.equal(res.body.error, 'required field(s) missing')
                    done();
                })
        });
    });

    suite('GET /api/issues/:project', () => {
        test('View issues on a project:', (done) => {
            chai
                .request(server)
                .get(`/api/issues/${projectname}`)
                .end((err, res) => {
                    assert.equal(res.status, 200);
                    assert.isAtLeast(res.body.length, 1)
                    done();
                })
        });

        test('View issues on a project with one filter:', (done) => {
            let query = "?issue_title='Test Title 1'"

            chai
                .request(server)
                .get(`/api/issues/${projectname}` + query)
                .end((err, res) => {
                    assert.equal(res.status, 200);
                    res.body.forEach(issue => {
                        assert.equal(issue.issue_title, 'Test Title 1')
                        assert.isAtLeast(res.body.length, 1)
                    });
                    done();
                })
        });

        test('View issues on a project with multiple filters:', (done) => {
            let query = "?issue_title='Test Title 1'&created_by='Post Test Suite'"

            chai
                .request(server)
                .get(`/api/issues/${projectname}` + query)
                .end((err, res) => {
                    assert.equal(res.status, 200);
                    res.body.forEach(issue => {
                        assert.equal(issue.issue_title, 'Test Title 1')
                        assert.equal(issue.created_by, 'Post Test Suite')
                        assert.isAtLeast(res.body.length, 1)
                    });
                    done();
                })
        });
    });

    suite('PUT /api/issues/:project', () => {
        test('Update one field on an issue:', (done) => {
            let testData = {
                _id: issueId_1,
                issue_title: 'Updated Title 1'
            }

            chai
                .request(server)
                .put(`/api/issues/${projectname}`)
                .send(testData)
                .end((err, res) => {
                    assert.equal(res.status, 200);
                    assert.equal(res.body.result, 'successfully updated')
                    assert.equal(res.body._id, issueId_1)
                })

            let query = `?issue_title=${testData.issue_title}&_id=${testData._id}`

            chai
                .request(server)
                .get(`/api/issues/${projectname}` + query)
                .end((err, res) => {
                    assert.equal(res.status, 200);
                    res.body.forEach(issue => {
                        assert.equal(issue.issue_title, testData.issue_title)
                        assert.equal(issue._id, testData._id)
                        assert.equal(res.body.length, 1)
                    });
                    done();
                })
        });

        test('Update multiple fields on an issue:', (done) => {
            let testData = {
                _id: issueId_2,
                issue_title: 'Updated Title 2',
                issue_text: 'Updated Text 2'
            }

            chai
                .request(server)
                .put(`/api/issues/${projectname}`)
                .send(testData)
                .end((err, res) => {
                    assert.equal(res.status, 200);
                    assert.equal(res.body.result, 'successfully updated')
                    assert.equal(res.body._id, issueId_2)
                })

            let query = `?issue_title=${testData.issue_title}&_id=${testData._id}&issue_text=${testData.issue_text}`

            chai
                .request(server)
                .get(`/api/issues/${projectname}` + query)
                .end((err, res) => {
                    assert.equal(res.status, 200);
                    res.body.forEach(issue => {
                        assert.equal(issue.issue_title, testData.issue_title)
                        assert.equal(issue._id, testData._id)
                        assert.equal(issue.issue_text, testData.issue_text)
                        assert.equal(res.body.length, 1)
                    });
                    done();
                })
        });

        test('Update an issue with missing _id:', (done) => {
            let testData = {
                issue_title: 'Updated Title 2',
                issue_text: 'Updated Text 2'
            }

            chai
                .request(server)
                .put(`/api/issues/${projectname}`)
                .send(testData)
                .end((err, res) => {
                    assert.equal(res.status, 200);
                    assert.equal(res.body.error, 'missing _id')
                    done();
                })
        });

        test('Update an issue with no fields to update:', (done) => {
            let testData = {
                _id: issueId_1,
            }

            chai
                .request(server)
                .put(`/api/issues/${projectname}`)
                .send(testData)
                .end((err, res) => {
                    assert.equal(res.status, 200);
                    assert.equal(res.body.error, 'no update field(s) sent')
                    done();
                })
        });

        test('Update an issue with an invalid _id:', (done) => {
            let testData = {
                _id: "5871dda29faedc3491ff93bb",
                issue_title: 'Fake ID',
            }

            chai
                .request(server)
                .put(`/api/issues/${projectname}`)
                .send(testData)
                .end((err, res) => {
                    assert.equal(res.status, 200);
                    assert.equal(res.body.error, 'could not update')
                    assert.equal(res.body._id, testData._id)
                    done();
                })
        });

        suite('DELETE /api/issues/:project', () => {
            test('Delete an issue:', (done) => {
                let testData = {
                    _id: issueId_2,
                }
    
                chai
                    .request(server)
                    .delete(`/api/issues/${projectname}`)
                    .send(testData)
                    .end((err, res) => {
                        assert.equal(res.status, 200);
                        assert.equal(res.body.result, 'successfully deleted')
                        assert.equal(res.body._id, testData._id)
                        done();
                    })
            });

            test('Delete an issue with an invalid _id:', (done) => {
                let testData = {
                    _id: "5871dda29faedc3491ff93bb",
                }
    
                chai
                    .request(server)
                    .delete(`/api/issues/${projectname}`)
                    .send(testData)
                    .end((err, res) => {
                        assert.equal(res.status, 200);
                        assert.equal(res.body.error, 'could not delete')
                        assert.equal(res.body._id, testData._id)
                        done();
                    })
            });

            test('Delete an issue with missing _id:', (done) => {
                let testData = {
                }
    
                chai
                    .request(server)
                    .delete(`/api/issues/${projectname}`)
                    .send(testData)
                    .end((err, res) => {
                        assert.equal(res.status, 200);
                        assert.equal(res.body.error, 'missing _id')
                        done();
                    })
            });
        });
    });
});
