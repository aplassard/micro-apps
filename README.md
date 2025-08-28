This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Testing

Run the unit tests with:

```bash
npm test
```

This compiles the TypeScript sources and executes the tests using Node's built-in test runner.

## Configuration

Set the following environment variables as needed:

- `VERBOSE`: any truthy value enables debug logging for development.
- `BASIC_AUTH_USER` and `BASIC_AUTH_PASS`: enable optional HTTP basic authentication.

### Continuous Integration

A GitHub Actions workflow in `.github/workflows/ci.yml` runs the linter and test suite on every push and pull request.
To enable it:

1. In your repository on GitHub, go to **Settings → Secrets and variables → Actions**.
2. Add a new repository secret named `OPENROUTER_API_KEY` with your API key.

The workflow maps that secret to an environment variable so integration tests that call OpenRouter can run automatically.
