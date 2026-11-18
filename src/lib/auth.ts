import { NextAuthOptions } from 'next-auth';
import GithubProvider from 'next-auth/providers/github';
import dbConnect from './mongodb';
import User from '@/models/User';

export const authOptions: NextAuthOptions = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, profile }) {
      await dbConnect();
      const githubProfile = profile as { login?: string; avatar_url?: string };
      await User.findOneAndUpdate(
        { githubId: user.id },
        {
          githubId: user.id,
          username: githubProfile?.login ?? user.name ?? '',
          email: user.email ?? '',
          avatarUrl: githubProfile?.avatar_url ?? user.image ?? '',
        },
        { upsert: true, new: true }
      );
      return true;
    },
    async session({ session, token }) {
      if (token?.sub) {
        await dbConnect();
        const dbUser = await User.findOne({ githubId: token.sub });
        if (dbUser) {
          session.user.id = dbUser._id.toString();
          session.user.username = dbUser.username;
          session.user.avatarUrl = dbUser.avatarUrl;
        }
      }
      return session;
    },
    async jwt({ token, profile }) {
      if (profile) {
        token.sub = (profile as { id?: string | number }).id?.toString() ?? token.sub;
      }
      return token;
    },
  },
  pages: {
    signIn: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
};
