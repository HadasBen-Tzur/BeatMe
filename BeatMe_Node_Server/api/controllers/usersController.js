const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/userSchema');

module.exports = {
    signup: (req, res) => {
        // const { path: image } = req.file;
        const { firstName, lastName, userName, email, phone, password, getEmail } = req.body;
        
        User.find({ email }).then((users) => {
            if (users.length >= 1) {
                return res.status(409).json({
                    message: 'Email exists'
                })
            }
            User.find({ userName }).then((users) => {
                if (users.length >= 1) {
                    return res.status(409).json({
                        message: 'UserName exists'
                    })
                }
                bcrypt.hash(password, 10, (error, hash) => {
                    if (error) {
                        return res.status(500).json({
                            error
                        })
                    }

                    const user = new User({
                        _id: new mongoose.Types.ObjectId(),
                        firstName,
                        lastName,
                        userName,
                        email,
                        phone,
                        password: hash,
                        getEmail,
                        image: image.replace('\\','/')
                    })

                    user.save().then((result) => {
                        console.log(result);

                        res.status(200).json({
                            message: 'User created'
                        });
                    }).catch(error => {
                        res.status(500).json({
                            error
                        })
                    });
                });
            })
        })
    },
    // addimage: (req, res)=>{
    //     console.log(req)
    //     console.log(req.files)
    //     const obj = JSON.parse(JSON.stringify(req.body)); // req.body = [Object: null prototype] { title: 'product' }
    //     console.log(obj);
    //     console.log('req.file', req.file, req.files, req.body)
        
    //     // const { path: image } = req.file;
       
    // },

    login: (req, res) => {
        const { userName, email, password } = req.body;

        User.find(email ? { email } : { userName }).then((users) => {

            if (users.length === 0) {
                return res.status(401).json({
                    message: 'Auth failed'
                });
            }

            const [user] = users;

            bcrypt.compare(password, user.password, (error, result) => {
                if (error) {
                    return res.status(401).json({
                        message: 'Auth failed'
                    });
                }

                if (result) {
                    const token = jwt.sign({
                        id: user._id,
                        userName: user.userName,
                        email: user.email
                    },
                        process.env.JWT_KEY,
                        {
                            //expiresIn: "3H"
                        });
                    console.log(user)
                    return res.status(200).json({
                        message: 'Auth successful',
                        user
                    })
                }

                res.status(401).json({
                    message: 'Auth failed'
                });
            })
        })
    },
    update: (req, res) => {
        //check when the user want to change the email and validate it
        const oldEmail = req.body.oldEmail;
        console.log(req.body)
        const { _id, firstName, lastName, userName, email, phone, password, getEmails } = req.body;

        User.findOne({ oldEmail }).then((users) => {
            console.log("u", users)
            if (!users) {
                return res.status(404).json({
                    message: 'User not found'
                })
            }
            User.find({ email }).then((users) => {
                if (users.length >= 1) {
                    return res.status(409).json({
                        message: 'Email exists'
                    })
                }
                User.find({ userName }).then((users) => {
                    if (users.length >= 1) {
                        return res.status(409).json({
                            message: 'UserName exists'
                        })
                    }

                    User.updateOne({ _id: _id }, req.body).then(() => {
                        res.status(200).json({
                            message: 'User Updated'
                        })
                    }).catch(error => {
                        res.status(500).json({
                            error
                        })
                    });
                })
            })
        })
    },
    getAllUsers: (req, res) => {
        User.find().then((users) => {
            res.status(200).json({
                users
            })
        }).catch(error => {
            res.status(500).json({
                error
            })
        });
    },
    getUser: (req, res) => {
        const userId = req.params.userId;
        User.findById(userId).then((user) => {
            res.status(200).json({
                user
            })
        }).catch(error => {
            res.status(500).json({
                error
            })
        });
    },
    getByEmail: (req, res) => {
        const email = req.params.email;
        User.findOne({ email }).then((user) => {

            if (user === null) {
                return res.status(401).json({
                    message: 'email not  found'
                });
            }
            return res.status(200).json({
                message: 'email exist'
            })
        }).catch(error => {
            res.status(500).json({
                error
            })
        });
    },
    getByUserName: (req, res) => {
        const userName = req.params.username;
        console.log(userName)
        User.findOne({ userName }).then((user) => {

            if (user === null) {
                return res.status(401).json({
                    message: 'uaername not  found'
                });
            }
            return res.status(200).json({
                message: 'username exist'
            })
        }).catch(error => {
            res.status(500).json({
                error
            })
        });
    },
}