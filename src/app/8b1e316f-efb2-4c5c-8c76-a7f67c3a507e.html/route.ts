export async function GET() {
  return new Response('8b1e316f-efb2-4c5c-8c76-a7f67c3a507e', {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
