var User = require('./models/user');
var Round = require('./models/round');
var crypto      = require('crypto');

module.exports = function (express, app, jwt, moment) {
    /* PROTRACKER */
    var proTracker = express.Router();
    app.use('/protracker', proTracker);

    app.get('/', function(req, res) {
        res.render('protracker/index.hbs', {layout: 'protracker'});
    });

    app.get('/login', function(req, res) {
        res.render('protracker/login.hbs', {layout: 'protracker'});
    });

    app.post('/login', function(req, res) {
        User.findOne({
            username: req.body.username
        }, function(err, user) {
            if (err) throw err;
            if (!user) {
                res.json({ success: false, message: 'Authentication failed. User not found.' });
            } else if (user) {
                if (crypto.createHmac('sha256', req.body.password).digest('hex') != user.password) {
                    res.json({ success: false, message: 'Authentication failed. Wrong password.' });
                } else {
                    var expiry = moment().add(7, 'days').valueOf();
                    var token = jwt.sign(user._id, app.get('superSecret'), {
                        expiresIn : expiry
                    });
                    res.setHeader('x-access-token', token);
                    res.send({
                        success: true,
                        expires: expiry,
                        token: token
                    });
                }
            }
        });
    });

    app.get('/round', function(req, res) {
        res.render('protracker/round.hbs', {layout: 'protracker'});
    });

    app.post('/save', function(req, res) {
        Round.findOne({
            tournament: req.body.tournament
        }, function(err, round) {
            if (err) throw err;
            if (!round) {
                res.json({ success: false, round: null});
            } else if (round) {
                round.score = JSON.parse(req.body.score);
                round.save(function(err) {
                    if (err) throw err;
                    res.json({ success: true, round: round});
                });
            }
        });
    });


    app.post('/get', function(req, res) {
        Round.findOne({
            tournament: req.body.tournament
        }, function(err, round) {
            if (err) throw err;
            if (!round) {

                var new_round = new Round({
                    tournament : req.body.tournament
                });

                new_round.save(function(err) {
                    if (err) throw err;
                    res.json({ success: true, round: new_round});
                });
            } else if (round) {
                res.json({ success: true, round: round});
            }
        });
    });

    app.get('/create', function(req, res) {
        var user = new User({
            username : 'ahmed',
            password: crypto.createHmac('sha256', 'PBtpc15t').digest('hex')
        });

        user.save(function(err) {
            if (err) throw err;
            console.log('User saved successfully');
            res.json({ success: true });
        });
    });

    app.use(function(req, res, next) {
        var token = req.body.token || req.query.token || req.headers['x-access-token'];
        if (token) {
            jwt.verify(token, app.get('superSecret'), function(err, decoded) {
                if (err) {
                    return res.json({ success: false, message: 'Failed to authenticate token.' });
                } else {
                    req.decoded = decoded;
                    res.setHeader('x-access-token', token);
                    next();
                }
            });
        } else {
            console.log(req);

            return res.status(403).send({
                success: false,
                message: 'No token provided.'
            });

        }
    });

    app.get('/account', function(req, res) {
        res.render('protracker/account.hbs', {layout: 'protracker'});
    });
};