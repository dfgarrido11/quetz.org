export const dynamic = "force-dynamic";
import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          // Prevent the double Google popup by using 'select_account' only once
          prompt: "select_account",
        },
      },
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        return { id: "1", email: credentials.email, name: credentials.email }
      }
    })
  ],
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/auth/login",
    error: "/auth/login",
  },
  callbacks: {
    async session({ session, token }) {
      return session
    },
    async redirect({ url, baseUrl }) {
      // Allow redirects to quetz.org (production domain) and the base URL (Railway)
      const allowedDomains = [
        baseUrl,
        'https://quetz.org',
        'https://www.quetz.org',
      ];
      
      // If the URL starts with any allowed domain, allow it
      for (const domain of allowedDomains) {
        if (url.startsWith(domain)) {
          return url;
        }
      }
      
      // If it's a relative URL, append to baseUrl
      if (url.startsWith('/')) {
        return `${baseUrl}${url}`;
      }
      
      // Default: redirect to baseUrl
      return baseUrl;
    },
  }
})

export { handler as GET, handler as POST }
