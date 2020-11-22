export async function handleRequest(request: Request) {
  let res = null;
  const path = getPath(request);
  if (path === "/") return await getPage("index");
  if (path === "/success") return await getPage("success");
  if (path === "/favicon.ico") return new Response();
  if (path === "/add") {
    res = await addNewRedirect(request)
  } else if (path.indexOf("/r/") === 0) {
    res = await executeRedirect(request);
  }

  if (res != null) return res;

  return new Response(null, { status: 404 })
}

async function addNewRedirect(request: Request) {
  const pathBlacklist = [
    "/",
    "/add",
    "/success",
    ""
  ] 

  const { searchParams: params } = new URL(request.url);
  const { key, url, expiration } = Object.fromEntries(params);
  url.replace("http://", "https://");
  const prefixedUrl = url.indexOf("https://") !== 0
    ? "https://" + url
    : url;
  console.log(prefixedUrl);
  if (!key || !prefixedUrl) return new Response(null, {status: 400, statusText: "Missing Key or URL"});

  if (pathBlacklist.includes(key)) {
    return new Response(null, {status: 400, statusText: "Path Reserved"});
  }
  
  const entry = await getFromKV(key);
  if (entry != null) {
    return new Response(null, {status: 409, statusText: "Duplicate Key"});
  }
  const config = {
    expiration,
    metadata: {
      addedBy: request.headers.get("cf-connecting-ip") || "",
      from: request.headers.get("cf-ipcountry") || "",
      addedOn: new Date()
    }
  }
  const response = await REDIRECTS.put(key, prefixedUrl, config)
  .then(kvRes => {
    return Response.redirect(`${getOrigin(request)}/success?url=${getOrigin(request) + "/r/" + key}`);
  })
  .catch(error => {
    console.error(error);
    return new Response("Error Occured", {status: 500});
    });
  return response;
}

async function executeRedirect(request: Request) {
  const path = getPath(request);
  const key = path.replace("/r/", "");
  const entry = await getFromKV(key);
  if (entry) {
    return Response.redirect(entry, 301);
  }
}

async function getFromKV(key: string) {
  return await REDIRECTS.get(key);
}


function getOrigin(request: Request) {
  const url = new URL(request.url);
  return url.origin;
}

function getPath(request: Request) {
  const url = new URL(request.url);

  return url.pathname;
}

async function getPage(pageName: string): Promise<Response> {
  const html = await STATIC.get(`${pageName}.html`);
  return new Response(html, {status: 200, headers: [
    [
      'Content-Type',
      'text/html; charset=utf-8'
    ]
  ]});
} 