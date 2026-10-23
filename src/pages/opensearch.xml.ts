/** Lets browsers add "Search LinuxServer.io" to the address bar. */
import type { APIContext } from 'astro';
import { withBase } from '@/lib/base';

export function GET({ site }: APIContext) {
  const url = (p: string) => new URL(withBase(p), site).toString();
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>
<OpenSearchDescription xmlns="http://a9.com/-/spec/opensearch/1.1/">
  <ShortName>LinuxServer.io</ShortName>
  <Description>Search LinuxServer.io images and blog posts</Description>
  <InputEncoding>UTF-8</InputEncoding>
  <Image width="32" height="32" type="image/png">${url('/favicon-32.png')}</Image>
  <Url type="text/html" template="${url('/search/')}?q={searchTerms}"/>
</OpenSearchDescription>
`,
    { headers: { 'Content-Type': 'application/opensearchdescription+xml' } },
  );
}
