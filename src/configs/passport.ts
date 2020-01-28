import bcrypt from 'bcryptjs';
import passport from 'passport';
import LocalStrategy from 'passport-local';

// Simple passportjs local strategy
passport.use('local.admin', new LocalStrategy.Strategy({ 'passReqToCallback': true },
    async function(req, email, password, done) {
        const adminData = await req.db.server.getAdminByEmail(email);
        if (!adminData) {
            return done(null, false, { 'message': 'no user' });
        }

        if (!await bcrypt.compare(password, adminData.password)) {
            return done(null, false, { 'message': 'incorrect password' });
        }
        const admin = {
            'id': adminData.id,
            'type': 'admin',
        };

        return done(null, admin, { 'message': 'done' });
    },
));

// Simple passportjs local strategy
passport.use('local.user', new LocalStrategy.Strategy({ 'passReqToCallback': true },
    async function(req, email, password, done) {
        const userData = await req.db.server.getUserByEmail(email);

        if (!userData) {
            return done(null, false, { 'message': 'no user' });
        }

        if (!userData.verified) {
            return done(null, false, { 'message': 'not verified' });
        }

        if (!await bcrypt.compare(password, userData.password)) {
            return done(null, false, { 'message': 'incorrect password' });
        }

        const user = {
            'id': userData.id,
            'type': 'user',
        };

        return done(null, user, { 'message': 'done' });
    },
));

passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(user, done) {
    done(null, user);
});

export default passport;
