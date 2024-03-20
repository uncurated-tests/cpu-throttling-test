import { NextResponse } from 'next/server';

// Edge so it doesn't count against serverless usage.
export const runtime = 'edge';

const hosts = [
  'cpu-throttling-test.vercel.app',
  'cpu-throttling-test-1-7gb.vercel.app',
  'cpu-throttling-test-3gb.vercel.app',
];

const paths = [
  '/',
  '/streaming/node/product/1',
  '/ssr/1',
  '/styling/css-modules',
  '/layouts/books',
];

export async function GET() {
  const data: Record<
    string,
    Record<
      string,
      {
        duration: number;
        status: number;
        serverTiming: string | null;
      }
    >
  > = {};
  for (const host of hosts) {
    data[host] = {};
    for (const path of paths) {
      const url = `https://${host}${path}`;
      const before = Date.now();
      // Serialize to avoid interference.
      const res = await fetch(url, {
        cache: 'no-store',
        headers: {
          'x-vercel-debug-proxy-timing': '1',
        },
      });
      const serverTiming = res.headers.get('server-timing');
      await res.text();
      data[host][path] = {
        duration: Date.now() - before,
        status: res.status,
        serverTiming,
      };
      console.log(url, res.status);
    }
  }
  return NextResponse.json(data);
}
