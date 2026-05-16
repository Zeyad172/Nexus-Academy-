import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/user.model.js";
import { uploadUrlToDrive } from "../services/drive.service.js";

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.CLIENT_ID,
            clientSecret: process.env.CLIENT_SECRET,
            callbackURL: process.env.CALLBACK_URL,
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                const existingUser = await User.findByGoogleId(profile.id);

                if (existingUser) {
                    return done(null, existingUser);
                }

                const email = profile.emails[0].value;
                const userByEmail = await User.findByEmail(email);

                let avatarUrl = null;
                const googlePhotoUrl = profile.photos[0]?.value;

                if (userByEmail) {
                    avatarUrl = userByEmail.avatar_url;

                    if (!avatarUrl && googlePhotoUrl) {
                        try {
                            const uploadResult = await uploadUrlToDrive(
                                googlePhotoUrl,
                                `google_avatar_${profile.id}.jpg`,
                            );
                            avatarUrl = uploadResult.fileId;
                        } catch (driveErr) {
                            console.error(
                                "Failed to upload Google avatar to Drive:",
                                driveErr,
                            );
                        }
                    }

                    await User.update(userByEmail.user_id, {
                        google_id: profile.id,
                        avatar_url: avatarUrl,
                        is_verified: true,
                    });
                    const updatedUser = await User.findById(
                        userByEmail.user_id,
                    );
                    return done(null, updatedUser);
                }

                if (googlePhotoUrl) {
                    try {
                        const uploadResult = await uploadUrlToDrive(
                            googlePhotoUrl,
                            `google_avatar_${profile.id}.jpg`,
                        );
                        avatarUrl = uploadResult.fileId;
                    } catch (driveErr) {
                        console.error(
                            "Failed to upload Google avatar to Drive:",
                            driveErr,
                        );
                    }
                }

                const newUser = await User.create({
                    first_name: profile.name.givenName,
                    last_name: profile.name.familyName,
                    email: email,
                    google_id: profile.id,
                    avatar_url: avatarUrl,
                    is_verified: true,
                    role: "user",
                });

                return done(null, newUser);
            } catch (error) {
                return done(error, null);
            }
        },
    ),
);

passport.serializeUser((user, done) => {
    done(null, user.user_id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

export default passport;
