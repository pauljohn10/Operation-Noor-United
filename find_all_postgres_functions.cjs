const supabaseUrl = 'https://gpljpjnzpyvmvlndcnfb.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdwbGpwam56cHl2bXZsbmRjbmZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ2MjQ3NTAsImV4cCI6MjEwMDIwMDc1MH0.q2s63JSKo6j6LJdNzipnXtMxU6T6O94JsWFV2WWJPKI';

async function fetchOpenApiSchema() {
  console.log('Fetching PostgREST OpenAPI schema from Supabase...');
  const res = await fetch(`${supabaseUrl}/rest/v1/`, {
    headers: { 'apikey': supabaseAnonKey },
  });

  const text = await res.text();
  try {
    const json = JSON.parse(text);
    console.log('API Title:', json.info?.title);
    const paths = Object.keys(json.paths || {});
    console.log('Exposed endpoints count:', paths.length);
    const rpcPaths = paths.filter((p) => p.startsWith('/rpc/'));
    console.log('Exposed RPC endpoints:', rpcPaths);
  } catch (e) {
    console.log('Raw response:', text.substring(0, 500));
  }
}

fetchOpenApiSchema();
